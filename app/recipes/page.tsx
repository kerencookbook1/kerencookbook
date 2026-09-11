import { createClient } from '@/lib/supabase/server'
import { getRecipeCards, countRecipes } from '@/lib/repositories/recipes'
import Link from 'next/link'

const PAGE_SIZE = 24

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
  const params = await searchParams
  const dietOnly = params.diet === '1'
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [recipes, totalCount] = user
    ? await Promise.all([
        // Diet filter runs in-memory, so we skip DB LIMIT when active
        // (see getRecipeCards). Otherwise we paginate at the DB layer.
        getRecipeCards(user.id, {
          dietOnly,
          ...(dietOnly ? {} : { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
        }),
        countRecipes(user.id),
      ])
    : [[], 0]
  const activeFilter = params.filter ?? 'הכל'
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const hasPrev = page > 1
  const hasNext = !dietOnly && page < pageCount

  const dietHref = (() => {
    const next = new URLSearchParams(
      Object.entries(params).filter(([, v]) => typeof v === 'string')
    )
    if (dietOnly) next.delete('diet')
    else next.set('diet', '1')
    const qs = next.toString()
    return qs ? `/recipes?${qs}` : '/recipes'
  })()

  const dietCountOnPage = recipes.filter((r) => r.is_diet_effective).length

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            הספרייה שלי
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            המתכונים שלי
          </h1>
        </div>
        <Link
          href="/import"
          className="inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-lime-700"
        >
          <span aria-hidden="true" className="text-base leading-none">+</span>
          <span>הוספת מתכון</span>
        </Link>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: 'סה"כ מתכונים', value: totalCount },
          { label: 'בעמוד זה', value: recipes.length },
          { label: 'דיאטטיים (בעמוד)', value: dietCountOnPage },
          { label: dietOnly ? 'מסונן' : 'עמוד', value: dietOnly ? 'דיאטטי' : `${page} / ${pageCount}` },
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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 shadow-sm sm:min-w-70">
          <span aria-hidden="true" className="text-neutral-400">🔎</span>
          <input
            type="search"
            aria-label="חיפוש מתכון"
            placeholder="חיפוש מתכון, מרכיב, קטגוריה..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
          />
        </div>
        <Link
          href={dietHref}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm transition ${
            dietOnly
              ? 'border-lime-600 bg-lime-600 text-white'
              : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
          }`}
          aria-pressed={dietOnly}
        >
          <span aria-hidden="true">{dietOnly ? '✓' : '○'}</span>
          <span>דיאטטי בלבד</span>
        </Link>
      </div>

      <nav
        className="mt-4 flex flex-wrap gap-1 rounded-lg border border-neutral-200 bg-white p-1 shadow-sm"
        aria-label="סינון לפי קטגוריה"
      >
        {FILTERS.map((filter) => (
          <Link
            key={filter}
            href={filter === 'הכל' ? '/recipes' : `/recipes?filter=${encodeURIComponent(filter)}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              activeFilter === filter
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {filter}
          </Link>
        ))}
      </nav>

      {recipes.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <p className="text-neutral-600">
            {dietOnly ? 'אין מתכונים דיאטטיים עדיין.' : 'עדיין אין מתכונים בספר שלך.'}
          </p>
          <Link
            href="/import"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-lime-700"
          >
            + הוסיפי את הראשון
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">
              {dietOnly
                ? `${recipes.length} מתכונים דיאטטיים`
                : `מציג ${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + recipes.length} מתוך ${totalCount}`}
            </h2>
            <span className="text-xs font-medium text-neutral-500">
              ממוין לפי תאריך הוספה
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe, index: number) => {
              const totalMinutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
              const imgSrc = recipe.image_url || FOOD_IMAGES[index % FOOD_IMAGES.length]
              return (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgSrc}
                      alt={recipe.title}
                      className="aspect-4/3 w-full object-cover"
                      loading="lazy"
                    />
                    {recipe.is_diet_effective && (
                      <span className="absolute right-3 top-3 rounded-full bg-lime-100 px-2 py-1 text-xs font-semibold text-lime-700 shadow-sm">
                        ✓ דיאטטי
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      {recipe.category && (
                        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">
                          {recipe.category}
                        </span>
                      )}
                      <span className="text-xs text-neutral-500">
                        {totalMinutes > 0 ? `${totalMinutes} דק׳` : 'ללא זמן'}
                        {recipe.servings ? ` · ${recipe.servings} מנות` : ''}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold leading-snug line-clamp-2">
                      {recipe.title}
                    </h3>
                  </div>
                </Link>
              )
            })}
          </div>

          {!dietOnly && pageCount > 1 && (
            <nav
              className="mt-8 flex items-center justify-center gap-2"
              aria-label="פאגינציה"
            >
              {hasPrev ? (
                <Link
                  href={pageHref(params, page - 1)}
                  className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 shadow-sm hover:border-neutral-300 hover:bg-neutral-50"
                  aria-label="עמוד קודם"
                  prefetch
                >
                  ← הקודם
                </Link>
              ) : (
                <span className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-400" aria-hidden>
                  ← הקודם
                </span>
              )}
              <span className="px-3 text-sm font-medium text-neutral-600">
                עמוד {page} מתוך {pageCount}
              </span>
              {hasNext ? (
                <Link
                  href={pageHref(params, page + 1)}
                  className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 shadow-sm hover:border-neutral-300 hover:bg-neutral-50"
                  aria-label="עמוד הבא"
                  prefetch
                >
                  הבא →
                </Link>
              ) : (
                <span className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-400" aria-hidden>
                  הבא →
                </span>
              )}
            </nav>
          )}
        </>
      )}
    </main>
  )
}

function pageHref(params: Record<string, string>, targetPage: number): string {
  const next = new URLSearchParams(
    Object.entries(params).filter(([, v]) => typeof v === 'string'),
  )
  if (targetPage <= 1) next.delete('page')
  else next.set('page', String(targetPage))
  const qs = next.toString()
  return qs ? `/recipes?${qs}` : '/recipes'
}
