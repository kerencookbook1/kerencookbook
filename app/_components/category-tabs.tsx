'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CATEGORIES, guessCategory, isCategoryId, type CategoryId } from '@/lib/categories'
import { FavoriteButton } from './favorite-button'
import { RecipeImagePlaceholder } from '@/components/recipes/recipe-image-placeholder'

type RecipeCard = {
  id: string
  title: string
  prep_time: number | null
  cook_time: number | null
  category: string | null
  is_favorite?: boolean
  is_diet_effective?: boolean
  image_url?: string | null
  ingredientNames?: string[]
}

/** Non-category filters that show as tiles alongside categories. */
type SpecialId = 'all' | 'diet'
type FilterId = SpecialId | CategoryId

/** Colored circle bg per category — visually distinct without needing custom illustrations. */
const CATEGORY_TILE_COLOR: Record<CategoryId, string> = {
  'בשר':         '#f5dad2',
  'עוף':         '#f7e2c0',
  'דגים':        '#d4e6f1',
  'חלבי':        '#f9f0d4',
  'צמחוני':      '#dcecd0',
  'פסטה':        '#f8e0d8',
  'אורז ודגנים': '#f0e5d0',
  'סלטים':       '#dceaca',
  'מרקים':       '#f5d4b8',
  'מאפים':       '#f0d9be',
  'קינוחים':     '#f4d3d8',
  'שתייה':       '#dfe4f0',
  'אחר':         '#eee6db',
}

/** Effective category: use stored value if valid, else guess by keywords. */
function effectiveCategory(r: RecipeCard): CategoryId {
  if (isCategoryId(r.category)) return r.category
  return guessCategory(r.title, r.ingredientNames)
}

export function CategoryTabs({ recipes }: { recipes: RecipeCard[] }) {
  const [activeId, setActiveId] = useState<FilterId>('all')
  const [showAll, setShowAll] = useState(false)

  // Count per category (using effective category for uncategorized rows)
  const countByCategory = useMemo(() => {
    const counts = new Map<CategoryId, number>()
    for (const r of recipes) {
      const cat = effectiveCategory(r)
      counts.set(cat, (counts.get(cat) ?? 0) + 1)
    }
    return counts
  }, [recipes])

  const dietCount = useMemo(
    () => recipes.filter((r) => r.is_diet_effective).length,
    [recipes],
  )

  const filtered = useMemo(() => {
    if (activeId === 'all') return recipes
    if (activeId === 'diet') return recipes.filter((r) => r.is_diet_effective)
    return recipes.filter((r) => effectiveCategory(r) === activeId)
  }, [recipes, activeId])

  const displayed = filtered.slice(0, 6)
  const activeLabel =
    activeId === 'all' ? 'הכל' : activeId === 'diet' ? 'דיאטטי' : activeId

  // Show only categories that have at least one recipe (unless user opens "show all")
  const nonEmpty = CATEGORIES.filter((c) => (countByCategory.get(c.id) ?? 0) > 0)
  const visibleCategories = showAll ? CATEGORIES : nonEmpty
  const canToggleShowAll = nonEmpty.length < CATEGORIES.length

  return (
    <>
      <section aria-label="קטגוריות" style={{ marginBottom: 28 }}>
        <div className="section-heading" style={{ marginBottom: 14 }}>
          <h2>קטגוריות</h2>
          {canToggleShowAll && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="text-button"
              style={{ background: 'none', cursor: 'pointer' }}
            >
              {showAll ? 'הצג רק פעילות ←' : 'הצג הכל ←'}
            </button>
          )}
        </div>

        <div className="category-grid">
          {/* "All" tile always first */}
          <button
            type="button"
            className={`category-tile${activeId === 'all' ? ' is-active' : ''}`}
            onClick={() => setActiveId('all')}
            aria-pressed={activeId === 'all'}
            style={{ '--tile-color': '#efe4d0' } as React.CSSProperties}
          >
            <span className="category-tile-icon" aria-hidden="true">🍽️</span>
            <span className="category-tile-label">הכל</span>
            <span className="category-tile-count">{recipes.length}</span>
          </button>

          {/* "Diet" tile — always visible, even at 0 count */}
          <button
            type="button"
            className={`category-tile${activeId === 'diet' ? ' is-active' : ''}`}
            onClick={() => setActiveId('diet')}
            aria-pressed={activeId === 'diet'}
            style={{ '--tile-color': '#dcecd0' } as React.CSSProperties}
          >
            <span className="category-tile-icon" aria-hidden="true">🥗</span>
            <span className="category-tile-label">דיאטטי</span>
            <span className="category-tile-count">{dietCount}</span>
          </button>

          {visibleCategories.map((cat) => {
            const isActive = cat.id === activeId
            const count = countByCategory.get(cat.id) ?? 0
            const isEmpty = count === 0
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-tile${isActive ? ' is-active' : ''}${isEmpty ? ' is-empty' : ''}`}
                onClick={() => setActiveId(cat.id)}
                aria-pressed={isActive}
                disabled={isEmpty}
                style={{ '--tile-color': CATEGORY_TILE_COLOR[cat.id] } as React.CSSProperties}
              >
                <span className="category-tile-icon" aria-hidden="true">{cat.icon}</span>
                <span className="category-tile-label">{cat.id}</span>
                <span className="category-tile-count">{count}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="recipe-section" aria-label={`מתכונים בקטגוריה ${activeLabel}`}>
        <div className="section-heading">
          <h2>{activeId === 'all' ? 'נבחרו בשבילך' : activeLabel}</h2>
          <Link
            href={
              activeId === 'all'
                ? '/recipes'
                : activeId === 'diet'
                  ? '/recipes?diet=1'
                  : `/recipes?category=${encodeURIComponent(activeId)}`
            }
            className="text-button"
          >
            הכל ({filtered.length})
          </Link>
        </div>

        {displayed.length > 0 ? (
          <div className="recipe-grid">
            {displayed.map((recipe) => {
              const totalMinutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
              const catLabel = effectiveCategory(recipe)
              return (
                <article key={recipe.id} className="recipe-card">
                  <Link href={`/recipes/${recipe.id}`} className="recipe-visual has-title-overlay" tabIndex={-1}>
                    {recipe.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={recipe.image_url} alt="" className="recipe-photo" loading="lazy" />
                    ) : (
                      <div className="recipe-photo" style={{ padding: 0 }}>
                        <RecipeImagePlaceholder
                          category={recipe.category}
                          title={recipe.title}
                          ingredientNames={recipe.ingredientNames}
                        />
                      </div>
                    )}
                    <div className="recipe-title-overlay">
                      <h3>{recipe.title}</h3>
                    </div>
                  </Link>
                  <FavoriteButton recipeId={recipe.id} initial={!!recipe.is_favorite} title={recipe.title} />
                  <div className="recipe-info">
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
            <p>
              {activeId === 'all'
                ? 'עדיין אין מתכונים. הוסיפי את הראשון!'
                : activeId === 'diet'
                  ? 'עדיין אין מתכונים דיאטטיים. סמני מתכון כדיאטטי כדי שיופיע כאן.'
                  : `אין עדיין מתכונים ב"${activeLabel}".`}
            </p>
            <Link href="/recipes/new" className="primary-button">+ מתכון חדש</Link>
          </div>
        )}
      </section>
    </>
  )
}
