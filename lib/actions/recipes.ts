'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { recipeFormSchema } from '@/lib/validations/recipes'
import type { IngredientItem, StepItem } from '@/lib/validations/recipes'
import { isDietAuto } from '@/lib/diet'

function overrideToDbValue(v: 'auto' | 'on' | 'off'): boolean | null {
  if (v === 'on') return true
  if (v === 'off') return false
  return null
}

export type RecipeActionState = { error?: string } | null

function parseJson<T>(raw: string): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function createRecipe(
  _prev: RecipeActionState,
  formData: FormData
): Promise<RecipeActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'לא מחובר' }

  const parsed = recipeFormSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || '',
    category: formData.get('category') || null,
    difficulty: formData.get('difficulty') || null,
    rating: formData.get('rating') || null,
    notes: formData.get('notes') || '',
    prepTime: formData.get('prepTime') || null,
    cookTime: formData.get('cookTime') || null,
    servings: formData.get('servings') || null,
    author: formData.get('author') || '',
    sourceName: formData.get('sourceName') || '',
    sourceUrl: formData.get('sourceUrl') || '',
    ingredientsJson: formData.get('ingredientsJson') ?? '[]',
    stepsJson: formData.get('stepsJson') ?? '[]',
    isDietOverride: formData.get('isDietOverride') || 'auto',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { title, description, category, difficulty, rating, notes, prepTime, cookTime, servings, author, sourceName, sourceUrl, ingredientsJson, stepsJson, isDietOverride } = parsed.data
  const ingredients = parseJson<IngredientItem>(ingredientsJson)
  const steps = parseJson<StepItem>(stepsJson)
  const dietAuto = isDietAuto(title, ingredients.map((i) => i.name))
  const dietOverride = overrideToDbValue(isDietOverride)

  // Ensure a profile row exists (signup does not auto-create one)
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split('@')[0] ??
    null
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, display_name: displayName }, { onConflict: 'id' })
  if (profileError) return { error: `יצירת פרופיל נכשלה: ${profileError.message}` }

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      owner_id: user.id,
      title,
      description: description || null,
      category: category || null,
      difficulty: difficulty || null,
      rating: rating ?? null,
      notes: notes || null,
      prep_time: prepTime ?? null,
      cook_time: cookTime ?? null,
      servings: servings ?? null,
      author: author?.trim() || null,
      source_name: sourceName?.trim() || null,
      source_url: sourceUrl?.trim() || null,
      is_diet_auto: dietAuto,
      is_diet_override: dietOverride,
    })
    .select('id')
    .single()

  if (recipeError || !recipe) return { error: 'שגיאה ביצירת המתכון' }

  if (ingredients.length > 0) {
    await supabase.from('ingredients').insert(
      ingredients
        .filter(ing => ing.name.trim())
        .map((ing, i) => ({
          recipe_id: recipe.id,
          name: ing.name.trim(),
          amount: ing.amount?.trim() || null,
          unit: ing.unit?.trim() || null,
          position: i,
        }))
    )
  }

  if (steps.length > 0) {
    await supabase.from('recipe_steps').insert(
      steps
        .filter(s => s.body.trim())
        .map((s, i) => ({
          recipe_id: recipe.id,
          title: s.title?.trim() || null,
          body: s.body.trim(),
          duration_seconds: s.durationSeconds ?? null,
          position: i,
        }))
    )
  }

  const imageUrl = formData.get('imageUrl')
  if (typeof imageUrl === 'string' && /^https?:\/\//i.test(imageUrl.trim())) {
    await supabase.from('recipe_images').insert({
      recipe_id: recipe.id,
      storage_path: imageUrl.trim(),
      is_primary: true,
      position: 0,
    })
  }

  redirect(`/recipes/${recipe.id}`)
}

export async function updateRecipe(
  _prev: RecipeActionState,
  formData: FormData
): Promise<RecipeActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'לא מחובר' }

  const recipeId = formData.get('recipeId') as string
  if (!recipeId) return { error: 'מזהה מתכון חסר' }

  const parsed = recipeFormSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || '',
    category: formData.get('category') || null,
    difficulty: formData.get('difficulty') || null,
    rating: formData.get('rating') || null,
    notes: formData.get('notes') || '',
    prepTime: formData.get('prepTime') || null,
    cookTime: formData.get('cookTime') || null,
    servings: formData.get('servings') || null,
    author: formData.get('author') || '',
    sourceName: formData.get('sourceName') || '',
    sourceUrl: formData.get('sourceUrl') || '',
    ingredientsJson: formData.get('ingredientsJson') ?? '[]',
    stepsJson: formData.get('stepsJson') ?? '[]',
    isDietOverride: formData.get('isDietOverride') || 'auto',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { title, description, category, difficulty, rating, notes, prepTime, cookTime, servings, author, sourceName, sourceUrl, ingredientsJson, stepsJson, isDietOverride } = parsed.data
  const ingredients = parseJson<IngredientItem>(ingredientsJson)
  const steps = parseJson<StepItem>(stepsJson)
  const dietAuto = isDietAuto(title, ingredients.map((i) => i.name))
  const dietOverride = overrideToDbValue(isDietOverride)

  const { error: updateError } = await supabase
    .from('recipes')
    .update({
      title,
      description: description || null,
      category: category || null,
      difficulty: difficulty || null,
      rating: rating ?? null,
      notes: notes || null,
      prep_time: prepTime ?? null,
      cook_time: cookTime ?? null,
      servings: servings ?? null,
      author: author?.trim() || null,
      source_name: sourceName?.trim() || null,
      source_url: sourceUrl?.trim() || null,
      is_diet_auto: dietAuto,
      is_diet_override: dietOverride,
    })
    .eq('id', recipeId)
    .eq('owner_id', user.id)

  if (updateError) return { error: 'שגיאה בעדכון המתכון' }

  await supabase.from('ingredients').delete().eq('recipe_id', recipeId)
  await supabase.from('recipe_steps').delete().eq('recipe_id', recipeId)

  if (ingredients.length > 0) {
    await supabase.from('ingredients').insert(
      ingredients
        .filter(ing => ing.name.trim())
        .map((ing, i) => ({
          recipe_id: recipeId,
          name: ing.name.trim(),
          amount: ing.amount?.trim() || null,
          unit: ing.unit?.trim() || null,
          position: i,
        }))
    )
  }

  if (steps.length > 0) {
    await supabase.from('recipe_steps').insert(
      steps
        .filter(s => s.body.trim())
        .map((s, i) => ({
          recipe_id: recipeId,
          title: s.title?.trim() || null,
          body: s.body.trim(),
          duration_seconds: s.durationSeconds ?? null,
          position: i,
        }))
    )
  }

  redirect(`/recipes/${recipeId}`)
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('recipes').delete().eq('id', recipeId)
  redirect('/recipes')
}

export async function toggleFavorite(recipeId: string, next: boolean): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'לא מחובר' }

  const { error } = await supabase
    .from('recipes')
    .update({ is_favorite: next })
    .eq('id', recipeId)
    .eq('owner_id', user.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
