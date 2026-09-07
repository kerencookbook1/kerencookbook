'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type MealType = 'breakfast' | 'lunch' | 'dinner'

function isMealType(v: unknown): v is MealType {
  return v === 'breakfast' || v === 'lunch' || v === 'dinner'
}

async function ensureProfile(userId: string, email: string | null | undefined) {
  const supabase = await createClient()
  const displayName = email?.split('@')[0] ?? null
  await supabase.from('profiles').upsert({ id: userId, display_name: displayName }, { onConflict: 'id' })
}

export async function setMealPlan(input: {
  date: string        // YYYY-MM-DD
  mealType: MealType
  recipeId: string
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'לא מחובר' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { ok: false, error: 'תאריך לא תקין' }
  if (!isMealType(input.mealType)) return { ok: false, error: 'סוג ארוחה לא תקין' }

  await ensureProfile(user.id, user.email)

  const { error } = await supabase
    .from('meal_plans')
    .upsert(
      {
        owner_id: user.id,
        date: input.date,
        meal_type: input.mealType,
        recipe_id: input.recipeId,
      },
      { onConflict: 'owner_id,date,meal_type' }
    )
  if (error) return { ok: false, error: error.message }
  revalidatePath('/meals')
  return { ok: true }
}

export async function clearMealPlan(input: {
  date: string
  mealType: MealType
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'לא מחובר' }

  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('owner_id', user.id)
    .eq('date', input.date)
    .eq('meal_type', input.mealType)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/meals')
  return { ok: true }
}
