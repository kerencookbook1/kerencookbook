import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getRecipeCards } from '@/lib/repositories/recipes'
import { CategoryTabs } from './_components/category-tabs'
import { FavoriteButton } from './_components/favorite-button'

export const metadata = { title: 'המטבח של קרן' }

function greetingByHour(hour: number): string {
  if (hour >= 5 && hour < 11) return 'בוקר טוב! מה אוכלים להיום?'
  if (hour >= 11 && hour < 16) return 'מה בא לך לצהריים?'
  if (hour >= 16 && hour < 22) return 'מה מבשלים לארוחת ערב?'
  return 'מה מכינים לפני שהולכים לישון?'
}

const IMPORT_TILES = [
  { href: '/import/photo', label: 'צילום מתכון',    icon: '📷', hint: 'צלמי דף מודפס',      color: '#f4d3a7' },
  { href: '/import/url',   label: 'ייבוא מקישור',   icon: '🌐', hint: 'הדביקי כתובת אתר',    color: '#c7dbf4' },
  { href: '/pantry',       label: 'מה יש לי בבית?', icon: '🍳', hint: 'מרכיבים שיש לי',      color: '#d8ecc9' },
  { href: '/shopping',     label: 'רשימת קניות',    icon: '🛒', hint: 'מקובצת לפי מעברים',   color: '#f4d3d8' },
  { href: '/meals',        label: 'תכנון ארוחות',   icon: '📅', hint: 'תפריט שבועי',         color: '#dfe2f4' },
] as const

const FAV_FALLBACK_IMAGES = [
  '/images/recipes/lemon-cake-default.png',
  '/images/recipes/meatballs-default.png',
  '/images/recipes/creamy-pasta-default.png',
  '/images/recipes/salmon-default.png',
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const recipes = user ? await getRecipeCards(user.id) : []
  const favorites = recipes.filter((r) => r.is_favorite).slice(0, 4)
  const greeting = greetingByHour(new Date().getHours())

  return (
    <main className="app-shell">
      <a href="#main-content" className="skip-link">דלג לתוכן</a>

      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">✿</span>
          המטבח של קרן
        </Link>
        <Link href="/recipes" className="search-box" aria-label="חפשי מתכון">
          חיפוש מתכון, מרכיב, קטגוריה...
        </Link>
        <Link href="/import" className="add-button" aria-label="הוספת מתכון חדש">
          <span aria-hidden="true">+</span>
          <span>הוספת מתכון</span>
        </Link>
      </header>

      <section className="hero" aria-label="ברוכה הבאה">
        <div className="hero-copy">
          <p className="eyebrow">היי 👋</p>
          <h1>{greeting}</h1>
          <p className="hero-text">
            המתכונים האהובים מהמטבח שלי, לאנשים שאני אוהבת.
          </p>
          <Link href="/recipes" className="primary-button">
            למתכונים שלי
          </Link>
        </div>

        <div className="hero-image-wrap" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/recipes/shakshuka-default.png" alt="" className="hero-image" />
        </div>
      </section>

      {/* Import tiles */}
      <nav className="import-tiles" aria-label="הוספת מתכון">
        {IMPORT_TILES.map((tile) => (
          <Link key={tile.href} href={tile.href} className="import-tile" style={{ background: tile.color }}>
            <span className="import-tile-icon" aria-hidden="true">{tile.icon}</span>
            <div>
              <p className="import-tile-label">{tile.label}</p>
              <p className="import-tile-hint">{tile.hint}</p>
            </div>
          </Link>
        ))}
      </nav>

      {/* Favorites */}
      {favorites.length > 0 && (
        <section className="favorites-section" aria-label="המועדפים שלי">
          <div className="section-heading">
            <h2>המועדפים שלי</h2>
            <span style={{ color: 'var(--muted)', fontSize: '.9rem' }}>{favorites.length} מתכונים</span>
          </div>
          <div className="favorites-scroll">
            {favorites.map((recipe, i) => {
              const imgSrc = recipe.image_url || FAV_FALLBACK_IMAGES[i % FAV_FALLBACK_IMAGES.length]
              return (
                <article key={recipe.id} className="favorite-card">
                  <Link href={`/recipes/${recipe.id}`} className="recipe-visual" tabIndex={-1} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc} alt="" className="recipe-photo" loading="lazy" />
                  </Link>
                  <FavoriteButton recipeId={recipe.id} initial={true} title={recipe.title} />
                  <div className="recipe-info">
                    <Link href={`/recipes/${recipe.id}`}>
                      <h3>{recipe.title}</h3>
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      <div id="main-content">
        <CategoryTabs recipes={recipes} />
      </div>
    </main>
  )
}
