'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bell, Check, Inbox, Trash2, X } from 'lucide-react'
import { deleteRecipeShare, respondToRecipeShare, type IncomingShare } from '@/lib/actions/sharing'

export function ShareInboxButton({ shares }: { shares: IncomingShare[] }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(shares)
  const [busy, setBusy] = useState<string | null>(null)
  const pendingCount = items.filter((share) => share.status === 'pending').length

  async function respond(id: string, accept: boolean) {
    setBusy(id)
    const result = await respondToRecipeShare(id, accept)
    if (result.ok) {
      setItems((current) => current.map((share) =>
        share.id === id ? { ...share, status: accept ? 'accepted' : 'rejected' } : share,
      ))
    }
    setBusy(null)
  }

  async function remove(id: string) {
    setBusy(id)
    const result = await deleteRecipeShare(id)
    if (result.ok) setItems((current) => current.filter((share) => share.id !== id))
    setBusy(null)
  }

  return (
    <div className="share-inbox">
      <button
        type="button"
        className={`share-inbox-trigger${open ? ' is-open' : ''}`}
        aria-label={pendingCount ? `התראות, ${pendingCount} בקשות ממתינות` : 'התראות'}
        aria-expanded={open}
        aria-controls="share-inbox-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={21} strokeWidth={1.8} aria-hidden="true" />
        {pendingCount > 0 && <span className="share-inbox-badge" aria-label={`${pendingCount} חדשות`}>{pendingCount > 9 ? '9+' : pendingCount}</span>}
      </button>

      {open && (
        <section id="share-inbox-panel" className="share-inbox-panel" aria-label="הודעות ושיתופים">
          <div className="share-inbox-heading">
            <div>
              <p className="eyebrow">מרכז הודעות</p>
              <h2>שיתופים</h2>
            </div>
            <Inbox size={22} aria-hidden="true" />
          </div>

          {items.length === 0 ? (
            <p className="share-inbox-empty">אין הודעות חדשות כרגע.</p>
          ) : (
            <div className="share-inbox-list">
              {items.map((share) => (
                <article className={`share-inbox-item is-${share.status}`} key={share.id}>
                  <div className="share-inbox-item-copy">
                    <strong>{share.recipeTitle}</strong>
                    <span>{share.status === 'pending' ? `${share.senderName} שלח/ה לך מתכון` : share.status === 'accepted' ? 'המתכון נשמר אצלך' : 'השיתוף נדחה'}</span>
                  </div>
                  {share.status === 'pending' ? (
                    <div className="share-inbox-actions">
                      <button type="button" className="share-inbox-accept" onClick={() => { void respond(share.id, true) }} disabled={busy !== null} aria-label={`אישור שמירת ${share.recipeTitle}`}>
                        <Check size={16} aria-hidden="true" />
                        <span>שמירה</span>
                      </button>
                      <button type="button" className="share-inbox-reject" onClick={() => { void respond(share.id, false) }} disabled={busy !== null} aria-label={`דחיית ${share.recipeTitle}`}>
                        <X size={16} aria-hidden="true" />
                        <span>דחייה</span>
                      </button>
                    </div>
                  ) : (
                    <span className="share-inbox-status" aria-label={share.status === 'accepted' ? 'אושר' : 'נדחה'}>{share.status === 'accepted' ? '✓' : '×'}</span>
                  )}
                  <button type="button" className="share-inbox-delete" onClick={() => { void remove(share.id) }} disabled={share.status === 'pending' || busy !== null} aria-label={`מחיקת הודעת ${share.recipeTitle}`}>
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          )}

          <Link href="/sharing" className="share-inbox-all" onClick={() => setOpen(false)}>לכל השיתופים</Link>
        </section>
      )}
    </div>
  )
}
