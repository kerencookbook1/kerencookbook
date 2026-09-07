import { createClient } from '@/lib/supabase/server'
import { getRecipeCards } from '@/lib/repositories/recipes'
import Link from 'next/link'

export const metadata = { title: 'המתכונים שלי — המטבח של קרן' }

const FOOD_IMAGES = [
  '/images/recipes/shakshuka-default.png',
  '/images/recipes/cauliflower-tahini-default.png',
  '/images/recipes/lemon-cake-default.png',
  '/images/recipes/creamy-pasta-default.png',
  '/images/recipes/meatballs-default.png',
  '/images/recipes/pumpkin-soup-default.png',
  '/images/recipes/salmon-default.png',
  '/images/recipes/herb-salad-default.png',
  '/images/recipes/tomato-pasta-default.png',
] as const

const FILTERS = ['הכל', 'צמחוני', 'מהיר', 'מתוקים', 'עוף', 'בשר', 'דגים'] as const

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const recipes = user ? await getRecipeCards(user.id) : []
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
              const totalMinutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
              const imgSrc = recipe.image_url || FOOD_IMAGES[index % FOOD_IMAGES.length]
              return (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="library-card">
                  <div className="library-visual">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc} alt={recipe.title} className="recipe-photo" loading="lazy" />
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
