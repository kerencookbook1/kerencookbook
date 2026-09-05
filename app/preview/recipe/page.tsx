import Link from 'next/link'
import '../preview.css'
import './recipe.css'

export const metadata = { title: 'פרטי מתכון — תצוגה' }

const INGREDIENTS = [
  '2 כפות שמן זית',
  '1 בצל גדול לבן, קצוץ',
  '2 שיני שום כתושות',
  '1 פלפל אדום חתוך לקוביות',
  '800 גרם עגבניות מרוסקות',
  '1 כפית פפריקה מתוקה',
  '1/2 כפית כמון',
  'מלח ופלפל לפי הטעם',
  '4 ביצים',
  'פטרוזיליה קצוצה',
] as const

const STEPS = [
  'מחממים שמן בסיר גדול ומטגנים את הבצל עד שהוא שקוף.',
  'מוסיפים שום ופלפל ומטגנים עוד 2 דקות.',
  'מוסיפים עגבניות ותבלינים, מערבבים ומבשלים 10 דקות.',
  'יוצרים גומות ושוברים ביצה לכל גומה.',
  'מכסים ומבשלים 8-10 דקות עד שהביצים עשויות.',
] as const

const TABS: { id: string; label: string; active?: boolean }[] = [
  { id: 'overview', label: 'סקירה', active: true },
  { id: 'steps', label: 'הוראות הכנה' },
  { id: 'notes', label: 'הערות' },
  { id: 'extra', label: 'מידע נוסף' },
]

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function DotsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
    </svg>
  )
}

export default function RecipeDetailPreview() {
  return (
    <div className="preview-page rd-page">
      <Link href="/preview/recipes" className="rd-back">
        &rarr; חזרה למתכונים שלי
      </Link>

      <article className="rd-shell">
        {/* עמודה שמאלית — תמונה + כותרת + מרכיבים */}
        <div className="rd-left">
          <div className="rd-photo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/recipes/shakshuka-default.png" alt="שקשוקה" />
            <button type="button" className="rd-heart" aria-label="הוסיפי למועדפים">
              <HeartIcon filled />
            </button>
          </div>

          <section className="rd-ingredients" aria-label="מרכיבים">
            <h3>מרכיבים</h3>
            <ul>
              {INGREDIENTS.map((ing) => (
                <li key={ing}>{ing}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* עמודה ימנית — כותרת, טאבים, סקירה */}
        <div className="rd-right">
          <header className="rd-title-row">
            <div>
              <h1>שקשוקה</h1>
              <div className="rd-meta">
                <span className="rd-stars">
                  <StarIcon filled /><StarIcon filled /><StarIcon filled /><StarIcon filled /><StarIcon />
                  <span className="rd-rating">4.8</span>
                </span>
                <span className="rd-meta-item"><ClockIcon /> 30 דק׳</span>
                <span className="rd-meta-item">קל</span>
                <span className="rd-meta-item"><UsersIcon /> 2 סועדים</span>
              </div>
            </div>
            <button type="button" className="rd-more" aria-label="עוד"><DotsIcon /></button>
          </header>

          <div className="rd-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={t.active}
                className={`rd-tab${t.active ? ' is-active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <section className="rd-steps" aria-label="הוראות הכנה בקצרה">
            <h3>הוראות הכנה בקצרה</h3>
            <ol>
              {STEPS.map((step, i) => (
                <li key={i}>
                  <span className="rd-step-num">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="rd-actions">
            <button type="button" className="rd-cta-secondary">ערוך מתכון</button>
            <Link href="/preview/cook" className="rd-cta-primary">התחל בישול</Link>
          </div>
        </div>
      </article>
    </div>
  )
}
