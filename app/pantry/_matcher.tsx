'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { RecipeImagePlaceholder } from '@/components/recipes/recipe-image-placeholder'

type Recipe = {
  id: string
  title: string
  category: string | null
  image_url: string | null
  ingredientNames: string[]
  prep_time: number | null
  cook_time: number | null
}

/** Quick-add chips for common Israeli pantry staples — one click adds to input. */
const QUICK_ITEMS: Array<{ label: string; emoji: string }> = [
  { label: 'ביצים',      emoji: '🥚' },
  { label: 'בצל',        emoji: '🧅' },
  { label: 'עגבניות',    emoji: '🍅' },
  { label: 'שום',        emoji: '🧄' },
  { label: 'שמן זית',    emoji: '🫒' },
  { label: 'קמח',        emoji: '🌾' },
  { label: 'סוכר',       emoji: '🍯' },
  { label: 'חמאה',       emoji: '🧈' },
  { label: 'חלב',        emoji: '🥛' },
  { label: 'גבינה צהובה', emoji: '🧀' },
  { label: 'לימון',      emoji: '🍋' },
  { label: 'פלפל',       emoji: '🌶️' },
  { label: 'מלח',        emoji: '🧂' },
  { label: 'אורז',       emoji: '🍚' },
  { label: 'פסטה',       emoji: '🍝' },
  { label: 'תפוח אדמה',  emoji: '🥔' },
  { label: 'גזר',        emoji: '🥕' },
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

  function addQuickItem(label: string) {
    setInput((current) => {
      const lines = current.split('\n').map((l) => l.trim())
      if (lines.some((l) => l.toLowerCase() === label.toLowerCase())) return current
      const trimmed = current.replace(/\s+$/, '')
      return trimmed ? `${trimmed}\n${label}` : label
    })
  }

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
          הצג רק מתכונים שיש לי את <em>כל</em> המרכיבים
        </label>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--muted, #525252)', marginBottom: 8 }}>
            הוספה מהירה
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {QUICK_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => addQuickItem(item.label)}
                className="outline-button"
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  fontSize: '.85rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  minHeight: 34,
                }}
              >
                <span aria-hidden>{item.emoji}</span> {item.label}
              </button>
            ))}
          </div>
        </div>
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
            {results.map(({ recipe, matched, missing, percent, missingList }) => {
              const totalMinutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
              return (
                <article key={recipe.id} className="recipe-card">
                  <Link href={`/recipes/${recipe.id}`} className="recipe-visual" tabIndex={-1} aria-hidden="true">
                    {recipe.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={recipe.image_url} alt="" className="recipe-photo" loading="lazy" />
                    ) : (
                      <div className="recipe-photo" style={{ padding: 0 }}>
                        <RecipeImagePlaceholder
                          category={recipe.category}
                          title={recipe.title}
                          ingredientNames={recipe.ingredientNames}
                        />
                      </div>
                    )}
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
