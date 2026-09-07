import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EditProfileForm } from './_form'

export const metadata = { title: 'עריכת פרופיל — המטבח של קרן' }

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Prefer stored profile name, fall back to signup metadata, then email prefix
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()

  const currentName =
    profile?.display_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split('@')[0] ??
    ''

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <Link href="/profile" className="back-link">← הפרופיל שלי</Link>
        <p className="eyebrow">חשבון</p>
        <h1>עריכת פרופיל</h1>
        <p>עדכני את השם המוצג באתר. האימייל לא ניתן לשינוי מכאן.</p>
      </header>

      <EditProfileForm initialName={currentName} email={user.email ?? ''} />
    </main>
  )
}
