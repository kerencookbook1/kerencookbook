'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import '../preview.css'
import './recipes.css'

type Recipe = { id: string; title: string; minutes: number; img: string }

const INITIAL_RECIPES: Recipe[] = [
  { id: '1', title: 'שקשוקה',                    minutes: 30, img: '/images/recipes/shakshuka-default.png' },
  { id: '2', title: 'סלמון בתנור עם עשבי תיבול', minutes: 45, img: '/images/recipes/salmon-default.png' },
  { id: '3', title: 'קציצות ברוטב עגבניות',      minutes: 60, img: '/images/recipes/meatballs-default.png' },
  { id: '4', title: 'פסטה ברוטב שמנת ופטריות',   minutes: 25, img: '/images/recipes/creamy-pasta-default.png' },
  { id: '5', title: 'סלט טבולה',                 minutes: 20, img: '/images/recipes/herb-salad-default.png' },
  { id: '6', title: 'עוגת גבינה אפויה',          minutes: 70, img: '/images/recipes/lemon-cake-default.png' },
]

/* ───────── icons ───────── */
function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}
function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

/* ───────── nav icons (unchanged) ───────── */
function HomeIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> }
function SearchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function CartIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> }
function BookIcon({ active }: { active?: boolean }) { return <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> }
function UserIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }

type ConfirmState = null | { kind: 'single'; recipe: Recipe } | { kind: 'bulk'; ids: string[] }

