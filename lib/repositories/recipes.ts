import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

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
}

/** Recipes enriched with primary external image URL and ingredient names — for card grids and category filtering. */
export async function getRecipeCards(userId: string): Promise<RecipeCardRow[]> {
  const supabase = await createClient()
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  if (!recipes || recipes.length === 0) return []

  const ids = recipes.map((r) => r.id)
  const [imagesRes, ingredientsRes] = await Promise.all([
    supabase
      .from('recipe_images')
      .select('recipe_id, storage_path, is_primary')
      .in('recipe_id', ids),
    supabase.from('ingredients').select('recipe_id, name').in('recipe_id', ids),
  ])

  const imagesByRecipe = new Map<string, string>()
  for (const img of imagesRes.data ?? []) {
    if (!/^https?:\/\//i.test(img.storage_path)) continue
    if (img.is_primary || !imagesByRecipe.has(img.recipe_id)) {
      imagesByRecipe.set(img.recipe_id, img.storage_path)
    }
  }

  const ingredientsByRecipe = new Map<string, string[]>()
  for (const ing of ingredientsRes.data ?? []) {
    const arr = ingredientsByRecipe.get(ing.recipe_id) ?? []
    arr.push(ing.name)
    ingredientsByRecipe.set(ing.recipe_id, arr)
  }

  return recipes.map((r) => ({
    ...r,
    image_url: imagesByRecipe.get(r.id) ?? null,
    ingredientNames: ingredientsByRecipe.get(r.id) ?? [],
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
