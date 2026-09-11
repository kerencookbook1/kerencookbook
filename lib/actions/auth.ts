'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/supabase/types'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth'

async function resolveIdentifierToEmail(identifier: string): Promise<string | null> {
  const trimmed = identifier.trim()
  if (!trimmed) return null
  if (trimmed.includes('@')) return trimmed  // looks like an email — use as-is

  // Otherwise treat it as a display_name and look up via service role.
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .ilike('display_name', trimmed)  // case-insensitive
    .limit(1)
    .maybeSingle()
  if (!profile) return null

  const { data: userRes, error } = await admin.auth.admin.getUserById(profile.id)
  if (error || !userRes?.user?.email) return null
  return userRes.user.email
}

export type AuthActionState = { error?: string; success?: boolean } | null

async function getClient(rememberMe?: boolean) {
  const cookieStore = await cookies()
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, maxAge !== undefined ? { ...options, maxAge } : options)
          )
        },
      },
    }
  )
}

export async function login(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get('identifier'),
    password: formData.get('password'),
    rememberMe: formData.get('rememberMe') === 'on',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const email = await resolveIdentifierToEmail(parsed.data.identifier)
  if (!email) return { error: 'אימייל, שם משתמש או סיסמה שגויים' }

  const supabase = await getClient(parsed.data.rememberMe)
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  })
  if (error) return { error: 'אימייל, שם משתמש או סיסמה שגויים' }

  redirect('/')
}

export async function register(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    displayName: formData.get('displayName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await getClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })
  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'כתובת האימייל כבר רשומה במערכת' }
    }
    return { error: 'אירעה שגיאה, נסה שוב' }
  }

  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      display_name: parsed.data.displayName,
    })
    if (profileError) {
      console.error('profiles insert failed:', profileError.message)
    }
  }

  if (!data.session) {
    return { success: true }
  }

  redirect('/')
}

export async function logout(): Promise<void> {
  const supabase = await getClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await getClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  return { success: true }
}

export async function resetPassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await getClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return { error: 'הקישור פג תוקף, בקש קישור חדש' }

  redirect('/login')
}
