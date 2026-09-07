'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type Recipe = {
  id: string
  title: string
  category: string | null
  image_url: string | null
  ingredientNames: string[]
  prep_time: number | null
  cook_time: number | null
}

const FALLBACK_IMAGES = [
  '/images/recipes/shakshuka-default.png',
  '/images/recipes/cauliflower-tahini-default.png',
  '/images/recipes/lemon-cake-default.png',
  '/images/recipes/creamy-pasta-default.png',
  '/images/recipes/meatballs-default.png',
]

// Normalize an ingredient/pantry item so "2 ביצים גדולות" and "ביצה" both match.
function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,;:()\/\d]/g, ' ')
    // Remove common Hebrew/English measurement + prep words
    .replace(/\b(כפית|כפות|כפ|כוס|כוסות|גרם|ק"ג|קילו|מ"ל|מל|ליטר|כפיות|קורט|חצי|רבע|שליש|קצוץ|קצוצה|קצוצים|טחון|טחונה|טחונים|קלוף|קלופה|גדול|גדולה|גדולים|קטן|קטנה|לפי הטעם|של|טרי|טרייה|טריים)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length >= 2)
}

/** How many pantry tokens appear in the recipe's ingredient words. */
function scoreMatch(ingredientWords: Set<string>, pantryWords: Set<string>): { matched: number; missing: number; matchedList: string[]; missingList: string[] } {
  const matched: string[] = []
  const missing: string[] = []
  for (const w of ingredientWords) {
    if (pantryWords.has(w) || Array.from(pantryWords).some((p) => w.includes(p) || p.includes(w))) {
      matched.push(w)
    } else {
      missing.push(w)
    }
  }
  return { matched: matched.length, missing: missing.length, matchedList: matched, missingList: missing }
}

export function PantryMatcher({ recipes }: { recipes: Recipe[] }) {
  const [input, setInput] = useState('')
  const [strict, setStrict] = useState(false)

  const pantryWords = useMemo(() => {
    const words = new Set<string>()
    for (const line of input.split(/[\n,]/)) {
      for (const w of normalize(line)) words.add(w)
    }
    return words
  }, [input])

  const results = useMemo(() => {
    if (pantryWords.size === 0) return []
    return recipes
      .map((r) => {
        const ingWords = new Set<string>()
        for (const name of r.ingredientNames) {
          for (const w of normalize(name)) ingWords.add(w)
        }
        const { matched, missing, matchedList, missingList } = scoreMatch(ingWords, pantryWords)
        const total = matched + missing
        const percent = total === 0 ? 0 : Math.round((matched / total) * 100)
        return { recipe: r, matched, missing, percent, matchedList, missingList }
      })
      .filter((r) => (strict ? r.missing === 0 : r.percent >= 40))
      .sort((a, b) => b.percent - a.percent || b.matched - a.matched)
      .slice(0, 20)
  }, [recipes, pantryWords, strict])

  return (
    <div style={{ display: 'grid', gap: 24, marginTop: 20 }}>
      <div className="upload-panel" style={{ padding: 20 }}>
        <label htmlFor="pantry-input" style={{ display: 'block', fontWeight: 800, marginBottom: 8 }}>
          המרכיבים שיש לך (שורה או פסיק בין אחד לשני)
        </label>
        <textarea
          id="pantry-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"ביצים\nגבינה צהובה\nעגבניות\nבצל\nשום\nשמן זית"}
          rows={8}
          style={{
            width: '100%',
            border: '1px solid #cfbfae',
            borderRadius: 12,
            padding: '12px 14px',
            background: '#fffdfa',
            fontSize: '1rem',
            fontFamily: 'inherit',
            lineHeight: 1.6,
            resize: 'vertical',
          }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontWeight: 700, cursor: 'pointer' }}>
          <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} style={{ width: 18, height: 18 }} />
          הצג רק מתכונים שיש לי את **כל** המרכיבים
        </label>
      </div>

      {pantryWords.size === 0 ? (
        <div className="empty-state">
          <p>הזיני מה יש לך במקרר או במזווה כדי לראות מתכונים תואמים.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <p>לא נמצאו מתכונים שתואמים{strict ? ' לחלוטין' : ''} למרכיבים שרשמת.</p>
          {strict && (
            <button type="button" className="outline-button" onClick={() => setStrict(false)}>
              הראי גם התאמות חלקיות
            </button>
          )}
        </div>
      ) : (
        <div>
          <p style={{ margin: '0 0 14px', color: 'var(--muted)' }}>{results.length} מתכונים תואמים</p>
          <div className="recipe-grid">
            {results.map(({ recipe, matched, missing, percent, missingList }, i) => {
              const imgSrc = recipe.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]
              const totalMinutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
              return (
                <article key={recipe.id} className="recipe-card">
                  <Link href={`/recipes/${recipe.id}`} className="recipe-visual" tabIndex={-1} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc} alt="" className="recipe-photo" loading="lazy" />
                  </Link>
                  <div
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: percent === 100 ? '#3b6035' : percent >= 70 ? '#c7a233' : '#8a6b3d',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '.82rem',
                    }}
                  >
                    {percent}%
                  </div>
                  <div className="recipe-info">
                    <Link href={`/recipes/${recipe.id}`}>
                      <h3>{recipe.title}</h3>
                    </Link>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '.82rem' }}>
                      <span style={{ color: '#3b6035', fontWeight: 700 }}>✓ יש לי {matched} מרכיבים</span>
                      {missing > 0 && (
                        <span style={{ color: 'var(--muted)' }}>
                          חסר: {missingList.slice(0, 3).join(', ')}{missingList.length > 3 ? '…' : ''}
                        </span>
                      )}
                      {totalMinutes > 0 && <span style={{ color: 'var(--muted)' }}>{totalMinutes} דק׳</span>}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
