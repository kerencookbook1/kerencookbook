"use client";

import Link from 'next/link'
import { useState } from 'react'

export default function ImportUrlPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)

  function handleFetch(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setPreview(true) }, 1500)
  }

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <Link href="/import" className="back-link">← הוספת מתכון</Link>
        <p className="eyebrow">ייבוא מקישור</p>
        <h1>ייבוא מכתובת אתר</h1>
        <p>הדביקי קישור למתכון — נחלץ את כל הפרטים עבורך.</p>
      </header>

      <div className="import-layout">
        <div className="upload-panel">
          <form onSubmit={handleFetch} style={{ display: 'grid', gap: 14 }}>
            <label htmlFor="recipe-url" style={{ fontWeight: 800 }}>
              כתובת URL של המתכון
              <input
                id="recipe-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.example.com/recipe/..."
                style={{
                  display: 'block',
                  width: '100%',
                  minHeight: 54,
                  marginTop: 8,
                  border: '1px solid #cfbfae',
                  borderRadius: 12,
                  padding: '0 14px',
                  background: '#fffdfa',
                  fontSize: '1rem',
                  direction: 'ltr',
                  textAlign: 'left',
                }}
              />
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="submit"
                className="primary-button"
                disabled={loading || !url.trim()}
              >
                {loading ? 'מחלץ…' : 'חילוץ מתכון'}
              </button>
              <Link href="/import" className="outline-button">ביטול</Link>
            </div>
          </form>

          {loading && (
            <div style={{ marginTop: 24, color: 'var(--muted)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
              <p style={{ margin: 0 }}>מוצא ומחלץ את המתכון…</p>
            </div>
          )}
        </div>

        <aside className="provider-card">
          {!preview ? (
            <>
              <div style={{
                minHeight: 180,
                border: '2px dashed #cfbfae',
                borderRadius: 16,
                display: 'grid',
                placeItems: 'center',
                color: 'var(--muted)',
                background: '#fdf9f4',
              }}>
                <span style={{ textAlign: 'center', fontSize: '.9rem' }}>תצוגה מקדימה<br />תופיע כאן</span>
              </div>
              <h2 style={{ marginTop: 20 }}>ייבוא חכם</h2>
              <p>ה-AI מזהה את שם המתכון, מרכיבים ושלבי הכנה מכל אתר.</p>
            </>
          ) : (
            <>
              <div className="recipe-visual lemon" style={{ height: 180, borderRadius: 14, overflow: 'hidden', isolation: 'isolate', marginBottom: 16 }}>
                <div className="plate" />
                <span className="ingredient ingredient-one" />
                <span className="ingredient ingredient-two" />
                <span className="ingredient ingredient-three" />
              </div>
              <div style={{ borderRadius: 12, padding: 14, background: '#eff3e7', marginBottom: 12 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 800, color: '#40522a' }}>✓ מתכון נמצא</p>
                <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--muted)' }}>ייבוא מוצלח מהאתר</p>
              </div>
              <h3 style={{ margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>מתכון לדוגמה</h3>
              <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: '.9rem' }}>
                הטיוטה מוכנה לבדיקה ועריכה לפני השמירה.
              </p>
              <Link href="/recipes/new" className="primary-button" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                עריכה ושמירה
              </Link>
            </>
          )}
        </aside>
      </div>
    </main>
  )
}
