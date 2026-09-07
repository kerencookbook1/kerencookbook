'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type RecipeCard = {
  id: string
  title: string
  prep_time: number | null
  cook_time: number | null
  image_url?: string | null
  ingredientNames?: string[]
}

type Category = {
  id: string
  label: string
  icon: string
  keywords?: string[]  // undefined = "all"
}

const CATEGORIES: Category[] = [
  { id: 'all',       label: 'הכל',       icon: '🍽️' },
  { id: 'starters',  label: 'ראשונות',   icon: '🥗', keywords: ['סלט', 'ממרח', 'חומוס', 'טחינה', 'קרפצ׳יו', 'קרפצ\'יו', 'starter', 'salad'] },
  { id: 'soups',     label: 'מרקים',     icon: '🍲', keywords: ['מרק', 'ציר', 'שקשוקה', 'soup', 'broth'] },
  { id: 'mains',     label: 'עיקריות',   icon: '🍛', keywords: ['עוף', 'בשר', 'דג', 'סלמון', 'טונה', 'שניצל', 'פסטה', 'אורז', 'קוסקוס', 'מקלובה', 'סטייק', 'המבורגר', 'chicken', 'beef', 'fish', 'pasta', 'rice'] },
  { id: 'sides',     label: 'תוספות',     icon: '🥦', keywords: ['ירק', 'קישוא', 'חציל', 'בטטה', 'תפוד', 'תפוח אדמה', 'כרובית', 'ברוקולי', 'תוספת', 'side'] },
  { id: 'baking',    label: 'מאפים',     icon: '🥐', keywords: ['לחם', 'חלה', 'מאפה', 'בורקס', 'פיצה', 'קרואסון', 'ג\'חנון', 'bread', 'pastry', 'pizza'] },
  { id: 'sweets',    label: 'מתוקים',    icon: '🍰', keywords: ['עוגה', 'עוגיות', 'קינוח', 'שוקולד', 'קרם', 'פאי', 'מוס', 'גלידה', 'cake', 'cookie', 'dessert', 'chocolate'] },
  { id: 'drinks',    label: 'שתייה',     icon: '🥤', keywords: ['שייק', 'סמות׳י', 'לימונדה', 'קפה', 'תה', 'משקה', 'shake', 'smoothie', 'drink'] },
]

const FALLBACK_IMAGES = [
  '/images/recipes/shakshuka-default.png',
  '/images/recipes/cauliflower-tahini-default.png',
  '/images/recipes/lemon-cake-default.png',
  '/images/recipes/creamy-pasta-default.png',
  '/images/recipes/meatballs-default.png',
  '/images/recipes/pumpkin-soup-default.png',
  '/images/recipes/salmon-default.png',
  '/images/recipes/herb-salad-default.png',
  '/images/recipes/tomato-pasta-default.png',
]

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function matchesCategory(recipe: RecipeCard, cat: Category): boolean {
  if (!cat.keywords) return true
  const haystack = [recipe.title, ...(recipe.ingredientNames ?? [])].join(' ').toLowerCase()
  return cat.keywords.some((k) => haystack.includes(k.toLowerCase()))
}

export function CategoryTabs({ recipes }: { recipes: RecipeCard[] }) {
  const [activeId, setActiveId] = useState<string>('all')
  const active = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0]

  const filtered = useMemo(
    () => recipes.filter((r) => matchesCategory(r, active)),
    [recipes, active]
  )

  const displayed = filtered.slice(0, 6)

  return (
    <>
      <nav className="category-tabs" aria-label="קטגוריות">
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === activeId
          return (
            <button
              key={cat.id}
              type="button"
              className={`category-tab${isActive ? ' is-active' : ''}`}
              onClick={() => setActiveId(cat.id)}
              aria-pressed={isActive}
            >
              <span aria-hidden="true">{cat.icon}</span>
              {cat.label}
            </button>
          )
        })}
      </nav>

      <section className="recipe-section" aria-label={`מתכונים בקטגוריה ${active.label}`}>
        <div className="section-heading">
          <h2>{active.id === 'all' ? 'נבחרו בשבילך' : active.label}</h2>
          <Link href={`/recipes${active.id !== 'all' ? `?cat=${active.id}` : ''}`} className="text-button">
            הכל ({filtered.length})
          </Link>
        </div>

        {displayed.length > 0 ? (
          <div className="recipe-grid">
            {displayed.map((recipe, index) => {
              const totalMinutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
              const imgSrc = recipe.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
              return (
                <article key={recipe.id} className="recipe-card">
                  <Link href={`/recipes/${recipe.id}`} className="recipe-visual" tabIndex={-1} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc} alt="" className="recipe-photo" loading="lazy" />
                  </Link>
                  <button type="button" className="favorite-button" aria-label={`הוסיפי לרשימת המועדפים: ${recipe.title}`}>
                    <HeartIcon />
                  </button>
                  <div className="recipe-info">
                    <Link href={`/recipes/${recipe.id}`}>
                      <h3>{recipe.title}</h3>
                    </Link>
                    {totalMinutes > 0 && (
                      <span aria-label={`זמן הכנה: ${totalMinutes} דקות`}>{totalMinutes} דק׳</span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="empty-state" role="status">
            <p>{active.id === 'all' ? 'עדיין אין מתכונים. הוסיפי את הראשון!' : `אין עדיין מתכונים ב"${active.label}".`}</p>
            <Link href="/recipes/new" className="primary-button">+ מתכון חדש</Link>
          </div>
        )}
      </section>
    </>
  )
}
