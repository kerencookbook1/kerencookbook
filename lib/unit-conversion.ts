/**
 * Ingredient-aware unit conversion between US customary and metric.
 *
 * Used in two places:
 * 1. During URL import — normalize an imported American recipe to metric
 *    before we hand it to the user for review.
 * 2. Recipe detail view — a live toggle that flips amounts between the
 *    stored form and metric for browsing.
 *
 * The converter is intentionally best-effort: cup volumes vary by ingredient
 * density (a cup of flour ≠ a cup of butter by weight), so we look up the
 * ingredient name in a small density table and fall back to a neutral
 * approximation when the name is unknown.
 */

export type ConversionResult = {
  amount: string
  unit: string
  /** True when we actually changed the amount+unit; false when we kept them. */
  converted: boolean
}

const CUP_ML = 240 // US legal cup
const TBSP_ML = 15
const TSP_ML = 5
const FLOZ_ML = 29.5735
const OZ_G = 28.3495
const LB_G = 453.592
const INCH_CM = 2.54

/** Ingredient-name keyword → grams per US cup. Fall back to 200g when unknown. */
const CUP_TO_GRAMS: Array<{ keywords: string[]; grams: number }> = [
  { keywords: ['קמח', 'flour', 'קמח לבן', 'קמח מלא'],          grams: 125 },
  { keywords: ['סוכר לבן', 'sugar', 'סוכר'],                  grams: 200 },
  { keywords: ['סוכר חום', 'brown sugar'],                    grams: 220 },
  { keywords: ['סוכר אבקה', 'אבקת סוכר', 'powdered sugar'],   grams: 120 },
  { keywords: ['חמאה', 'butter', 'מרגרינה'],                  grams: 227 },
  { keywords: ['שוקולד', 'chocolate'],                        grams: 170 },
  { keywords: ['קקאו', 'cocoa'],                              grams: 100 },
  { keywords: ['אורז', 'rice'],                               grams: 200 },
  { keywords: ['שיבולת שועל', 'קוואקר', 'oats', 'שיבולת'],    grams: 90 },
  { keywords: ['פירורי לחם', 'breadcrumb', 'פירורים'],        grams: 110 },
  { keywords: ['אגוזים', 'nuts', 'שקדים', 'almond', 'walnut'], grams: 120 },
  { keywords: ['צימוקים', 'raisin', 'חמוציות', 'cranberry'],  grams: 150 },
  { keywords: ['גבינה מגוררת', 'shredded cheese', 'מגורר'],   grams: 100 },
  { keywords: ['פרמזן'],                                       grams: 90 },
  { keywords: ['דבש', 'honey'],                                grams: 340 },
  { keywords: ['מייפל', 'maple'],                              grams: 320 },
]

/** Ingredient-name keyword → ml per US cup. Fall back to 240ml when unknown. */
const CUP_TO_ML: Array<{ keywords: string[]; ml: number }> = [
  { keywords: ['מים', 'water'],                            ml: 240 },
  { keywords: ['חלב', 'milk', 'שמנת', 'cream'],            ml: 240 },
  { keywords: ['שמן', 'oil'],                              ml: 218 },
  { keywords: ['יין', 'wine'],                             ml: 240 },
  { keywords: ['רוטב סויה', 'soy sauce', 'סויה'],          ml: 240 },
  { keywords: ['מרק', 'ציר', 'broth', 'stock'],            ml: 240 },
]

/**
 * The unit synonym table. Match is case-insensitive and tolerates trailing
 * punctuation. Includes Hebrew forms because some Israelis type "cup" as "כוס"
 * when translating imported recipes manually.
 */
const UNIT_ALIASES: Array<{ canonical: 'cup' | 'tbsp' | 'tsp' | 'floz' | 'oz' | 'lb' | 'F' | 'inch'; forms: RegExp }> = [
  { canonical: 'cup',  forms: /^(cups?|c\.|כוס(ות)?)$/i },
  { canonical: 'tbsp', forms: /^(tbsps?|tablespoons?|tb|כפ|כף|כפות)$/i },
  { canonical: 'tsp',  forms: /^(tsps?|teaspoons?|כפית(ות)?|כפיות)$/i },
  { canonical: 'floz', forms: /^(fl\.?\s?oz|fluid\s?ounces?)$/i },
  { canonical: 'oz',   forms: /^(oz\.?|ounces?)$/i },
  { canonical: 'lb',   forms: /^(lbs?\.?|pounds?)$/i },
  { canonical: 'F',    forms: /^(°?f|fahrenheit)$/i },
  { canonical: 'inch', forms: /^(in\.?|inches?|inch)$/i },
]

/**
 * Parse a numeric amount that may be a fraction ("1/2"), a mixed number
 * ("1 1/2"), or a decimal. Hebrew fraction words are also accepted.
 */
