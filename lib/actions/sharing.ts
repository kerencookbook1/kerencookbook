'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const emailSchema = z.string().trim().email('הכניסי כתובת אימייל תקינה').max(255)

export type IncomingShare = {
  id: string
  recipeId: string
  recipeTitle: string
  senderName: string
  senderEmail: string | null
  createdAt: string
  status: 'pending' | 'accepted' | 'rejected'
}

export type SharePreview = {
  title: string
  description: string | null
  ingredients: Array<{ name: string; amount: string | null; unit: string | null }>
  steps: Array<{ title: string | null; body: string }>
}

async function currentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function sendRecipeShare(recipeId: string, recipientEmail: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase, user } = await currentUser()
  if (!user) return { ok: false, error: 'לא מחובר' }
  const email = emailSchema.safeParse(recipientEmail.toLowerCase())
  if (!email.success) return { ok: false, error: email.error.issues[0]?.message ?? 'אימייל לא תקין' }

  const { data: recipe } = await supabase.from('recipes').select('id').eq('id', recipeId).eq('owner_id', user.id).single()
  if (!recipe) return { ok: false, error: 'המתכון לא נמצא אצלך' }

  const admin = createAdminClient()
  const { data: users, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (usersError) return { ok: false, error: 'לא הצלחתי לבדוק את המשתמשים הרשומים' }
  const recipient = users.users.find((candidate) => candidate.email?.toLowerCase() === email.data)
  if (!recipient) return { ok: false, error: 'לא נמצא משתמש רשום עם האימייל הזה' }
  if (recipient.id === user.id) return { ok: false, error: 'אי אפשר לשתף מתכון עם עצמך' }

  const { error } = await supabase.from('recipe_shares').upsert({
    recipe_id: recipeId,
    sender_id: user.id,
    recipient_id: recipient.id,
    status: 'pending',
    responded_at: null,
  }, { onConflict: 'recipe_id,recipient_id' })
  if (error) return { ok: false, error: `שליחת בקשת השיתוף נכשלה: ${error.message}` }
  revalidatePath(`/recipes/${recipeId}`)
  revalidatePath('/sharing')
  return { ok: true }
}

export async function getIncomingShares(): Promise<IncomingShare[]> {
  const { user } = await currentUser()
  if (!user) return []
  const admin = createAdminClient()
  const { data: shares, error } = await admin.from('recipe_shares').select('*').eq('recipient_id', user.id).order('created_at', { ascending: false })
  if (error || !shares?.length) return []

  const senderIds = [...new Set(shares.map((share) => share.sender_id))]
  const recipeIds = [...new Set(shares.map((share) => share.recipe_id))]
  const [{ data: senderProfiles }, { data: recipes }] = await Promise.all([
    admin.from('profiles').select('id, display_name').in('id', senderIds),
    admin.from('recipes').select('id, title').in('id', recipeIds),
  ])
  const profileById = new Map((senderProfiles ?? []).map((profile) => [profile.id, profile.display_name]))
  const recipeById = new Map((recipes ?? []).map((recipe) => [recipe.id, recipe.title]))
  return shares.map((share) => ({
    id: share.id,
    recipeId: share.recipe_id,
    recipeTitle: recipeById.get(share.recipe_id) ?? 'מתכון ללא שם',
    senderName: profileById.get(share.sender_id) ?? 'משתמשת רשומה',
    senderEmail: null,
    createdAt: share.created_at,
    status: share.status as IncomingShare['status'],
  }))
}

export async function getSharePreview(shareId: string): Promise<{ ok: boolean; preview?: SharePreview; error?: string }> {
  const { user } = await currentUser()
  if (!user) return { ok: false, error: 'לא מחובר' }
  const admin = createAdminClient()
  const { data: share } = await admin.from('recipe_shares').select('recipe_id').eq('id', shareId).eq('recipient_id', user.id).single()
  if (!share) return { ok: false, error: 'בקשת השיתוף לא נמצאה' }
  const [{ data: recipe }, { data: ingredients }, { data: steps }] = await Promise.all([
    admin.from('recipes').select('title, description').eq('id', share.recipe_id).single(),
    admin.from('ingredients').select('name, amount, unit').eq('recipe_id', share.recipe_id).order('position'),
    admin.from('recipe_steps').select('title, body').eq('recipe_id', share.recipe_id).order('position'),
  ])
  if (!recipe) return { ok: false, error: 'המתכון המקורי לא נמצא' }
  return { ok: true, preview: { title: recipe.title, description: recipe.description, ingredients: ingredients ?? [], steps: steps ?? [] } }
}

export async function respondToRecipeShare(shareId: string, accept: boolean): Promise<{ ok: boolean; recipeId?: string; error?: string }> {
  const { user } = await currentUser()
  if (!user) return { ok: false, error: 'לא מחובר' }
  const admin = createAdminClient()
  const { data: share } = await admin.from('recipe_shares').select('*').eq('id', shareId).eq('recipient_id', user.id).single()
  if (!share || share.status !== 'pending') return { ok: false, error: 'בקשת השיתוף לא זמינה' }
  if (!accept) {
    await admin.from('recipe_shares').update({ status: 'rejected', responded_at: new Date().toISOString() }).eq('id', shareId).eq('recipient_id', user.id)
    revalidatePath('/sharing')
    return { ok: true }
  }

  const [{ data: source }, { data: ingredients }, { data: steps }] = await Promise.all([
    admin.from('recipes').select('*').eq('id', share.recipe_id).single(),
    admin.from('ingredients').select('*').eq('recipe_id', share.recipe_id).order('position'),
    admin.from('recipe_steps').select('*').eq('recipe_id', share.recipe_id).order('position'),
  ])
  if (!source) return { ok: false, error: 'המתכון המקורי לא נמצא' }
  const { data: senderAuth } = await admin.auth.admin.getUserById(share.sender_id)
  const senderName = senderAuth.user?.user_metadata?.full_name ?? senderAuth.user?.email ?? 'משתמש רשום'
  const { data: copy, error: copyError } = await admin.from('recipes').insert({
    owner_id: user.id,
    title: source.title,
    description: source.description,
    category: source.category,
    difficulty: source.difficulty,
    servings: source.servings,
    prep_time: source.prep_time,
    cook_time: source.cook_time,
    source_name: `שיתוף מ־${senderName}`,
    status: 'draft',
    is_diet_auto: source.is_diet_auto,
  }).select('id').single()
  if (copyError || !copy) return { ok: false, error: `שמירת העותק נכשלה: ${copyError?.message ?? 'שגיאה'}` }
  if (ingredients?.length) await admin.from('ingredients').insert(ingredients.map((item) => ({ recipe_id: copy.id, name: item.name, amount: item.amount, unit: item.unit, position: item.position })))
  if (steps?.length) await admin.from('recipe_steps').insert(steps.map((step) => ({ recipe_id: copy.id, title: step.title, body: step.body, duration_seconds: step.duration_seconds, position: step.position })))
  await admin.from('recipe_shares').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('id', shareId).eq('recipient_id', user.id)
  revalidatePath('/sharing')
  revalidatePath('/recipes')
  return { ok: true, recipeId: copy.id }
}
