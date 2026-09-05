'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import '../preview.css'
import './settings.css'

type ProviderStatus = {
  id: 'openai' | 'anthropic' | 'google'
  label: string
  hint: string
  docsUrl: string
  keyMasked?: string
  savedAt?: string
  lastTestedAt?: string
  lastTestOk?: boolean
  lastTestError?: string
  isActive: boolean
}

type ProvidersResponse = {
  active: ProviderStatus['id'] | null
  providers: ProviderStatus[]
}

export default function SettingsPage() {
  const [data, setData] = useState<ProvidersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)  // action-key currently running
  const [error, setError] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/providers')
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const json = (await r.json()) as ProvidersResponse
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת ההגדרות')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function saveKey(id: ProviderStatus['id']) {
    const apiKey = drafts[id]
    if (!apiKey || apiKey.trim().length < 10) {
      setError('מפתח לא תקין (מינימום 10 תווים)')
      return
    }
    setBusy(`save:${id}`)
    setError(null)
    try {
      const r = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: id, apiKey: apiKey.trim() }),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error || `HTTP ${r.status}`)
      setData(json)
      setDrafts((d) => ({ ...d, [id]: '' }))  // clear input after save
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה')
    } finally {
      setBusy(null)
    }
  }

  async function testKey(id: ProviderStatus['id']) {
    setBusy(`test:${id}`)
    setError(null)
    try {
      const payload: { provider: string; apiKey?: string } = { provider: id }
      // If user typed a key but didn't save, test that draft directly
      if (drafts[id] && drafts[id].trim().length >= 10) {
        payload.apiKey = drafts[id].trim()
      }
      const r = await fetch('/api/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error || `HTTP ${r.status}`)
      setData({ active: json.active, providers: json.providers })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בבדיקה')
    } finally {
      setBusy(null)
    }
  }

  async function setActive(id: ProviderStatus['id'] | null) {
    setBusy(`active:${id}`)
    setError(null)
    try {
      const r = await fetch('/api/providers/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: id }),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error || `HTTP ${r.status}`)
      setData({ active: json.active, providers: json.providers })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהחלפת ספק')
    } finally {
      setBusy(null)
    }
  }

  async function removeKey(id: ProviderStatus['id']) {
    if (!confirm('למחוק את המפתח של ' + id + '?')) return
    setBusy(`del:${id}`)
    setError(null)
    try {
      const r = await fetch(`/api/providers?provider=${id}`, { method: 'DELETE' })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error || `HTTP ${r.status}`)
      setData({ active: json.active, providers: json.providers })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה במחיקה')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="preview-page settings-page">
      <header className="settings-header">
        <Link href="/preview" className="settings-back">&rarr; חזרה</Link>
        <h1>חיבורים ומפתחות</h1>
        <p>חברי ספק AI/OCR כדי לחלץ מתכונים מתמונות. אפשר לחבר כמה ספקים ולבחור מי הפעיל.</p>
      </header>

      {error && (
        <div className="settings-error" role="alert">
          {error}
          <button type="button" onClick={() => setError(null)} aria-label="סגור">✕</button>
        </div>
      )}

      {loading && <p className="settings-loading">טוען הגדרות...</p>}

      {data && (
        <>
          <div className="settings-active-strip" aria-label="ספק פעיל">
            <span className="settings-active-label">ספק פעיל:</span>
            <strong>
              {data.active
                ? data.providers.find((p) => p.id === data.active)?.label
                : 'לא נבחר — סריקה תשתמש בכל ספק זמין'}
            </strong>
          </div>

          <div className="settings-cards">
            {data.providers.map((p) => {
              const busySave = busy === `save:${p.id}`
              const busyTest = busy === `test:${p.id}`
              const busyDel  = busy === `del:${p.id}`
              const busyAct  = busy === `active:${p.id}`
              const hasKey = !!p.keyMasked
              const testStatus =
                p.lastTestOk === true ? 'ok' :
                p.lastTestOk === false ? 'err' :
                hasKey ? 'unknown' : 'none'
              const testLabel =
                testStatus === 'ok' ? 'מחובר ותקין' :
                testStatus === 'err' ? 'שגיאה בחיבור' :
                testStatus === 'unknown' ? 'לא נבדק' :
                'לא מוגדר'

              return (
                <section key={p.id} className={`prov-card is-${p.id}${p.isActive ? ' is-active' : ''}`}>
                  <header className="prov-head">
                    <div>
                      <h2>{p.label}</h2>
                      <p>{p.hint}</p>
                    </div>
                    <span className={`prov-badge is-${testStatus}`}>{testLabel}</span>
                  </header>

                  {hasKey && (
                    <div className="prov-current">
                      <div className="prov-current-key">
                        <span className="prov-current-label">מפתח שמור:</span>
                        <code>{p.keyMasked}</code>
                      </div>
                      <button
                        type="button"
                        className="prov-btn tiny danger"
                        onClick={() => removeKey(p.id)}
                        disabled={busyDel}
                      >
                        {busyDel ? '...' : 'הסר'}
                      </button>
                    </div>
                  )}

                  {p.lastTestError && (
                    <p className="prov-error">שגיאה אחרונה: {p.lastTestError}</p>
                  )}

                  <div className="prov-input-row">
                    <label htmlFor={`k-${p.id}`}>{hasKey ? 'החלף מפתח:' : 'הוסף מפתח API:'}</label>
                    <div className="prov-input-wrap">
                      <input
                        id={`k-${p.id}`}
                        type={revealed[p.id] ? 'text' : 'password'}
                        placeholder={hasKey ? 'הכנס מפתח חדש כדי לעדכן...' : 'הדבק את המפתח כאן'}
                        value={drafts[p.id] ?? ''}
                        onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                        autoComplete="off"
                        spellCheck={false}
                        dir="ltr"
                      />
                      <button
                        type="button"
                        className="prov-eye"
                        onClick={() => setRevealed((r) => ({ ...r, [p.id]: !r[p.id] }))}
                        aria-label={revealed[p.id] ? 'הסתר' : 'הצג'}
                      >
                        {revealed[p.id] ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>

                  <div className="prov-actions">
                    <button
                      type="button"
                      className="prov-btn primary"
                      onClick={() => saveKey(p.id)}
                      disabled={busySave || !drafts[p.id]}
                    >
                      {busySave ? 'שומר...' : 'שמור מפתח'}
                    </button>
                    <button
                      type="button"
                      className="prov-btn secondary"
                      onClick={() => testKey(p.id)}
                      disabled={busyTest || (!hasKey && !drafts[p.id])}
                    >
                      {busyTest ? 'בודק...' : 'בדוק חיבור'}
                    </button>
                    <label className="prov-active-toggle">
                      <input
                        type="radio"
                        name="active-provider"
                        checked={p.isActive}
                        onChange={() => setActive(p.id)}
                        disabled={!hasKey || busyAct}
                      />
                      <span>הפוך לפעיל</span>
                    </label>
                  </div>

                  <a href={p.docsUrl} target="_blank" rel="noopener noreferrer" className="prov-docs">
                    איך להשיג מפתח? →
                  </a>
                </section>
              )
            })}
          </div>

          {data.active && (
            <div className="settings-clear-active">
              <button type="button" onClick={() => setActive(null)} className="prov-btn tiny secondary">
                נקה בחירת ספק פעיל
              </button>
            </div>
          )}
        </>
      )}

      <div className="settings-security-note">
        🔒 המפתחות נשמרים בקובץ מקומי בשרת (`.data/preview-providers.json`) ואינם נחשפים לדפדפן.
        התיקייה מסומנת ב-.gitignore. במעבר ל-Production הם יעברו ל-Supabase Secrets.
      </div>
    </div>
  )
}
