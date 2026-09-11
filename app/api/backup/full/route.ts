import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { collectRecipes } from '../recipes/route'
import { BACKUP_VERSION, type FullBackup } from '@/lib/backup'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

  const [{ data: profile }, { data: shopping }, { data: meals }] = await Promise.all([
    supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).maybeSingle(),
    supabase.from('shopping_items').select('name, amount, unit, aisle, is_checked, created_at').eq('owner_id', user.id),
    supabase.from('meal_plans').select('date, meal_type, recipe_id, created_at').eq('owner_id', user.id),
  ])

  // Meal plans reference recipes by id; convert to titles for portability.
  const recipes = await collectRecipes(supabase, user.id)
  const idToTitle = new Map<string, string>()
  const { data: rawRecipes } = await supabase.from('recipes').select('id, title').eq('owner_id', user.id)
  for (const r of rawRecipes ?? []) idToTitle.set(r.id, r.title)

  const backup: FullBackup = {
    version: BACKUP_VERSION,
    kind: 'full',
    exportedAt: new Date().toISOString(),
    profile: profile ? { display_name: profile.display_name, avatar_url: profile.avatar_url } : null,
    recipes,
    shopping_items: (shopping ?? []).map((s) => ({
      name: s.name, amount: s.amount, unit: s.unit, aisle: s.aisle,
      is_checked: s.is_checked, created_at: s.created_at,
    })),
    meal_plans: (meals ?? [])
      .filter((m) => idToTitle.has(m.recipe_id))
      .map((m) => ({
        date: m.date,
        meal_type: m.meal_type,
        recipe_title: idToTitle.get(m.recipe_id)!,
        created_at: m.created_at,
      })),
  }

  const filename = `keren-full-backup-${new Date().toISOString().slice(0, 10)}.json`
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
