import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BACKUP_VERSION, type BackupRecipe, type RecipesBackup } from '@/lib/backup'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

  const recipes = await collectRecipes(supabase, user.id)

  const backup: RecipesBackup = {
    version: BACKUP_VERSION,
    kind: 'recipes',
    exportedAt: new Date().toISOString(),
    recipes,
  }

  const filename = `keren-recipes-${new Date().toISOString().slice(0, 10)}.json`
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

export async function collectRecipes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<BackupRecipe[]> {
  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })

  if (!recipes || recipes.length === 0) return []
  const ids = recipes.map((r) => r.id)

  const [ingredientsRes, stepsRes, imagesRes] = await Promise.all([
    supabase.from('ingredients').select('*').in('recipe_id', ids).order('position'),
    supabase.from('recipe_steps').select('*').in('recipe_id', ids).order('position'),
    supabase.from('recipe_images').select('*').in('recipe_id', ids).order('position'),
  ])

  const byRecipe = (rows: Array<{ recipe_id: string }> | null) => {
    const m = new Map<string, Array<{ recipe_id: string }>>()
    for (const row of rows ?? []) {
      const arr = m.get(row.recipe_id) ?? []
      arr.push(row)
      m.set(row.recipe_id, arr)
    }
    return m
  }
  const ingByRecipe = byRecipe(ingredientsRes.data)
  const stepsByRecipe = byRecipe(stepsRes.data)
  const imgsByRecipe = byRecipe(imagesRes.data)

  return recipes.map((r) => ({
    title: r.title,
    description: r.description,
    category: r.category,
    difficulty: r.difficulty,
    rating: r.rating,
    notes: r.notes,
    prep_time: r.prep_time,
    cook_time: r.cook_time,
    servings: r.servings,
    status: r.status,
    is_favorite: r.is_favorite,
    is_diet_auto: r.is_diet_auto,
    is_diet_override: r.is_diet_override,
    created_at: r.created_at,
    updated_at: r.updated_at,
    ingredients: (ingByRecipe.get(r.id) ?? []).map((i: any) => ({
      name: i.name, amount: i.amount, unit: i.unit, position: i.position,
    })),
    steps: (stepsByRecipe.get(r.id) ?? []).map((s: any) => ({
      title: s.title, body: s.body, duration_seconds: s.duration_seconds, position: s.position,
    })),
    images: (imgsByRecipe.get(r.id) ?? []).map((im: any) => ({
      storage_path: im.storage_path, is_primary: im.is_primary, position: im.position,
    })),
  }))
}
