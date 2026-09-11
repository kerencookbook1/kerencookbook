/**
 * Shopping-list normalization: strip cooking descriptors from ingredient
 * names ("בצל גדול, קצוץ" → "בצל") and merge duplicate rows across
 * recipes ("2 כפות שמן זית" + "3 כפות שמן זית" → "5 כפות שמן זית").
 *
 * More aggressive than lib/ingredients.ts because in the shopping list
 * the user cares about the *thing to buy*, not how it will be prepped.
 */

// Adjectives / preparation words to remove. Long forms first so
// "קצוצים" is caught before "קצוץ" would swallow it in a wrong branch.
const DESCRIPTOR_WORDS: string[] = [
  // cut / chopped / sliced / crushed
  'קצוצים', 'קצוצות', 'קצוצה', 'קצוץ',
  'חתוכים', 'חתוכות', 'חתוכה', 'חתוך',
  'טחונים', 'טחונות', 'טחונה', 'טחון',
  'פרוסים', 'פרוסות', 'פרוסה', 'פרוס',
  'קלופים', 'קלופות', 'קלופה', 'קלוף',
  'מגורדים', 'מגורדות', 'מגורדת', 'מגורד',
  'מרוסקים', 'מרוסקות', 'מרוסקת', 'מרוסק',
  'מפורקים', 'מפורקות', 'מפורקת', 'מפורק',
  'מרוקנים', 'מרוקנות', 'מרוקנת', 'מרוקן',
  // cooked / raw / dry / frozen states
  'מבושלים', 'מבושלות', 'מבושלת', 'מבושל',
  'אפויים', 'אפויות', 'אפויה', 'אפוי',
  'מטוגנים', 'מטוגנות', 'מטוגנת', 'מטוגן',
  'קלויים', 'קלויות', 'קלויה', 'קלוי',
  'טריים', 'טריות', 'טרייה', 'טרי',
  'מוקפאים', 'מוקפאות', 'מוקפאת', 'מוקפא',
  'יבשים', 'יבשות', 'יבשה', 'יבש',
  'רותחים', 'רותחות', 'רותחת', 'רותח',
  'חמים', 'חמות', 'חמה', 'חם',
  'קרים', 'קרות', 'קרה', 'קר',
  // sizes
  'גדולים', 'גדולות', 'גדולה', 'גדול',
  'בינוניים', 'בינוניות', 'בינונית', 'בינוני',
  'קטנים', 'קטנות', 'קטנה', 'קטן',
  // spoon qualifiers
  'שטוחים', 'שטוחות', 'שטוחה', 'שטוח',
  'גדושים', 'גדושות', 'גדושה', 'גדוש',
  'ממולאים', 'ממולאות', 'ממולאת', 'ממולא',
  // shape targets ("לקוביות", "לחתיכות", etc.)
  'לקוביות', 'לפרוסות', 'לחתיכות', 'לרצועות', 'לטבעות',
]

// "לפי הטעם", "לקישוט" — mark the whole line as "amount unknown"; strip them.
const TRAILING_QUALIFIERS = [
  'לפי הטעם', 'לקישוט', 'להגשה', 'לזילוף', 'לפיזור', 'לצורך',
]

export function stripDescriptors(rawName: string): string {
  let name = (rawName ?? '').trim()
  if (!name) return ''

  // Drop everything after a comma (typically preparation notes)
  const commaIdx = name.indexOf(',')
  if (commaIdx > -1) name = name.slice(0, commaIdx).trim()

  // Drop parenthesised additions ("(אפשר להחליף בשמן קוקוס)")
  name = name.replace(/\(.*?\)/g, '').trim()

  // Drop trailing qualifiers
  for (const q of TRAILING_QUALIFIERS) {
    if (name.endsWith(q)) name = name.slice(0, -q.length).trim()
  }

  // Repeatedly strip trailing descriptor words separated by spaces / "ו"
  // (e.g. "בצל גדול קצוץ" → "בצל גדול" → "בצל").
  let changed = true
  while (changed) {
    changed = false
    for (const word of DESCRIPTOR_WORDS) {
      const re = new RegExp(`(^|\\s|ו)${escapeRegex(word)}$`)
      if (re.test(name)) {
        name = name.replace(re, '').trim()
        changed = true
        break
      }
    }
  }

  // Collapse whitespace
  name = name.replace(/\s+/g, ' ').trim()
  return name || rawName.trim()
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ---------------------------------------------------------------------------
// Amount arithmetic
// ---------------------------------------------------------------------------

const UNICODE_FRACTIONS: Record<string, number> = {
  '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 0.25, '¾': 0.75,
  '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8,
  '⅙': 1 / 6, '⅚': 5 / 6, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
}

/**
 * Try to parse an amount string into a number. Handles integers, decimals,
 * "1/2", unicode fractions (½), "1 ½", "1½", ranges ("1-2" → upper bound).
 * Returns null when the value is not numeric ("קורט", "לפי הטעם").
 */
export function parseAmount(raw: string | null | undefined): number | null {
  if (!raw) return null
  const s = raw.trim()
  if (!s) return null

  // range "1-2" or "1–2" → use upper bound
  const range = s.match(/^(.+?)\s*[-–—]\s*(.+)$/)
  if (range) {
    const upper = parseAmount(range[2])
    return upper
  }

  // mixed "1 ½" or "1½" or "1 1/2"
  const mixed = s.match(
    new RegExp(`^(\\d+)\\s*([${Object.keys(UNICODE_FRACTIONS).join('')}]|\\d+\\s*\\/\\s*\\d+)$`)
  )
  if (mixed) {
    const whole = Number(mixed[1])
    const frac = parseAmount(mixed[2])
    if (frac != null) return whole + frac
  }

  // simple unicode fraction
  if (s.length === 1 && UNICODE_FRACTIONS[s] !== undefined) return UNICODE_FRACTIONS[s]

  // ASCII fraction "1/2"
  const frac = s.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (frac) {
    const b = Number(frac[2])
    if (b !== 0) return Number(frac[1]) / b
  }

  // Plain number (accept both . and , as decimal separator)
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/** Convert a number back to a compact display string ("1.5" not "1.500"). */
export function formatAmount(n: number): string {
  if (!Number.isFinite(n)) return ''
  const rounded = Math.round(n * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toString()
}

/**
 * Combine two amounts. If both are numeric, sum. Otherwise concatenate the
 * raw strings with " + " (so "קורט" + "1 כפית" stays readable).
 */
export function mergeAmounts(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  const na = parseAmount(a)
  const nb = parseAmount(b)
  if (na != null && nb != null) return formatAmount(na + nb)
  return `${a} + ${b}`
}

// ---------------------------------------------------------------------------
// Grouping key
// ---------------------------------------------------------------------------

/**
 * Stable key used to match two shopping items as "the same product".
 * Same normalized name + same lowercased unit merge. Different units
 * do NOT merge (e.g. "500 גרם עגבנייה" and "3 יחידות עגבנייה" stay apart).
 */
export function shoppingMergeKey(name: string, unit: string | null | undefined): string {
  const cleaned = stripDescriptors(name).toLowerCase()
  const u = (unit ?? '').trim().toLowerCase()
  return `${cleaned}|${u}`
}
