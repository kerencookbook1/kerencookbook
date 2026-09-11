/**
 * Parse a free-text ingredient line into { amount, unit, name }.
 * Handles Hebrew + English units, fractions (½, 1/2), ranges (1-2),
 * and mixed numbers (1 ½, 1½).
 *
 * Examples:
 *   "200 גרם סוכר"    → { amount: "200",  unit: "גרם",   name: "סוכר" }
 *   "½ כפית מלח"      → { amount: "½",    unit: "כפית",  name: "מלח" }
 *   "1-2 שיני שום"    → { amount: "1-2",  unit: "שיני",  name: "שום" }
 *   "3 ביצים"          → { amount: "3",    unit: "",      name: "ביצים" }
 *   "עוף שלם"          → { amount: "",     unit: "",      name: "עוף שלם" }
 *   "1 ½ כוסות קמח"   → { amount: "1 ½", unit: "כוסות", name: "קמח" }
 *   "2 tsp salt"       → { amount: "2",    unit: "tsp",   name: "salt" }
 */

export type ParsedIngredient = { name: string; amount: string; unit: string }

// Longer / plural forms first so they are matched before their singular
// counterparts (e.g. "כוסות" before "כוס").
const HEBREW_UNITS: string[] = [
  'כוסות', 'כוס',
  'כפיות', 'כפית',
  'כפות', 'כף',
  'ק"ג', 'קילוגרם', 'קילו',
  'גרם', "ג'", 'ג׳',
  'מ"ל', 'מיליליטר',
  'ליטרים', 'ליטר',
  'פרוסות', 'פרוסה',
  'חופנים', 'חופן',
  'קמצוץ', 'קורט',
  'שיני', 'שן',
  'יחידות', 'יחידה',
  'חבילות', 'חבילה',
  'שקיות', 'שקית',
  'קופסאות', 'קופסה', 'קופסא',
  'פחיות', 'פחית',
  'בקבוקים', 'בקבוק',
  'מיכלים', 'מיכל',
  'צנצנות', 'צנצנת',
  'ס"מ',
]

const ENGLISH_UNITS: string[] = [
  'tablespoons', 'tablespoon', 'tbsp', 'tbs',
  'teaspoons', 'teaspoon', 'tsp',
  'cups', 'cup',
  'grams', 'gram', 'g',
  'kilograms', 'kilogram', 'kg',
  'milliliters', 'milliliter', 'ml',
  'liters', 'liter', 'l',
  'ounces', 'ounce', 'oz',
  'pounds', 'pound', 'lbs', 'lb',
  'pinch', 'handful', 'dash',
]

const UNICODE_FRACTIONS = '½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞'

// Leading amount: digits/decimal, unicode fraction, or ASCII fraction (1/2),
// optionally followed by a range (- 1-2, – 1–2) OR a mixed second part (1 ½).
const AMOUNT_RE = new RegExp(
  `^\\s*(` +
    `(?:\\d+(?:[.,]\\d+)?|[${UNICODE_FRACTIONS}]|\\d+\\s*\\/\\s*\\d+)` +
    `(?:\\s*[-–—]\\s*(?:\\d+(?:[.,]\\d+)?|[${UNICODE_FRACTIONS}]|\\d+\\s*\\/\\s*\\d+))?` +
    `(?:\\s*(?:\\d+\\s*\\/\\s*\\d+|[${UNICODE_FRACTIONS}]))?` +
  `)\\s*`
)

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function parseIngredientLine(rawLine: string): ParsedIngredient {
  const line = (rawLine ?? '').trim()
  if (!line) return { name: '', amount: '', unit: '' }

  // 1. Leading amount
  let amount = ''
  let rest = line
  const amtMatch = AMOUNT_RE.exec(line)
  if (amtMatch) {
    amount = amtMatch[1].trim()
    rest = line.slice(amtMatch[0].length).trim()
  }

  // 2. Unit (only accepted right after the amount, at the start of the rest)
  let unit = ''
  const units = [...HEBREW_UNITS, ...ENGLISH_UNITS]
  for (const u of units) {
    const re = new RegExp(`^${escapeRegex(u)}(?=\\s|$|[.,])`, 'i')
    if (re.test(rest)) {
      unit = u
      rest = rest.slice(u.length).trim()
      break
    }
  }

  // 3. Cleanup: drop leading "של" and stray separators
  rest = rest.replace(/^\s*של\s+/, '')
  rest = rest.replace(/^[\s\-–—:]+/, '').trim()

  return { name: rest || line, amount, unit }
}

/**
 * Bulk-parse a list of ingredient lines (from AI extractors) into structured
 * rows. Empty lines are skipped.
 */
export function parseIngredientLines(lines: string[]): ParsedIngredient[] {
  return lines
    .map((l) => (l ?? '').trim())
    .filter(Boolean)
    .map(parseIngredientLine)
}
