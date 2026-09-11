#!/usr/bin/env node
/**
 * Backfill script: re-parse every ingredient row whose amount+unit are empty
 * by splitting the free-text `name` into { amount, unit, name } via the same
 * parser used by the import flows.
 *
 * Usage:
 *   node scripts/reparse-ingredients.mjs            # dry-run (prints diff)
 *   node scripts/reparse-ingredients.mjs --apply    # applies updates to DB
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// ---- Load .env.local manually (no dotenv dep) --------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
try {
  const raw = readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  }
} catch (e) {
  console.error(`Could not read ${envPath}: ${e.message}`)
  process.exit(1)
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// ---- Ingredient parser (inlined copy of lib/ingredients.ts) ------------------
const HEBREW_UNITS = [
  'כוסות', 'כוס', 'כפיות', 'כפית', 'כפות', 'כף',
  'ק"ג', 'קילוגרם', 'קילו', 'גרם', "ג'", 'ג׳',
  'מ"ל', 'מיליליטר', 'ליטרים', 'ליטר',
  'פרוסות', 'פרוסה', 'חופנים', 'חופן', 'קמצוץ', 'קורט',
  'שיני', 'שן', 'יחידות', 'יחידה', 'חבילות', 'חבילה',
  'שקיות', 'שקית', 'קופסאות', 'קופסה', 'קופסא',
  'פחיות', 'פחית', 'בקבוקים', 'בקבוק', 'מיכלים', 'מיכל',
  'צנצנות', 'צנצנת', 'ס"מ',
]
const ENGLISH_UNITS = [
  'tablespoons', 'tablespoon', 'tbsp', 'tbs',
  'teaspoons', 'teaspoon', 'tsp',
  'cups', 'cup', 'grams', 'gram', 'g',
  'kilograms', 'kilogram', 'kg',
  'milliliters', 'milliliter', 'ml',
  'liters', 'liter', 'l',
  'ounces', 'ounce', 'oz',
  'pounds', 'pound', 'lbs', 'lb',
  'pinch', 'handful', 'dash',
]
const UNICODE_FRACTIONS = '½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞'
const AMOUNT_RE = new RegExp(
  `^\\s*(` +
    `(?:\\d+(?:[.,]\\d+)?|[${UNICODE_FRACTIONS}]|\\d+\\s*\\/\\s*\\d+)` +
    `(?:\\s*[-–—]\\s*(?:\\d+(?:[.,]\\d+)?|[${UNICODE_FRACTIONS}]|\\d+\\s*\\/\\s*\\d+))?` +
    `(?:\\s*(?:\\d+\\s*\\/\\s*\\d+|[${UNICODE_FRACTIONS}]))?` +
  `)\\s*`
)
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function parseIngredientLine(rawLine) {
  const line = (rawLine ?? '').trim()
  if (!line) return { name: '', amount: '', unit: '' }
  let amount = ''
  let rest = line
  const amtMatch = AMOUNT_RE.exec(line)
  if (amtMatch) {
    amount = amtMatch[1].trim()
    rest = line.slice(amtMatch[0].length).trim()
  }
  let unit = ''
  for (const u of [...HEBREW_UNITS, ...ENGLISH_UNITS]) {
    const re = new RegExp(`^${escapeRegex(u)}(?=\\s|$|[.,])`, 'i')
    if (re.test(rest)) {
      unit = u
      rest = rest.slice(u.length).trim()
      break
    }
  }
  rest = rest.replace(/^\s*של\s+/, '').replace(/^[\s\-–—:]+/, '').trim()
  return { name: rest || line, amount, unit }
}

// ---- Main --------------------------------------------------------------------
const apply = process.argv.includes('--apply')
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

console.log(`Mode: ${apply ? 'APPLY (writing to DB)' : 'DRY-RUN (no writes)'}`)
console.log(`Supabase: ${SUPABASE_URL}\n`)

// Only touch rows where amount+unit are still empty; skip anything that was
// already curated (either manually entered or previously backfilled).
const { data: rows, error } = await supabase
  .from('ingredients')
  .select('id, recipe_id, name, amount, unit')
  .is('amount', null)
  .is('unit', null)

if (error) {
  console.error('Fetch failed:', error.message)
  process.exit(1)
}

console.log(`Fetched ${rows.length} candidate rows (amount+unit are both NULL).`)

const changes = []
for (const row of rows) {
  const parsed = parseIngredientLine(row.name)
  // Skip rows where parsing yields nothing new
  if (!parsed.amount && !parsed.unit) continue
  if (parsed.name === row.name) continue
  changes.push({ id: row.id, before: row.name, ...parsed })
}

console.log(`Will update ${changes.length} rows.\n`)

const sample = changes.slice(0, 15)
if (sample.length) {
  console.log('Sample of changes:')
  for (const c of sample) {
    console.log(`  [${c.id.slice(0, 8)}] "${c.before}"`)
    console.log(`     → name="${c.name}"  amount="${c.amount}"  unit="${c.unit}"`)
  }
  if (changes.length > sample.length) {
    console.log(`  … and ${changes.length - sample.length} more.\n`)
  } else {
    console.log('')
  }
}

if (!apply) {
  console.log('Dry-run complete. Re-run with --apply to write the changes.')
  process.exit(0)
}

if (changes.length === 0) {
  console.log('Nothing to update.')
  process.exit(0)
}

// Apply in small batches; each update is per-row (Supabase update doesn't
// support bulk-with-different-values in one call).
let done = 0
let failed = 0
for (const c of changes) {
  const { error: updErr } = await supabase
    .from('ingredients')
    .update({ name: c.name, amount: c.amount || null, unit: c.unit || null })
    .eq('id', c.id)
  if (updErr) {
    failed++
    console.error(`  ✗ ${c.id.slice(0, 8)}: ${updErr.message}`)
  } else {
    done++
  }
}
console.log(`\nDone. ${done} updated, ${failed} failed.`)
