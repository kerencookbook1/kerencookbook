'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { getSharePreview, respondToRecipeShare, type IncomingShare, type SharePreview } from '@/lib/actions/sharing'

export function SharingPanel({ shares }: { shares: IncomingShare[] }) {
  const [items, setItems] = useState(shares)
  const [busy, setBusy] = useState<string | null>(null)
  const [previews, setPreviews] = useState<Record<string, SharePreview>>({})
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null)
  const formatDate = (value: string | null) => value
    ? new Intl.DateTimeFormat('he-IL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
    : 'ממתין לתגובה'

  if (items.length === 0) return <div className="empty-state"><p>עדיין אין שיתופים להצגה.</p><Link href="/recipes" className="primary-button">חזרה למתכונים</Link></div>

  async function respond(id: string, accept: boolean) {
    setBusy(id)
    const result = await respondToRecipeShare(id, accept)
    if (result.ok) setItems((current) => current.map((share) => share.id === id ? {
      ...share,
      status: accept ? 'accepted' : 'rejected',
      respondedAt: new Date().toISOString(),
    } : share))
    setBusy(null)
  }

  async function showPreview(id: string) {
    if (previews[id]) return
    setLoadingPreview(id)
    const result = await getSharePreview(id)
    if (result.ok && result.preview) setPreviews((current) => ({ ...current, [id]: result.preview! }))
    setLoadingPreview(null)
  }

  return <section className="sharing-list" aria-label="רשימת שיתופים">
    {items.map((share) => <article className={`sharing-card is-${share.status}`} key={share.id}>
      <div className="sharing-card-content">
        <p className="eyebrow">שיתוף מ־{share.senderName}</p>
        <h2>{share.recipeTitle}</h2>
        <div className="sharing-meta">
          <span>נשלח: {formatDate(share.createdAt)}</span>
          <span className={`sharing-status is-${share.status}`}>
            {share.status === 'pending' ? 'ממתין לאישור' : share.status === 'accepted' ? 'אושר' : 'סורב'}
          </span>
          {share.respondedAt && <span>נענה: {formatDate(share.respondedAt)}</span>}
        </div>
        {share.status === 'pending' && <p>{share.senderName} שלח/ה לך מתכון. החליטי אם לשמור אותו אצלך.</p>}
        {previews[share.id] && <div className="sharing-preview"><p>{previews[share.id].description}</p><h3>מרכיבים</h3><ul>{previews[share.id].ingredients.map((ingredient, index) => <li key={`${ingredient.name}-${index}`}>{[ingredient.amount, ingredient.unit, ingredient.name].filter(Boolean).join(' ')}</li>)}</ul><h3>אופן הכנה</h3><ol>{previews[share.id].steps.map((step, index) => <li key={`${step.body}-${index}`}>{step.title ? <strong>{step.title}: </strong> : null}{step.body}</li>)}</ol></div>}
      </div>
      <div className="sharing-actions">
        {share.status === 'pending' ? <>
          <button type="button" className="outline-button" disabled={loadingPreview !== null} onClick={() => { void showPreview(share.id) }}>{loadingPreview === share.id ? 'טוענת…' : previews[share.id] ? 'המתכון מוצג' : 'הציגי מתכון'}</button>
          <button type="button" className="primary-button" disabled={busy !== null} onClick={() => { void respond(share.id, true) }}><Check size={17} /> אשרי ושמרי</button>
          <button type="button" className="outline-button" disabled={busy !== null} onClick={() => { void respond(share.id, false) }}><X size={17} /> דחי</button>
        </> : <span className={`sharing-status-badge is-${share.status}`}>{share.status === 'accepted' ? '✓ אושר' : '× סורב'}</span>}
      </div>
    </article>)}
  </section>
}
