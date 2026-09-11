import Link from 'next/link'
import { Noto_Sans, Noto_Serif_Display } from 'next/font/google'

const sans = Noto_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans-d' })
const serif = Noto_Serif_Display({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-serif-d' })

export const metadata = { title: 'עיצוב ד — Japandi — המטבח של קרן' }

const RECIPES = [
  { title: 'שקשוקה ביתית', min: 30, img: '/images/recipes/shakshuka-default.png', tag: 'ארוחת בוקר' },
  { title: 'סלמון בגלייז דבש', min: 25, img: '/images/recipes/salmon-default.png', tag: 'דגים' },
  { title: 'כרובית בטחינה לימון', min: 40, img: '/images/recipes/cauliflower-tahini-default.png', tag: 'ירקות' },
  { title: 'עוגת לימון בחושה', min: 60, img: '/images/recipes/lemon-cake-default.png', tag: 'קינוחים' },
  { title: 'קציצות ברוטב עגבניות', min: 45, img: '/images/recipes/meatballs-default.png', tag: 'בשרים' },
  { title: 'פסטה שמנת פטריות', min: 20, img: '/images/recipes/creamy-pasta-default.png', tag: 'פסטה' },
]

const CATEGORIES = ['הכל', 'בשר', 'עוף', 'דגים', 'חלבי', 'פסטה', 'קינוחים']

export default function DesignDPage() {
  return (
    <div
      className={`${sans.variable} ${serif.variable} min-h-screen`}
      style={{
        background: '#f7f5f0',
        color: '#2b2620',
        fontFamily: 'var(--font-sans-d), system-ui, sans-serif',
      }}
    >
      <div className="mx-auto max-w-5xl px-8 py-16">
        <Link
          href="/preview/designs"
          className="text-xs tracking-[0.2em] uppercase opacity-50 hover:opacity-100"
        >
          ← designs
        </Link>

        <header className="mt-20">
          <div className="mb-8 h-px w-16" style={{ background: '#d4b896' }} />
          <p className="text-xs tracking-[0.3em] uppercase" style={{ color: '#8a7c6b' }}>
            九月 · Autumn · המטבח של קרן
          </p>
          <h1
            className="mt-6 text-6xl leading-[1.1]"
            style={{
              fontFamily: 'var(--font-serif-d), serif',
              fontWeight: 400,
              letterSpacing: '-0.02em',
            }}
          >
            אוכל.
            <br />
            <span style={{ color: '#8a7c6b' }}>שקט.</span>
          </h1>
          <p className="mt-8 max-w-md text-base leading-[1.9]" style={{ color: '#6b5f52' }}>
            מרחב פנוי לחשוב על הארוחה הבאה. שום דבר מיותר.
          </p>
        </header>

        <nav className="mt-24 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {CATEGORIES.map((c, i) => (
            <button
              key={c}
              className="tracking-wide transition"
              style={{
                color: i === 0 ? '#2b2620' : '#8a7c6b',
                fontWeight: i === 0 ? 600 : 400,
                textDecoration: i === 0 ? 'underline' : 'none',
                textUnderlineOffset: '6px',
                textDecorationThickness: '1px',
                textDecorationColor: '#d4b896',
              }}
            >
              {c}
            </button>
          ))}
        </nav>

        <div className="mt-8 h-px w-full" style={{ background: '#e8e0d2' }} />

        <section className="mt-24">
          <p className="text-xs tracking-[0.25em] uppercase" style={{ color: '#8a7c6b' }}>
            06 · מתכונים
          </p>
          <div className="mt-16 grid grid-cols-1 gap-x-12 gap-y-24 sm:grid-cols-2">
            {RECIPES.map((r, idx) => (
              <article key={r.title} className="group">
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.img}
                    alt={r.title}
                    className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    style={{ filter: 'contrast(0.95) saturate(0.85)' }}
                  />
                </div>
                <div className="mt-6 flex items-baseline justify-between">
                  <p className="text-xs tracking-[0.2em] uppercase" style={{ color: '#8a7c6b' }}>
                    0{idx + 1}
                  </p>
                  <p className="text-xs tracking-wider" style={{ color: '#8a7c6b' }}>
                    {r.tag}
                  </p>
                </div>
                <h3
                  className="mt-3 text-2xl leading-snug"
                  style={{ fontFamily: 'var(--font-serif-d), serif', fontWeight: 400 }}
                >
                  {r.title}
                </h3>
                <p className="mt-3 text-sm" style={{ color: '#6b5f52' }}>
                  {r.min} דקות
                </p>
                <div className="mt-6 h-px w-8" style={{ background: '#d4b896' }} />
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-32 text-center text-xs tracking-[0.3em] uppercase" style={{ color: '#a89e8f' }}>
          מוקאפ תצוגה — עיצוב ד
        </footer>
      </div>
    </div>
  )
}
