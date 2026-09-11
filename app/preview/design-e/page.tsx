import Link from 'next/link'
import { Cormorant_Garamond, Inter } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter-e' })

export const metadata = { title: 'עיצוב ה — Dark Bistro — המטבח של קרן' }

const RECIPES = [
  { title: 'שקשוקה ביתית', min: 30, img: '/images/recipes/shakshuka-default.png', tag: 'ארוחת בוקר', desc: 'עגבניות מגורדות, בצל מקורמל, ביצים רכות' },
  { title: 'סלמון בגלייז דבש', min: 25, img: '/images/recipes/salmon-default.png', tag: 'דגים', desc: 'סלמון טרי בזיגוג דבש וסויה' },
  { title: 'כרובית בטחינה לימון', min: 40, img: '/images/recipes/cauliflower-tahini-default.png', tag: 'ירקות', desc: 'כרובית קלויה עם רוטב טחינה קרים' },
  { title: 'עוגת לימון בחושה', min: 60, img: '/images/recipes/lemon-cake-default.png', tag: 'קינוחים', desc: 'עוגה אוורירית עם קליפת לימון טרייה' },
  { title: 'קציצות ברוטב עגבניות', min: 45, img: '/images/recipes/meatballs-default.png', tag: 'בשרים', desc: 'קציצות בקר ברוטב עגבניות מבושל לאט' },
  { title: 'פסטה שמנת פטריות', min: 20, img: '/images/recipes/creamy-pasta-default.png', tag: 'פסטה', desc: 'פסטה טרייה, שמנת ופטריות יער' },
]

const CATEGORIES = ['הכל', 'בשר', 'עוף', 'דגים', 'חלבי', 'פסטה', 'קינוחים']
const GOLD = '#c9a961'
const BG = '#151816'
const CARD = '#1e2320'
const TEXT = '#e8dcc4'
const MUTED = '#8a8477'

export default function DesignEPage() {
  return (
    <div
      className={`${cormorant.variable} ${inter.variable} min-h-screen`}
      style={{
        background: BG,
        color: TEXT,
        fontFamily: 'var(--font-inter-e), system-ui, sans-serif',
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/preview/designs"
          className="text-xs tracking-[0.3em] uppercase transition"
          style={{ color: MUTED }}
        >
          ← designs
        </Link>

        <header className="mt-12 border-b pb-16" style={{ borderColor: '#2a3028' }}>
          <div className="flex items-center gap-4">
            <span className="h-px w-16" style={{ background: GOLD }} />
            <p className="text-xs tracking-[0.4em] uppercase" style={{ color: GOLD }}>
              La Cuisine · Est. 2026
            </p>
          </div>
          <h1
            className="mt-10 text-7xl leading-[1] md:text-8xl"
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontWeight: 300,
              letterSpacing: '-0.02em',
            }}
          >
            המטבח <em style={{ color: GOLD, fontStyle: 'italic', fontWeight: 400 }}>של קרן</em>
          </h1>
          <p
            className="mt-8 max-w-xl text-lg leading-relaxed"
            style={{ color: MUTED, fontFamily: 'var(--font-cormorant), serif', fontSize: '1.25rem' }}
          >
            אוסף פרטי של מתכונים אהובים. כל אחד נבחר בזהירות, כל אחד מסופר עם כל התיבול.
          </p>
        </header>

        <nav className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3">
          {CATEGORIES.map((c, i) => (
            <button
              key={c}
              className="text-sm tracking-widest transition"
              style={{
                color: i === 0 ? GOLD : MUTED,
                fontWeight: i === 0 ? 600 : 400,
              }}
            >
              {c}
            </button>
          ))}
        </nav>

        <div className="mt-6 h-px w-full" style={{ background: '#2a3028' }} />

        <section
          className="mt-16 grid gap-12 md:grid-cols-[1.5fr_1fr]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={RECIPES[0].img}
            alt={RECIPES[0].title}
            className="aspect-[4/3] w-full object-cover"
            style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}
          />
          <div className="flex flex-col justify-center">
            <p className="text-xs tracking-[0.35em] uppercase" style={{ color: GOLD }}>
              Chef's Choice
            </p>
            <h2
              className="mt-5 text-5xl leading-tight"
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontWeight: 400,
              }}
            >
              {RECIPES[0].title}
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="h-px w-8" style={{ background: GOLD }} />
              <p className="text-xs tracking-[0.25em] uppercase" style={{ color: MUTED }}>
                {RECIPES[0].tag} · {RECIPES[0].min}′
              </p>
            </div>
            <p
              className="mt-6 text-lg leading-relaxed"
              style={{ color: TEXT, fontFamily: 'var(--font-cormorant), serif', fontSize: '1.35rem' }}
            >
              {RECIPES[0].desc}. מתכון של סוף שבוע, בלי לחץ, עם כוס יין וקצת שמש.
            </p>
            <button
              className="mt-10 self-start px-8 py-4 text-xs tracking-[0.3em] uppercase transition hover:brightness-110"
              style={{
                background: 'transparent',
                border: `1px solid ${GOLD}`,
                color: GOLD,
                fontWeight: 600,
              }}
            >
              קרא את המתכון →
            </button>
          </div>
        </section>

        <div className="mt-24 flex items-baseline justify-between">
          <div className="flex items-center gap-4">
            <span className="h-px w-16" style={{ background: GOLD }} />
            <h2
              className="text-3xl tracking-widest"
              style={{ fontFamily: 'var(--font-cormorant), serif', fontWeight: 500 }}
            >
              THE MENU
            </h2>
          </div>
          <span className="text-xs tracking-[0.3em] uppercase" style={{ color: MUTED }}>
            {RECIPES.length} plates
          </span>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {RECIPES.slice(1).map((r) => (
            <article
              key={r.title}
              className="group overflow-hidden transition"
              style={{
                background: CARD,
                border: `1px solid #2a3028`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.img}
                alt={r.title}
                className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="p-6">
                <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: GOLD }}>
                  {r.tag}
                </p>
                <h3
                  className="mt-3 text-2xl leading-tight"
                  style={{ fontFamily: 'var(--font-cormorant), serif', fontWeight: 500 }}
                >
                  {r.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>
                  {r.desc}
                </p>
                <div
                  className="mt-4 flex items-center justify-between border-t pt-4 text-xs tracking-widest uppercase"
                  style={{ borderColor: '#2a3028', color: MUTED }}
                >
                  <span>{r.min} min</span>
                  <span style={{ color: GOLD }}>view →</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <footer
          className="mt-20 border-t pt-8 text-center text-xs tracking-[0.4em] uppercase"
          style={{ borderColor: '#2a3028', color: MUTED }}
        >
          מוקאפ תצוגה — עיצוב ה
        </footer>
      </div>
    </div>
  )
}
