'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getKeyCandidates } from '@/lib/ai-providers'
import { importRecipeFromUrl } from '@/lib/url-recipe-extractor'
import { parseIngredientLine } from '@/lib/ingredients'

export type RebuildResult = { ok: true } | { ok: false; error: string }

/**
 * Re-run the URL extractor on an existing recipe and replace its ingredients
 * + steps with the fresh output. Uses the current (improved) HTML cleanup,
 * AI prompt, and noise filter — so recipes that were imported before the
 * cleanup work can be rehabilitated without a manual re-import.
 *
 * We DELIBERATELY leave title, description, category, image, notes, ratings,
 * timing, and attribution alone: the user may have edited those by hand and
 * we don't want to clobber that work. Only the actionable content (what to
 * cook + how to cook it) is replaced.
 */
export async function rebuildRecipeFromSource(recipeId: string): Promise<RebuildResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'לא מחובר' }

  // Fetch the recipe + confirm the current user owns it
  const { data: recipe, error: fetchErr } = await supabase
    .from('recipes')
    .select('id, owner_id, source_url')
    .eq('id', recipeId)
    .single()
  if (fetchErr || !recipe) return { ok: false, error: 'המתכון לא נמצא' }
  if (recipe.owner_id !== user.id) return { ok: false, error: 'אין הרשאה למתכון הזה' }
  if (!recipe.source_url) {
    return { ok: false, error: 'למתכון הזה אין כתובת מקור. אפשר לבנות מחדש רק מתכונים שיובאו מקישור.' }
  }

  const candidates = await getKeyCandidates()
  if (candidates.length === 0) {
    return { ok: false, error: 'לא הוגדר ספק AI. עברי להגדרות ה-API להוסיף מפתח.' }
  }

  let extracted
  try {
    extracted = await importRecipeFromUrl(recipe.source_url, candidates)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }

  const cleanedIngredients = extracted.ingredients
    .map((line) => parseIngredientLine(line))
    .filter((i) => i.name.trim().length > 0)

  const cleanedSteps = extracted.steps
    .map((s) => ({ title: s.title ?? null, body: s.body.trim() }))
    .filter((s) => s.body)

  // Replace ingredients + steps in a single transaction-ish sequence.
  // (Supabase JS lacks explicit transactions client-side, but delete-then-
  // insert is idempotent enough for this feature.)
  const { error: delIngErr } = await supabase.from('ingredients').delete().eq('recipe_id', recipeId)
  if (delIngErr) return { ok: false, error: `שגיאה במחיקת מרכיבים ישנים: ${delIngErr.message}` }

  const { error: delStepErr } = await supabase.from('recipe_steps').delete().eq('recipe_id', recipeId)
  if (delStepErr) return { ok: false, error: `שגיאה במחיקת שלבים ישנים: ${delStepErr.message}` }

  if (cleanedIngredients.length > 0) {
    const { error: insIngErr } = await supabase.from('ingredients').insert(
      cleanedIngredients.map((ing, i) => ({
        recipe_id: recipeId,
        name: ing.name.trim(),
        amount: ing.amount?.trim() || null,
        unit: ing.unit?.trim() || null,
        position: i,
      })),
    )
    if (insIngErr) return { ok: false, error: `שגיאה בהוספת מרכיבים חדשים: ${insIngErr.message}` }
  }

  if (cleanedSteps.length > 0) {
    const { error: insStepErr } = await supabase.from('recipe_steps').insert(
      cleanedSteps.map((step, i) => ({
        recipe_id: recipeId,
        title: step.title,
        body: step.body,
        duration_seconds: null,
        position: i,
      })),
    )
    if (insStepErr) return { ok: false, error: `שגיאה בהוספת שלבים חדשים: ${insStepErr.message}` }
  }

  revalidatePath(`/recipes/${recipeId}`)
  return { ok: true }
}
