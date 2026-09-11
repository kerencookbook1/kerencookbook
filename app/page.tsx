import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getRecipeCards } from '@/lib/repositories/recipes'
import { CategoryTabs } from './_components/category-tabs'
import { FavoriteButton } from './_components/favorite-button'
import { SearchBarTrigger } from './_components/search-trigger'

export const metadata = { title: 'המטבח של קרן' }

function greetingByHour(hour: number): string {
  if (hour >= 5 && hour < 11) return 'בוקר טוב! מה אוכלים היום?'
  if (hour >= 11 && hour < 16) return 'מה בא לך לצהריים?'
  if (hour >= 16 && hour < 22) return 'מה מבשלים לארוחת ערב?'
  return 'מה מכינים לפני שהולכים לישון?'
}

const IMPORT_TILES = [
  { href: '/import/photo', label: 'צילום מתכון',    icon: '📷', hint: 'צלמי דף מודפס' },
  { href: '/import/url',   label: 'ייבוא מקישור',   icon: '🌐', hint: 'הדביקי כתובת אתר' },
  { href: '/pantry',       label: 'מה יש לי בבית?', icon: '🍳', hint: 'מרכיבים שיש לי' },
  { href: '/shopping',     label: 'רשימת קניות',    icon: '🛒', hint: 'מקובצת לפי מעברים' },
  { href: '/meals',        label: 'תכנון ארוחות',   icon: '📅', hint: 'תפריט שבועי' },
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

  // Home page is a snapshot — cap at 12 latest recipes to keep the query
  // fast. The full list lives at /recipes with pagination.
  const recipes = user ? await getRecipeCards(user.id, { limit: 12 }) : []
  const favorites = recipes.filter((r) => r.is_favorite).slice(0, 4)
  const dietCount = recipes.filter((r) => r.is_diet_effective).length
  const greeting = greetingByHour(new Date().getHours())

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <a href="#main-content" className="skip-link">דלג לתוכן</a>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span aria-hidden="true" className="text-lime-600">✿</span>
          המטבח של קרן
        </Link>
        <div className="flex items-center gap-2">
          <SearchBarTrigger />
          <Link
            href="/import"
            className="inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-lime-700"
            aria-label="הוספת מתכון חדש"
          >
            <span aria-hidden="true" className="text-base leading-none">+</span>
            <span className="hidden sm:inline">הוספת מתכון</span>
          </Link>
        </div>
      </header>

      <section className="mt-8" aria-label="ברוכה הבאה">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          היי 👋
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {greeting}
        </h1>
        <p className="mt-3 max-w-xl text-base text-neutral-600">
          המתכונים האהובים מהמטבח שלי, לאנשים שאני אוהבת.
        </p>
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: 'סה"כ מתכונים', value: recipes.length },
          { label: 'מועדפים', value: favorites.length },
          { label: 'דיאטטיים', value: dietCount },
          { label: 'קטגוריות', value: new Set(recipes.map((r) => r.category).filter(Boolean)).size },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {s.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <nav className="mt-8" aria-label="הוספת מתכון">
        <h2 className="mb-3 text-lg font-semibold">איך תוסיפי מתכון?</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {IMPORT_TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-lime-300 hover:shadow-md"
            >
              <span aria-hidden="true" className="text-2xl">
                {tile.icon}
              </span>
              <p className="mt-3 text-sm font-semibold text-neutral-900">
                {tile.label}
              </p>
              <p className="mt-1 text-xs text-neutral-500">{tile.hint}</p>
            </Link>
          ))}
        </div>
      </nav>

      {favorites.length > 0 && (
        <section className="mt-10" aria-label="המועדפים שלי">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">המועדפים שלי</h2>
            <span className="text-xs font-medium text-neutral-500">
              {favorites.length} מתכונים
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {favorites.map((recipe, i) => {
              const imgSrc = recipe.image_url || FAV_FALLBACK_IMAGES[i % FAV_FALLBACK_IMAGES.length]
              return (
                <article
                  key={recipe.id}
                  className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Link href={`/recipes/${recipe.id}`} tabIndex={-1}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgSrc}
                      alt=""
                      className="aspect-4/3 w-full object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div className="absolute right-2 top-2">
                    <FavoriteButton recipeId={recipe.id} initial={true} title={recipe.title} />
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                      {recipe.title}
                    </h3>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      <div id="main-content" className="mt-10">
        <CategoryTabs recipes={recipes} />
      </div>
    </main>
  )
}
