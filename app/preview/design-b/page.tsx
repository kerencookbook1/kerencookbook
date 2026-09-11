import Link from 'next/link'
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-playfair',
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = { title: 'עיצוב ב — Editorial Minimal — המטבח של קרן' }

const RECIPES = [
  { title: 'שקשוקה ביתית', min: 30, img: '/images/recipes/shakshuka-default.png', tag: 'ארוחת בוקר' },
  { title: 'סלמון בגלייז דבש', min: 25, img: '/images/recipes/salmon-default.png', tag: 'דגים' },
  { title: 'כרובית בטחינה לימון', min: 40, img: '/images/recipes/cauliflower-tahini-default.png', tag: 'ירקות' },
  { title: 'עוגת לימון בחושה', min: 60, img: '/images/recipes/lemon-cake-default.png', tag: 'קינוחים' },
  { title: 'קציצות ברוטב עגבניות', min: 45, img: '/images/recipes/meatballs-default.png', tag: 'בשרים' },
  { title: 'פסטה שמנת פטריות', min: 20, img: '/images/recipes/creamy-pasta-default.png', tag: 'פסטה' },
]

const CATEGORIES = ['הכל', 'בשר', 'עוף', 'דגים', 'חלבי', 'פסטה', 'קינוחים']
const ACCENT = '#3d5a2c'
const BORDER = '#ececec'

export default function DesignBPage() {
  return (
    <div
      className={`${playfair.variable} ${inter.variable} min-h-screen bg-white`}
      style={{
        color: '#0a0a0a',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}
    >
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/preview/designs"
          className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100"
          style={{ color: ACCENT }}
        >
          ← Back to designs
        </Link>

        <header className="mt-12 border-b pb-10" style={{ borderColor: BORDER }}>
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
            The Keren Kitchen · No. 47
          </p>
          <h1
            className="mt-6 text-6xl leading-[1.05] md:text-7xl"
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            מטבח, לאט,
            <br />
            <em style={{ fontWeight: 400 }}>בשלווה.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-80">
            אוסף של מתכונים בכתב יד, בצילום ובקישור. נשמר, נבנה, מבושל.
          </p>
        </header>

        <nav className="mt-10 flex flex-wrap gap-6 border-b pb-4 text-sm" style={{ borderColor: BORDER }}>
          {CATEGORIES.map((c, i) => (
            <button
              key={c}
              className="pb-2 font-medium tracking-wide transition"
              style={
                i === 0
                  ? { color: '#0a0a0a', borderBottom: `2px solid ${ACCENT}`, marginBottom: -1 }
                  : { color: '#606060' }
              }
            >
              {c}
            </button>
          ))}
        </nav>

        <section className="mt-16 grid gap-6 md:grid-cols-[1.6fr_1fr]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={RECIPES[0].img}
            alt={RECIPES[0].title}
            className="h-96 w-full object-cover"
          />
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
              Feature · {RECIPES[0].tag}
            </p>
            <h2
              className="mt-4 text-4xl leading-tight"
              style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 700 }}
            >
              {RECIPES[0].title}
            </h2>
            <p className="mt-4 text-base leading-relaxed opacity-75">
              מתכון בסיסי לארוחת בוקר עם עגבניות מגורדות, בצל, פפריקה מעושנת וביצים
              רכות. 30 דקות מהמקרר לצלחת.
            </p>
            <button
              className="mt-8 self-start border-b pb-1 text-sm font-semibold uppercase tracking-widest"
              style={{ borderColor: ACCENT, color: ACCENT }}
            >
              קרא את המתכון →
            </button>
          </div>
        </section>

        <div className="mt-24 flex items-baseline justify-between border-b pb-4" style={{ borderColor: BORDER }}>
          <h2
            className="text-3xl"
            style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 700 }}
          >
            Latest additions
          </h2>
          <span className="text-xs uppercase tracking-widest opacity-60">
            {RECIPES.length} recipes
          </span>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {RECIPES.slice(1).map((r) => (
            <article key={r.title} className="group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.img}
                alt={r.title}
                className="aspect-square w-full object-cover transition group-hover:opacity-90"
              />
              <p className="mt-4 text-xs uppercase tracking-[0.25em]" style={{ color: ACCENT }}>
                {r.tag}
              </p>
              <h3
                className="mt-2 text-2xl leading-tight"
                style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 700 }}
              >
                {r.title}
              </h3>
              <p className="mt-2 text-sm opacity-60">{r.min} minutes · serves 4</p>
            </article>
          ))}
        </div>

        <footer className="mt-24 border-t pt-8 text-center text-xs uppercase tracking-widest opacity-50" style={{ borderColor: BORDER }}>
          זה מוקאפ תצוגה — עיצוב ב
        </footer>
      </div>
    </div>
  )
}
