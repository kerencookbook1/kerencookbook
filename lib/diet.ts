/**
 * Auto-detect whether a recipe is "dietetic" (דיאטטי) from its title + ingredients.
 * Pure functions, no I/O. Same style as guessCategory() in ./categories.
 */

export const DIET_POSITIVE_KEYWORDS: string[] = [
  'אפוי',
  'בתנור',
  'מאודה',
  'גריל',
  'ללא שמן',
  'דל שומן',
  'דל קלוריות',
  'לייט',
  'טבעוני',
  'כרובית',
  'טופו',
  'קינואה',
  'בטטה',
  'יוגורט 0%',
  'קוטג׳ 3%',
  'גבינה 5%',
  'אבוקדו',
  'סלט',
  'ירקות',
  'חזה עוף',
]

export const DIET_NEGATIVE_KEYWORDS: string[] = [
  'מטוגן',
  'טיגון עמוק',
  'שמנת מתוקה',
  'מיונז',
  'חמאה',
  'מרגרינה',
  'שוקולד לבן',
  'קרם פטיסייר',
  'בצק עלים',
]

export const DIET_SCORE_THRESHOLD = 2

export type DietScore = {
  score: number
  isDiet: boolean
  positiveHits: string[]
  negativeHits: string[]
}

export function scoreDiet(title: string, ingredientNames: string[] = []): DietScore {
  const haystack = [title, ...ingredientNames].join(' ').toLowerCase()

  const positiveHits: string[] = []
  for (const kw of DIET_POSITIVE_KEYWORDS) {
    if (haystack.includes(kw.toLowerCase())) positiveHits.push(kw)
  }

  const negativeHits: string[] = []
  for (const kw of DIET_NEGATIVE_KEYWORDS) {
    if (haystack.includes(kw.toLowerCase())) negativeHits.push(kw)
  }

  const score = positiveHits.length - negativeHits.length * 2

  return {
    score,
    isDiet: score >= DIET_SCORE_THRESHOLD,
    positiveHits,
    negativeHits,
  }
}

export function isDietAuto(title: string, ingredientNames: string[] = []): boolean {
  return scoreDiet(title, ingredientNames).isDiet
}

/**
 * Resolve the effective diet flag for display/filter.
 * Override wins if present; otherwise fall back to the stored auto value.
 */
export function effectiveIsDiet(
  isDietAutoValue: boolean | null | undefined,
  isDietOverride: boolean | null | undefined,
): boolean {
  if (isDietOverride === true || isDietOverride === false) return isDietOverride
  return Boolean(isDietAutoValue)
}
