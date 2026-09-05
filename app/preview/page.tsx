import Link from 'next/link'
import './preview.css'

export const metadata = { title: 'תצוגה מקדימה — המטבח של קרן' }

const DEMO_RECIPES = [
  {
    id: 'demo-1',
    title: 'שקשוקה ביתית',
    minutes: 30,
    img: '/images/recipes/shakshuka-default.png',
  },
  {
    id: 'demo-2',
    title: 'כרובית בטחינה לימון',
    minutes: 40,
    img: '/images/recipes/cauliflower-tahini-default.png',
  },
  {
    id: 'demo-3',
    title: 'עוגת לימון בחושה',
    minutes: 60,
    img: '/images/recipes/lemon-cake-default.png',
  },
]

const QUICK_FILTERS = [
  { label: 'מהיר', icon: '🏃' },
  { label: 'צמחוני', icon: '🌿' },
  { label: 'מתוקים', icon: '🎂' },
]

const CATEGORIES = [
  { key: 'meat',    label: 'בשר',    tint: 'meat' },
  { key: 'chicken', label: 'עוף',    tint: 'chicken' },
  { key: 'fish',    label: 'דגים',   tint: 'fish' },
  { key: 'pasta',   label: 'פסטה',   tint: 'pasta' },
  { key: 'salad',   label: 'סלטים',  tint: 'salad' },
  { key: 'soup',    label: 'מרקים',  tint: 'soup' },
  { key: 'sweet',   label: 'קינוחים', tint: 'sweet' },
  { key: 'bread',   label: 'אפים',   tint: 'bread' },
] as const

/* ═══════════════════════════════════════════════════════════
   קטגוריות — 1:1 מהתצלום שהמשתמשת שלחה
   סטייק / שוק עוף / דג / פסטה סליל / קערת סלט / מרק / פרוסת עוגה / לחם
   ═══════════════════════════════════════════════════════════ */
