import Link from 'next/link'
import '../preview.css'
import './icons.css'

export const metadata = { title: 'איקונים — בחירת סגנון' }

const CATS = [
  { key: 'meat',    label: 'בשר',    tint: 'meat' },
  { key: 'chicken', label: 'עוף',    tint: 'chicken' },
  { key: 'fish',    label: 'דגים',   tint: 'fish' },
  { key: 'pasta',   label: 'פסטה',   tint: 'pasta' },
  { key: 'salad',   label: 'סלטים',  tint: 'salad' },
  { key: 'soup',    label: 'מרקים',  tint: 'soup' },
  { key: 'sweet',   label: 'קינוחים', tint: 'sweet' },
  { key: 'bread',   label: 'אפים',   tint: 'bread' },
] as const

/* ═══════════════════════════════════════════════════════
   סגנון A — קווי מתאר עדינים בגוון חום חם
   ═══════════════════════════════════════════════════════ */
function IconOutline({ kind }: { kind: string }) {
  const p = { width: 44, height: 44, viewBox: '0 0 48 48', fill: 'none',
              stroke: '#6a3f18', strokeWidth: 1.6,
              strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
              'aria-hidden': true } as const
  switch (kind) {
    case 'meat':
      return (
        <svg {...p}>
          <path d="M8 26 Q6 16 16 12 Q28 8 38 13 Q46 18 44 28 Q42 38 30 41 Q17 43 11 37 Q6 32 8 26 Z"/>
          <path d="M17 24 Q24 20 32 24 Q34 27 32 30 Q24 33 17 30 Q15 27 17 24 Z"/>
        </svg>
      )
    case 'chicken':
      return (
        <svg {...p}>
          <path d="M14 14 Q18 6 28 8 Q38 10 40 20 Q41 27 32 30 Q26 32 21 28 L14 20 Z"/>
          <path d="M21 28 L14 40 Q11 44 14 45 Q17 46 19 43 L26 32"/>
          <circle cx="14" cy="41.5" r="3"/>
        </svg>
      )
    case 'fish':
      return (
        <svg {...p}>
          <path d="M6 24 Q16 14 28 14 Q40 14 46 22 Q46 26 44 28 Q40 34 28 34 Q16 34 6 24 Z"/>
          <path d="M6 24 L0 16 L0 32 Z"/>
          <circle cx="36" cy="22" r="1.6" fill="#6a3f18"/>
          <path d="M22 22 Q24 24 22 26 M28 22 Q30 25 28 28"/>
        </svg>
      )
    case 'pasta':
      return (
        <svg {...p}>
          <ellipse cx="24" cy="34" rx="20" ry="4"/>
          <path d="M6 34 Q7 22 14 18 Q22 14 30 16 Q38 18 42 24 Q44 30 42 34"/>
          <path d="M12 25 Q16 22 20 25 M22 23 Q26 20 30 24 M32 24 Q36 21 40 25"/>
        </svg>
      )
    case 'salad':
      return (
        <svg {...p}>
          <path d="M4 22 L44 22 Q44 38 32 42 Q24 44 16 42 Q4 38 4 22 Z"/>
          <path d="M4 22 L44 22"/>
          <path d="M10 20 Q14 10 22 14 Q20 22 12 22"/>
          <path d="M22 20 Q28 10 36 16 Q34 22 24 22"/>
          <circle cx="18" cy="26" r="2"/>
          <circle cx="30" cy="26" r="2"/>
        </svg>
      )
    case 'soup':
      return (
        <svg {...p}>
          <path d="M16 8 Q18 12 16 16 M22 8 Q24 12 22 16 M28 8 Q30 12 28 16"/>
          <path d="M4 22 L44 22 Q44 38 34 42 Q24 44 14 42 Q4 38 4 22 Z"/>
          <path d="M4 22 L44 22"/>
        </svg>
      )
    case 'sweet':
      return (
        <svg {...p}>
          <path d="M22 6 L22 12"/>
          <rect x="8" y="20" width="32" height="20" rx="2"/>
          <path d="M8 28 Q16 24 24 28 Q32 32 40 28"/>
        </svg>
      )
    case 'bread':
      return (
        <svg {...p}>
          <path d="M6 22 Q8 12 24 12 Q40 12 42 22 Q42 30 40 36 Q38 40 30 40 L18 40 Q10 40 8 36 Q6 30 6 22 Z"/>
          <path d="M14 18 Q18 22 22 18 M20 24 Q24 28 28 24 M26 18 Q30 22 34 18 M14 30 Q18 34 22 30 M26 30 Q30 34 34 30"/>
        </svg>
      )
    default: return null
  }
}

