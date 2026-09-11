import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AnyBackup, BackupRecipe } from '@/lib/backup'

export const runtime = 'nodejs'

/**
 * Restore imports every recipe (and, for a full backup, shopping items +
 * meal plans) as NEW rows. It never deletes or overwrites existing data,
 * so the worst case is duplicates the user can clean up manually.
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

  let payload: AnyBackup
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'קובץ הגיבוי אינו JSON תקין' }, { status: 400 })
  }

  if (!payload || typeof payload !== 'object' || typeof payload.version !== 'number') {
    return NextResponse.json({ error: 'קובץ הגיבוי אינו בפורמט מזוהה' }, { status: 400 })
  }

  let importedRecipes = 0
  let importedShopping = 0
  let importedMeals = 0

  const titleToNewId = new Map<string, string>()

  for (const recipe of payload.recipes ?? []) {
    const newId = await importRecipe(supabase, user.id, recipe)
    if (newId) {
      titleToNewId.set(recipe.title, newId)
      importedRecipes++
    }
  }

  if (payload.kind === 'full') {
    if (payload.shopping_items?.length) {
      const rows = payload.shopping_items.map((s) => ({
        owner_id: user.id,
        name: s.name, amount: s.amount, unit: s.unit, aisle: s.aisle,
        is_checked: s.is_checked,
      }))
      const { error } = await supabase.from('shopping_items').insert(rows)
      if (!error) importedShopping = rows.length
    }

    if (payload.meal_plans?.length) {
      const rows = payload.meal_plans
        .map((m) => {
          const recipeId = titleToNewId.get(m.recipe_title)
          if (!recipeId) return null
          return {
            owner_id: user.id,
            date: m.date,
            meal_type: m.meal_type,
            recipe_id: recipeId,
          }
        })
        .filter((r): r is { owner_id: string; date: string; meal_type: string; recipe_id: string } => r != null)
      if (rows.length) {
        const { error } = await supabase.from('meal_plans').insert(rows)
        if (!error) importedMeals = rows.length
      }
    }
  }

  return NextResponse.json({
    ok: true,
    importedRecipes,
    importedShopping,
    importedMeals,
  })
}

async function importRecipe(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  recipe: BackupRecipe,
): Promise<string | null> {
  const { data: inserted, error } = await supabase
    .from('recipes')
    .insert({
      owner_id: userId,
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      difficulty: recipe.difficulty,
      rating: recipe.rating,
      notes: recipe.notes,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      servings: recipe.servings,
      status: recipe.status ?? 'draft',
      is_favorite: recipe.is_favorite ?? false,
      is_diet_auto: recipe.is_diet_auto ?? false,
      is_diet_override: recipe.is_diet_override ?? null,
    })
    .select('id')
    .single()
  if (error || !inserted) return null

  if (recipe.ingredients?.length) {
    await supabase.from('ingredients').insert(
      recipe.ingredients.map((i) => ({
        recipe_id: inserted.id,
        name: i.name, amount: i.amount, unit: i.unit, position: i.position ?? 0,
      })),
    )
  }
  if (recipe.steps?.length) {
    await supabase.from('recipe_steps').insert(
      recipe.steps.map((s) => ({
        recipe_id: inserted.id,
        title: s.title, body: s.body,
        duration_seconds: s.duration_seconds, position: s.position ?? 0,
      })),
    )
  }
  if (recipe.images?.length) {
    await supabase.from('recipe_images').insert(
      recipe.images.map((im) => ({
        recipe_id: inserted.id,
        storage_path: im.storage_path,
        is_primary: im.is_primary ?? false,
        position: im.position ?? 0,
      })),
    )
  }
  return inserted.id
}
