import Link from 'next/link'

export const metadata = { title: 'תצוגת מכשירים · המטבח של קרן' }

/* ─────────── Palette (warm cream + olive, matching user reference) ─────────── */
const P = {
  cream:      '#FAF6EE',
  creamSoft:  '#F5EEDF',
  paper:      '#FFFFFF',
  ink:        '#2A2620',
  mute:       '#6B6357',
  line:       '#E7DEC9',
  olive:      '#4A7C3C',
  oliveDeep:  '#3D6631',
  oliveSoft:  '#EAF1E3',
  paprika:    '#C24E3B',
  amber:      '#E1A233',
  fish:       '#5A9DB0',
  pasta:      '#D89550',
  salad:      '#7BB262',
  sweet:      '#D96D8A',
  bread:      '#B27A47',
  meat:       '#B23D3D',
  chicken:    '#D89A2C',
} as const

/* ─────────── Category SVG icons (matching reference exactly) ─────────── */
function CatIcon({ kind }: { kind: string }) {
  const p = { width: 34, height: 34, viewBox: '0 0 48 48', 'aria-hidden': true } as const
  switch (kind) {
    case 'meat':
      return (
        <svg {...p}>
          <path d="M8 22 Q6 12 18 10 Q30 8 40 14 Q46 20 42 30 Q38 40 26 40 Q14 40 10 32 Q6 28 8 22 Z" fill={P.meat} />
          <path d="M12 22 Q18 18 28 20 Q36 22 38 26 Q36 30 26 30 Q16 30 12 26 Q10 24 12 22 Z" fill="#E89898" />
          <path d="M22 22 L22 32 M18 26 L26 26" stroke="#FDF7EA" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      )
    case 'chicken':
      return (
        <svg {...p}>
          <path d="M18 8 Q30 6 38 14 Q44 22 40 30 Q34 36 26 34 Q18 32 14 24 Q12 16 18 8 Z" fill={P.chicken} />
          <rect x="10" y="30" width="10" height="6" rx="2" fill="#FDF7EA" transform="rotate(-30 15 33)" />
          <circle cx="7" cy="37" r="3.5" fill="#FDF7EA" />
          <circle cx="9" cy="42" r="2.8" fill="#FDF7EA" />
        </svg>
      )
    case 'fish':
      return (
        <svg {...p}>
          <path d="M6 24 Q10 14 22 12 Q34 12 42 20 Q44 24 42 28 Q34 36 22 36 Q10 34 6 24 Z" fill={P.fish} />
          <path d="M6 24 L-1 15 L0 33 Z" fill={P.fish} />
          <circle cx="34" cy="20" r="2.4" fill="#FDF7EA" />
          <circle cx="34" cy="20" r="1.2" fill="#1e3a45" />
        </svg>
      )
    case 'pasta':
      return (
        <svg {...p}>
          <path d="M10 12 Q24 6 38 12 Q42 24 38 36 Q24 42 10 36 Q6 24 10 12 Z" fill={P.pasta} />
          <path d="M12 18 Q24 12 36 18 M12 24 Q24 20 36 24 M12 30 Q24 26 36 30" stroke="#8b5a1a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'salad':
      return (
        <svg {...p}>
          <path d="M8 20 Q10 8 18 12 Q22 18 16 22 Z" fill={P.salad} />
          <path d="M22 18 Q26 6 34 12 Q38 20 30 22 Z" fill="#8FC378" />
          <circle cx="16" cy="24" r="2.2" fill={P.paprika} />
          <circle cx="30" cy="24" r="1.8" fill={P.paprika} />
          <path d="M4 22 L44 22 Q42 38 32 42 Q24 44 16 42 Q6 38 4 22 Z" fill={P.bread} />
          <path d="M6 22 L42 22 L42 25 L6 25 Z" fill="#D9A874" />
        </svg>
      )
    case 'soup':
      return (
        <svg {...p}>
          <path d="M14 4 Q17 10 14 16 M22 4 Q25 10 22 16 M30 4 Q33 10 30 16" stroke={P.pasta} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M4 20 L44 20 Q42 38 32 42 Q24 44 16 42 Q6 38 4 20 Z" fill={P.bread} />
          <path d="M6 20 L42 20 L42 26 L6 26 Z" fill="#D9A874" />
        </svg>
      )
    case 'sweet':
      return (
        <svg {...p}>
          <path d="M8 42 L24 6 L40 42 Z" fill="#8B5A2F" />
          <path d="M14 30 L24 8 L34 30 Z" fill="#C88950" />
          <path d="M18 22 L24 10 L30 22 Z" fill={P.sweet} />
          <circle cx="24" cy="14" r="1.6" fill="#A82030" />
        </svg>
      )
    case 'bread':
      return (
        <svg {...p}>
          <ellipse cx="24" cy="26" rx="20" ry="12" fill={P.bread} />
          <path d="M12 22 L16 32 M20 20 L24 34 M28 20 L32 34" stroke="#7A4A1A" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )
    default: return null
  }
}

/* ─────────── Small icons ─────────── */
const Icon = {
  Home: ({ active }: { active?: boolean } = {}) => <svg width="20" height="20" viewBox="0 0 24 24" fill={active?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22" stroke={active?'#fff':'currentColor'}/></svg>,
  Book: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z"/></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Cart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Heart: ({ active }: { active?: boolean } = {}) => <svg width="18" height="18" viewBox="0 0 24 24" fill={active?P.paprika:'none'} stroke={active?P.paprika:'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Clock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Camera: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Globe: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Wifi: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={P.fish} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  Star: () => <svg width="22" height="22" viewBox="0 0 24 24" fill={P.amber} stroke={P.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={P.sweet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Basket: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={P.paprika} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h18M6 10l1.5 10h9L18 10M9 10V6a3 3 0 0 1 6 0v4"/></svg>,
  Leaf: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={P.salad} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.8 2c1 3 .5 4.5-2 6.5C15 11 16 15 16 15"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>,
} as const

/* ─────────── Data ─────────── */
const CATEGORIES = [
  { key: 'meat',    label: 'בשר',     tint: '#F7E7E4' },
  { key: 'chicken', label: 'עוף',     tint: '#FDF0D8' },
  { key: 'fish',    label: 'דגים',    tint: '#DFEDF2' },
  { key: 'pasta',   label: 'פסטה',    tint: '#FBEBD7' },
  { key: 'salad',   label: 'סלטים',   tint: '#EAF1E3' },
  { key: 'soup',    label: 'מרקים',   tint: '#FBEBD7' },
  { key: 'sweet',   label: 'קינוחים', tint: '#F9DEE6' },
  { key: 'bread',   label: 'אפים',    tint: '#F0E1CE' },
]

const RECIPES = [
  { id: 'r1', title: 'שקשוקה',              minutes: 30, cat: 'ארוחת בוקר', img: '/images/recipes/shakshuka-default.png' },
  { id: 'r2', title: 'סלמון בתנור עם עשבי תיבול', minutes: 45, cat: 'דגים',       img: '/images/recipes/salmon-default.png' },
  { id: 'r3', title: 'קציצות ברוטב עגבניות', minutes: 60, cat: 'בשר',          img: '/images/recipes/meatballs-default.png' },
  { id: 'r4', title: 'פסטה ברוטב שמנת ופטריות', minutes: 25, cat: 'פסטה',       img: '/images/recipes/creamy-pasta-default.png' },
  { id: 'r5', title: 'סלט טבולה',            minutes: 20, cat: 'סלטים',        img: '/images/recipes/herb-salad-default.png' },
  { id: 'r6', title: 'עוגת גבינה אפויה',     minutes: 70, cat: 'קינוחים',      img: '/images/recipes/lemon-cake-default.png' },
]

const FAV = [
  { id: 'f1', title: 'לאזניה ביתית',      img: '/images/recipes/tomato-pasta-default.png' },
  { id: 'f2', title: 'עוף בתנור עם לימון', img: '/images/recipes/meatballs-default.png' },
  { id: 'f3', title: 'עוגת שוקולד עסיסית', img: '/images/recipes/lemon-cake-default.png' },
]

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function DevicesMockup() {
  return (
    <div style={{
      background: '#EDE5D2', minHeight: '100vh',
      fontFamily: '"Heebo", system-ui, sans-serif',
      padding: '32px 20px 60px', direction: 'rtl',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,800&display=swap');
        .dm-serif { font-family: 'Fraunces', serif; }
        .dm-shadow { box-shadow: 0 8px 24px -8px rgba(58,45,25,.15), 0 2px 6px -2px rgba(58,45,25,.08); }
        .dm-phone { border-radius: 32px; border: 8px solid #1a1614; background: ${P.cream}; overflow: hidden; box-shadow: 0 24px 48px -20px rgba(0,0,0,.35), 0 8px 16px -8px rgba(0,0,0,.2); }
        .dm-tablet { border-radius: 24px; border: 12px solid #1a1614; background: ${P.cream}; overflow: hidden; box-shadow: 0 30px 60px -25px rgba(0,0,0,.4), 0 10px 20px -10px rgba(0,0,0,.25); }
        .dm-desktop { border-radius: 12px 12px 0 0; border: 1px solid #d4c9b0; background: ${P.cream}; overflow: hidden; box-shadow: 0 32px 64px -30px rgba(0,0,0,.45), 0 12px 24px -12px rgba(0,0,0,.25); }
        .dm-statusbar { display: flex; justify-content: space-between; align-items: center; padding: 8px 22px 4px; font-size: 12px; font-weight: 600; color: ${P.ink}; }
        .dm-section-title { font-size: 20px; font-weight: 800; color: ${P.ink}; margin: 0 0 16px; text-align: center; letter-spacing: -.01em; }
      `}</style>

      {/* ═══════════ HEADER ═══════════ */}
      <header style={{ maxWidth: 1500, margin: '0 auto 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: P.paper, borderRadius: 999, border: `1px solid ${P.line}`, marginBottom: 16 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: P.olive }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: P.mute, letterSpacing: '.05em' }}>DEVICE MOCKUPS · 3 SIZES</span>
        </div>
        <h1 className="dm-serif" style={{ fontSize: 'clamp(36px, 5vw, 56px)', margin: '0 0 12px', color: P.ink, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}>
          המטבח של קרן <span style={{ color: P.olive }}>·</span> ב-3 גדלים
        </h1>
        <p style={{ fontSize: 16, color: P.mute, maxWidth: 620, margin: '0 auto', lineHeight: 1.5 }}>
          איך האפליקציה נראית בטלפון, טאבלט ומחשב. אותה שפה עיצובית, מותאמת לכל מסך.
        </p>
        <div style={{ marginTop: 20 }}>
          <Link href="/preview" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: P.paper, color: P.ink, border: `1px solid ${P.line}`, borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            ← חזרה לתצוגה מקדימה
          </Link>
        </div>
      </header>

      {/* ═══════════ DESKTOP ═══════════ */}
      <section style={{ maxWidth: 1500, margin: '0 auto 60px' }}>
        <h2 className="dm-section-title">🖥️ תצוגת מחשב · 1440px</h2>
        <div className="dm-desktop" style={{ width: '100%' }}>
          {/* macOS chrome */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: '#e8dfc9', borderBottom: `1px solid ${P.line}` }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
            <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: P.mute, fontFamily: 'ui-monospace, monospace' }}>keren.cooking / המתכונים שלי</div>
          </div>
          <DesktopScreen />
        </div>
      </section>

      {/* ═══════════ TABLET + PHONE row ═══════════ */}
      <section style={{ maxWidth: 1500, margin: '0 auto 60px', display: 'grid', gridTemplateColumns: '1fr', gap: 40 }}>
        <h2 className="dm-section-title">📱 תצוגת טאבלט · 1024×768</h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="dm-tablet" style={{ width: 'min(100%, 1080px)', aspectRatio: '4/3' }}>
            <TabletScreen />
          </div>
        </div>
      </section>

      {/* ═══════════ PHONE screens ═══════════ */}
      <section style={{ maxWidth: 1500, margin: '0 auto 60px' }}>
        <h2 className="dm-section-title">📱 תצוגת טלפון · 375×812 · חמישה מסכים ראשיים</h2>
        <div style={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', justifyItems: 'center', maxWidth: 1500 }}>
          <PhoneFrame title="בית · מה מבשלים?"><PhoneHome /></PhoneFrame>
          <PhoneFrame title="המתכונים שלי"><PhoneList /></PhoneFrame>
          <PhoneFrame title="מתכון בודד"><PhoneRecipe /></PhoneFrame>
          <PhoneFrame title="מצב בישול"><PhoneCook /></PhoneFrame>
          <PhoneFrame title="רשימת קניות"><PhoneShopping /></PhoneFrame>
        </div>
      </section>

      {/* ═══════════ FEATURE BAR ═══════════ */}
      <section style={{ maxWidth: 1500, margin: '0 auto', padding: '30px 24px', background: P.paper, border: `1px solid ${P.line}`, borderRadius: 20 }}>
        <h2 className="dm-section-title" style={{ marginBottom: 20 }}>✨ פיצ&apos;רים מרכזיים</h2>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {[
            { i: <Icon.Wifi />,     t: 'עובד גם בלי אינטרנט', d: 'הכניסות למתכונים שלך זמינות תמיד' },
            { i: <Icon.Star />,     t: 'הערות ודירוג',        d: 'דרג, הוסף הערות וצור גרסאות' },
            { i: <Icon.Users />,    t: 'שיתוף משפחתי',        d: 'שתפי אוספים עם בני המשפחה' },
            { i: <Icon.Basket />,   t: 'רשימת קניות חכמה',    d: 'צור רשימה אוטומטית ממתכונים' },
            { i: <Icon.Calendar />, t: 'תכנון ארוחות',        d: 'תפריט שבועי בקלות' },
            { i: <Icon.Leaf />,     t: 'מה יש בבית?',        d: 'הכנסי מצרכים וקבלי רעיונות' },
            { i: <Icon.Search />,   t: 'חיפוש חכם',          d: 'לפי מרכיבים, זמן הכנה ועוד' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8, padding: 12 }}>
              <div>{f.i}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: P.ink }}>{f.t}</div>
              <div style={{ fontSize: 11, color: P.mute, lineHeight: 1.4 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ maxWidth: 1500, margin: '30px auto 0', textAlign: 'center', color: P.mute, fontSize: 12 }}>
        המטבח של קרן · {new Date().toISOString().slice(0, 10)} · Device Preview
      </footer>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   DESKTOP SCREEN
   ═══════════════════════════════════════════════════════════════════════════ */
function DesktopScreen() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 380px 1fr', minHeight: 620, background: P.cream }}>

      {/* Sidebar */}
      <aside style={{ background: P.paper, borderInlineEnd: `1px solid ${P.line}`, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: P.oliveSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍳</div>
          <div>
            <div className="dm-serif" style={{ fontSize: 17, fontWeight: 800, color: P.ink, lineHeight: 1 }}>המטבח של קרן</div>
            <div style={{ fontSize: 11, color: P.mute, marginTop: 3 }}>ספר המתכונים האישי</div>
          </div>
        </div>
        {[
          { i: <Icon.Home />, l: 'בית' },
          { i: <Icon.Book />, l: 'המתכונים שלי', a: true },
          { i: <Icon.Search />, l: 'חיפוש' },
          { i: <Icon.Cart />, l: 'רשימת קניות' },
          { i: <Icon.Calendar />, l: 'תכנון ארוחות' },
          { i: <Icon.Settings />, l: 'הגדרות' },
        ].map((n, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
            background: n.a ? P.oliveSoft : 'transparent',
            color: n.a ? P.oliveDeep : P.ink, fontWeight: n.a ? 700 : 500, fontSize: 14,
          }}>
            <span style={{ color: n.a ? P.olive : P.mute }}>{n.i}</span> {n.l}
          </div>
        ))}
        <div style={{ marginTop: 24, padding: '14px 12px', background: P.oliveSoft, borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.oliveDeep, marginBottom: 4 }}>+ הוספת מתכון</div>
          <div style={{ fontSize: 11, color: P.mute }}>URL · צילום · הזנה ידנית</div>
        </div>
      </aside>

      {/* Middle — recipes list */}
      <div style={{ background: P.paper, borderInlineEnd: `1px solid ${P.line}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: P.cream, borderRadius: 10, padding: '10px 12px', flex: 1, border: `1px solid ${P.line}` }}>
            <span style={{ color: P.mute }}><Icon.Search /></span>
            <span style={{ fontSize: 13, color: P.mute }}>חיפוש מתכון...</span>
          </div>
          <button style={{ marginInlineStart: 10, padding: '10px 14px', background: P.olive, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon.Plus /> חדש
          </button>
        </div>

        <div style={{ padding: 12, overflow: 'auto', flex: 1 }}>
          {RECIPES.map((r, i) => (
            <div key={r.id} style={{
              display: 'grid', gridTemplateColumns: '76px 1fr', gap: 12, padding: 10, borderRadius: 12,
              background: i === 0 ? P.oliveSoft : 'transparent',
              border: i === 0 ? `1.5px solid ${P.olive}` : '1.5px solid transparent',
              marginBottom: 4,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.img} alt="" style={{ width: 76, height: 76, borderRadius: 10, objectFit: 'cover' }} />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: P.ink, lineHeight: 1.2, marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: P.mute, display: 'flex', alignItems: 'center', gap: 4 }}><Icon.Clock /> {r.minutes} דק&apos;</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — selected recipe */}
      <div style={{ padding: 24, overflow: 'auto', background: P.cream }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/recipes/shakshuka-default.png" alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 14 }} />
            <div style={{ marginTop: 18, padding: 16, background: P.paper, borderRadius: 12, border: `1px solid ${P.line}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: P.mute, letterSpacing: '.1em', marginBottom: 10 }}>הוראות הכנה בקצרה</div>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'מחממים שמן בסיר גדול ומטגנים בצל עד שקוף.',
                  'מוסיפים שום ופלפל ומטגנים 2 דקות.',
                  'מוסיפים עגבניות ותבלינים, מבשלים 10 דקות.',
                  'יוצרים גומות ושוברים ביצה לכל אחת.',
                  'מכסים ומבשלים 8-10 דקות עד שהביצים עשויות.',
                ].map((s, i) => (
                  <li key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 10, fontSize: 13, color: P.ink, lineHeight: 1.4 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: P.oliveSoft, color: P.oliveDeep, fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <h2 className="dm-serif" style={{ fontSize: 40, margin: 0, color: P.ink, fontWeight: 800, letterSpacing: '-.01em', lineHeight: 1 }}>שקשוקה</h2>
                <div style={{ marginTop: 10, display: 'flex', gap: 12, fontSize: 13, color: P.mute, alignItems: 'center' }}>
                  <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Icon.Star /> <b style={{ color: P.ink }}>4.8</b></span>
                  <span>·</span>
                  <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Icon.Clock /> 30 דק&apos;</span>
                  <span>·</span>
                  <span>קל</span>
                  <span>·</span>
                  <span>4 סועדים</span>
                </div>
              </div>
              <button style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: P.paper, boxShadow: '0 2px 8px rgba(0,0,0,.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Heart active /></button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${P.line}`, marginTop: 22 }}>
              {['סקירה', 'הוראות הכנה', 'הערות', 'מידע נוסף'].map((t, i) => (
                <div key={t} style={{
                  padding: '10px 14px', fontSize: 13, fontWeight: i === 0 ? 800 : 500,
                  color: i === 0 ? P.olive : P.mute,
                  borderBottom: i === 0 ? `2px solid ${P.olive}` : '2px solid transparent',
                  marginBottom: -1,
                }}>{t}</div>
              ))}
            </div>

            {/* Ingredients */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: P.ink, marginBottom: 12 }}>מרכיבים</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  '2 כפות שמן זית',
                  '1 בצל גדול קצוץ',
                  '2 שיני שום כתושות',
                  '1 פלפל אדום חתוך לקוביות',
                  '800 גרם עגבניות מרוסקות',
                  '1 כפית פפריקה מתוקה',
                  '½ כפית כמון',
                  'מלח ופלפל לפי הטעם',
                  '4 ביצים',
                  'פטרוזיליה קצוצה',
                ].map(ing => (
                  <li key={ing} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: P.ink, padding: '2px 0' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: P.olive }} /> {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: '14px 20px', background: P.olive, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>התחל בישול</button>
              <button style={{ padding: '14px 18px', background: P.paper, color: P.ink, border: `1px solid ${P.line}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>ערוך מתכון</button>
              <button style={{ padding: '14px 14px', background: P.paper, color: P.mute, border: `1px solid ${P.line}`, borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>⋯</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   TABLET SCREEN
   ═══════════════════════════════════════════════════════════════════════════ */
function TabletScreen() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '80px 320px 1fr', height: '100%', background: P.cream, fontSize: 14 }}>
      {/* Icon-only sidebar */}
      <aside style={{ background: P.paper, borderInlineEnd: `1px solid ${P.line}`, padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: P.oliveSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12 }}>🍳</div>
        {[
          { i: <Icon.Home />, l: 'בית' },
          { i: <Icon.Book />, l: 'המתכונים שלי', a: true },
          { i: <Icon.Search />, l: 'חיפוש' },
          { i: <Icon.Cart />, l: 'רשימת קניות' },
          { i: <Icon.Calendar />, l: 'תכנון ארוחות' },
          { i: <Icon.Settings />, l: 'הגדרות' },
        ].map((n, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 4px', color: n.a ? P.olive : P.mute, background: n.a ? P.oliveSoft : 'transparent', width: 62, borderRadius: 12 }}>
            <span>{n.i}</span>
            <span style={{ fontSize: 9, fontWeight: 700 }}>{n.l}</span>
          </div>
        ))}
      </aside>

      {/* List */}
      <div style={{ background: P.paper, borderInlineEnd: `1px solid ${P.line}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 18px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="dm-serif" style={{ fontSize: 22, fontWeight: 800, color: P.ink }}>המתכונים שלי</div>
            <button style={{ width: 32, height: 32, borderRadius: 8, background: P.olive, color: '#fff', border: 'none', fontSize: 18, fontWeight: 700, lineHeight: 1 }}>+</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: P.cream, borderRadius: 10, padding: '10px 12px', border: `1px solid ${P.line}` }}>
            <span style={{ color: P.mute }}><Icon.Search /></span>
            <span style={{ fontSize: 12, color: P.mute }}>חיפוש מתכון...</span>
          </div>
        </div>

        <div style={{ padding: '0 10px 10px', overflow: 'auto', flex: 1 }}>
          {RECIPES.map((r, i) => (
            <div key={r.id} style={{
              display: 'grid', gridTemplateColumns: '64px 1fr', gap: 10, padding: 8, borderRadius: 10,
              background: i === 0 ? P.oliveSoft : 'transparent',
              border: i === 0 ? `1.5px solid ${P.olive}` : '1.5px solid transparent',
              marginBottom: 2,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.img} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, lineHeight: 1.2, marginBottom: 3 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: P.mute }}>{r.minutes} דק&apos;</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div style={{ padding: 20, overflow: 'auto', background: P.cream, fontSize: 13 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/recipes/shakshuka-default.png" alt="" style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', borderRadius: 12, marginBottom: 14 }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 className="dm-serif" style={{ fontSize: 28, margin: 0, color: P.ink, fontWeight: 800, letterSpacing: '-.01em' }}>שקשוקה</h2>
            <div style={{ marginTop: 6, display: 'flex', gap: 10, fontSize: 11, color: P.mute, alignItems: 'center' }}>
              <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}><Icon.Star /> <b style={{ color: P.ink }}>4.8</b></span>
              <span>·</span>
              <span>⏱ 30 דק&apos;</span>
              <span>·</span>
              <span>קל · 4 סועדים</span>
            </div>
          </div>
          <button style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: P.paper, boxShadow: '0 2px 6px rgba(0,0,0,.1)' }}><Icon.Heart active /></button>
        </div>

        <div style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${P.line}`, marginTop: 14 }}>
          {['סקירה', 'הוראות הכנה', 'הערות', 'מידע נוסף'].map((t, i) => (
            <div key={t} style={{ padding: '8px 10px', fontSize: 11, fontWeight: i === 0 ? 800 : 500, color: i === 0 ? P.olive : P.mute, borderBottom: i === 0 ? `2px solid ${P.olive}` : '2px solid transparent', marginBottom: -1 }}>{t}</div>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: P.ink, marginBottom: 8 }}>מרכיבים</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {['2 כפות שמן זית', '1 בצל קצוץ', '2 שיני שום', '1 פלפל אדום', '800ג עגבניות', '1 כפית פפריקה', '½ כפית כמון', 'מלח ופלפל', '4 ביצים', 'פטרוזיליה'].map(ing => (
              <div key={ing} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: P.ink }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: P.olive }} /> {ing}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
          <button style={{ flex: 1, padding: '10px', background: P.olive, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>התחל בישול</button>
          <button style={{ padding: '10px 12px', background: P.paper, color: P.ink, border: `1px solid ${P.line}`, borderRadius: 8, fontSize: 12, fontWeight: 600 }}>ערוך</button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PHONE FRAME + SCREENS
   ═══════════════════════════════════════════════════════════════════════════ */
function PhoneFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="dm-phone" style={{ width: 300, height: 620 }}>
        <div className="dm-statusbar">
          <span>9:41</span>
          <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', fontSize: 11 }}>
            <svg width="14" height="10" viewBox="0 0 14 10"><rect x="0" y="6" width="2" height="4" fill={P.ink}/><rect x="3" y="4" width="2" height="6" fill={P.ink}/><rect x="6" y="2" width="2" height="8" fill={P.ink}/><rect x="9" y="0" width="2" height="10" fill={P.ink}/></svg>
            <svg width="14" height="10" viewBox="0 0 14 10"><rect x="0" y="1" width="12" height="8" rx="1.5" fill="none" stroke={P.ink} strokeWidth=".8"/><rect x="12" y="3.5" width="1.2" height="3" fill={P.ink}/><rect x="1.5" y="2.5" width="9" height="5" fill={P.ink}/></svg>
          </span>
        </div>
        <div style={{ height: 'calc(100% - 30px)', overflow: 'hidden' }}>{children}</div>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: P.ink, textAlign: 'center' }}>{title}</div>
    </div>
  )
}

/* ─── Phone: Home ─── */
function PhoneHome() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: P.cream }}>
      {/* Top bar */}
      <div style={{ padding: '4px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: P.ink }}><Icon.Menu /></span>
        <span style={{ color: P.ink }}><Icon.Bell /></span>
      </div>

      {/* Content scroll */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px' }}>
        <h1 className="dm-serif" style={{ fontSize: 26, margin: 0, color: P.ink, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.01em' }}>
          <span style={{ fontSize: 22 }}>🧑‍🍳</span> מה בא לך<br/>להכין היום?
        </h1>

        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, background: P.paper, borderRadius: 12, padding: '10px 12px', border: `1px solid ${P.line}` }}>
          <span style={{ color: P.mute }}><Icon.Search /></span>
          <span style={{ fontSize: 12, color: P.mute }}>חיפוש מתכון, מרכיב, קטגוריה...</span>
        </div>

        {/* Three tiles */}
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { i: <Icon.Camera />, l: 'צילום מתכון', bg: '#EAF1E3', c: P.olive },
            { i: <Icon.Globe />,  l: 'ייבוא מהאינטרנט', bg: '#DFEDF2', c: P.fish },
            { i: <Icon.Plus />,   l: 'מתכון חדש', bg: '#F7E7E4', c: P.paprika },
          ].map((t, i) => (
            <div key={i} style={{ background: P.paper, borderRadius: 12, padding: '10px 6px', border: `1px solid ${P.line}`, textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: t.bg, color: t.c, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>{t.i}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: P.ink, lineHeight: 1.2 }}>{t.l}</div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div className="dm-serif" style={{ fontSize: 17, fontWeight: 800, color: P.ink }}>קטגוריות</div>
          <div style={{ fontSize: 11, color: P.olive, fontWeight: 600 }}>הצג הכל</div>
        </div>
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
          {CATEGORIES.map(c => (
            <div key={c.key} style={{ background: P.paper, borderRadius: 12, padding: '8px 4px', textAlign: 'center', border: `1px solid ${P.line}` }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: c.tint, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                <CatIcon kind={c.key} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: P.ink }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Favorites */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div className="dm-serif" style={{ fontSize: 17, fontWeight: 800, color: P.ink }}>המועדפים שלי</div>
          <div style={{ fontSize: 11, color: P.olive, fontWeight: 600 }}>הצג הכל</div>
        </div>
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, paddingBottom: 8 }}>
          {FAV.map(f => (
            <div key={f.id} style={{ background: P.paper, borderRadius: 12, overflow: 'hidden', border: `1px solid ${P.line}` }}>
              <div style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.img} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 4, right: 4 }}><Icon.Heart active /></div>
              </div>
              <div style={{ padding: '5px 6px 8px', fontSize: 10, fontWeight: 700, color: P.ink, lineHeight: 1.2 }}>{f.title}</div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  )
}

/* ─── Phone: List ─── */
function PhoneList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: P.cream }}>
      <div style={{ padding: '4px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: P.ink }}><Icon.Menu /></span>
        <div className="dm-serif" style={{ fontSize: 18, fontWeight: 800, color: P.ink }}>המתכונים שלי</div>
        <div style={{ display: 'flex', gap: 6, color: P.ink }}><Icon.Search /></div>
      </div>

      <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6 }}>
        {['קטגוריה', 'זמן הכנה', 'עוד'].map((f, i) => (
          <div key={f} style={{ padding: '7px 14px', background: P.paper, border: `1px solid ${P.line}`, borderRadius: 999, fontSize: 11, fontWeight: 600, color: P.ink }}>{f} ▾</div>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {RECIPES.map(r => (
            <div key={r.id} style={{ background: P.paper, borderRadius: 12, overflow: 'hidden', border: `1px solid ${P.line}` }}>
              <div style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.img} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 4, right: 4 }}><Icon.Heart active /></div>
              </div>
              <div style={{ padding: '6px 8px 8px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.ink, lineHeight: 1.15, marginBottom: 3 }}>{r.title}</div>
                <div style={{ fontSize: 9, color: P.mute }}>⏱ {r.minutes} דק&apos;</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="recipes" />
    </div>
  )
}

/* ─── Phone: Recipe detail ─── */
function PhoneRecipe() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: P.cream }}>
      <div style={{ padding: '4px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: P.ink, fontSize: 20 }}>‹</span>
        <div style={{ color: P.ink }}><Icon.Heart active /></div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 10px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/recipes/shakshuka-default.png" alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 12 }} />
        <h2 className="dm-serif" style={{ fontSize: 22, margin: '10px 0 4px', color: P.ink, fontWeight: 800 }}>שקשוקה</h2>
        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: P.mute, alignItems: 'center' }}>
          <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}><Icon.Star /> <b style={{ color: P.ink }}>4.8</b></span>
          <span>·</span><span>⏱ 30 דק&apos;</span><span>·</span><span>קל · 4 סועדים</span>
        </div>

        <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${P.line}`, marginTop: 12 }}>
          {['סקירה', 'הוראות', 'הערות'].map((t, i) => (
            <div key={t} style={{ padding: '7px 8px', fontSize: 11, fontWeight: i === 0 ? 800 : 500, color: i === 0 ? P.olive : P.mute, borderBottom: i === 0 ? `2px solid ${P.olive}` : '2px solid transparent' }}>{t}</div>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: P.ink, marginBottom: 6 }}>מרכיבים</div>
          {['2 כפות שמן זית', '1 בצל גדול קצוץ', '2 שיני שום כתושות', '800 גרם עגבניות', '4 ביצים'].map(ing => (
            <div key={ing} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: P.ink, padding: '3px 0' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: P.olive }} /> {ing}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '10px 16px', borderTop: `1px solid ${P.line}`, background: P.paper }}>
        <button style={{ width: '100%', padding: '12px', background: P.olive, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>התחל בישול</button>
      </div>
    </div>
  )
}

/* ─── Phone: Cook mode ─── */
function PhoneCook() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: P.cream }}>
      <div style={{ padding: '4px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: P.ink, fontSize: 20 }}>‹</span>
        <div style={{ fontSize: 11, color: P.mute }}>יציאה</div>
      </div>

      <div style={{ padding: '0 16px', textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: P.olive, fontWeight: 700 }}>שלב 3 מתוך 8</div>
        <div style={{ height: 4, background: P.line, borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
          <div style={{ width: '37.5%', height: '100%', background: P.olive }} />
        </div>
        <div style={{ marginTop: 12, fontSize: 15, color: P.ink, lineHeight: 1.5, fontWeight: 500 }}>
          הוסיפו את הביצים אחת אחת, וטרפו כדי לערבבן היטב.
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/recipes/creamy-pasta-default.png" alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 12 }} />
      </div>

      <div style={{ margin: '0 16px', padding: 14, background: P.paper, borderRadius: 12, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, color: P.mute, fontWeight: 700 }}>⏱ טיימר</div>
          <div className="dm-serif" style={{ fontSize: 32, fontWeight: 800, color: P.ink, letterSpacing: '-.02em', lineHeight: 1 }}>02:30</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ width: 40, height: 40, borderRadius: '50%', background: P.oliveSoft, color: P.olive, border: 'none', fontSize: 16 }}>⏸</button>
          <button style={{ width: 40, height: 40, borderRadius: '50%', background: P.paper, color: P.mute, border: `1px solid ${P.line}`, fontSize: 14 }}>↺</button>
        </div>
      </div>

      <div style={{ marginTop: 'auto', padding: 16, display: 'flex', gap: 8 }}>
        <button style={{ flex: 1, padding: '12px', background: P.paper, color: P.ink, border: `1px solid ${P.line}`, borderRadius: 10, fontSize: 13, fontWeight: 600 }}>הקודם</button>
        <button style={{ flex: 1, padding: '12px', background: P.olive, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>הבא</button>
      </div>
    </div>
  )
}

/* ─── Phone: Shopping list ─── */
function PhoneShopping() {
  const groups = [
    { name: 'ירקות ופירות', items: ['בצל', 'עגבניות', 'פלפל אדום'] },
    { name: 'מוצרי חלב',    items: ['חמאה', 'ביצים'] },
    { name: 'מזווה',          items: ['קמח', 'סוכר'] },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: P.cream }}>
      <div style={{ padding: '4px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: P.ink }}><Icon.Menu /></span>
        <div className="dm-serif" style={{ fontSize: 16, fontWeight: 800, color: P.ink }}>רשימת קניות שלי</div>
        <div style={{ color: P.ink, fontSize: 14 }}>↗</div>
      </div>

      <div style={{ display: 'flex', gap: 4, background: P.paper, marginInline: 16, marginBottom: 10, borderRadius: 10, border: `1px solid ${P.line}`, padding: 4 }}>
        <div style={{ flex: 1, padding: '8px 12px', background: P.olive, color: '#fff', borderRadius: 8, fontSize: 11, fontWeight: 700, textAlign: 'center' }}>לפי מוצרים</div>
        <div style={{ flex: 1, padding: '8px 12px', color: P.mute, fontSize: 11, fontWeight: 600, textAlign: 'center' }}>לפי קטגוריה</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
        {groups.map(g => (
          <div key={g.name} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: P.mute, letterSpacing: '.05em', marginBottom: 6, textTransform: 'uppercase' }}>{g.name}</div>
            <div style={{ background: P.paper, borderRadius: 12, border: `1px solid ${P.line}`, overflow: 'hidden' }}>
              {g.items.map((item, i) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: i < g.items.length - 1 ? `1px solid ${P.line}` : 'none' }}>
                  <div style={{ width: 16, height: 16, border: `1.5px solid ${P.line}`, borderRadius: 4 }} />
                  <span style={{ fontSize: 12, color: P.ink }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 12, borderTop: `1px solid ${P.line}`, background: P.paper }}>
        <button style={{ width: '100%', padding: '11px', background: P.olive, color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>+ הוסף פריט</button>
      </div>
    </div>
  )
}

function BottomNav({ active }: { active: 'home' | 'shopping' | 'search' | 'recipes' | 'profile' }) {
  const items = [
    { k: 'home',     l: 'בית',           i: <Icon.Home active={active === 'home'} /> },
    { k: 'shopping', l: 'רשימת קניות', i: <Icon.Cart /> },
    { k: 'search',   l: 'חיפוש',         i: <Icon.Search /> },
    { k: 'recipes',  l: 'המתכונים שלי',  i: <Icon.Book /> },
    { k: 'profile',  l: 'פרופיל',        i: <span style={{fontSize:16}}>👤</span> },
  ] as const
  return (
    <nav style={{ borderTop: `1px solid ${P.line}`, background: P.paper, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', padding: '6px 4px' }}>
      {items.map(i => {
        const on = i.k === active
        return (
          <div key={i.k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 2px', color: on ? P.olive : P.mute }}>
            <span>{i.i}</span>
            <span style={{ fontSize: 9, fontWeight: on ? 700 : 500 }}>{i.l}</span>
          </div>
        )
      })}
    </nav>
  )
}
