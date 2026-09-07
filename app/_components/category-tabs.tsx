'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CATEGORIES, guessCategory, isCategoryId, type CategoryId } from '@/lib/categories'
import { FavoriteButton } from './favorite-button'

type RecipeCard = {
  id: string
  title: string
  prep_time: number | null
  cook_time: number | null
  category: string | null
  is_favorite?: boolean
  image_url?: string | null
  ingredientNames?: string[]
}

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

/** Effective category: use stored value if valid, else guess by keywords. */
function effectiveCategory(r: RecipeCard): CategoryId {
  if (isCategoryId(r.category)) return r.category
  return guessCategory(r.title, r.ingredientNames)
}

export function CategoryTabs({ recipes }: { recipes: RecipeCard[] }) {
  const [activeId, setActiveId] = useState<'all' | CategoryId>('all')

  // Count recipes per category (using effective category for uncategorized rows)
  const countByCategory = useMemo(() => {
    const counts = new Map<CategoryId, number>()
    for (const r of recipes) {
      const cat = effectiveCategory(r)
      counts.set(cat, (counts.get(cat) ?? 0) + 1)
    }
    return counts
  }, [recipes])

  const filtered = useMemo(() => {
    if (activeId === 'all') return recipes
    return recipes.filter((r) => effectiveCategory(r) === activeId)
  }, [recipes, activeId])

  const displayed = filtered.slice(0, 6)
  const activeLabel = activeId === 'all' ? 'הכל' : activeId

  // Show only categories that have at least one recipe, plus "all"
  const visibleCategories = CATEGORIES.filter((c) => (countByCategory.get(c.id) ?? 0) > 0)

  return (
    <>
      <nav className="category-tabs" aria-label="קטגוריות">
        <button
          type="button"
          className={`category-tab${activeId === 'all' ? ' is-active' : ''}`}
          onClick={() => setActiveId('all')}
          aria-pressed={activeId === 'all'}
        >
          <span aria-hidden="true">🍽️</span>
          הכל ({recipes.length})
        </button>
        {visibleCategories.map((cat) => {
          const isActive = cat.id === activeId
          const count = countByCategory.get(cat.id) ?? 0
          return (
            <button
              key={cat.id}
              type="button"
              className={`category-tab${isActive ? ' is-active' : ''}`}
              onClick={() => setActiveId(cat.id)}
              aria-pressed={isActive}
            >
              <span aria-hidden="true">{cat.icon}</span>
              {cat.id} ({count})
            </button>
          )
        })}
      </nav>

      <section className="recipe-section" aria-label={`מתכונים בקטגוריה ${activeLabel}`}>
        <div className="section-heading">
          <h2>{activeId === 'all' ? 'נבחרו בשבילך' : activeLabel}</h2>
          <Link href={`/recipes${activeId !== 'all' ? `?category=${encodeURIComponent(activeId)}` : ''}`} className="text-button">
            הכל ({filtered.length})
          </Link>
        </div>

        {displayed.length > 0 ? (
          <div className="recipe-grid">
            {displayed.map((recipe, index) => {
              const totalMinutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
              const imgSrc = recipe.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
              const catLabel = effectiveCategory(recipe)
              return (
                <article key={recipe.id} className="recipe-card">
                  <Link href={`/recipes/${recipe.id}`} className="recipe-visual" tabIndex={-1} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc} alt="" className="recipe-photo" loading="lazy" />
                  </Link>
                  <FavoriteButton recipeId={recipe.id} initial={!!recipe.is_favorite} title={recipe.title} />
                  <div className="recipe-info">
                    <Link href={`/recipes/${recipe.id}`}>
                      <h3>{recipe.title}</h3>
                    </Link>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="recipe-tag">{catLabel}</span>
                      {totalMinutes > 0 && (
                        <span aria-label={`זמן הכנה: ${totalMinutes} דקות`}>{totalMinutes} דק׳</span>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="empty-state" role="status">
            <p>{activeId === 'all' ? 'עדיין אין מתכונים. הוסיפי את הראשון!' : `אין עדיין מתכונים ב"${activeLabel}".`}</p>
            <Link href="/recipes/new" className="primary-button">+ מתכון חדש</Link>
          </div>
        )}
      </section>
    </>
  )
}
