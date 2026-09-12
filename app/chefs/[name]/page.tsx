import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES, guessCategory, isCategoryId, type CategoryId } from '@/lib/categories'

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  return { title: `${decodeURIComponent(name)} — שף · המטבח של קרן` }
}

type CategoryBucket = {
  id: CategoryId
  icon: string
  count: number
}

const CATEGORY_TINT: Record<CategoryId, string> = {
  'בשר':         '#f5dad2',
  'עוף':         '#f7e2c0',
  'דגים':        '#d4e6f1',
  'חלבי':        '#f9f0d4',
  'צמחוני':      '#dcecd0',
  'פסטה':        '#f8e0d8',
  'אורז ודגנים': '#f0e5d0',
  'סלטים':       '#dceaca',
  'מרקים':       '#f5d4b8',
  'מאפים':       '#f0d9be',
  'קינוחים':     '#f4d3d8',
  'שתייה':       '#dfe4f0',
  'אחר':         '#eee6db',
}

export default async function ChefCategoriesPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name: encoded } = await params
  const chefName = decodeURIComponent(encoded).trim()
  if (!chefName) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // Match recipes where the chef's name appears as either the author OR the
  // source_name — /chefs groups on both, so drill-down has to as well.
  const { data: recipesRaw } = await supabase
    .from('recipes')
    .select('id, title, category, ingredients(name)')
    .eq('owner_id', user.id)
    .or(`author.eq."${chefName.replace(/"/g, '\\"')}",source_name.eq."${chefName.replace(/"/g, '\\"')}"`)

  const recipes = recipesRaw ?? []
  if (recipes.length === 0) notFound()

  // Bucket by effective category (uses guessCategory when stored value is missing)
  const buckets = new Map<CategoryId, CategoryBucket>()
  for (const r of recipes) {
    const cat = isCategoryId(r.category)
      ? r.category
      : guessCategory(r.title, (r.ingredients ?? []).map((i) => (i as { name: string }).name))
    const existing = buckets.get(cat)
    if (existing) existing.count++
    else {
      const meta = CATEGORIES.find((c) => c.id === cat)
      buckets.set(cat, { id: cat, icon: meta?.icon ?? '🍽️', count: 1 })
    }
  }

  const sortedBuckets = Array.from(buckets.values()).sort((a, b) => b.count - a.count)

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <Link href="/chefs" className="text-xs font-medium text-neutral-500 hover:text-neutral-900">
        ← כל השפים
      </Link>

      <header className="mt-3 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">שף</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{chefName}</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {recipes.length} מתכונים ב־{sortedBuckets.length} קטגוריות
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sortedBuckets.map((bucket) => (
          <Link
            key={bucket.id}
            href={`/chefs/${encodeURIComponent(chefName)}/${encodeURIComponent(bucket.id)}`}
            className="group flex flex-col items-center rounded-xl border border-neutral-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-lime-500 hover:shadow-md"
          >
            <div
              className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
              style={{ background: CATEGORY_TINT[bucket.id] }}
              aria-hidden
            >
              {bucket.icon}
            </div>
            <div className="text-base font-bold text-neutral-900">{bucket.id}</div>
            <div className="mt-1 text-xs font-semibold text-neutral-500">
              {bucket.count} {bucket.count === 1 ? 'מתכון' : 'מתכונים'}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