/* ═══════════════════════════════════════════════════════
   סגנון B — איורים מלאים בצבע (הנוכחי)
   ═══════════════════════════════════════════════════════ */
function IconFilled({ kind }: { kind: string }) {
  const common = { width: 46, height: 46, viewBox: '0 0 48 48', 'aria-hidden': true } as const
  switch (kind) {
    case 'meat':
      return (
        <svg {...common}>
          <path d="M6 24 Q4 14 14 10 Q26 5 36 10 Q45 15 44 26 Q43 37 32 40 Q19 43 11 37 Q4 32 6 24 Z"
                fill="#c95555" stroke="#7a3030" strokeWidth="1.6"/>
          <path d="M15 22 Q23 18 32 22 Q34 26 32 30 Q23 33 15 29 Q13 26 15 22 Z" fill="#ea9494" opacity=".6"/>
        </svg>
      )
    case 'chicken':
      return (
        <svg {...common}>
          <path d="M14 12 Q18 4 28 6 Q38 8 40 18 Q42 26 34 30 Q27 32 22 28 Q17 24 14 20 Z" fill="#e6a955" stroke="#7d5218" strokeWidth="1.6"/>
          <path d="M22 28 L14 40 Q11 44 14 45 Q17 46 19 43 L27 32" fill="#f2ebd6" stroke="#7d5218" strokeWidth="1.6"/>
          <circle cx="14" cy="41.5" r="3" fill="#f2ebd6" stroke="#7d5218" strokeWidth="1.6"/>
        </svg>
      )
    case 'fish':
      return (
        <svg {...common}>
          <path d="M4 24 Q14 14 26 14 Q38 14 44 22 Q44 26 42 28 Q38 34 26 34 Q14 34 4 24 Z" fill="#6ba7bb" stroke="#2f6474" strokeWidth="1.6"/>
          <path d="M10 24 L4 16 L4 32 Z" fill="#6ba7bb" stroke="#2f6474" strokeWidth="1.6"/>
          <circle cx="36" cy="22" r="2" fill="#fff"/><circle cx="36.5" cy="22" r="1" fill="#2f6474"/>
        </svg>
      )
    case 'pasta':
      return (
        <svg {...common}>
          <ellipse cx="24" cy="34" rx="20" ry="4" fill="#c88e4c" stroke="#5d3a12" strokeWidth="1.5"/>
          <path d="M6 34 Q7 22 14 18 Q22 14 30 16 Q38 18 42 24 Q44 30 42 34" fill="#f0c766" stroke="#5d3a12" strokeWidth="1.5"/>
          <path d="M12 25 Q16 22 20 25 M22 23 Q26 20 30 24 M32 24 Q36 21 40 25" stroke="#7d4a1a" strokeWidth="1.1" fill="none"/>
          <circle cx="18" cy="22" r="2" fill="#c95a2f"/>
          <circle cx="26" cy="27" r="1.3" fill="#7a9a3f"/>
        </svg>
      )
    case 'salad':
      return (
        <svg {...common}>
          <path d="M4 22 L44 22 Q44 38 32 42 Q24 44 16 42 Q4 38 4 22 Z" fill="#f5f0e2" stroke="#4a3d20" strokeWidth="1.5"/>
          <path d="M10 18 Q14 8 22 12 Q20 20 12 22 Z" fill="#6b9a3a" stroke="#3d5c1d" strokeWidth="1.3"/>
          <path d="M22 18 Q28 8 36 14 Q34 22 24 22 Z" fill="#8ab355" stroke="#3d5c1d" strokeWidth="1.3"/>
          <circle cx="18" cy="24" r="2.5" fill="#d54b34"/>
          <circle cx="28" cy="26" r="2.2" fill="#e5b23a"/>
        </svg>
      )
    case 'soup':
      return (
        <svg {...common}>
          <path d="M16 8 Q18 12 16 16 M22 8 Q24 12 22 16 M28 8 Q30 12 28 16" stroke="#a05a2f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M4 22 L44 22 Q44 38 34 42 Q24 44 14 42 Q4 38 4 22 Z" fill="#dc6a4a" stroke="#6f2d18" strokeWidth="1.6"/>
          <ellipse cx="24" cy="26" rx="14" ry="3" fill="#f0a578" opacity=".7"/>
        </svg>
      )
    case 'sweet':
      return (
        <svg {...common}>
          <path d="M22 6 L22 12" stroke="#e5688a" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
          <rect x="8" y="20" width="32" height="20" rx="2" fill="#f5c9a0" stroke="#7a4a1a" strokeWidth="1.5"/>
          <path d="M8 26 Q16 22 24 26 Q32 30 40 26 L40 30 Q32 34 24 30 Q16 26 8 30 Z" fill="#f5a4c1" stroke="#a5385e" strokeWidth="1.2"/>
        </svg>
      )
    case 'bread':
      return (
        <svg {...common}>
          <path d="M6 22 Q8 12 24 12 Q40 12 42 22 Q42 30 40 36 Q38 40 30 40 L18 40 Q10 40 8 36 Q6 30 6 22 Z" fill="#dfa869" stroke="#5a3410" strokeWidth="1.6"/>
          <path d="M14 18 Q18 22 22 18 M20 22 Q24 26 28 22 M26 18 Q30 22 34 18" stroke="#6a3f18" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        </svg>
      )
    default: return null
  }
}

