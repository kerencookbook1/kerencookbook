/**
 * Approximate calorie database for common Hebrew ingredients.
 *
 * Each entry can carry any subset of {kcalPer100g, kcalPerCup, kcalPerTbsp,
 * kcalPerTsp, kcalPerUnit} — the calculator picks the field that matches
 * the ingredient's parsed unit. Values are best-effort averages sourced
 * from USDA FoodData Central + standard nutrition references; treat as
 * ballpark estimates, not medical-grade data.
 *
 * `aliases` lets synonyms and slight naming variations match the same row.
 */

export type CalorieRow = {
  name: string
  kcalPer100g?: number
  kcalPerCup?: number
  kcalPerTbsp?: number
  kcalPerTsp?: number
  kcalPerUnit?: number     // 1 unit = one whole item (egg, apple, chicken breast…)
  unitLabel?: string       // human label shown in breakdown ("1 בינוני", "1 שן")
  aliases?: string[]
}

export const CALORIE_DB: CalorieRow[] = [
  // Proteins
  { name: 'חזה עוף', kcalPer100g: 165, kcalPerUnit: 285, unitLabel: 'חזה בינוני', aliases: ['עוף', 'שוקיים', 'כנפיים', 'פרגית', 'עוף שלם'] },
  { name: 'הודו', kcalPer100g: 189, aliases: ['חזה הודו'] },
  { name: 'בשר בקר טחון', kcalPer100g: 250, aliases: ['בשר טחון', 'בקר טחון'] },
  { name: 'סטייק אנטריקוט', kcalPer100g: 291, aliases: ['סטייק'] },
  { name: 'כבש', kcalPer100g: 294, aliases: ['בשר כבש', 'קבב'] },
  { name: 'סלמון', kcalPer100g: 208 },
  { name: 'טונה', kcalPer100g: 132 },
  { name: 'דניס', kcalPer100g: 100, aliases: ['לברק', 'מושט', 'בורי'] },
  { name: 'ביצים', kcalPer100g: 155, kcalPerUnit: 78, unitLabel: 'ביצה', aliases: ['ביצה'] },
  { name: 'טופו', kcalPer100g: 76 },

  // Dairy
  { name: 'חלב', kcalPer100g: 42, kcalPerCup: 149, kcalPerTbsp: 9 },
  { name: 'שמנת מתוקה', kcalPer100g: 340, kcalPerCup: 820, kcalPerTbsp: 51 },
  { name: 'שמנת חמוצה', kcalPer100g: 193, kcalPerTbsp: 26 },
  { name: 'שמנת בישול', kcalPer100g: 195, kcalPerCup: 470, kcalPerTbsp: 30 },
  { name: 'יוגורט', kcalPer100g: 61 },
  { name: 'יוגורט יווני', kcalPer100g: 100 },
  { name: 'לבנה', kcalPer100g: 145 },
  { name: 'קוטג\'', kcalPer100g: 98, aliases: ['גבינה לבנה'] },
  { name: 'גבינה צהובה', kcalPer100g: 393 },
  { name: 'מוצרלה', kcalPer100g: 280 },
  { name: 'פרמזן', kcalPer100g: 431, kcalPerTbsp: 22 },
  { name: 'פטה', kcalPer100g: 264 },
  { name: 'חמאה', kcalPer100g: 717, kcalPerTbsp: 102 },

  // Grains / starches
  { name: 'קמח', kcalPer100g: 364, kcalPerCup: 455, kcalPerTbsp: 30 },
  { name: 'קמח מלא', kcalPer100g: 340, kcalPerCup: 400, kcalPerTbsp: 25 },
  { name: 'סוכר', kcalPer100g: 387, kcalPerCup: 774, kcalPerTbsp: 48, kcalPerTsp: 16 },
  { name: 'סוכר חום', kcalPer100g: 380, kcalPerCup: 828, kcalPerTbsp: 52 },
  { name: 'דבש', kcalPer100g: 304, kcalPerTbsp: 64, kcalPerTsp: 21 },
  { name: 'סילאן', kcalPer100g: 291, kcalPerTbsp: 61 },
  { name: 'שיבולת שועל', kcalPer100g: 389, kcalPerCup: 307, aliases: ['קוואקר'] },
  { name: 'אורז', kcalPer100g: 350, kcalPerCup: 685, aliases: ['אורז בסמטי', 'אורז יסמין', 'אורז מלא'] },
  { name: 'קינואה', kcalPer100g: 368, kcalPerCup: 626 },
  { name: 'בורגול', kcalPer100g: 342, kcalPerCup: 479 },
  { name: 'קוסקוס', kcalPer100g: 376, kcalPerCup: 650 },
  { name: 'פסטה', kcalPer100g: 371, kcalPerCup: 210, aliases: ['ספגטי', 'פנה', 'אטריות'] },
  { name: 'לחם', kcalPer100g: 265, kcalPerUnit: 80, unitLabel: 'פרוסה' },
  { name: 'פיתה', kcalPer100g: 275, kcalPerUnit: 165, unitLabel: 'פיתה' },

  // Legumes
  { name: 'עדשים', kcalPer100g: 353, kcalPerCup: 678, aliases: ['עדשים אדומות'] },
  { name: 'חומוס', kcalPer100g: 364, kcalPerCup: 728 },
  { name: 'שעועית', kcalPer100g: 341, kcalPerCup: 620, aliases: ['שעועית שחורה'] },

  // Vegetables
  { name: 'בצל', kcalPer100g: 40, kcalPerUnit: 44, unitLabel: 'בצל בינוני', aliases: ['בצל סגול', 'בצל ירוק'] },
  { name: 'שום', kcalPer100g: 149, kcalPerUnit: 4, unitLabel: 'שן' },
  { name: 'עגבנייה', kcalPer100g: 18, kcalPerUnit: 22, unitLabel: 'עגבנייה בינונית', aliases: ['עגבניות שרי', 'עגבניות'] },
  { name: 'מלפפון', kcalPer100g: 15, kcalPerUnit: 45 },
  { name: 'גזר', kcalPer100g: 41, kcalPerUnit: 25, unitLabel: 'גזר בינוני' },
  { name: 'תפוח אדמה', kcalPer100g: 77, kcalPerUnit: 160, unitLabel: 'תפו"א בינוני' },
  { name: 'בטטה', kcalPer100g: 86, kcalPerUnit: 112, unitLabel: 'בטטה בינונית' },
  { name: 'פלפל', kcalPer100g: 31, kcalPerUnit: 37, unitLabel: 'פלפל בינוני', aliases: ['פלפל אדום', 'פלפל צהוב', 'פלפל ירוק'] },
  { name: 'קישוא', kcalPer100g: 17, kcalPerUnit: 33 },
  { name: 'חציל', kcalPer100g: 25, kcalPerUnit: 137 },
  { name: 'חסה', kcalPer100g: 15 },
  { name: 'כרוב', kcalPer100g: 25 },
  { name: 'כרובית', kcalPer100g: 25, kcalPerUnit: 146, unitLabel: 'ראש בינוני' },
  { name: 'ברוקולי', kcalPer100g: 34 },
  { name: 'תרד', kcalPer100g: 23 },
  { name: 'פטריות', kcalPer100g: 22 },
  { name: 'תירס', kcalPer100g: 96 },
  { name: 'אבוקדו', kcalPer100g: 160, kcalPerUnit: 240, unitLabel: 'אבוקדו בינוני' },
  { name: 'לימון', kcalPer100g: 29, kcalPerUnit: 17, unitLabel: 'לימון' },
  { name: 'זיתים', kcalPer100g: 115 },

  // Fruits
  { name: 'תפוח', kcalPer100g: 52, kcalPerUnit: 95, unitLabel: 'תפוח בינוני' },
  { name: 'בננה', kcalPer100g: 89, kcalPerUnit: 105, unitLabel: 'בננה בינונית' },
  { name: 'תפוז', kcalPer100g: 47, kcalPerUnit: 62 },
  { name: 'אגס', kcalPer100g: 57, kcalPerUnit: 101 },
  { name: 'תותים', kcalPer100g: 32, kcalPerCup: 49 },
  { name: 'מנגו', kcalPer100g: 60, kcalPerUnit: 202 },
  { name: 'תמרים', kcalPer100g: 282, kcalPerUnit: 20 },
  { name: 'צימוקים', kcalPer100g: 299, kcalPerTbsp: 27 },

  // Fats / oils
  { name: 'שמן זית', kcalPer100g: 884, kcalPerCup: 1920, kcalPerTbsp: 120, kcalPerTsp: 40, aliases: ['שמן קנולה', 'שמן חמניות', 'שמן קוקוס'] },
  { name: 'שמן שומשום', kcalPer100g: 884, kcalPerTbsp: 120 },
  { name: 'טחינה', kcalPer100g: 595, kcalPerTbsp: 89, aliases: ['טחינה גולמית'] },
  { name: 'מיונז', kcalPer100g: 680, kcalPerTbsp: 94 },
  { name: 'קטשופ', kcalPer100g: 101, kcalPerTbsp: 15 },
  { name: 'סויה', kcalPer100g: 53, kcalPerTbsp: 8 },
  { name: 'חומץ', kcalPer100g: 18, kcalPerTbsp: 3 },
  { name: 'חרדל', kcalPer100g: 60, kcalPerTbsp: 9 },

  // Nuts & seeds
  { name: 'שקדים', kcalPer100g: 579, kcalPerTbsp: 43 },
  { name: 'אגוזי מלך', kcalPer100g: 654, kcalPerTbsp: 48, aliases: ['אגוזי פקאן'] },
  { name: 'קשיו', kcalPer100g: 553, kcalPerTbsp: 41 },
  { name: 'בוטנים', kcalPer100g: 567, kcalPerTbsp: 42 },
  { name: 'פיסטוקים', kcalPer100g: 560, kcalPerTbsp: 42 },
  { name: 'שומשום', kcalPer100g: 573, kcalPerTbsp: 52 },
  { name: 'זרעי חמנייה', kcalPer100g: 584, kcalPerTbsp: 51 },
  { name: 'זרעי דלעת', kcalPer100g: 559, kcalPerTbsp: 46 },
  { name: 'זרעי צ\'יה', kcalPer100g: 486, kcalPerTbsp: 60 },

  // Baking / chocolate / cocoa
  { name: 'שוקולד מריר', kcalPer100g: 546 },
  { name: 'שוקולד חלב', kcalPer100g: 535 },
  { name: 'קקאו', kcalPer100g: 228, kcalPerTbsp: 12 },
  { name: 'קורנפלור', kcalPer100g: 381, kcalPerTbsp: 30 },

  // Liquids (essentially zero)
  { name: 'מים', kcalPer100g: 0, kcalPerCup: 0, aliases: ['מים רותחים'] },

  // Spices — negligible; explicitly zero so they don't show as "unknown".
  { name: 'מלח', kcalPer100g: 0, kcalPerTsp: 0 },
  { name: 'פלפל שחור', kcalPer100g: 251, kcalPerTsp: 6 },
  { name: 'פפריקה', kcalPer100g: 282, kcalPerTsp: 6, aliases: ['פפריקה מתוקה', 'פפריקה חריפה'] },
  { name: 'כמון', kcalPer100g: 375, kcalPerTsp: 8 },
  { name: 'כורכום', kcalPer100g: 354, kcalPerTsp: 8 },
  { name: 'קינמון', kcalPer100g: 247, kcalPerTsp: 6 },
]

// Flatten aliases into a lookup — canonical name -> row, and each alias -> row.
const INDEX = new Map<string, CalorieRow>()
for (const row of CALORIE_DB) {
  INDEX.set(row.name.toLowerCase(), row)
  for (const alias of row.aliases ?? []) {
    if (!INDEX.has(alias.toLowerCase())) INDEX.set(alias.toLowerCase(), row)
  }
}

export function findCalorieRow(rawName: string): CalorieRow | null {
  const name = rawName.trim().toLowerCase()
  if (!name) return null

  // 1. Exact / alias match
  const exact = INDEX.get(name)
  if (exact) return exact

  // 2. Substring match — the ingredient name contains any canonical/alias name
  //    (e.g. "חזה עוף של תרנגול" contains "חזה עוף").
  for (const [key, row] of INDEX.entries()) {
    if (name.includes(key)) return row
  }

  return null
}
