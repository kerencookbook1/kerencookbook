/**
 * Estimate a recipe's full nutritional profile — calories + macros + fiber +
 * sugar — plus detect allergens and vegetarian status.
 *
 * Strategy for macros: instead of maintaining a per-ingredient macro table
 * (which would be a huge data project), each row in the calorie DB carries
 * a lightweight `macroProfile` label. The calculator turns kcal into grams
 * of protein/carb/fat by applying the profile's calorie-fraction split,
 * then dividing by the per-macro energy density (4/4/9 kcal/g).
 *
 * This gives ballpark values that are honest — labeled "AI-assisted, rough"
 * in the UI — while staying fully client-side and instant.
 */

import { estimateRecipeCalories, type IngredientForCalories } from './calorie-calc'
import { findCalorieRow } from './calories'

/**
 * A rough profile of how many calories in an ingredient come from each macro.
 * `p+c+f` should sum to 1.0.
 */
export type MacroProfile =
  | 'protein-lean'    // lean meat, white fish, egg whites — ~70% P, 30% F
  | 'protein-fatty'   // eggs, salmon, cheese, dark chicken — ~35% P, 55% F
  | 'protein-carb'    // beans, lentils, tofu — ~30% P, 55% C, 15% F
  | 'carb-starch'     // rice, pasta, flour, potato, bread, oats — ~10% P, 85% C, 5% F
  | 'carb-sugar'      // sugar, honey, jam, syrups — ~0% P, 100% C, 0% F
  | 'carb-fruit'      // fruits — ~5% P, 90% C (mostly sugar), 5% F
  | 'carb-veg'        // vegetables — ~15% P, 75% C, 10% F
  | 'fat-pure'        // oil, butter, ghee — ~0% P, 0% C, 100% F
  | 'fat-nuts'        // nuts, seeds, nut butters — ~15% P, 15% C, 70% F
  | 'balanced-dairy'  // milk, yogurt — ~20% P, 40% C, 40% F
  | 'balanced-mixed'  // sauces, dressings — ~10% P, 40% C, 50% F
  | 'other'           // fallback: 15/55/30

const PROFILE_FRACTIONS: Record<MacroProfile, { p: number; c: number; f: number }> = {
  'protein-lean':   { p: 0.70, c: 0.00, f: 0.30 },
  'protein-fatty':  { p: 0.35, c: 0.05, f: 0.60 },
  'protein-carb':   { p: 0.30, c: 0.55, f: 0.15 },
  'carb-starch':    { p: 0.10, c: 0.85, f: 0.05 },
  'carb-sugar':     { p: 0.00, c: 1.00, f: 0.00 },
  'carb-fruit':     { p: 0.05, c: 0.90, f: 0.05 },
  'carb-veg':       { p: 0.15, c: 0.75, f: 0.10 },
  'fat-pure':       { p: 0.00, c: 0.00, f: 1.00 },
  'fat-nuts':       { p: 0.15, c: 0.15, f: 0.70 },
  'balanced-dairy': { p: 0.20, c: 0.40, f: 0.40 },
  'balanced-mixed': { p: 0.10, c: 0.40, f: 0.50 },
  'other':          { p: 0.15, c: 0.55, f: 0.30 },
}

/** Fraction of carbs that are sugar (rough, for sugar-tracking). */
const SUGAR_FRACTION: Record<MacroProfile, number> = {
  'protein-lean': 0, 'protein-fatty': 0, 'protein-carb': 0.1,
  'carb-starch': 0.03, 'carb-sugar': 1.0, 'carb-fruit': 0.85, 'carb-veg': 0.4,
  'fat-pure': 0, 'fat-nuts': 0.1,
  'balanced-dairy': 1.0, 'balanced-mixed': 0.3, 'other': 0.1,
}

