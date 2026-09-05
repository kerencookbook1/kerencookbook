import Link from 'next/link'
import '../preview.css'
import './cook.css'

export const metadata = { title: 'מצב בישול — תצוגה' }

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function ChefHat() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M6 16 Q6 8 16 8 Q26 8 26 16 L26 22 L6 22 Z" fill="#f5f0e2" stroke="#4a3d20" strokeWidth="1.6"/>
      <path d="M6 22 L26 22 L26 25 L6 25 Z" fill="#e5d7b8" stroke="#4a3d20" strokeWidth="1.6"/>
      <circle cx="12" cy="14" r="2" fill="#c94848"/>
    </svg>
  )
}

export default function CookPreviewPage() {
  return (
    <div className="cook-page">
      {/* ===== TOP BAR ===== */}
      <header className="cook-header">
        <Link href="/preview/recipe" className="cook-back" aria-label="חזרה">
          <BackIcon />
          <span>יציאה</span>
        </Link>
        <div className="cook-title">
          <span>שלב 3 מתוך 8</span>
        </div>
        <div className="cook-header-spacer" aria-hidden="true"></div>
      </header>

      {/* ===== PROGRESS BAR ===== */}
      <div className="cook-progress" aria-label="התקדמות">
        <span style={{ width: '37.5%' }} />
      </div>

      {/* ===== STEP INSTRUCTION ===== */}
      <section className="cook-step">
        <h1>הוסיפו את הביצים אחת אחת ובתוך כך ערבבו היטב.</h1>
      </section>

      {/* ===== ILLUSTRATION / PHOTO ===== */}
      <div className="cook-visual">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/recipes/creamy-pasta-default.png" alt="" />
      </div>

      {/* ===== TIMER ===== */}
      <section className="cook-timer" aria-label="טיימר">
        <div className="cook-timer-label">
          <ClockIcon />
          <span>טיימר</span>
        </div>
        <div className="cook-timer-value">02:30</div>
      </section>

      {/* ===== ACTIONS ===== */}
      <div className="cook-actions">
        <button type="button" className="cook-back-btn">הקודם</button>
        <button type="button" className="cook-next-btn">
          הבא
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>

      {/* Footer chef hat decoration */}
      <div className="cook-chef" aria-hidden="true"><ChefHat /></div>
    </div>
  )
}