/* ═══════════════════════════════════════════════════════
   סגנון C — סטיקר עגלגל מודגש (בולד, שמח)
   ═══════════════════════════════════════════════════════ */
function IconSticker({ kind }: { kind: string }) {
  const p = { width: 46, height: 46, viewBox: '0 0 48 48',
              stroke: '#1f1408', strokeWidth: 2.6,
              strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
              'aria-hidden': true } as const
  switch (kind) {
    case 'meat':
      return (
        <svg {...p}>
          <path d="M6 26 Q4 14 16 10 Q28 6 38 12 Q46 18 44 28 Q42 38 30 42 Q16 44 10 38 Q4 32 6 26 Z" fill="#ef4444"/>
          <path d="M18 24 Q24 20 32 24 Q34 27 32 30 Q24 33 18 30 Q16 27 18 24 Z" fill="#fca5a5"/>
        </svg>
      )
    case 'chicken':
      return (
        <svg {...p}>
          <path d="M14 12 Q18 4 28 6 Q40 8 42 20 Q42 28 32 30 Q26 32 22 28 Q17 24 14 20 Z" fill="#facc15"/>
          <path d="M22 28 L14 40 Q11 44 14 45 Q17 46 19 43 L27 32" fill="#fef3c7"/>
          <circle cx="14" cy="41.5" r="3.5" fill="#fef3c7"/>
        </svg>
      )
    case 'fish':
      return (
        <svg {...p}>
          <path d="M4 24 Q14 12 28 12 Q42 12 46 22 Q46 26 44 28 Q40 36 28 36 Q14 36 4 24 Z" fill="#22d3ee"/>
          <path d="M10 24 L4 14 L4 34 Z" fill="#22d3ee"/>
          <circle cx="36" cy="22" r="2.5" fill="#fff"/>
          <circle cx="36" cy="22" r="1.2" fill="#1f1408"/>
        </svg>
      )
    case 'pasta':
      return (
        <svg {...p}>
          <ellipse cx="24" cy="36" rx="22" ry="4" fill="#a16207"/>
          <path d="M4 36 Q5 22 14 16 Q24 12 34 16 Q42 20 44 26 Q46 32 44 36" fill="#fbbf24"/>
          <circle cx="18" cy="22" r="2.5" fill="#dc2626"/>
          <circle cx="30" cy="24" r="2" fill="#dc2626"/>
        </svg>
      )
    case 'salad':
      return (
        <svg {...p}>
          <path d="M4 22 L44 22 Q44 40 32 44 Q24 46 16 44 Q4 40 4 22 Z" fill="#fef9c3"/>
          <path d="M10 20 Q14 8 22 14 Q20 22 12 22 Z" fill="#22c55e"/>
          <path d="M22 18 Q28 6 38 14 Q36 22 26 22 Z" fill="#4ade80"/>
          <circle cx="18" cy="26" r="3" fill="#ef4444"/>
          <circle cx="30" cy="28" r="2.5" fill="#f59e0b"/>
        </svg>
      )
    case 'soup':
      return (
        <svg {...p}>
          <path d="M14 6 Q17 12 14 18 M22 6 Q25 12 22 18 M30 6 Q33 12 30 18" fill="none"/>
          <path d="M4 22 L44 22 Q44 40 34 44 Q24 46 14 44 Q4 40 4 22 Z" fill="#ef4444"/>
          <ellipse cx="24" cy="27" rx="14" ry="3" fill="#fca5a5"/>
        </svg>
      )
    case 'sweet':
      return (
        <svg {...p}>
          <path d="M22 4 L22 12" fill="none" stroke="#ec4899"/>
          <rect x="8" y="20" width="32" height="22" rx="3" fill="#fbbf24"/>
          <path d="M8 28 Q16 22 24 28 Q32 34 40 28 L40 32 Q32 38 24 32 Q16 26 8 32 Z" fill="#f472b6"/>
          <circle cx="14" cy="16" r="2" fill="#ef4444"/>
          <circle cx="24" cy="14" r="2" fill="#facc15"/>
          <circle cx="34" cy="16" r="2" fill="#4ade80"/>
        </svg>
      )
    case 'bread':
      return (
        <svg {...p}>
          <path d="M4 22 Q6 10 24 10 Q42 10 44 22 Q44 32 42 38 Q40 42 32 42 L16 42 Q8 42 6 38 Q4 32 4 22 Z" fill="#f59e0b"/>
          <path d="M14 18 Q18 24 22 18 M22 22 Q26 28 30 22 M30 18 Q34 24 38 18" fill="none"/>
        </svg>
      )
    default: return null
  }
}

