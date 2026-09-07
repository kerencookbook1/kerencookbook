/**
 * Recipe categories — single source of truth for the whole app.
 * Values are the canonical Hebrew label AND the string stored in recipes.category.
 * If categories are ever renamed, add a migration to remap existing rows.
 */

export type CategoryId =
  | 'בשר'
  | 'עוף'
  | 'דגים'
  | 'חלבי'
  | 'צמחוני'
  | 'פסטה'
  | 'אורז ודגנים'
  | 'סלטים'
  | 'מרקים'
  | 'מאפים'
  | 'קינוחים'
  | 'שתייה'
  | 'אחר'

export type Category = {
  id: CategoryId
  icon: string
  keywords: string[]  // For AI hints + fallback matching for uncategorized recipes
}

export const CATEGORIES: Category[] = [
  { id: 'בשר',         icon: '🥩', keywords: ['בקר', 'כבש', 'טלה', 'סטייק', 'המבורגר', 'קבב', 'שווארמה', 'צלי', 'beef', 'lamb', 'steak'] },
  { id: 'עוף',         icon: '🍗', keywords: ['עוף', 'תרנגול', 'הודו', 'שניצל', 'שוקיים', 'פרגית', 'חזה עוף', 'chicken', 'turkey'] },
  { id: 'דגים',        icon: '🐟', keywords: ['דג', 'סלמון', 'טונה', 'לברק', 'מושט', 'הרינג', 'שרימפס', 'fish', 'salmon', 'tuna'] },
  { id: 'חלבי',        icon: '🧀', keywords: ['גבינה', 'חלב', 'שמנת', 'לבנה', 'קוטג׳', 'יוגורט', 'חמאה', 'פרמזן', 'מוצרלה', 'cheese', 'milk', 'cream', 'butter'] },
  { id: 'צמחוני',      icon: '🥦', keywords: ['ירקות', 'טבעוני', 'ללא בשר', 'קטניות', 'vegetarian', 'vegan'] },
  { id: 'פסטה',        icon: '🍝', keywords: ['פסטה', 'ספגטי', 'פנה', 'לזניה', 'רביולי', 'נודלס', 'pasta', 'spaghetti', 'lasagna', 'noodle'] },
  { id: 'אורז ודגנים', icon: '🍚', keywords: ['אורז', 'קוסקוס', 'קינואה', 'בורגול', 'מקלובה', 'ריזוטו', 'rice', 'quinoa', 'risotto', 'couscous'] },
  { id: 'סלטים',       icon: '🥗', keywords: ['סלט', 'ממרח', 'חומוס', 'טחינה', 'טאבולה', 'salad', 'hummus'] },
  { id: 'מרקים',       icon: '🍲', keywords: ['מרק', 'ציר', 'קרם', 'שקשוקה', 'soup', 'broth'] },
  { id: 'מאפים',       icon: '🥐', keywords: ['לחם', 'חלה', 'מאפה', 'בורקס', 'פיצה', 'קרואסון', 'ג׳חנון', 'בצק', 'לחמניות', 'bread', 'pastry', 'pizza', 'dough'] },
  { id: 'קינוחים',     icon: '🍰', keywords: ['עוגה', 'עוגיות', 'קינוח', 'שוקולד', 'קרם', 'פאי', 'מוס', 'גלידה', 'מקרון', 'טירמיסו', 'cake', 'cookie', 'dessert', 'chocolate', 'ice cream'] },
  { id: 'שתייה',       icon: '🥤', keywords: ['שייק', 'סמות׳י', 'לימונדה', 'קפה', 'תה', 'משקה', 'מיץ', 'shake', 'smoothie', 'drink', 'juice'] },
  { id: 'אחר',         icon: '🍽️', keywords: [] },
]

export const CATEGORY_IDS: CategoryId[] = CATEGORIES.map((c) => c.id)

export function isCategoryId(v: unknown): v is CategoryId {
  return typeof v === 'string' && (CATEGORY_IDS as string[]).includes(v)
}

/**
 * Guess a category for a recipe from its title + ingredients, using keyword lists.
 * Returns 'אחר' as the ultimate fallback.
 */
export function guessCategory(title: string, ingredientNames: string[] = []): CategoryId {
  const haystack = [title, ...ingredientNames].join(' ').toLowerCase()
  for (const cat of CATEGORIES) {
    if (cat.keywords.length === 0) continue
    if (cat.keywords.some((k) => haystack.includes(k.toLowerCase()))) return cat.id
  }
  return 'אחר'
}
