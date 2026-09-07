'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { guessAisle, isAisle, type Aisle } from '@/lib/aisles'

async function ensureProfile(userId: string, email: string | null | undefined) {
  const supabase = await createClient()
  const displayName = email?.split('@')[0] ?? null
  await supabase.from('profiles').upsert({ id: userId, display_name: displayName }, { onConflict: 'id' })
}

export async function addShoppingItem(input: {
  name: string
  amount?: string | null
  unit?: string | null
  aisle?: Aisle | null
  sourceRecipeId?: string | null
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'לא מחובר' }
  const name = input.name.trim()
  if (!name) return { ok: false, error: 'שם פריט חסר' }

  await ensureProfile(user.id, user.email)

  const aisle = input.aisle && isAisle(input.aisle) ? input.aisle : guessAisle(name)

  const { error } = await supabase.from('shopping_items').insert({
    owner_id: user.id,
    name,
    amount: input.amount?.trim() || null,
    unit: input.unit?.trim() || null,
    aisle,
    source_recipe_id: input.sourceRecipeId ?? null,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/shopping')
  return { ok: true }
}

export async function addRecipeIngredientsToShoppingList(recipeId: string): Promise<{ ok: boolean; added: number; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, added: 0, error: 'לא מחובר' }
  await ensureProfile(user.id, user.email)

  const { data: ingredients, error: readErr } = await supabase
    .from('ingredients')
    .select('name, amount, unit')
    .eq('recipe_id', recipeId)
    .order('position')
  if (readErr) return { ok: false, added: 0, error: readErr.message }
  if (!ingredients || ingredients.length === 0) return { ok: true, added: 0 }

  const rows = ingredients
    .filter((i) => i.name.trim())
    .map((i) => ({
      owner_id: user.id,
      name: i.name.trim(),
      amount: i.amount?.trim() || null,
      unit: i.unit?.trim() || null,
      aisle: guessAisle(i.name),
      source_recipe_id: recipeId,
    }))

  const { error } = await supabase.from('shopping_items').insert(rows)
  if (error) return { ok: false, added: 0, error: error.message }
  revalidatePath('/shopping')
  return { ok: true, added: rows.length }
}

export async function toggleShoppingItem(id: string, next: boolean): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'לא מחובר' }
  const { error } = await supabase
    .from('shopping_items')
    .update({ is_checked: next })
    .eq('id', id)
    .eq('owner_id', user.id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function deleteShoppingItem(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'לא מחובר' }
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/shopping')
  return { ok: true }
}

export async function clearCheckedShoppingItems(): Promise<{ ok: boolean; deleted: number; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, deleted: 0, error: 'לא מחובר' }
  const { data, error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('owner_id', user.id)
    .eq('is_checked', true)
    .select('id')
  if (error) return { ok: false, deleted: 0, error: error.message }
  revalidatePath('/shopping')
  return { ok: true, deleted: data?.length ?? 0 }
}