function parseAmount(text: string): number | null {
  const trimmed = text.trim().toLowerCase()
  if (!trimmed) return null

  // Hebrew fraction words
  const hebrew: Record<string, number> = {
    'חצי': 0.5, '½': 0.5,
    'רבע': 0.25, '¼': 0.25,
    'שליש': 1 / 3, '⅓': 1 / 3,
    'שלושת רבעי': 0.75, '¾': 0.75,
    'שני שלישי': 2 / 3, '⅔': 2 / 3,
  }
  if (hebrew[trimmed] != null) return hebrew[trimmed]!

  // "1 1/2" or "1 חצי"
  const mixed = trimmed.match(/^(\d+)\s+(?:(\d+)\s*\/\s*(\d+)|([¼-¾⅐-⅞½¼¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]))$/)
  if (mixed) {
    const whole = parseInt(mixed[1]!, 10)
    if (mixed[2] && mixed[3]) {
      const n = parseInt(mixed[2]!, 10)
      const d = parseInt(mixed[3]!, 10)
      return d > 0 ? whole + n / d : whole
    }
    const glyph = mixed[4]!
    const g = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 } as Record<string, number>
    if (g[glyph] != null) return whole + g[glyph]!
  }

  // "1/2"
  const frac = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (frac) {
    const n = parseInt(frac[1]!, 10)
    const d = parseInt(frac[2]!, 10)
    return d > 0 ? n / d : null
  }

  // Decimal / integer
  const num = parseFloat(trimmed.replace(',', '.'))
  return Number.isFinite(num) ? num : null
}

function canonicalizeUnit(text: string): typeof UNIT_ALIASES[number]['canonical'] | null {
  const cleaned = text.trim().replace(/[.,;]$/g, '')
  if (!cleaned) return null
  for (const { canonical, forms } of UNIT_ALIASES) {
    if (forms.test(cleaned)) return canonical
  }
  return null
}

function pickGramsPerCup(ingredientName: string): number {
  const lower = ingredientName.toLowerCase()
  for (const entry of CUP_TO_GRAMS) {
    if (entry.keywords.some((k) => lower.includes(k.toLowerCase()))) return entry.grams
  }
  return 200
}

/**
 * Public: grams in one US cup of the given ingredient. Used by the calorie
 * estimator to convert a "cup"-quantity into a mass when the DB row only
 * knows kcal/100g. Falls back to 200g when the ingredient is unknown.
 */
export function gramsPerUsCup(ingredientName: string): number {
  return pickGramsPerCup(ingredientName)
}

function pickMlPerCup(ingredientName: string): number | null {
  const lower = ingredientName.toLowerCase()
  for (const entry of CUP_TO_ML) {
    if (entry.keywords.some((k) => lower.includes(k.toLowerCase()))) return entry.ml
  }
  return null
}

function isLiquidIngredient(ingredientName: string): boolean {
  return pickMlPerCup(ingredientName) !== null
}

function roundDisplay(n: number): string {
  if (n >= 100) return String(Math.round(n))
  if (n >= 10) return String(Math.round(n))
  if (n >= 1) return (Math.round(n * 10) / 10).toString()
  return (Math.round(n * 100) / 100).toString()
}

/**
 * Convert an amount + unit pair to metric, using the ingredient name as a
 * hint for cup conversions. Returns the original values unchanged when the
 * unit isn't recognized or the amount can't be parsed.
 */
export function convertToMetric(
  amount: string,
  unit: string,
  ingredientName: string,
): ConversionResult {
  const canonical = canonicalizeUnit(unit)
  const n = parseAmount(amount)
  if (canonical == null || n == null) {
    return { amount, unit, converted: false }
  }

  switch (canonical) {
    case 'cup': {
      if (isLiquidIngredient(ingredientName)) {
        const ml = n * (pickMlPerCup(ingredientName) ?? CUP_ML)
        return { amount: roundDisplay(ml), unit: 'מ״ל', converted: true }
      }
      const g = n * pickGramsPerCup(ingredientName)
      return { amount: roundDisplay(g), unit: 'גרם', converted: true }
    }
    case 'tbsp': {
      const ml = n * TBSP_ML
      return { amount: roundDisplay(ml), unit: 'מ״ל', converted: true }
    }
    case 'tsp': {
      const ml = n * TSP_ML
      return { amount: roundDisplay(ml), unit: 'מ״ל', converted: true }
    }
    case 'floz': {
      const ml = n * FLOZ_ML
      return { amount: roundDisplay(ml), unit: 'מ״ל', converted: true }
    }
    case 'oz': {
      const g = n * OZ_G
      return { amount: roundDisplay(g), unit: 'גרם', converted: true }
    }
    case 'lb': {
      const g = n * LB_G
      if (g >= 1000) return { amount: roundDisplay(g / 1000), unit: 'ק״ג', converted: true }
      return { amount: roundDisplay(g), unit: 'גרם', converted: true }
    }
    case 'F': {
      const c = (n - 32) * (5 / 9)
      return { amount: roundDisplay(Math.round(c / 5) * 5), unit: '°C', converted: true }
    }
    case 'inch': {
      const cm = n * INCH_CM
      return { amount: roundDisplay(cm), unit: 'ס״מ', converted: true }
    }
  }
}

/**
 * Detect whether an ingredient row already looks metric — used to decide if
 * the metric toggle should even render on a given recipe.
 */
export function isImperialAmount(amount: string, unit: string): boolean {
  return canonicalizeUnit(unit) !== null && parseAmount(amount) !== null
}
