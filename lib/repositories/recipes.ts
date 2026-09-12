import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { resolveRecipeImageUrl } from '@/lib/recipe-image-url'

export type RecipeRow = Database['public']['Tables']['recipes']['Row']
export type IngredientRow = Database['public']['Tables']['ingredients']['Row']
export type StepRow = Database['public']['Tables']['recipe_steps']['Row']
export type ImageRow = Database['public']['Tables']['recipe_images']['Row']

export type RecipeWithDetails = {
  recipe: RecipeRow
  ingredients: IngredientRow[]
  steps: StepRow[]
  images: ImageRow[]
}

/** Fast count of a user's recipes — for pagination UI. Runs as a `head` request with `count: 'exact'`, so no rows are transferred. */
export async function countRecipes(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('recipes')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', userId)
  if (error) throw error
  return count ?? 0
}

export async function getRecipes(userId: string): Promise<RecipeRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export type RecipeCardRow = RecipeRow & {
  image_url: string | null
  ingredientNames: string[]
  is_diet_effective: boolean
}

export type GetRecipeCardsOptions = {
  dietOnly?: boolean
  /** Max rows to return. Omit for no limit (used by pages that need the full set — search, pantry, meal planning). */
  limit?: number
  /** Skip N rows before returning (paired with `limit` for pagination). */
  offset?: number
}

/** Recipes enriched with primary external image URL and ingredient names — for card grids and category filtering. */
export async function getRecipeCards(
  userId: string,
  options: GetRecipeCardsOptions = {},
): Promise<RecipeCardRow[]> {
  const supabase = await createClient()
  let query = supabase
    .from('recipes')
    .select('*')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false })

  // Apply LIMIT at the DB layer when the caller doesn't need diet-filtering.
  // Diet filtering happens in-memory below, so we can't rely on the LIMIT
  // clause when dietOnly is true — a limited-then-filtered page would show
  // fewer results than expected. In that case we skip DB pagination.
  if (options.limit != null && !options.dietOnly) {
    const from = options.offset ?? 0
    query = query.range(from, from + options.limit - 1)
  }

  const { data: recipes, error } = await query
  if (error) throw error
  if (!recipes || recipes.length === 0) return []

  const filtered = options.dietOnly
    ? recipes.filter((r) =>
        r.is_diet_override === true ||
        (r.is_diet_override === null && r.is_diet_auto === true),
      )
    : recipes

  if (filtered.length === 0) return []

  const ids = filtered.map((r) => r.id)
  const [imagesRes, ingredientsRes] = await Promise.all([
    supabase
      .from('recipe_images')
      .select('recipe_id, storage_path, is_primary')
      .in('recipe_id', ids),
    supabase.from('ingredients').select('recipe_id, name').in('recipe_id', ids),
  ])

  // Prefer the primary image; fall back to the first row per recipe. Storage-path
  // entries are resolved to public URLs (bucket is public-read after migration
  // 0008); external http(s) entries are returned as-is.
  // Prefer the primary image; fall back to the first row per recipe. Storage-path
  // entries are resolved to public URLs (bucket is public-read after migration
  // 0008); external http(s) entries are returned as-is.
  const imagesByRecipe = new Map<string, string>()
  for (const img of imagesRes.data ?? []) {
    const url = resolveRecipeImageUrl(null, img.storage_path)
    if (!url) continue
    if (img.is_primary || !imagesByRecipe.has(img.recipe_id)) {
      imagesByRecipe.set(img.recipe_id, url)
    }
  }

  const ingredientsByRecipe = new Map<string, string[]>()
  for (const ing of ingredientsRes.data ?? []) {
    const arr = ingredientsByRecipe.get(ing.recipe_id) ?? []
    arr.push(ing.name)
    ingredientsByRecipe.set(ing.recipe_id, arr)
  }

  return filtered.map((r) => ({
    ...r,
    image_url: imagesByRecipe.get(r.id) ?? null,
    ingredientNames: ingredientsByRecipe.get(r.id) ?? [],
    is_diet_effective:
      r.is_diet_override === true ||
      (r.is_diet_override === null && r.is_diet_auto === true),
  }))
}

export async function getRecipe(id: string): Promise<RecipeWithDetails | null> {
  const supabase = await createClient()
  const [recipeRes, ingredientsRes, stepsRes, imagesRes] = await Promise.all([
    supabase.from('recipes').select('*').eq('id', id).single(),
    supabase.from('ingredients').select('*').eq('recipe_id', id).order('position'),
    supabase.from('recipe_steps').select('*').eq('recipe_id', id).order('position'),
    supabase.from('recipe_images').select('*').eq('recipe_id', id).order('position'),
  ])
  if (recipeRes.error || !recipeRes.data) return null
  return {
    recipe: recipeRes.data,
    ingredients: ingredientsRes.data ?? [],
    steps: stepsRes.data ?? [],
    images: imagesRes.data ?? [],
  }
}
