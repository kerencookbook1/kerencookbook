import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { resolveRecipeImageUrl } from '@/lib/recipe-image-url'
import { RecipeImagePlaceholder } from '@/components/recipes/recipe-image-placeholder'

export const metadata = { title: 'שפים — המטבח של קרן' }

type ChefSummary = {
  author: string
  recipeCount: number
  categories: string[]
  latestImage: string | null
  latestCategory: string | null
  latestTitle: string
}

/**
 * Group the user's recipes by `author` and surface chefs with at least two
 * recipes. The user asked for this floor so that a one-off imported recipe
 * doesn't create a "chef" tile with a single dish behind it.
 */
export default async function ChefsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
        <p>לא מחובר.</p>
      </main>
    )
  }

  const { data: recipesRaw, error } = await supabase
    .from('recipes')
    .select('id, title, author, category')
    .eq('owner_id', user.id)
    .not('author', 'is', null)
    .order('updated_at', { ascending: false })

  // If the author column is not yet in the DB, guide the user to run migration.
  if (error && /column.*author.*does not exist/i.test(error.message)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
        <h1 className="text-3xl font-bold mb-4">שפים</h1>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-semibold mb-2">חסרה עמודה במסד הנתונים.</p>
          <p className="text-sm mb-3">
            צריך להריץ ב-Supabase SQL Editor פעם אחת:
          </p>
          <pre className="text-xs bg-white p-3 rounded overflow-x-auto" dir="ltr">
{`ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS author      TEXT,
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS source_url  TEXT;`}
          </pre>
        </div>
      </main>
    )
  }

  const recipes = recipesRaw ?? []

  // Group by normalized author name so "יותם אוטולנגי " and "יותם אוטולנגי"
  // collapse into the same entry.
  const byAuthor = new Map<string, ChefSummary>()
  for (const r of recipes) {
    const name = (r.author ?? '').trim()
    if (!name) continue
    const existing = byAuthor.get(name)
    if (existing) {
      existing.recipeCount++
      if (r.category && !existing.categories.includes(r.category)) {
        existing.categories.push(r.category)
      }
    } else {
      byAuthor.set(name, {
        author: name,
        recipeCount: 1,
        categories: r.category ? [r.category] : [],
        latestImage: null,
        latestCategory: r.category ?? null,
        latestTitle: r.title,
      })
    }
  }

  const chefs = Array.from(byAuthor.values())
    .filter((c) => c.recipeCount >= 2)
    .sort((a, b) => b.recipeCount - a.recipeCount)

  // Fetch a hero image (the primary image of any of the chef's recipes) so
  // each chef tile isn't just a text row.
  if (chefs.length > 0) {
    const authorNames = chefs.map((c) => c.author)
    const { data: withImages } = await supabase
      .from('recipes')
      .select('author, category, title, recipe_images(storage_path, is_primary, position)')
      .eq('owner_id', user.id)
      .in('author', authorNames)
      .order('updated_at', { ascending: false })

    for (const row of withImages ?? []) {
      if (!row.author) continue
      const chef = byAuthor.get(row.author.trim())
      if (!chef || chef.latestImage) continue
      const images = (row as { recipe_images?: Array<{ storage_path: string; is_primary: boolean; position: number }> }).recipe_images ?? []
      const primary = images.find((i) => i.is_primary) ?? images[0]
      if (primary) {
        chef.latestImage = resolveRecipeImageUrl(null, primary.storage_path)
      }
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          לפי מחבר
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          שפים
        </h1>
        <p className="mt-3 max-w-xl text-sm text-neutral-600">
          שפים ומחברים שיש להם לפחות שני מתכונים בספר שלך. הקישי כדי לראות את הקטגוריות של השף ומשם למתכונים עצמם.
        </p>
      </header>

      {chefs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <p className="text-neutral-600 mb-2">
            עדיין אין שפים עם 2 מתכונים או יותר בספר שלך.
          </p>
          <p className="text-sm text-neutral-500 mb-4">
            הוספי שדה &quot;מחבר/שף&quot; במתכונים בעריכה, וכשיהיו לפחות 2 מתכונים של אותו שם — הוא יופיע כאן.
          </p>
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-lime-700"
          >
            למתכונים שלי ←
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chefs.map((chef) => (
            <Link
              key={chef.author}
              href={`/chefs/${encodeURIComponent(chef.author)}`}
              className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-lime-500 hover:shadow-md"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden">
                {chef.latestImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={chef.latestImage}
                    alt=""
                    className="aspect-4/3 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <RecipeImagePlaceholder
                    category={chef.latestCategory}
                    title={chef.latestTitle}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 text-white drop-shadow">
                  <div className="text-xs font-semibold uppercase tracking-wide opacity-90">שף</div>
                  <div className="text-xl font-bold leading-tight">{chef.author}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="text-sm font-semibold text-neutral-700">
                  {chef.recipeCount} מתכונים
                </span>
                <span className="text-xs text-neutral-500">
                  {chef.categories.length > 0
                    ? `${chef.categories.slice(0, 2).join(' · ')}${chef.categories.length > 2 ? ' …' : ''}`
                    : 'ללא קטגוריה'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