function CategoryArt({ kind }: { kind: string }) {
  const p = { width: 44, height: 44, viewBox: '0 0 48 48', 'aria-hidden': true } as const

  switch (kind) {
    // בשר — סטייק T-bone: גוש בשר אדום-ורוד עם עצם לבנה בצורת T
    case 'meat':
      return (
        <svg {...p}>
          {/* גוף הבשר */}
          <path d="M8 22 Q6 12 18 10 Q30 8 40 14 Q46 20 42 30 Q38 40 26 40 Q14 40 10 32 Q6 28 8 22 Z"
                fill="#c94848"/>
          {/* שכבת שומן ורודה */}
          <path d="M12 22 Q18 18 28 20 Q36 22 38 26 Q36 30 26 30 Q16 30 12 26 Q10 24 12 22 Z"
                fill="#f0a8a8"/>
          {/* עצם T לבנה */}
          <path d="M22 22 L22 32 M18 26 L26 26" stroke="#f5f0e2" strokeWidth="3.5" strokeLinecap="round"/>
        </svg>
      )
    // עוף — שוק עוף: גוף עגול צהוב עם עצם לבנה יוצאת
    case 'chicken':
      return (
        <svg {...p}>
          {/* גוף העוף השמנמן */}
          <path d="M18 8 Q30 6 38 14 Q44 22 40 30 Q34 36 26 34 Q18 32 14 24 Q12 16 18 8 Z"
                fill="#e6a028"/>
          {/* קו הדגשה */}
          <path d="M22 12 Q28 12 32 16" stroke="#c48520" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          {/* עצם לבנה יוצאת */}
          <rect x="10" y="30" width="10" height="6" rx="2" fill="#f5f0e2" transform="rotate(-30 15 33)"/>
          <circle cx="7" cy="37" r="3.5" fill="#f5f0e2"/>
          <circle cx="9" cy="42" r="2.8" fill="#f5f0e2"/>
        </svg>
      )
    // דגים — דג צדדי בגוון תכלת-אפור עם זנב וסנפיר
    case 'fish':
      return (
        <svg {...p}>
          {/* גוף דג */}
          <path d="M6 24 Q10 14 22 12 Q34 12 42 20 Q44 24 42 28 Q34 36 22 36 Q10 34 6 24 Z"
                fill="#6ea8b8"/>
          {/* זנב משולש */}
          <path d="M6 24 L-1 15 L0 33 Z" fill="#6ea8b8"/>
          {/* סנפיר עליון */}
          <path d="M22 12 Q26 8 30 12 L28 16 Q24 15 22 16 Z" fill="#5893a4"/>
          {/* עין */}
          <circle cx="34" cy="20" r="2.4" fill="#f5f0e2"/>
          <circle cx="34" cy="20" r="1.2" fill="#1e3a45"/>
          {/* קשקש */}
          <path d="M18 25 Q22 21 26 25 Q26 28 22 30 Q18 28 18 25 Z" fill="#5893a4" opacity=".6"/>
        </svg>
      )
    // פסטה — סליל פסטה (פוזילי): צורת ספירלה
    case 'pasta':
      return (
        <svg {...p}>
          {/* גוף חיצוני של הסליל */}
          <path d="M10 12 Q24 6 38 12 Q42 24 38 36 Q24 42 10 36 Q6 24 10 12 Z"
                fill="#d09b5a"/>
          {/* קווי הסליל */}
          <path d="M12 18 Q24 12 36 18" stroke="#8b5a1a" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <path d="M12 24 Q24 20 36 24" stroke="#8b5a1a" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <path d="M12 30 Q24 26 36 30" stroke="#8b5a1a" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          {/* היילייט */}
          <path d="M14 15 Q22 10 32 14" stroke="#f2c68a" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".7"/>
        </svg>
      )
    // סלטים — קערה חומה עם עלים ירוקים ופיסות אדומות
    case 'salad':
      return (
        <svg {...p}>
          {/* עלי חסה ירוקים בולטים */}
          <path d="M8 20 Q10 8 18 12 Q22 18 16 22 Q10 22 8 20 Z" fill="#5c9c30"/>
          <path d="M22 18 Q26 6 34 12 Q38 20 30 22 Q24 22 22 18 Z" fill="#7fb548"/>
          <path d="M14 16 Q18 4 26 8 Q28 16 22 20" fill="#4a8422"/>
          {/* פיסות אדומות */}
          <circle cx="16" cy="24" r="2.2" fill="#c94848"/>
          <circle cx="30" cy="24" r="1.8" fill="#c94848"/>
          <circle cx="24" cy="26" r="1.6" fill="#e69b2a"/>
          {/* קערה חומה */}
          <path d="M4 22 L44 22 Q42 38 32 42 Q24 44 16 42 Q6 38 4 22 Z" fill="#b58048"/>
          {/* פס אור בפנים הקערה */}
          <path d="M6 22 L42 22 L42 25 L6 25 Z" fill="#d9a874"/>
        </svg>
      )
    // מרקים — קערה חומה עם קווי אדים וכף אדומה
    case 'soup':
      return (
        <svg {...p}>
          {/* קווי אדים */}
          <path d="M14 4 Q17 10 14 16 M22 4 Q25 10 22 16 M30 4 Q33 10 30 16"
                stroke="#c88950" strokeWidth="2" fill="none" strokeLinecap="round"/>
          {/* כף אדומה בתוך המרק */}
          <path d="M34 12 L38 6" stroke="#c94848" strokeWidth="3" strokeLinecap="round"/>
          <ellipse cx="34" cy="14" rx="3" ry="4" fill="#c94848" transform="rotate(-30 34 14)"/>
          {/* קערה */}
          <path d="M4 20 L44 20 Q42 38 32 42 Q24 44 16 42 Q6 38 4 20 Z" fill="#b58048"/>
          {/* מרק בפנים */}
          <path d="M6 20 L42 20 L42 26 L6 26 Z" fill="#d9a874"/>
          <circle cx="16" cy="23" r="1.4" fill="#8b5a1a" opacity=".5"/>
          <circle cx="26" cy="23" r="1.2" fill="#8b5a1a" opacity=".5"/>
        </svg>
      )
    // קינוחים — פרוסת עוגה משולשת עם שכבות ורודות
    case 'sweet':
      return (
        <svg {...p}>
          {/* משולש עוגה חום */}
          <path d="M8 42 L24 6 L40 42 Z" fill="#8b5a2f"/>
          {/* שכבת בסיס חומה בהירה */}
          <path d="M14 30 L24 8 L34 30 Z" fill="#c88950"/>
          {/* שכבת קרם ורודה עליונה */}
          <path d="M18 22 L24 10 L30 22 Z" fill="#e5688a"/>
          {/* דובדבן/פסים */}
          <circle cx="24" cy="14" r="1.6" fill="#a82030"/>
          <circle cx="20" cy="34" r="1.2" fill="#f5d94a"/>
          <circle cx="28" cy="34" r="1.2" fill="#f5d94a"/>
        </svg>
      )
    // אפים — כיכר לחם חומה אליפטית עם חתכים
    case 'bread':
      return (
        <svg {...p}>
          {/* גוף הלחם */}
          <ellipse cx="24" cy="26" rx="20" ry="12" fill="#b57845"/>
          {/* חתכי אפייה אלכסוניים */}
          <path d="M12 22 L16 32" stroke="#7a4a1a" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M20 20 L24 34" stroke="#7a4a1a" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M28 20 L32 34" stroke="#7a4a1a" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M36 22 L38 30" stroke="#7a4a1a" strokeWidth="2.2" strokeLinecap="round"/>
          {/* קו אור עליון */}
          <path d="M8 22 Q22 14 40 22" stroke="#e2ad78" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".7"/>
        </svg>
      )
    default:
      return null
  }
}

