import Link from 'next/link'
import { Fraunces, Inter } from 'next/font/google'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-fraunces',
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = { title: 'עיצוב א — Warm Kitchen — המטבח של קרן' }

const RECIPES = [
  { title: 'שקשוקה ביתית', min: 30, img: '/images/recipes/shakshuka-default.png', tag: 'ארוחת בוקר' },
  { title: 'סלמון בגלייז דבש', min: 25, img: '/images/recipes/salmon-default.png', tag: 'דגים' },
  { title: 'כרובית בטחינה לימון', min: 40, img: '/images/recipes/cauliflower-tahini-default.png', tag: 'ירקות' },
  { title: 'עוגת לימון בחושה', min: 60, img: '/images/recipes/lemon-cake-default.png', tag: 'קינוחים' },
  { title: 'קציצות ברוטב עגבניות', min: 45, img: '/images/recipes/meatballs-default.png', tag: 'בשרים' },
  { title: 'פסטה שמנת פטריות', min: 20, img: '/images/recipes/creamy-pasta-default.png', tag: 'פסטה' },
]

const CATEGORIES = ['הכל', 'בשר', 'עוף', 'דגים', 'חלבי', 'פסטה', 'קינוחים']

export default function DesignAPage() {
  return (
    <div
      className={`${fraunces.variable} ${inter.variable} min-h-screen`}
      style={{
        background: '#fdf6ec',
        color: '#1f1611',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/preview/designs"
          className="text-sm underline decoration-dotted opacity-70 hover:opacity-100"
          style={{ color: '#5f7548' }}
        >
          ← חזרה לבחירת עיצוב
        </Link>

        <header className="mt-8 flex items-end justify-between gap-6">
          <div>
            <p
              className="text-xs uppercase tracking-widest opacity-70"
              style={{ color: '#5f7548' }}
            >
              המטבח של קרן · Warm Kitchen
            </p>
            <h1
              className="mt-2 text-5xl leading-tight md:text-6xl"
              style={{
                fontFamily: 'var(--font-fraunces), serif',
                fontWeight: 600,
                letterSpacing: '-0.02em',
              }}
            >
              שלום קרן, מה מבשלים היום?
            </h1>
          </div>
          <button
            className="hidden md:inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-95"
            style={{ background: '#c94f2b' }}
          >
            <span className="text-lg">+</span>
            <span>הוספת מתכון</span>
          </button>
        </header>

        <div className="mt-8 flex items-center gap-3 rounded-full border px-5 py-3" style={{ borderColor: '#e8d9c4', background: '#fffcf6' }}>
          <span className="text-lg opacity-60">🔎</span>
          <input
            className="flex-1 bg-transparent text-base outline-none placeholder:text-neutral-500"
            placeholder="חיפוש מתכון, מרכיב, קטגוריה..."
            dir="rtl"
          />
        </div>

        <nav className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c, i) => (
            <button
              key={c}
              className="rounded-full px-5 py-2 text-sm font-semibold transition"
              style={
                i === 0
                  ? { background: '#c94f2b', color: '#fff' }
                  : { background: '#f6e6d3', color: '#3d2a1c' }
              }
            >
              {c}
            </button>
          ))}
        </nav>

        <section
          className="mt-10 overflow-hidden rounded-3xl p-8"
          style={{ background: '#f3e2c9' }}
        >
          <p className="text-xs uppercase tracking-widest" style={{ color: '#5f7548' }}>
            בישול פעיל
          </p>
          <h2
            className="mt-2 text-3xl"
            style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 600 }}
          >
            תוכניות: סלמון בגלייז דבש
          </h2>
          <p className="mt-1 text-sm opacity-75">שלב 3 מתוך 6 · 12 דק׳ נותרו</p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ background: '#dfc3a0' }}>
            <div className="h-full rounded-full" style={{ width: '50%', background: '#c94f2b' }} />
          </div>
          <button
            className="mt-5 rounded-full px-6 py-2 text-sm font-semibold text-white"
            style={{ background: '#5f7548' }}
          >
            המשך בישול ←
          </button>
        </section>

        <div className="mt-12 flex items-baseline justify-between">
          <h2
            className="text-3xl"
            style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 600 }}
          >
            הוספו לאחרונה
          </h2>
          <Link href="#" className="text-sm underline decoration-dotted" style={{ color: '#5f7548' }}>
            כל המתכונים ({RECIPES.length}) →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RECIPES.map((r) => (
            <article
              key={r.title}
              className="overflow-hidden rounded-3xl shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              style={{ background: '#fffcf6' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.img} alt={r.title} className="h-56 w-full object-cover" />
              <div className="p-5">
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: '#f6e6d3', color: '#5f7548' }}
                >
                  {r.tag}
                </span>
                <h3
                  className="mt-3 text-xl leading-snug"
                  style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 600 }}
                >
                  {r.title}
                </h3>
                <p className="mt-1 text-sm opacity-70">{r.min} דק׳ · 4 מנות</p>
              </div>
            </article>
          ))}
        </div>

        <footer className="mt-16 border-t pt-6 text-center text-xs opacity-60" style={{ borderColor: '#e8d9c4' }}>
          זה מוקאפ תצוגה — עיצוב א
        </footer>
      </div>
    </div>
  )
}