const STYLES = [
  { title: 'סגנון A — קווי מתאר עדינים', sub: 'רזה, מינימלי, בגוון חום חם', Component: IconOutline },
  { title: 'סגנון B — איורים מלאים', sub: 'רב-צבעוני, פרטים עדינים (נוכחי)', Component: IconFilled },
  { title: 'סגנון C — סטיקר בולד', sub: 'קווים עבים, צבעים חיים ושמחים', Component: IconSticker },
]

export default function IconChoicePage() {
  return (
    <div className="preview-page icon-choice-page">
      <header className="icon-choice-head">
        <Link href="/preview" className="icon-back">&rarr; חזרה לתצוגה</Link>
        <h1>בחרי סגנון איורים לקטגוריות</h1>
        <p>שלושה סגנונות שונים. תגידי לי איזה — A, B או C — ואני אחיל אותו בכל האפליקציה.</p>
      </header>

      {STYLES.map(({ title, sub, Component }, idx) => (
        <section key={title} className={`icon-option option-${['a', 'b', 'c'][idx]}`}>
          <div className="icon-option-head">
            <h2>{title}</h2>
            <p>{sub}</p>
          </div>
          <div className="preview-cat-row">
            {CATS.map((cat) => (
              <div key={cat.label} className={`preview-cat-tile tint-${cat.tint}`}>
                <span className="preview-cat-art">
                  <Component kind={cat.key} />
                </span>
                <span className="preview-cat-label">{cat.label}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