const POPULAR_TAGS = [
  'ללא גלוטן', 'טבעוני', 'לילדים', 'שבתי', 'ארוחת ערב',
  'מהיר להכנה', 'פרווה', 'חלבי', 'בשרי', 'מאפים מלוחים',
] as const

const FAVORITE_RECIPES = [
  { id: 'f1', title: 'לזאניה ביתית',    minutes: 90, img: '/images/recipes/tomato-pasta-default.png' },
  { id: 'f2', title: 'עוף בתנור עם לימון', minutes: 75, img: '/images/recipes/meatballs-default.png' },
  { id: 'f3', title: 'עוגת שוקולד עסיסית',  minutes: 55, img: '/images/recipes/lemon-cake-default.png' },
] as const

const FEATURES = [
  { id: 'offline', label: 'עבד גם בלי אינטרנט', desc: 'הכניסות למתכונים שלך זמינות גם במצב לא מקוון', tint: 'sky', icon: 'wifi-off' },
  { id: 'rate',    label: 'הערות ודירוג', desc: 'דרג, הוסף הערות וצור גרסאות משלך', tint: 'amber', icon: 'star' },
  { id: 'share',   label: 'שיתוף משפחתי', desc: 'שתפי מתכונים ואוספים עם בני המשפחה', tint: 'sage', icon: 'users' },
  { id: 'cart',    label: 'רשימת קניות חכמה', desc: 'צור רשימת קניות אוטומטית מכמה מתכונים', tint: 'red',   icon: 'cart' },
  { id: 'plan',    label: 'תכנון ארוחות', desc: 'תכנני תפריט שבועי בקלות', tint: 'terra', icon: 'calendar' },
  { id: 'pantry',  label: 'מה יש בבית?', desc: 'הכנסי מצרכים וקבלי רעיונות למתכונים', tint: 'sage', icon: 'basket' },
  { id: 'search',  label: 'חיפוש חכם', desc: 'חפשי לפי מרכיבים, זמן הכנה ועוד', tint: 'sky', icon: 'search' },
] as const

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" stroke={active ? 'white' : 'currentColor'} />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function FeatureIcon({ kind }: { kind: string }) {
  const p = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none',
              stroke: 'currentColor', strokeWidth: 2,
              strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
              'aria-hidden': true } as const
  switch (kind) {
    case 'wifi-off':
      return <svg {...p}><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
    case 'star':
      return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    case 'users':
      return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    case 'cart':
      return <svg {...p}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    case 'calendar':
      return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'basket':
      return <svg {...p}><path d="M3 10h18M6 10l1.5 10h9L18 10M9 10V6a3 3 0 0 1 6 0v4"/></svg>
    case 'search':
      return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    default:
      return null
  }
}

