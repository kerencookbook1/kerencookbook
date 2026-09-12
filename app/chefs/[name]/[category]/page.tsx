import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveRecipeImageUrl } from '@/lib/recipe-image-url'
import { RecipeImagePlaceholder } from '@/components/recipes/recipe-image-placeholder'
import { guessCategory, isCategoryId } from '@/lib/categories'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string; category: string }>
}) {
  const { name, category } = await params
  return {
    title: `${decodeURIComponent(category)} · ${decodeURIComponent(name)} — המטבח של קרן`,
  }
}

export default async function ChefCategoryRecipesPage({
  params,
}: {
  params: Promise<{ name: string; category: string }>
}) {
  const { name: encodedName, category: encodedCategory } = await params
  const chefName = decodeURIComponent(encodedName).trim()
  const category = decodeURIComponent(encodedCategory).trim()
  if (!chefName || !category) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: recipesRaw } = await supabase
    .from('recipes')
    .select('id, title, category, prep_time, cook_time, ingredients(name), recipe_images(storage_path, is_primary, position)')
    .eq('owner_id', user.id)
    .eq('author', chefName)
    .order('updated_at', { ascending: false })

  const all = recipesRaw ?? []
  if (all.length === 0) notFound()

  // Filter by effective category (uses guessCategory when stored value is missing)
  const filtered = all.filter((r) => {
    const cat = isCategoryId(r.category)
      ? r.category
      : guessCategory(r.title, (r.ingredients ?? []).map((i) => (i as { name: string }).name))
    return cat === category
  })

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <Link
        href={`/chefs/${encodeURIComponent(chefName)}`}
        className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
      >
        ← קטגוריות של {chefName}
      </Link>

      <header className="mt-3 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {chefName} · {category}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {category}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          {filtered.length} מתכונים
        </p>
      </header>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <p className="text-neutral-600">אין מתכונים בקטגוריה הזאת אצל השף.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => {
            const totalMinutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
            const images = (recipe as { recipe_images?: Array<{ storage_path: string; is_primary: boolean; position: number }> }).recipe_images ?? []
            const primary = images.find((i) => i.is_primary) ?? images[0]
            const imgUrl = primary ? resolveRecipeImageUrl(null, primary.storage_path) : null
            return (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden">
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgUrl}
                      alt={recipe.title}
                      className="aspect-4/3 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <RecipeImagePlaceholder
                      category={recipe.category}
                      title={recipe.title}
                      ingredientNames={(recipe.ingredients ?? []).map((i) => (i as { name: string }).name)}
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold leading-snug line-clamp-2">
                    {recipe.title}
                  </h3>
                  <div className="mt-2 text-xs text-neutral-500">
                    {totalMinutes > 0 ? `${totalMinutes} דק׳` : 'ללא זמן'}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