/** Fiber grams per 100 kcal, by profile (very rough averages). */
const FIBER_PER_100KCAL: Record<MacroProfile, number> = {
  'protein-lean': 0, 'protein-fatty': 0, 'protein-carb': 8,
  'carb-starch': 1.5, 'carb-sugar': 0, 'carb-fruit': 3, 'carb-veg': 6,
  'fat-pure': 0, 'fat-nuts': 3.5,
  'balanced-dairy': 0, 'balanced-mixed': 0.5, 'other': 1,
}

/** Keywords → macro profile. Longest / most specific first wins. */
const PROFILE_KEYWORDS: Array<{ keywords: string[]; profile: MacroProfile }> = [
  // Fats — check before carbs (butter has "בוט" prefix issues)
  { keywords: ['שמן זית', 'שמן קנולה', 'שמן חמניות', 'שמן', 'oil', 'olive oil'], profile: 'fat-pure' },
  { keywords: ['חמאה', 'butter', 'מרגרינה', 'margarine', 'שומן'],                 profile: 'fat-pure' },
  { keywords: ['אגוזים', 'שקדים', 'קשיו', 'בוטנים', 'טחינה', 'שומשום', 'nut', 'almond', 'peanut', 'sesame', 'tahini'], profile: 'fat-nuts' },

  // Sugars & sweeteners
  { keywords: ['סוכר', 'sugar', 'דבש', 'honey', 'מייפל', 'maple', 'סירופ', 'syrup', 'ריבה', 'jam'], profile: 'carb-sugar' },

  // Starches & baking
  { keywords: ['אורז', 'rice', 'קוסקוס', 'קינואה', 'quinoa', 'בורגול'],              profile: 'carb-starch' },
  { keywords: ['פסטה', 'ספגטי', 'לזניה', 'pasta', 'spaghetti', 'noodle'],           profile: 'carb-starch' },
  { keywords: ['קמח', 'flour', 'לחם', 'bread', 'פיתה', 'לחמניה', 'חלה', 'טורטייה'], profile: 'carb-starch' },
  { keywords: ['תפוח אדמה', 'תפו"א', 'potato', 'בטטה', 'sweet potato'],             profile: 'carb-starch' },
  { keywords: ['פירורי לחם', 'breadcrumb', 'פירורים'],                              profile: 'carb-starch' },
  { keywords: ['שיבולת שועל', 'קוואקר', 'oats', 'oatmeal', 'קורנפלור', 'עמילן', 'starch'], profile: 'carb-starch' },
  { keywords: ['קקאו', 'cocoa'],                                                    profile: 'carb-starch' },

  // Fruits
  { keywords: ['בננה', 'banana', 'תפוח', 'apple', 'תפוז', 'orange', 'ענבים', 'grape', 'לימון', 'lemon', 'תות', 'strawberry', 'אבוקדו', 'avocado', 'צימוקים', 'raisin', 'חמוציות', 'cranberry'], profile: 'carb-fruit' },

  // Vegetables
  { keywords: ['בצל', 'onion', 'שום', 'garlic', 'עגבניה', 'עגבניות', 'tomato', 'פלפל', 'pepper', 'מלפפון', 'cucumber', 'גזר', 'carrot', 'חסה', 'lettuce', 'קישוא', 'zucchini', 'ברוקולי', 'כרובית', 'תרד', 'spinach'], profile: 'carb-veg' },

  // Legumes / mixed
  { keywords: ['שעועית', 'bean', 'עדשים', 'lentil', 'חומוס', 'chickpea', 'פול', 'טופו', 'tofu'], profile: 'protein-carb' },

  // Dairy — check before "protein-fatty" (cheese)
  { keywords: ['חלב', 'milk', 'יוגורט', 'yogurt', 'שמנת חמוצה'],                    profile: 'balanced-dairy' },
  { keywords: ['שמנת מתוקה', 'cream'],                                              profile: 'fat-pure' },
  { keywords: ['גבינה', 'cheese', 'מוצרלה', 'פרמזן', 'לבנה', 'קוטג'],               profile: 'protein-fatty' },

  // Proteins — fatty
  { keywords: ['סלמון', 'salmon', 'טונה במים', 'סרדינים', 'sardine'],               profile: 'protein-fatty' },
  { keywords: ['ביצה', 'ביצים', 'egg'],                                             profile: 'protein-fatty' },
  { keywords: ['בשר טחון', 'בקר טחון', 'המבורגר', 'ground beef', 'burger'],         profile: 'protein-fatty' },
  { keywords: ['סטייק', 'steak', 'אנטריקוט'],                                       profile: 'protein-fatty' },
  { keywords: ['כבש', 'lamb', 'טלה'],                                               profile: 'protein-fatty' },
  { keywords: ['נקניק', 'sausage', 'חזיר', 'pork', 'bacon'],                        profile: 'protein-fatty' },

  // Proteins — lean
  { keywords: ['חזה עוף', 'chicken breast', 'שוקיים', 'פרגית'],                     profile: 'protein-lean' },
  { keywords: ['עוף', 'chicken', 'הודו', 'turkey'],                                  profile: 'protein-lean' },
  { keywords: ['דג', 'fish', 'טונה', 'tuna', 'דניס', 'מושט', 'לברק'],               profile: 'protein-lean' },
  { keywords: ['שרימפס', 'shrimp', 'סרטן', 'crab', 'קלמארי', 'calamari'],           profile: 'protein-lean' },

  // Sauces / dressings
  { keywords: ['רסק עגבניות', 'רוטב עגבניות', 'קטשופ', 'ketchup', 'סויה', 'soy sauce', 'מיונז', 'mayo', 'חרדל', 'mustard'], profile: 'balanced-mixed' },
]

