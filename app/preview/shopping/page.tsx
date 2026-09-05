import Link from 'next/link'
import '../preview.css'
import './shopping.css'

export const metadata = { title: 'רשימת קניות — תצוגה' }

const GROUPS = [
  {
    title: 'ירקות ופירות',
    items: [
      { name: 'בצל', done: false },
      { name: 'עגבניות', done: false, marked: true },
      { name: 'פלפל אדום', done: false },
      { name: 'לימון', done: true },
    ],
  },
  {
    title: 'מוצרי חלב',
    items: [
      { name: 'חמאה', done: false },
      { name: 'ביצים', done: false },
      { name: 'גבינה מוצרלה 200 ג׳', done: true },
    ],
  },
  {
    title: 'מזווה',
    items: [
      { name: 'קמח', done: false },
      { name: 'סוכר', done: false },
      { name: 'שמן זית 750 מ״ל', done: false, marked: true },
      { name: 'אורז בסמטי', done: true },
    ],
  },
] as const

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
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
function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

export default function ShoppingPreviewPage() {
  return (
    <div className="shop-page">
      {/* ===== HEADER ===== */}
      <header className="shop-header">
        <button type="button" className="shop-share" aria-label="שיתוף">
          <ShareIcon />
        </button>
        <h1>רשימת קניות</h1>
        <Link href="/preview" className="shop-back" aria-label="חזרה">
          <BackIcon />
        </Link>
      </header>
      <p className="shop-subtitle">שתפי וסנכרנו עם המשפחה</p>

      {/* ===== TABS ===== */}
      <div className="shop-tabs" role="tablist">
        <button type="button" className="shop-tab is-active" role="tab" aria-selected="true">
          לפי קטגוריה
        </button>
        <button type="button" className="shop-tab" role="tab" aria-selected="false">
          לפי מתכון
        </button>
      </div>

      {/* ===== GROUPS ===== */}
      {GROUPS.map((group) => (
        <section key={group.title} className="shop-group" aria-label={group.title}>
          <h2>{group.title}</h2>
          <ul>
            {group.items.map((item) => (
              <li key={item.name} className={`shop-item${item.done ? ' is-done' : ''}${'marked' in item && item.marked ? ' is-marked' : ''}`}>
                <span className="shop-check" aria-hidden="true">
                  {item.done && <CheckIcon />}
                </span>
                <span className="shop-name">{item.name}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* ===== ADD BAR ===== */}
      <div className="shop-add-bar">
        <input type="text" placeholder="הוסיפי פריט חדש..." aria-label="פריט חדש" />
        <button type="button" className="shop-add-btn">
          <PlusIcon />
          <span>הוסף פריט</span>
        </button>
      </div>
    </div>
  )
}
