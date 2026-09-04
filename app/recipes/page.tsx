import { createClient } from '@/lib/supabase/server'
import { getRecipes } from '@/lib/repositories/recipes'
import Link from 'next/link'

export const metadata = { title: 'המתכונים שלי — המטבח של קרן' }

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const recipes = user ? await getRecipes(user.id) : []

  return (
    <main className="library-shell">
      <header className="library-header">
        <div className="library-title-row">
          <h1>המתכונים שלי</h1>
          <Link href="/recipes/new" className="add-button" aria-label="הוסף מתכון חדש">
            +
          </Link>
        </div>
      </header>

      {recipes.length === 0 ? (
        <div className="empty-state">
          <p>עדיין אין מתכונים בספר שלך.</p>
          <Link href="/recipes/new" className="primary-button">
            + הוסיפי את הראשון
          </Link>
        </div>
      ) : (
        <div className="library-grid">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="library-card"
            >
              <div className="library-visual">
                <div className="recipe-photo-placeholder" aria-hidden />
              </div>
              <div className="library-card-body">
                <div className="library-title-row">
                  <span>{recipe.title}</span>
                </div>
                <div className="library-count">
                  {recipe.prep_time || recipe.cook_time
                    ? `${(recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)} דק׳`
                    : null}
                  {recipe.servings ? ` · ${recipe.servings} מנות` : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
