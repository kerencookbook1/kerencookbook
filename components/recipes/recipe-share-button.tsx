'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { getRegisteredUsers, sendRecipeShare, type ShareableUser } from '@/lib/actions/sharing'

export function RecipeShareButton({ recipeId }: { recipeId: string }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [users, setUsers] = useState<ShareableUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  async function openShare() {
    setOpen((value) => !value)
    if (users.length > 0) return
    setLoadingUsers(true)
    setUsers(await getRegisteredUsers())
    setLoadingUsers(false)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage(null)
    const result = await sendRecipeShare(recipeId, email)
    setMessage(result.ok ? 'בקשת השיתוף נשלחה. המתכון יופיע רק אחרי אישור.' : result.error ?? 'השליחה נכשלה')
    if (result.ok) setEmail('')
    setBusy(false)
  }

  return <div className="recipe-share-wrap">
    <button type="button" className="outline-button recipe-share-trigger" onClick={() => { void openShare() }}><Share2 size={17} /> שתפי משתמש רשום</button>
    {open && <form className="recipe-share-form" onSubmit={submit}>
      <label htmlFor={`share-user-${recipeId}`}>בחרי משתמש רשום</label>
      <select id={`share-user-${recipeId}`} value={email} onChange={(event) => setEmail(event.target.value)} disabled={loadingUsers || busy}>
        <option value="">{loadingUsers ? 'טוענת משתמשים…' : users.length > 0 ? 'בחרי משתמש מהרשימה' : 'לא נמצאו משתמשים נוספים'}</option>
        {users.map((user) => <option key={user.id} value={user.email}>{user.name} · {user.email}</option>)}
      </select>
      <span className="recipe-share-or">או הזיני אימייל ידנית</span>
      <label htmlFor={`share-email-${recipeId}`}>אימייל</label>
      <input id={`share-email-${recipeId}`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required />
      <button type="submit" className="primary-button" disabled={busy}>{busy ? 'שולחת…' : 'שלחי בקשת שיתוף'}</button>
      {message && <p role="status">{message}</p>}
    </form>}
  </div>
}
