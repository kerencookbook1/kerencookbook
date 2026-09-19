'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, Inbox, X } from 'lucide-react'
import { respondToRecipeShare, type IncomingShare } from '@/lib/actions/sharing'

export function ShareNotification({ shares }: { shares: IncomingShare[] }) {
  const [items, setItems] = useState(shares.filter((share) => share.status === 'pending'))
  const [busy, setBusy] = useState(false)
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const current = items[0]
  if (!current) return null

  async function respond(accept: boolean) {
    setBusy(true)
    setError(null)
    const result = await respondToRecipeShare(current.id, accept)
    if (!result.ok) {
      setError(result.error ?? 'לא הצלחתי לעדכן את בקשת השיתוף')
      setBusy(false)
      return
    }
    if (accept && result.recipeId) setSavedRecipeId(result.recipeId)
    else setItems((pending) => pending.slice(1))
    setBusy(false)
  }

  return <div className="share-notification-backdrop" role="presentation">
    <section className="share-notification" role="dialog" aria-modal="true" aria-labelledby="share-notification-title">
      <button type="button" className="share-notification-close" onClick={() => setItems((pending) => pending.slice(1))} aria-label="סגרי התראה"><X size={20} /></button>
      <div className="share-notification-icon" aria-hidden="true"><Inbox size={24} /></div>
      <p className="eyebrow">מתכון חדש מחכה לך</p>
      <h2 id="share-notification-title">{current.recipeTitle}</h2>
      <p><strong>{current.senderName}</strong> רוצה לשתף איתך מתכון.</p>
      <p className="share-notification-note">אפשר לאשר ולשמור אותו בספרייה שלך, או לסרב. שום דבר לא יישמר בלי אישורך.</p>
      {error && <p className="pantry-ai-error" role="alert">{error}</p>}
      {savedRecipeId ? <Link href={`/recipes/${savedRecipeId}`} className="primary-button share-notification-link">המתכון נשמר — פתחי אותו</Link> : <div className="share-notification-actions"><button type="button" className="primary-button" onClick={() => { void respond(true) }} disabled={busy}><Check size={18} /> אשרי ושמרי</button><button type="button" className="outline-button" onClick={() => { void respond(false) }} disabled={busy}><X size={18} /> סרבי</button></div>}
      {items.length > 1 && !savedRecipeId && <p className="share-notification-count">יש עוד {items.length - 1} בקשות שיתוף</p>}
    </section>
  </div>
}
