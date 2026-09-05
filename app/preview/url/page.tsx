'use client'

import Link from 'next/link'
import { useState } from 'react'
import '../preview.css'
import './url.css'

type ImportedRecipe = {
  title: string
  description?: string | null
  servings?: number | null
  prep_minutes?: number | null
  cook_minutes?: number | null
  ingredients: string[]
  steps: string[]
  source_url: string
  source_site?: string
  image_url?: string
  method: 'json-ld' | 'ai'
  provider?: string
}

type Phase = 'idle' | 'processing' | 'result' | 'error'

const EXAMPLE_URLS = [
  { host: 'allrecipes.com', label: 'AllRecipes' },
  { host: 'nytimes.com/cooking', label: 'NYT Cooking' },
  { host: 'simplyrecipes.com', label: 'Simply Recipes' },
]

export default function UrlImportPage() {
  const [url, setUrl] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [recipe, setRecipe] = useState<ImportedRecipe | null>(null)

  async function handleImport(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) {
      setErrorMsg('הדבק כתובת URL של דף מתכון')
      return
    }
    setPhase('processing')
    setErrorMsg(null)
    setRecipe(null)

    try {
      const r = await fetch('/api/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || `שגיאה ${r.status}`)
      setRecipe(data)
      setPhase('result')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'שגיאה לא ידועה')
      setPhase('error')
    }
  }

  function reset() {
    setPhase('idle')
    setRecipe(null)
    setErrorMsg(null)
  }

  return (
    <div className="url-page">
      <header className="url-header">
        <Link href="/preview/add" className="url-back" aria-label="חזרה">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
        <h1>ייבוא מתכון מהאינטרנט</h1>
        <div className="url-header-spacer" aria-hidden="true"></div>
      </header>

      {/* ===== IDLE — URL input form ===== */}
      {(phase === 'idle' || phase === 'error') && (
        <>
          <div className="url-hero">
            <div className="url-hero-icon" aria-hidden="true">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <h2>הדביקי קישור למתכון</h2>
            <p>המערכת תקרא את הדף ותחלץ אוטומטית את הכותרת, המרכיבים והשלבים.</p>
          </div>

          <form className="url-form" onSubmit={handleImport}>
            <div className="url-input-row">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/recipe"
                dir="ltr"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit" className="url-btn primary" disabled={!url.trim()}>
                ייבא מתכון
              </button>
            </div>
            {phase === 'error' && errorMsg && (
              <p className="url-error" role="alert">{errorMsg}</p>
            )}
          </form>

          <div className="url-tips">
            <h3>💡 עובד הכי טוב עם:</h3>
            <ul>
              <li>אתרי מתכונים עם מבנה schema.org/Recipe (רוב האתרים הגדולים)</li>
              <li>אתרים ישראליים ואירופאים בעברית ואנגלית</li>
              <li>אם לא נמצא מבנה מסודר — המערכת תשתמש ב-AI לקרוא את הדף</li>
            </ul>
            <p className="url-examples">
              דוגמאות:{' '}
              {EXAMPLE_URLS.map((ex, i) => (
                <span key={ex.host}>
                  {i > 0 && ' • '}
                  <code>{ex.host}</code>
                </span>
              ))}
            </p>
          </div>
        </>
      )}

      {/* ===== PROCESSING ===== */}
      {phase === 'processing' && (
        <div className="url-processing">
          <div className="url-spinner" aria-hidden="true"/>
          <h3>קורא את הדף...</h3>
          <p>הייבוא עשוי לקחת עד 30 שניות</p>
          <p className="url-processing-url" dir="ltr">{url}</p>
        </div>
      )}

      {/* ===== RESULT ===== */}
      {phase === 'result' && recipe && (
        <div className="url-result">
          {recipe.image_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={recipe.image_url} alt="" className="url-result-photo" />
          )}

          <div className="url-result-body">
            <div className="url-result-tags">
              <span className={`url-method-tag is-${recipe.method}`}>
                {recipe.method === 'json-ld' ? '✓ מבנה סטנדרטי' : '🤖 חילוץ AI'}
              </span>
              {recipe.provider && (
                <span className="url-provider-tag">{recipe.provider}</span>
              )}
              {recipe.source_site && (
                <span className="url-source-tag">מ-{recipe.source_site}</span>
              )}
            </div>

            <h2>{recipe.title}</h2>
            {recipe.description && <p className="url-result-desc">{recipe.description}</p>}

            {(recipe.servings != null || recipe.prep_minutes != null || recipe.cook_minutes != null) && (
              <div className="url-result-meta">
                {recipe.servings != null && <span>👥 {recipe.servings} מנות</span>}
                {recipe.prep_minutes != null && <span>🕒 הכנה {recipe.prep_minutes} דק׳</span>}
                {recipe.cook_minutes != null && <span>🔥 בישול {recipe.cook_minutes} דק׳</span>}
              </div>
            )}

            <section className="url-section" aria-label="מרכיבים">
              <h3>מרכיבים ({recipe.ingredients.length})</h3>
              {recipe.ingredients.length > 0 ? (
                <ul>
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              ) : (
                <p className="url-empty">לא זוהו מרכיבים</p>
              )}
            </section>

            <section className="url-section" aria-label="הוראות הכנה">
              <h3>הוראות הכנה ({recipe.steps.length})</h3>
              {recipe.steps.length > 0 ? (
                <ol>
                  {recipe.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              ) : (
                <p className="url-empty">לא זוהו שלבים</p>
              )}
            </section>

            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="url-source-link"
              dir="ltr"
            >
              המקור: {recipe.source_url}
            </a>

            <div className="url-result-actions">
              <button type="button" className="url-btn secondary" onClick={reset}>ייבא כתובת נוספת</button>
              <button type="button" className="url-btn primary">שמור את המתכון</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
