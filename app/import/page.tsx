import Link from 'next/link'

export const metadata = { title: 'הוספת מתכון — המטבח של קרן' }

const SOURCES = [
  {
    number: '01',
    title: 'הקלדה ידנית',
    description: 'כתיבת מתכון חדש בעצמך, שלב אחר שלב.',
    href: '/recipes/new',
    primary: true,
  },
  {
    number: '02',
    title: 'ייבוא מקישור',
    description: 'הדביקי כתובת URL של מתכון מהאינטרנט.',
    href: '/import/url',
    primary: false,
  },
  {
    number: '03',
    title: 'צילום מתכון',
    description: 'צלמי מתכון כתוב יד או מודפס — OCR יעבד אותו.',
    href: '/import/photo',
    primary: false,
  },
  {
    number: '04',
    title: 'הקלטת קול',
    description: 'הכתיבי מתכון בקול — AI יתמלל ויעצב.',
    href: '/import/voice',
    primary: false,
  },
] as const

export default function ImportPage() {
  return (
    <main className="screen-shell">
      <header className="screen-header">
        <Link href="/" className="back-link">← חזרה לבית</Link>
        <p className="eyebrow">הוספת מתכון</p>
        <h1>איך תוסיפי את המתכון?</h1>
        <p>בחרי את הדרך הנוחה לך — כולן יוצרות טיוטה לבדיקה.</p>
      </header>

      <div className="source-grid">
        {SOURCES.map((source) => (
          <Link
            key={source.number}
            href={source.href}
            className={`source-card${source.primary ? ' primary-source' : ''}`}
          >
            <span className="source-number">{source.number}</span>
            <h2>{source.title}</h2>
            <p>{source.description}</p>
            <span className="outline-button">{source.primary ? 'התחלי' : 'בחרי'}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
