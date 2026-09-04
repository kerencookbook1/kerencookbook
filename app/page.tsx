import { createClient } from '@/lib/supabase/server'
import { getRecipes } from '@/lib/repositories/recipes'
import Link from 'next/link'

export const metadata = { title: 'המטבח של קרן' }

const CATEGORIES = [
  { label: 'בשר', emoji: '🥩' },
  { label: 'עוף', emoji: '🍗' },
  { label: 'דגים', emoji: '🐟' },
  { label: 'פסטה', emoji: '🍝' },
  { label: 'סלטים', emoji: '🥗' },
  { label: 'מרקים', emoji: '🍲' },
  { label: 'קינוחים', emoji: '🍰' },
  { label: 'אפייה', emoji: '🥐' },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const recentRecipes = user ? await getRecipes(user.id) : []
  const displayed = recentRecipes.slice(0, 6)

  return (
    <main className="reference-home">
      <a href="#main-content" className="skip-link">דלג לתוכן</a>

      <header className="mobile-appbar">
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
          המטבח של קרן
        </h1>
      </header>

      <div id="main-content">
        <div className="reference-search">
          <label htmlFor="search-home" className="sr-only">חיפוש מתכון</label>
          <Link href="/recipes" className="search-box" aria-label="חפשי מתכון">
            חיפוש מתכון, מרכיב, קטגוריה...
          </Link>
        </div>

        <section className="source-shortcuts" aria-label="הוספת מתכון">
          <Link href="/recipes/new" className="source-shortcut accent">
            <strong>+</strong><span>מתכון חדש</span>
          </Link>
          <Link href="/import/photo" className="source-shortcut">
            <strong>◎</strong><span>ייבוא מהאינטרנט</span>
          </Link>
          <Link href="/import/photo" className="source-shortcut sage">
            <strong>▣</strong><span>צילום מתכון</span>
          </Link>
        </section>

        <section className="reference-categories" aria-label="קטגוריות">
          <div className="mini-heading">
            <h2>קטגוריות</h2>
          </div>
          <div className="category-tiles">
            {CATEGORIES.map((cat, index) => (
              <Link
                key={cat.label}
                href={`/recipes?category=${encodeURIComponent(cat.label)}`}
                className={`category-tile tile-${index}`}
              >
                <span aria-hidden>{cat.emoji}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {displayed.length > 0 && (
          <section className="reference-recipes" aria-label="מתכונים אחרונים">
            <div className="mini-heading">
              <h2>המתכונים שלי</h2>
              <Link href="/recipes" className="text-button">
                הצג הכל
              </Link>
            </div>
            <div className="recipe-grid">
              {displayed.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="recipe-card"
                >
                  <div className="recipe-visual">
                    <div className="recipe-photo-placeholder" aria-hidden />
                  </div>
                  <div className="recipe-info">
                    <h3>{recipe.title}</h3>
                    {(recipe.prep_time || recipe.cook_time) && (
                      <span>
                        {(recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)} דק׳
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {displayed.length === 0 && (
          <div className="empty-state">
            <p>עדיין אין מתכונים. הוסיפי את הראשון!</p>
            <Link href="/recipes/new" className="primary-button">
              + מתכון חדש
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
