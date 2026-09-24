'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type Recipe = {
  id: string
  title: string
  category: string | null
  source_name: string | null
  image_url: string | null
  ingredientNames: string[]
  prep_time: number | null
  cook_time: number | null
}

function normalize(value: string) {
  return value.toLocaleLowerCase('he').replace(/[.,;:!?()\-/]/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function LocalRecipeSearch() {
  const [query, setQuery] = useState('')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/my-recipes')
      .then(async (response) => response.ok ? response.json() : { recipes: [] })
      .then((data) => setRecipes(data.recipes ?? []))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false))
  }, [])

  const results = useMemo(() => {
    const value = normalize(query)
    if (!value) return []
    const pool = recipes.filter((recipe) => {
      const haystack = normalize([recipe.title, recipe.category ?? '', recipe.source_name ?? '', ...recipe.ingredientNames].join(' '))
      return haystack.includes(value)
    })
    return pool.slice(0, 10)
  }, [query, recipes])

  return (
    <section className="local-search-section" aria-labelledby="local-search-title">
      <div className="search-section-heading">
        <div>
          <p className="eyebrow">הספר האישי שלך</p>
          <h2 id="local-search-title">המתכונים שלי</h2>
        </div>
        <span>{recipes.length} מתכונים</span>
      </div>
      <div className="local-search-row">
        <label className="local-search-input" htmlFor="local-recipe-search">
          <span className="sr-only">חיפוש במתכונים השמורים</span>
        <input
          id="local-recipe-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="חפשי לפי שם, מרכיב או קטגוריה"
        />
        </label>
      </div>
      {loading && <p className="search-muted">טוענת את המתכונים שלך…</p>}
      {!loading && results.length > 0 && (
        <div className="local-recipe-grid">
          {results.map((recipe) => {
            const minutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
            return (
              <Link href={`/recipes/${recipe.id}`} className="local-recipe-card" key={recipe.id}>
                {recipe.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={recipe.image_url} alt="" loading="lazy" />
                ) : <div className="local-recipe-placeholder" aria-hidden="true">🍲</div>}
                <span>
                  <strong>{recipe.title}</strong>
                  <small>{recipe.category || recipe.source_name || (minutes ? `${minutes} דקות` : 'מתכון שמור')}</small>
                </span>
              </Link>
            )
          })}
        </div>
      )}
      {!loading && results.length === 0 && (
        <div className="local-search-empty">
          <strong>{query ? `לא מצאתי מתכון שמור עבור “${query}”` : 'כתבי משהו כדי לחפש במתכונים שלך'}</strong>
          <span>{query ? 'אפשר להמשיך מיד לחיפוש בגוגל שנמצא מתחת.' : 'התוצאות יופיעו כאן תוך כדי הכתיבה.'}</span>
        </div>
      )}
    </section>
  )
}
