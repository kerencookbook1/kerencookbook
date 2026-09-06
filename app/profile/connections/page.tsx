'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import './connections.css'

type ProviderId = 'openai' | 'anthropic' | 'google'

type ProviderStatus = {
  id: ProviderId
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
  active: ProviderId | null
  providers: ProviderStatus[]
}

const HOW_TO: Record<ProviderId, { steps: string[]; note?: string; buttonLabel: string }> = {
  anthropic: {
    buttonLabel: 'פתח דף המפתחות של Anthropic',
    steps: [
      'לחצי על הכפתור למטה — נפתח דף חדש ב־Anthropic Console.',
      'התחברי (Sign up אם אין חשבון) ולחצי על "Create Key".',
      'העתיקי את המפתח (מתחיל ב־sk-ant-…) והדביקי אותו כאן למטה.',
    ],
    note: 'איכות מעולה בעברית. יש קרדיט התחלתי חינם, אחר כך ~$0.003 למתכון.',
  },
  openai: {
    buttonLabel: 'פתח דף המפתחות של OpenAI',
    steps: [
      'לחצי על הכפתור למטה — נפתח דף חדש של OpenAI Platform.',
      'התחברי ולחצי על "Create new secret key".',
      'העתיקי את המפתח (מתחיל ב־sk-…) והדביקי אותו כאן למטה.',
    ],
    note: 'תמיכה טובה בעברית. ~$0.005 למתכון.',
  },
  google: {
    buttonLabel: 'פתח דף המפתחות של Google AI Studio',
    steps: [
      'לחצי על הכפתור למטה — נפתח דף חדש של Google AI Studio.',
      'התחברי עם חשבון Google ולחצי על "Create API key".',
      'העתיקי את המפתח (מתחיל ב־AIza…) והדביקי אותו כאן למטה.',
    ],
    note: 'חינם בגבולות שימוש רגילים. מהיר יחסית.',
  },
}

export default function ConnectionsPage() {
  const [data, setData] = useState<ProvidersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/providers')
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const json = (await r.json()) as ProvidersResponse
        if (!cancelled) setData(json)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'שגיאה בטעינת ההגדרות')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  async function saveKey(id: ProviderId) {
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
      setDrafts((d) => ({ ...d, [id]: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה')
    } finally {
      setBusy(null)
    }
  }

  async function testKey(id: ProviderId) {
    setBusy(`test:${id}`)
    setError(null)
    try {
      const payload: { provider: string; apiKey?: string } = { provider: id }
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

  async function setActive(id: ProviderId | null) {
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

  async function removeKey(id: ProviderId) {
    if (!confirm(`למחוק את המפתח של ${id}?`)) return
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
    <main className="screen-shell connections-page">
      <header className="screen-header">
        <Link href="/profile" className="back-link">← חזרה לפרופיל</Link>
        <p className="eyebrow">חיבורי AI</p>
        <h1>מפתחות ספקי AI</h1>
        <p>חברי ספק לחילוץ מתכונים מתמונות ומדפי אתרים. אפשר לחבר כמה ספקים ולבחור מי הפעיל.</p>
      </header>

      {error && (
        <div className="connections-error" role="alert">
          {error}
          <button type="button" onClick={() => setError(null)} aria-label="סגור">✕</button>
        </div>
      )}

      {loading && <p className="connections-loading">טוען הגדרות...</p>}

      {data && (
        <>
          <div className="connections-active-strip" aria-label="ספק פעיל">
            <span className="connections-active-label">ספק פעיל:</span>
            <strong>
              {data.active
                ? data.providers.find((p) => p.id === data.active)?.label
                : 'לא נבחר — הסריקה תנסה כל ספק זמין'}
            </strong>
          </div>

          <div className="connections-cards">
            {data.providers.map((p) => {
              const busySave = busy === `save:${p.id}`
              const busyTest = busy === `test:${p.id}`
              const busyDel = busy === `del:${p.id}`
              const busyAct = busy === `active:${p.id}`
              const hasKey = !!p.keyMasked
              const testStatus =
                p.lastTestOk === true ? 'ok' :
                p.lastTestOk === false ? 'err' :
                hasKey ? 'unknown' : 'none'
              const testLabel =
                testStatus === 'ok' ? 'מחובר ותקין' :
                testStatus === 'err' ? 'שגיאה בחיבור' :
                testStatus === 'unknown' ? 'לא נבדק' : 'לא מוגדר'

              const howTo = HOW_TO[p.id]
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

                  {!hasKey && (
                    <div className="prov-howto">
                      <p className="prov-howto-title">איך להשיג מפתח?</p>
                      <ol className="prov-howto-steps">
                        {howTo.steps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                      <a
                        href={p.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="prov-btn primary prov-getkey-btn"
                      >
                        🔑 {howTo.buttonLabel} ↗
                      </a>
                      {howTo.note && <p className="prov-howto-note">{howTo.note}</p>}
                    </div>
                  )}

                  <div className="prov-input-row">
                    <label htmlFor={`k-${p.id}`}>{hasKey ? 'החלף מפתח:' : 'הדביקי את המפתח כאן:'}</label>
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
            <div className="connections-clear-active">
              <button type="button" onClick={() => setActive(null)} className="prov-btn tiny secondary">
                נקה בחירת ספק פעיל
              </button>
            </div>
          )}
        </>
      )}

      <div className="connections-security-note">
        🔒 המפתחות נשמרים בשרת בלבד ואינם נחשפים לדפדפן. ניתן להסיר אותם בכל עת.
      </div>
    </main>
  )
}
