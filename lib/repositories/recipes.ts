import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export type RecipeRow = Database['public']['Tables']['recipes']['Row']
export type IngredientRow = Database['public']['Tables']['ingredients']['Row']
export type StepRow = Database['public']['Tables']['recipe_steps']['Row']

export type RecipeWithDetails = {
  recipe: RecipeRow
  ingredients: IngredientRow[]
  steps: StepRow[]
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

export async function getRecipe(id: string): Promise<RecipeWithDetails | null> {
  const supabase = await createClient()
  const [recipeRes, ingredientsRes, stepsRes] = await Promise.all([
    supabase.from('recipes').select('*').eq('id', id).single(),
    supabase.from('ingredients').select('*').eq('recipe_id', id).order('position'),
    supabase.from('recipe_steps').select('*').eq('recipe_id', id).order('position'),
  ])
  if (recipeRes.error || !recipeRes.data) return null
  return {
    recipe: recipeRes.data,
    ingredients: ingredientsRes.data ?? [],
    steps: stepsRes.data ?? [],
  }
}
