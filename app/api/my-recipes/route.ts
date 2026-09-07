import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRecipeCards } from '@/lib/repositories/recipes'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

  const recipes = await getRecipeCards(user.id)
  // Trim to only the fields the client search dialog needs
  const trimmed = recipes.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    image_url: r.image_url,
    ingredientNames: r.ingredientNames,
    prep_time: r.prep_time,
    cook_time: r.cook_time,
  }))
  return NextResponse.json({ recipes: trimmed })
}