function FeatureCard({ label, desc, tint, icon }: { label: string; desc: string; tint: string; icon: string }) {
  return (
    <div className={`preview-feat feat-tint-${tint}`}>
      <span className="preview-feat-icon"><FeatureIcon kind={icon} /></span>
      <strong>{label}</strong>
      <span className="preview-feat-desc">{desc}</span>
    </div>
  )
}

function LeafDeco() {
  return (
    <svg width="34" height="26" viewBox="0 0 60 40" fill="none" aria-hidden="true">
      <path d="M5 30 Q20 5, 55 8 Q40 25, 5 30 Z" fill="#8ea86a" opacity=".6" />
      <path d="M15 32 Q28 15, 50 18" stroke="#4a6b34" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export default function PreviewPage() {
  return (
    <div className="preview-page">
      {/* ===== סרגל עליון ===== */}
      <header className="preview-topbar">
        <Link href="/preview/add" className="preview-add-btn">
          <PlusIcon />
          <span>הוספת מתכון</span>
        </Link>

        <div className="preview-search">
          <SearchIcon />
          <span>מה מתחשק לבשל?</span>
        </div>

        <div className="preview-brand">
          <span>המטבח של קרן</span>
          <LeafDeco />
        </div>
      </header>

      {/* ===== הירו ===== */}
      <section className="preview-hero">
        <div className="preview-hero-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/recipes/shakshuka-default.png" alt="" />
        </div>
        <div className="preview-hero-copy">
          <h1>ארוחת ערב<br />שמרגישה כמו בית</h1>
          <p>מתכונים אהובים מהמטבח שלי,<br />לאנשים שאני אוהבת</p>
          <Link href="/preview/recipes" className="preview-cta">למתכונים שלי</Link>
        </div>
      </section>

      {/* ===== צ'יפסים ===== */}
      <div className="preview-chips">
        {QUICK_FILTERS.map((chip) => (
          <button key={chip.label} type="button" className="preview-chip">
            <span aria-hidden="true">{chip.icon}</span>
            {chip.label}
          </button>
        ))}
      </div>

      {/* ===== קטגוריות ===== */}
      <section className="preview-categories" aria-label="קטגוריות">
        <div className="preview-section-head">
          <h2>קטגוריות</h2>
          <button type="button" className="preview-link">הצג הכל</button>
        </div>
        <div className="preview-cat-row">
          {CATEGORIES.map((cat) => (
            <button key={cat.label} type="button" className={`preview-cat-tile tint-${cat.tint}`}>
              <span className="preview-cat-art">
                <CategoryArt kind={cat.key} />
              </span>
              <span className="preview-cat-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ===== תגיות ואוספים ===== */}
      <section className="preview-tags" aria-label="תגיות ואוספים">
        <div className="preview-section-head">
          <h2>תגיות ואוספים</h2>
          <button type="button" className="preview-link">הצג הכל</button>
        </div>
        <div className="preview-tag-row">
          {POPULAR_TAGS.map((tag) => (
            <button key={tag} type="button" className="preview-tag-pill">
              #{tag}
            </button>
          ))}
        </div>
      </section>

      {/* ===== מומלצים בשבילך ===== */}
      <section className="preview-recipes">
        <div className="preview-section-head">
          <h2>המומלצים בשבילך</h2>
          <Link href="/preview/recipes" className="preview-link">הצג הכל</Link>
        </div>
        <div className="preview-recipe-grid">
          {DEMO_RECIPES.map((recipe) => (
            <Link key={recipe.id} href="/preview/recipe" className="preview-recipe-card">
              <div className="preview-recipe-photo-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={recipe.img} alt={recipe.title} />
                <span className="preview-fav" aria-label={`מועדף: ${recipe.title}`}>
                  <HeartIcon />
                </span>
              </div>
              <div className="preview-recipe-body">
                <h3>{recipe.title}</h3>
                <span className="preview-recipe-time">
                  <ClockIcon />
                  {recipe.minutes} דק׳
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== המועדפים שלי ===== */}
      <section className="preview-recipes">
        <div className="preview-section-head">
          <h2>המועדפים שלי</h2>
          <button type="button" className="preview-link">הכל</button>
        </div>
        <div className="preview-recipe-grid">
          {FAVORITE_RECIPES.map((recipe) => (
            <Link key={recipe.id} href="/preview/recipe" className="preview-recipe-card">
              <div className="preview-recipe-photo-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={recipe.img} alt={recipe.title} />
                <span className="preview-fav is-active" aria-label="מועדף">
                  <HeartIcon />
                </span>
              </div>
              <div className="preview-recipe-body">
                <h3>{recipe.title}</h3>
                <span className="preview-recipe-time">
                  <ClockIcon />
                  {recipe.minutes} דק׳
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== פיצ'רים מרכזיים ===== */}
      <section className="preview-features" aria-label="פיצ'רים מרכזיים">
        <div className="preview-section-head">
          <h2>הפיצ׳רים שלנו</h2>
          <span className="preview-link" style={{ pointerEvents: 'none' }}>7 יכולות</span>
        </div>
        <div className="preview-feat-grid">
          {FEATURES.map((f) => (
            <FeatureCard key={f.id} {...f} />
          ))}
        </div>
      </section>

      {/* ===== ניווט תחתון ===== */}
      <nav className="preview-bottom-nav" aria-label="ניווט ראשי">
        <button type="button" className="preview-nav-item is-active">
          <div className="preview-nav-icon-active">
            <HomeIcon active />
          </div>
          <span>בית</span>
        </button>
        <Link href="/preview/shopping" className="preview-nav-item">
          <BookmarkIcon />
          <span>רשימת קניות</span>
        </Link>
        <button type="button" className="preview-nav-item">
          <SearchIcon />
          <span>חיפוש</span>
        </button>
        <Link href="/preview/recipes" className="preview-nav-item">
          <BookmarkIcon />
          <span>המתכונים שלי</span>
        </Link>
        <button type="button" className="preview-nav-item">
          <UserIcon />
          <span>פרופיל</span>
        </button>
      </nav>

      {/* ===== סיידבר שמאלי — אזור אישי ===== */}
      <aside className="preview-sidebar" aria-label="אזור אישי">
        <div className="preview-sidebar-header">
          <div className="preview-sidebar-avatar" aria-hidden="true">ק</div>
          <div>
            <p className="preview-sidebar-hello">שלום, אורח</p>
            <p className="preview-sidebar-sub">אזור אישי</p>
          </div>
        </div>

        <div className="preview-sidebar-body">
          <p className="preview-sidebar-text">
            שמרי מתכונים, בנייך אוספים משפחתיים ותכנני ארוחות שבועיות.
          </p>
          <Link href="/login" className="preview-sidebar-cta">
            התחברי לחשבון
          </Link>
          <Link href="/register" className="preview-sidebar-link">
            צור/י חשבון חדש
          </Link>
          <Link href="/preview/settings" className="preview-sidebar-link">
            🔌 חיבורים ומפתחות API
          </Link>
        </div>

        <div className="preview-sidebar-footer">
          <p>✿ המטבח של קרן</p>
          <small>גרסת תצוגה מקדימה</small>
        </div>
      </aside>
    </div>
  )
}
