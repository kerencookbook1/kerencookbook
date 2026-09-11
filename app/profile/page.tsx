import { createClient } from '@/lib/supabase/server'
import { getRecipes } from '@/lib/repositories/recipes'
import Link from 'next/link'
import { logout } from '@/lib/actions/auth'

export const metadata = { title: 'הפרופיל שלי — המטבח של קרן' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const recipes = user ? await getRecipes(user.id) : []

  // Prefer the profile row (updated via /profile/edit), fall back to signup
  // metadata, then to the email prefix
  const { data: profile } = user
    ? await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
    : { data: null }

  const displayName =
    profile?.display_name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split('@')[0]

  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
    : 'כ'
  const name = displayName || 'קרן כהן'

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <p className="eyebrow">הפרופיל שלי</p>
        <h1>ברוכה הבאה, {name.split(' ')[0]}</h1>
        <p>כאן מנהלים את הספר המשפחתי וההעדפות שלך.</p>
      </header>

      <section className="profile-grid">
        {/* Identity card */}
        <article className="profile-card profile-identity">
          <div className="avatar" aria-hidden="true">{initials}</div>
          <h2>{name}</h2>
          <p>בעלת ספר המתכונים</p>
          {user?.email && (
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginTop: -8 }}>{user.email}</p>
          )}
          <Link href="/profile/edit" className="outline-button" style={{ marginTop: 16, display: 'inline-flex' }}>עריכת פרופיל</Link>
        </article>

        {/* Stats card */}
        <article className="profile-card">
          <p className="eyebrow">הספרייה שלי</p>
          <h2>{recipes.length}</h2>
          <p>מתכונים שמורים</p>
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            <div>
              <strong style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem' }}>4</strong>
              <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--muted)' }}>חברי משפחה</p>
            </div>
            <div>
              <strong style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem' }}>2</strong>
              <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--muted)' }}>אוספים</p>
            </div>
          </div>
          <Link href="/recipes" className="text-button" style={{ marginTop: 16, display: 'inline-block' }}>
            לכל המתכונים
          </Link>
        </article>

        {/* Family card */}
        <article className="profile-card">
          <p className="eyebrow">ספר משפחתי</p>
          <h2>המטבח של קרן</h2>
          <p>3 חברים יכולים לצפות ולהוסיף מתכונים.</p>
          <div style={{ display: 'flex', gap: -8, marginTop: 12 }}>
            {['כ', 'י', 'ר', 'מ'].map((initial, i) => (
              <div key={i} style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: ['#d84b32', '#6d7d4e', '#c8a85c', '#7a6b8a'][i],
                color: 'white',
                display: 'grid',
                placeItems: 'center',
                fontSize: '.85rem',
                fontWeight: 700,
                border: '2px solid white',
                marginRight: i > 0 ? -8 : 0,
              }}>{initial}</div>
            ))}
          </div>
          <Link className="text-button" href="/collections" style={{ marginTop: 16, display: 'inline-block' }}>
            ניהול משפחה
          </Link>
        </article>

        {/* AI connections card */}
        <article className="profile-card">
          <p className="eyebrow">חיבורי AI</p>
          <h2>מפתחות ספקי AI</h2>
          <p>הוסיפי מפתח של OpenAI, Anthropic או Google לחילוץ מתכונים מתמונות ומכתובות אתר.</p>
          <Link className="text-button" href="/profile/connections" style={{ marginTop: 16, display: 'inline-block' }}>
            ניהול מפתחות
          </Link>
        </article>

        {/* Backup & restore card */}
        <article className="profile-card">
          <p className="eyebrow">הגדרות</p>
          <h2>גיבוי ושחזור</h2>
          <p>הורידי גיבוי JSON של המתכונים שלך או של כל המידע, וייבאי אותו בחזרה בכל זמן.</p>
          <Link className="text-button" href="/settings/backup" style={{ marginTop: 16, display: 'inline-block' }}>
            פתיחת הגדרות גיבוי
          </Link>
        </article>
      </section>

      {/* Logout */}
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
        <form action={logout}>
          <button type="submit" className="outline-button">יציאה מהחשבון</button>
        </form>
      </div>
    </main>
  )
}
