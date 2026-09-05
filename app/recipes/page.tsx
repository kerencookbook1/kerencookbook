import { createClient } from '@/lib/supabase/server'
import { getRecipes } from '@/lib/repositories/recipes'
import Link from 'next/link'

export const metadata = { title: 'המתכונים שלי — המטבח של קרן' }

const CARD_THEMES = ['', 'cauliflower', 'lemon', 'pumpkin', 'garden'] as const
const FILTERS = ['הכל', 'צמחוני', 'מהיר', 'מתוקים', 'עוף', 'בשר', 'דגים'] as const

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const recipes = user ? await getRecipes(user.id) : []
  const params = await searchParams
  const activeFilter = params.filter ?? 'הכל'

  return (
    <main className="library-shell">
      <header className="library-header">
        <div className="library-title-row">
          <div>
            <p className="eyebrow">הספרייה שלי</p>
            <h1>המתכונים שלי</h1>
          </div>
          <Link href="/import" className="add-button">
            <span aria-hidden="true">+</span>
            <span>הוספת מתכון</span>
          </Link>
        </div>
      </header>

      <div className="library-tools">
        <div className="library-search">
          <label htmlFor="lib-search" className="sr-only">חיפוש מתכון</label>
          <input
            id="lib-search"
            type="search"
            placeholder="חיפוש מתכון, מרכיב, קטגוריה..."
          />
        </div>
        <nav className="filter-row" aria-label="סינון לפי קטגוריה">
          {FILTERS.map((filter) => (
            <Link
              key={filter}
              href={filter === 'הכל' ? '/recipes' : `/recipes?filter=${encodeURIComponent(filter)}`}
              className={`filter-pill${activeFilter === filter ? ' is-current' : ''}`}
            >
              {filter}
            </Link>
          ))}
        </nav>
      </div>

      {recipes.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <p>עדיין אין מתכונים בספר שלך.</p>
          <Link href="/import" className="primary-button">+ הוסיפי את הראשון</Link>
        </div>
      ) : (
        <>
          <div className="library-count">
            <h2>{recipes.length} מתכונים</h2>
            <span>ממוין לפי תאריך הוספה</span>
          </div>
          <div className="library-grid">
            {recipes.map((recipe, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length]
              const totalMinutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
              return (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="library-card">
                  <div className={`library-visual${theme ? ` ${theme}` : ''}`}>
                    <div className="plate" />
                    <span className="ingredient ingredient-one" />
                    <span className="ingredient ingredient-two" />
                    <span className="ingredient ingredient-three" />
                  </div>
                  <div className="library-card-body">
                    <h3>{recipe.title}</h3>
                    <p>
                      {totalMinutes > 0 ? `${totalMinutes} דק׳` : 'ללא זמן'}
                      {recipe.servings ? ` · ${recipe.servings} מנות` : ''}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
