'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { guessAisle, isAisle, type Aisle } from '@/lib/aisles'
import { parseIngredientLine } from '@/lib/ingredients'
import { mergeAmounts, shoppingMergeKey, stripDescriptors } from '@/lib/shopping-normalize'

async function ensureProfile(userId: string, email: string | null | undefined) {
  const supabase = await createClient()
  const displayName = email?.split('@')[0] ?? null
  await supabase.from('profiles').upsert({ id: userId, display_name: displayName }, { onConflict: 'id' })
}

/**
 * Look for an existing unchecked row with the same normalized (name, unit).
 * If found, merge amounts in-place and return true; otherwise return false
 * so the caller can insert a fresh row.
 */
async function mergeIntoExisting(input: {
  userId: string
  name: string
  amount: string | null
  unit: string | null
}): Promise<boolean> {
  const supabase = await createClient()
  const targetKey = shoppingMergeKey(input.name, input.unit)

  const { data: existingRows } = await supabase
    .from('shopping_items')
    .select('id, name, amount, unit')
    .eq('owner_id', input.userId)
    .eq('is_checked', false)

  if (!existingRows) return false
  const match = existingRows.find(
    (row) => shoppingMergeKey(row.name, row.unit) === targetKey
  )
  if (!match) return false

  const nextAmount = mergeAmounts(match.amount, input.amount)
  await supabase
    .from('shopping_items')
    .update({ amount: nextAmount })
    .eq('id', match.id)
    .eq('owner_id', input.userId)
  return true
}

export async function addShoppingItem(input: {
  name: string
  amount?: string | null
  unit?: string | null
  aisle?: Aisle | null
  sourceRecipeId?: string | null
}): Promise<{ ok: boolean; error?: string; merged?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'לא מחובר' }
  const rawName = input.name.trim()
  if (!rawName) return { ok: false, error: 'שם פריט חסר' }

  await ensureProfile(user.id, user.email)

  // If caller only sent a name (typical for the free-text add box), parse
  // out amount + unit so "6 ביצים" doesn't land in the name column.
  let name = rawName
  let amount = input.amount?.trim() || null
  let unit = input.unit?.trim() || null
  if (!amount && !unit) {
    const parsed = parseIngredientLine(rawName)
    name = parsed.name
    amount = parsed.amount || null
    unit = parsed.unit || null
  }

  // Strip cooking descriptors — the shopping list wants the product only.
  name = stripDescriptors(name)
  if (!name) return { ok: false, error: 'שם פריט חסר' }

  // Try merge into an existing unchecked row before inserting.
  const merged = await mergeIntoExisting({ userId: user.id, name, amount, unit })
  if (merged) {
    revalidatePath('/shopping')
    return { ok: true, merged: true }
  }

  const aisle = input.aisle && isAisle(input.aisle) ? input.aisle : guessAisle(name)

  const { error } = await supabase.from('shopping_items').insert({
    owner_id: user.id,
    name,
    amount,
    unit,
    aisle,
    source_recipe_id: input.sourceRecipeId ?? null,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/shopping')
  return { ok: true }
}

export async function addRecipeIngredientsToShoppingList(
  recipeId: string,
): Promise<{ ok: boolean; added: number; merged: number; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, added: 0, merged: 0, error: 'לא מחובר' }
  await ensureProfile(user.id, user.email)

  const { data: ingredients, error: readErr } = await supabase
    .from('ingredients')
    .select('name, amount, unit')
    .eq('recipe_id', recipeId)
    .order('position')
  if (readErr) return { ok: false, added: 0, merged: 0, error: readErr.message }
  if (!ingredients || ingredients.length === 0) return { ok: true, added: 0, merged: 0 }

  const { data: existingRows } = await supabase
    .from('shopping_items')
    .select('id, name, amount, unit')
    .eq('owner_id', user.id)
    .eq('is_checked', false)

  const existingByKey = new Map<string, { id: string; amount: string | null }>()
  for (const row of existingRows ?? []) {
    existingByKey.set(shoppingMergeKey(row.name, row.unit), {
      id: row.id,
      amount: row.amount,
    })
  }

  let merged = 0
  let inserted = 0
  const toInsert: Array<{
    owner_id: string
    name: string
    amount: string | null
    unit: string | null
    aisle: string | null
    source_recipe_id: string
  }> = []

  for (const ing of ingredients) {
    const rawName = (ing.name ?? '').trim()
    if (!rawName) continue
    const name = stripDescriptors(rawName)
    if (!name) continue
    const amount = ing.amount?.trim() || null
    const unit = ing.unit?.trim() || null
    const key = shoppingMergeKey(name, unit)

    const existing = existingByKey.get(key)
    if (existing) {
      const nextAmount = mergeAmounts(existing.amount, amount)
      await supabase
        .from('shopping_items')
        .update({ amount: nextAmount })
        .eq('id', existing.id)
        .eq('owner_id', user.id)
      // update in-map so a later duplicate within the SAME recipe also merges
      existingByKey.set(key, { id: existing.id, amount: nextAmount })
      merged++
    } else {
      const row = {
        owner_id: user.id,
        name,
        amount,
        unit,
        aisle: guessAisle(name),
        source_recipe_id: recipeId,
      }
      toInsert.push(row)
      // Reserve the key so two identical lines in the same recipe merge
      // together instead of both being inserted.
      existingByKey.set(key, { id: '__pending__', amount })
      inserted++
    }
  }

  if (toInsert.length > 0) {
    // Handle in-recipe duplicates that we queued: sum them before insert.
    const dedup = new Map<string, typeof toInsert[number]>()
    for (const row of toInsert) {
      const key = shoppingMergeKey(row.name, row.unit)
      const prev = dedup.get(key)
      if (prev) prev.amount = mergeAmounts(prev.amount, row.amount)
      else dedup.set(key, { ...row })
    }
    const { error } = await supabase.from('shopping_items').insert(Array.from(dedup.values()))
    if (error) return { ok: false, added: 0, merged, error: error.message }
    inserted = dedup.size
  }

  revalidatePath('/shopping')
  return { ok: true, added: inserted, merged }
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