export default function RecipesPreviewPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirm, setConfirm] = useState<ConfirmState>(null)

  const selectedRecipes = useMemo(
    () => recipes.filter((r) => selected.has(r.id)),
    [recipes, selected]
  )
  const allSelected = selected.size === recipes.length && recipes.length > 0

  function toggleSelectMode() {
    setSelectMode((s) => !s)
    setSelected(new Set())
  }

  function toggleSelected(id: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(recipes.map((r) => r.id)))
  }

  function askDeleteSingle(recipe: Recipe) {
    setConfirm({ kind: 'single', recipe })
  }
  function askDeleteBulk() {
    if (selected.size === 0) return
    setConfirm({ kind: 'bulk', ids: Array.from(selected) })
  }

  function confirmDelete() {
    if (!confirm) return
    if (confirm.kind === 'single') {
      setRecipes((rs) => rs.filter((r) => r.id !== confirm.recipe.id))
      setSelected((s) => {
        const next = new Set(s)
        next.delete(confirm.recipe.id)
        return next
      })
    } else {
      const toDelete = new Set(confirm.ids)
      setRecipes((rs) => rs.filter((r) => !toDelete.has(r.id)))
      setSelected(new Set())
      setSelectMode(false)
    }
    setConfirm(null)
  }

  return (
    <div className="preview-page rec-page">
      {/* ===== HEADER ===== */}
      <header className="rec-header">
        <button type="button" className="rec-filter-icon" aria-label="סינון">
          <FilterIcon />
        </button>
        <h1>המתכונים שלי</h1>
        <Link href="/preview" className="rec-back" aria-label="חזרה">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
      </header>

      {/* ===== SELECT MODE STRIP ===== */}
      <div className="rec-toolbar">
        {selectMode ? (
          <>
            <button type="button" className="rec-tool-btn" onClick={toggleAll}>
              {allSelected ? 'בטל בחירת הכל' : 'בחר הכל'}
            </button>
            <span className="rec-tool-count">
              {selected.size > 0 ? `${selected.size} נבחרו` : 'לא נבחרו מתכונים'}
            </span>
            <button type="button" className="rec-tool-btn ghost" onClick={toggleSelectMode}>
              ביטול
            </button>
          </>
        ) : (
          <>
            <button type="button" className="rec-tool-btn" onClick={toggleSelectMode}>
              <TrashIcon />
              <span>בחר למחיקה</span>
            </button>
            <span className="rec-tool-count">{recipes.length} מתכונים</span>
          </>
        )}
      </div>

      {/* ===== FILTER CHIPS ===== */}
      {!selectMode && (
        <div className="rec-chips">
          <button type="button" className="rec-chip">עוד<ChevronDown /></button>
          <button type="button" className="rec-chip">זמן הכנה<ChevronDown /></button>
          <button type="button" className="rec-chip">קטגוריה<ChevronDown /></button>
        </div>
      )}

      {/* ===== RECIPE GRID ===== */}
      {recipes.length === 0 ? (
        <div className="rec-empty">
          <p>אין מתכונים בספר שלך</p>
          <Link href="/preview/add" className="rec-empty-cta">+ הוסיפי מתכון</Link>
        </div>
      ) : (
        <section className="rec-grid" aria-label="רשימת מתכונים">
          {recipes.map((r) => {
            const isChecked = selected.has(r.id)
            return (
              <article key={r.id} className={`rec-card${isChecked ? ' is-checked' : ''}`}>
                {selectMode ? (
                  <label className="rec-select-overlay">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelected(r.id)}
                      aria-label={`בחר את ${r.title}`}
                    />
                    <span className="rec-select-box" aria-hidden="true">
                      {isChecked && <CheckIcon />}
                    </span>
                  </label>
                ) : (
                  <button
                    type="button"
                    className="rec-x"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      askDeleteSingle(r)
                    }}
                    aria-label={`מחק את ${r.title}`}
                  >
                    <XIcon size={14} />
                  </button>
                )}

                <div className="rec-photo-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.img} alt={r.title} />
                  {!selectMode && (
                    <span className="rec-fav" aria-hidden="true">
                      <HeartIcon />
                    </span>
                  )}
                </div>
                <div className="rec-body">
                  <h3>{r.title}</h3>
                  <span className="rec-time"><ClockIcon />{r.minutes} דק׳</span>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {/* ===== BULK ACTION BAR (only when items selected) ===== */}
      {selectMode && selected.size > 0 && (
        <div className="rec-bulk-bar" role="region" aria-label="פעולות על נבחרים">
          <span>{selected.size} נבחרו למחיקה</span>
          <button type="button" className="rec-bulk-delete" onClick={askDeleteBulk}>
            <TrashIcon />
            <span>מחק {selected.size}</span>
          </button>
        </div>
      )}

      {/* ===== CONFIRMATION MODAL ===== */}
      {confirm && (
        <div className="rec-modal-overlay" role="dialog" aria-modal="true" onClick={() => setConfirm(null)}>
          <div className="rec-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rec-modal-icon" aria-hidden="true">
              <TrashIcon />
            </div>
            <h3>אישור מחיקה</h3>
            {confirm.kind === 'single' ? (
              <p>
                למחוק את המתכון <strong>{confirm.recipe.title}</strong>?<br />
                <span className="rec-modal-note">לא ניתן לשחזר לאחר המחיקה.</span>
              </p>
            ) : (
              <>
                <p>
                  למחוק <strong>{confirm.ids.length} מתכונים</strong> שנבחרו?<br />
                  <span className="rec-modal-note">לא ניתן לשחזר לאחר המחיקה.</span>
                </p>
                <ul className="rec-modal-list">
                  {selectedRecipes.slice(0, 4).map((r) => (
                    <li key={r.id}>• {r.title}</li>
                  ))}
                  {selectedRecipes.length > 4 && <li>• ועוד {selectedRecipes.length - 4}...</li>}
                </ul>
              </>
            )}
            <div className="rec-modal-actions">
              <button type="button" className="rec-modal-cancel" onClick={() => setConfirm(null)}>
                ביטול
              </button>
              <button type="button" className="rec-modal-confirm" onClick={confirmDelete}>
                מחק
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== BOTTOM NAV ===== */}
      <nav className="preview-bottom-nav rec-nav" aria-label="ניווט ראשי">
        <Link href="/preview" className="preview-nav-item"><HomeIcon /><span>בית</span></Link>
        <button type="button" className="preview-nav-item"><CartIcon /><span>רשימת קניות</span></button>
        <button type="button" className="preview-nav-item"><SearchIcon /><span>חיפוש</span></button>
        <button type="button" className="preview-nav-item is-active">
          <div className="preview-nav-icon-active"><BookIcon active /></div>
          <span>המתכונים שלי</span>
        </button>
        <button type="button" className="preview-nav-item"><UserIcon /><span>פרופיל</span></button>
      </nav>
    </div>
  )
}