function pickProfile(name: string): MacroProfile {
  const lower = name.toLowerCase()
  for (const { keywords, profile } of PROFILE_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k.toLowerCase()))) return profile
  }
  return 'other'
}

// ─── Allergen + vegetarian detection ─────────────────────────────────────────

export type AllergenId = 'gluten' | 'egg' | 'dairy' | 'nuts' | 'sesame' | 'fish' | 'shellfish' | 'soy'

const ALLERGEN_KEYWORDS: Record<AllergenId, string[]> = {
  gluten:    ['חיטה', 'קמח לבן', 'קמח מלא', 'קמח', 'לחם', 'פיתה', 'חלה', 'קוסקוס', 'בורגול', 'פסטה', 'ספגטי', 'לזניה', 'פירורי לחם', 'wheat', 'flour', 'bread', 'pasta'],
  egg:       ['ביצה', 'ביצים', 'חלמון', 'חלבון', 'egg'],
  dairy:     ['חלב', 'גבינה', 'חמאה', 'שמנת', 'יוגורט', 'קוטג', 'לבנה', 'מוצרלה', 'פרמזן', 'milk', 'cheese', 'butter', 'cream', 'yogurt'],
  nuts:      ['אגוזים', 'שקדים', 'קשיו', 'בוטנים', 'פקאן', 'פיסטוק', 'nut', 'almond', 'cashew', 'peanut', 'walnut', 'pistachio'],
  sesame:    ['שומשום', 'טחינה', 'חלווה', 'sesame', 'tahini'],
  fish:      ['סלמון', 'טונה', 'דניס', 'מושט', 'לברק', 'בורי', 'סרדינים', 'הרינג', 'דג', 'fish', 'salmon', 'tuna'],
  shellfish: ['שרימפס', 'סרטן', 'קלמארי', 'תמנון', 'חסילון', 'shrimp', 'crab', 'calamari', 'octopus', 'lobster'],
  soy:       ['סויה', 'טופו', 'אדממה', 'soy', 'tofu'],
}

export const ALLERGEN_LABELS: Record<AllergenId, string> = {
  gluten: 'מכיל גלוטן',
  egg: 'מכיל ביצים',
  dairy: 'מכיל חלב',
  nuts: 'מכיל אגוזים',
  sesame: 'מכיל שומשום',
  fish: 'מכיל דגים',
  shellfish: 'מכיל פירות ים',
  soy: 'מכיל סויה',
}

