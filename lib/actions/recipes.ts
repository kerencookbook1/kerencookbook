'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { recipeFormSchema } from '@/lib/validations/recipes'
import type { IngredientItem, StepItem } from '@/lib/validations/recipes'
import { isDietAuto } from '@/lib/diet'
import { parseIngredientLine } from '@/lib/ingredients'
import type { Database } from '@/lib/supabase/types'

type RecipeInsert = Database['public']['Tables']['recipes']['Insert']

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
    sourcePhotoPath: formData.get('sourcePhotoPath') || '',
    ingredientsJson: formData.get('ingredientsJson') ?? '[]',
    stepsJson: formData.get('stepsJson') ?? '[]',
    isDietOverride: formData.get('isDietOverride') || 'auto',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { title, description, category, difficulty, rating, notes, prepTime, cookTime, servings, author, sourceName, sourceUrl, sourcePhotoPath, ingredientsJson, stepsJson, isDietOverride } = parsed.data
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

  // Attempt full insert including the newer attribution columns. If the DB
  // schema is behind (migrations 0009/0010 not run), Supabase reports
  // "column X does not exist" — we detect that and retry without the
  // missing columns so the recipe still saves. Any other error is surfaced
  // to the user with its actual message instead of a generic string.
  const fullPayload: RecipeInsert = {
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
    source_photo_path: sourcePhotoPath?.trim() || null,
    is_diet_auto: dietAuto,
    is_diet_override: dietOverride,
  }

  const ATTRIBUTION_COLUMNS = ['author', 'source_name', 'source_url', 'source_photo_path'] as const

  let insertRes = await supabase.from('recipes').insert(fullPayload).select('id').single()

  if (insertRes.error) {
    const missing = /column\s+"?(\w+)"?\s+.*does\s+not\s+exist/i.exec(insertRes.error.message)?.[1]
    if (missing && ATTRIBUTION_COLUMNS.includes(missing as typeof ATTRIBUTION_COLUMNS[number])) {
      // Migrations 0009/0010 not yet applied — retry without the attribution columns.
      const retryPayload = { ...fullPayload }
      for (const k of ATTRIBUTION_COLUMNS) delete retryPayload[k as keyof RecipeInsert]
      insertRes = await supabase.from('recipes').insert(retryPayload).select('id').single()
      if (!insertRes.error) {
        console.warn(
          `[createRecipe] attribution columns missing from DB — recipe saved without them.
Run this in Supabase SQL Editor to re-enable them:
  ALTER TABLE recipes ADD COLUMN IF NOT EXISTS author            TEXT;
  ALTER TABLE recipes ADD COLUMN IF NOT EXISTS source_name       TEXT;
  ALTER TABLE recipes ADD COLUMN IF NOT EXISTS source_url        TEXT;
  ALTER TABLE recipes ADD COLUMN IF NOT EXISTS source_photo_path TEXT;`
        )
      }
    }
  }

  const { data: recipe, error: recipeError } = insertRes

  if (recipeError || !recipe) {
    console.error('[createRecipe] insert failed:', recipeError)
    return {
      error: `שגיאה ביצירת המתכון: ${recipeError?.message ?? 'לא ידוע'}`,
    }
  }

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

  // `imageUrl` can be either an external HTTP(S) URL (URL / video imports) or
  // a storage path from the recipe-images bucket (photo imports uploaded the
  // photo client-side before calling this action).
  const imageUrl = formData.get('imageUrl')
  if (typeof imageUrl === 'string' && imageUrl.trim()) {
    const raw = imageUrl.trim()
    const isUrl = /^https?:\/\//i.test(raw)
    const looksLikeStoragePath = /^[0-9a-f-]{36}\/.+/i.test(raw)
    if (isUrl || looksLikeStoragePath) {
      await supabase.from('recipe_images').insert({
        recipe_id: recipe.id,
        storage_path: raw,
        is_primary: true,
        position: 0,
      })
    }
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
    sourcePhotoPath: formData.get('sourcePhotoPath') || '',
    ingredientsJson: formData.get('ingredientsJson') ?? '[]',
    stepsJson: formData.get('stepsJson') ?? '[]',
    isDietOverride: formData.get('isDietOverride') || 'auto',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { title, description, category, difficulty, rating, notes, prepTime, cookTime, servings, author, sourceName, sourceUrl, sourcePhotoPath, ingredientsJson, stepsJson, isDietOverride } = parsed.data
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
      source_photo_path: sourcePhotoPath?.trim() || null,
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

/** Save a recipe generated from the pantry assistant as a reviewable draft. */
export async function saveGeneratedRecipe(input: {
  title: string
  description: string
  ingredients: string[]
  steps: string[]
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'לא מחובר' }

  const title = input.title.trim().slice(0, 160)
  const description = input.description.trim().slice(0, 500)
  const ingredients = input.ingredients.map((line) => parseIngredientLine(line)).filter((item) => item.name.trim()).slice(0, 40)
  const steps = input.steps.map((body) => body.trim().slice(0, 1000)).filter(Boolean).slice(0, 20)
  if (!title || ingredients.length === 0 || steps.length === 0) return { ok: false, error: 'המתכון שהתקבל חסר מרכיבים או שלבים' }

  const displayName = user.email?.split('@')[0] ?? null
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, display_name: displayName }, { onConflict: 'id' })
  if (profileError) return { ok: false, error: `יצירת פרופיל נכשלה: ${profileError.message}` }

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      owner_id: user.id,
      title,
      description: description || null,
      category: 'אחר',
      source_name: 'העוזר החכם — מה שיש בבית',
      status: 'draft',
      is_diet_auto: isDietAuto(title, ingredients.map((item) => item.name)),
    })
    .select('id')
    .single()
  if (recipeError || !recipe) return { ok: false, error: `שמירת המתכון נכשלה: ${recipeError?.message ?? 'שגיאה לא ידועה'}` }

  const { error: ingredientsError } = await supabase.from('ingredients').insert(
    ingredients.map((item, position) => ({ recipe_id: recipe.id, name: item.name, amount: item.amount || null, unit: item.unit || null, position }))
  )
  const { error: stepsError } = await supabase.from('recipe_steps').insert(
    steps.map((body, position) => ({ recipe_id: recipe.id, title: `שלב ${position + 1}`, body, position }))
  )
  if (ingredientsError || stepsError) return { ok: false, error: `המתכון נשמר חלקית: ${ingredientsError?.message ?? stepsError?.message ?? 'שגיאה בשמירת הפרטים'}` }

  revalidatePath('/recipes')
  revalidatePath(`/recipes/${recipe.id}`)
  return { ok: true, id: recipe.id }
}
