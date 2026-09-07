'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ProfileActionState = { error?: string; success?: boolean } | null

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'השם קצר מדי').max(60, 'השם ארוך מדי'),
})

export async function updateProfile(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const parsed = profileFormSchema.safeParse({
    displayName: formData.get('displayName'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'לא מחובר' }

  const displayName = parsed.data.displayName.trim()

  // Upsert profile row (in case user signed up before profiles auto-create)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      { id: user.id, display_name: displayName },
      { onConflict: 'id' }
    )
  if (profileError) return { error: `שגיאה בשמירה: ${profileError.message}` }

  // Also mirror to auth metadata so other places that read user_metadata stay in sync
  const { error: metaError } = await supabase.auth.updateUser({
    data: { full_name: displayName },
  })
  if (metaError) {
    // Non-fatal — profiles table is the source of truth
    console.error('auth metadata update failed:', metaError.message)
  }

  revalidatePath('/profile')
  revalidatePath('/profile/edit')
  redirect('/profile')
}