const MEAT_KEYWORDS = [
  'עוף', 'חזה עוף', 'שוקיים', 'פרגית', 'הודו', 'turkey', 'chicken',
  'בשר', 'בקר', 'טחון', 'סטייק', 'אנטריקוט', 'כבש', 'טלה', 'lamb', 'beef', 'steak',
  'דג', 'סלמון', 'טונה', 'דניס', 'מושט', 'לברק', 'fish', 'salmon', 'tuna',
  'שרימפס', 'סרטן', 'shrimp',
  'נקניק', 'חזיר', 'pork', 'bacon', 'sausage',
]

export function detectAllergens(ingredientNames: string[]): AllergenId[] {
  const haystack = ingredientNames.join(' ').toLowerCase()
  const found: AllergenId[] = []
  for (const [id, kws] of Object.entries(ALLERGEN_KEYWORDS) as Array<[AllergenId, string[]]>) {
    if (kws.some((k) => haystack.includes(k.toLowerCase()))) found.push(id)
  }
  return found
}

export function isVegetarian(ingredientNames: string[]): boolean {
  const haystack = ingredientNames.join(' ').toLowerCase()
  return !MEAT_KEYWORDS.some((k) => haystack.includes(k.toLowerCase()))
}

// ─── Full nutrition estimate ─────────────────────────────────────────────────

export type NutritionEstimate = {
  perServing: {
    kcal: number
    proteinG: number
    carbsG: number
    fatG: number
    fiberG: number
    sugarG: number
  }
  totalKcal: number
  servings: number
  /** How confident we are: high = most ingredients matched with known profile. */
  precision: 'high' | 'medium' | 'low'
  matchedRatio: number
  isVegetarian: boolean
  allergens: AllergenId[]
}

/** Compose the full estimate. Wraps the existing kcal calculator. */
export function estimateNutrition(
  ingredients: IngredientForCalories[],
  servings: number | null,
): NutritionEstimate {
  const cal = estimateRecipeCalories(ingredients, servings)
  const effectiveServings = Math.max(1, servings ?? 1)

  // Break the totalKcal into macro grams by weighting each ingredient's kcal by its profile.
  let totalP = 0
  let totalC = 0
  let totalF = 0
  let totalSugar = 0
  let totalFiber = 0
  let matched = 0

  for (const item of cal.breakdown) {
    if (item.kcal == null || item.kcal <= 0) continue
    matched++
    const profile = pickProfile(item.name)
    const frac = PROFILE_FRACTIONS[profile]
    // 4 kcal/g P, 4 kcal/g C, 9 kcal/g F
    totalP += (item.kcal * frac.p) / 4
    totalC += (item.kcal * frac.c) / 4
    totalF += (item.kcal * frac.f) / 9
    totalSugar += ((item.kcal * frac.c) / 4) * SUGAR_FRACTION[profile]
    totalFiber += (item.kcal / 100) * FIBER_PER_100KCAL[profile]
  }

  const perServing = {
    kcal: Math.round(cal.totalKcal / effectiveServings),
    proteinG: Math.round(totalP / effectiveServings),
    carbsG: Math.round(totalC / effectiveServings),
    fatG: Math.round(totalF / effectiveServings),
    fiberG: Math.round(totalFiber / effectiveServings),
    sugarG: Math.round(totalSugar / effectiveServings),
  }

  const totalMatchable = cal.breakdown.length || 1
  const matchedRatio = matched / totalMatchable
  const precision: NutritionEstimate['precision'] =
    matchedRatio >= 0.8 ? 'high' : matchedRatio >= 0.5 ? 'medium' : 'low'

  const ingredientNames = ingredients.map((i) => i.name)
  return {
    perServing,
    totalKcal: Math.round(cal.totalKcal),
    servings: effectiveServings,
    precision,
    matchedRatio,
    isVegetarian: isVegetarian(ingredientNames),
    allergens: detectAllergens(ingredientNames),
  }
}

/** Re-export the kcal ingredient row lookup for convenience. */
export { findCalorieRow }
