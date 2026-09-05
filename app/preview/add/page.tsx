import Link from 'next/link'
import '../preview.css'
import './add.css'

export const metadata = { title: 'הוספת מתכון — תצוגה' }

function CameraIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}
function GlobeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function PenIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  )
}
function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

const OPTIONS = [
  {
    id: 'photo',
    label: 'צילום מתכון',
    desc: 'צלם דף כרטיסייה או ספר מתכונים',
    Icon: CameraIcon,
    tint: 'photo',
  },
  {
    id: 'url',
    label: 'ייבוא מהאינטרנט',
    desc: 'הדבק קישור וייבא מתכון ברשת',
    Icon: GlobeIcon,
    tint: 'url',
  },
  {
    id: 'search',
    label: 'חיפוש מתכונים',
    desc: 'חפש מתכון ושמור לספר שלך',
    Icon: SearchIcon,
    tint: 'search',
  },
  {
    id: 'manual',
    label: 'הזנה ידנית',
    desc: 'הכנס את פרטי המתכון בעצמך',
    Icon: PenIcon,
    tint: 'manual',
  },
] as const

export default function AddPreviewPage() {
  return (
    <div className="add-page">
      <header className="add-header">
        <div className="add-header-spacer" aria-hidden="true"></div>
        <h1>הוספת מתכון</h1>
        <Link href="/preview" className="add-back" aria-label="חזרה">
          <BackIcon />
        </Link>
      </header>

      <p className="add-intro">איך תרצה להוסיף מתכון?</p>

      <div className="add-options">
        {OPTIONS.map(({ id, label, desc, Icon, tint }) => {
          const hrefMap: Record<string, string | undefined> = {
            photo: '/preview/scan',
            url: '/preview/url',
          }
          const href = hrefMap[id]
          const cls = `add-option add-tint-${tint}`
          const content = (
            <>
              <span className="add-option-icon"><Icon /></span>
              <span className="add-option-text">
                <strong>{label}</strong>
                <span>{desc}</span>
              </span>
              <span className="add-option-arrow" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </span>
            </>
          )
          return href ? (
            <Link key={id} href={href} className={cls}>{content}</Link>
          ) : (
            <button key={id} type="button" className={cls}>{content}</button>
          )
        })}
      </div>
    </div>
  )
}
