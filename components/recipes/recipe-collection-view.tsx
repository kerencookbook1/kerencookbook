'use client'

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Grid2X2, List } from 'lucide-react'
import { RecipeImagePlaceholder } from '@/components/recipes/recipe-image-placeholder'
import type { RecipeCardRow } from '@/lib/repositories/recipes'
import { recipeByline } from '@/lib/recipe-attribution'

type ViewMode = 'grid' | 'list'

function RecipeMeta({ recipe, compact = false }: { recipe: RecipeCardRow; compact?: boolean }) {
  const totalMinutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
  return <div className={`recipe-collection-meta${compact ? ' is-compact' : ''}`}>
    {recipe.category && <span className="recipe-collection-category">{recipe.category}</span>}
    <span className="recipe-collection-author">מאת {recipeByline({ author: recipe.author, sourceName: recipe.source_name, sourceUrl: recipe.source_url, notes: recipe.notes })}</span>
    <span>{totalMinutes > 0 ? `${totalMinutes} דק׳` : 'ללא זמן'}</span>
    {recipe.servings ? <span>· {recipe.servings} מנות</span> : null}
  </div>
}

export function RecipeCollectionView({ recipes }: { recipes: RecipeCardRow[] }) {
  const [mode, setMode] = useState<ViewMode>('grid')

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem('recipes-view-mode')
      if (saved === 'list' || saved === 'grid') setMode(saved)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  function changeMode(nextMode: ViewMode) {
    setMode(nextMode)
    window.localStorage.setItem('recipes-view-mode', nextMode)
  }

  return <section aria-label="רשימת המתכונים">
    <div className="recipe-collection-toolbar">
      <span className="recipe-collection-view-label">תצוגה</span>
      <div className="recipe-view-toggle" role="group" aria-label="בחירת תצוגת מתכונים">
        <button type="button" className={mode === 'grid' ? 'is-active' : ''} onClick={() => changeMode('grid')} aria-pressed={mode === 'grid'}><Grid2X2 size={17} aria-hidden="true" /><span>כרטיסים</span></button>
        <button type="button" className={mode === 'list' ? 'is-active' : ''} onClick={() => changeMode('list')} aria-pressed={mode === 'list'}><List size={18} aria-hidden="true" /><span>רשימה</span></button>
      </div>
    </div>

    {mode === 'grid' ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-4/3 w-full">
          {recipe.image_url ? <img src={recipe.image_url} alt={recipe.title} className="aspect-4/3 w-full object-cover" loading="lazy" /> : <RecipeImagePlaceholder category={recipe.category} title={recipe.title} ingredientNames={recipe.ingredientNames} />}
          {recipe.is_diet_effective && <span className="absolute right-3 top-3 rounded-full bg-lime-100 px-2 py-1 text-xs font-semibold text-lime-700 shadow-sm">✓ דיאטטי</span>}
        </div>
        <div className="p-4"><RecipeMeta recipe={recipe} /><h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug">{recipe.title}</h3></div>
      </Link>)}
    </div> : <div className="recipe-list-view">
      {recipes.map((recipe) => <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="recipe-list-row">
        <div className="recipe-list-thumb">
          {recipe.image_url ? <img src={recipe.image_url} alt="" loading="lazy" /> : <RecipeImagePlaceholder category={recipe.category} title={recipe.title} ingredientNames={recipe.ingredientNames} />}
        </div>
        <div className="recipe-list-copy">
          <div className="recipe-list-title-row"><h3>{recipe.title}</h3>{recipe.is_diet_effective && <span className="recipe-list-diet">דיאטטי</span>}</div>
          <RecipeMeta recipe={recipe} compact />
          {recipe.ingredientNames.length > 0 && <p>{recipe.ingredientNames.slice(0, 3).join(' · ')}</p>}
        </div>
        <span className="recipe-list-arrow" aria-hidden="true">←</span>
      </Link>)}
    </div>}
  </section>
}
