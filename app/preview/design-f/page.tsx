import Link from 'next/link'
import { DM_Serif_Display, Nunito } from 'next/font/google'

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
})
const nunito = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '900'], variable: '--font-nunito' })

export const metadata = { title: 'עיצוב ו — Vintage Cookbook — המטבח של קרן' }

const RECIPES = [
  { title: 'שקשוקה ביתית', min: 30, img: '/images/recipes/shakshuka-default.png', tag: 'ארוחת בוקר', num: 47 },
  { title: 'סלמון בגלייז דבש', min: 25, img: '/images/recipes/salmon-default.png', tag: 'דגים', num: 48 },
  { title: 'כרובית בטחינה לימון', min: 40, img: '/images/recipes/cauliflower-tahini-default.png', tag: 'ירקות', num: 49 },
  { title: 'עוגת לימון בחושה', min: 60, img: '/images/recipes/lemon-cake-default.png', tag: 'קינוחים', num: 50 },
  { title: 'קציצות ברוטב עגבניות', min: 45, img: '/images/recipes/meatballs-default.png', tag: 'בשרים', num: 51 },
  { title: 'פסטה שמנת פטריות', min: 20, img: '/images/recipes/creamy-pasta-default.png', tag: 'פסטה', num: 52 },
]

const CATEGORIES = ['הכל', 'בשר', 'עוף', 'דגים', 'חלבי', 'פסטה', 'קינוחים']
const RED = '#a83232'
const OCHRE = '#d89b3a'
const CREAM = '#fdf3e0'
const INK = '#3a2818'
const BORDER = '#c89b56'

export default function DesignFPage() {
  return (
    <div
      className={`${dmSerif.variable} ${nunito.variable} min-h-screen`}
      style={{
        background: CREAM,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${BORDER}22 1px, transparent 0)`,
        backgroundSize: '20px 20px',
        color: INK,
        fontFamily: 'var(--font-nunito), system-ui, sans-serif',
      }}
    >
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/preview/designs"
          className="text-xs font-bold uppercase tracking-widest hover:underline"
          style={{ color: RED }}
        >
          ← designs
        </Link>

        <header
          className="mt-8 rounded-lg border-2 bg-white p-10 text-center shadow-[6px_6px_0_0_rgba(168,50,50,0.15)]"
          style={{ borderColor: RED, background: '#fffdf5' }}
        >
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-16" style={{ background: OCHRE }} />
            <span style={{ color: OCHRE, fontSize: '1.4rem' }}>❦</span>
            <span className="h-px w-16" style={{ background: OCHRE }} />
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.4em]" style={{ color: OCHRE }}>
            Volume I · המהדורה הראשונה
          </p>
          <h1
            className="mt-4 text-6xl leading-tight md:text-7xl"
            style={{
              fontFamily: 'var(--font-dm-serif), serif',
              color: RED,
              letterSpacing: '-0.01em',
            }}
          >
            המטבח <em>של קרן</em>
          </h1>
          <p
            className="mx-auto mt-4 max-w-xl text-base leading-relaxed"
            style={{ color: '#6a4e34' }}
          >
            אוסף מתכונים אישי · מדף בית · טעמים אהובים · סוד המשפחה
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="h-px w-16" style={{ background: OCHRE }} />
            <span style={{ color: OCHRE, fontSize: '1.4rem' }}>✿</span>
            <span className="h-px w-16" style={{ background: OCHRE }} />
          </div>
        </header>

        <nav
          className="mt-8 rounded-lg border-2 bg-white px-4 py-3 shadow-sm"
          style={{ borderColor: OCHRE }}
        >
          <div className="flex flex-wrap items-center gap-1">
            <span
              className="ml-2 text-xs font-bold uppercase tracking-widest"
              style={{ color: OCHRE }}
            >
              קטגוריות:
            </span>
            {CATEGORIES.map((c, i) => (
              <button
                key={c}
                className="rounded-full px-4 py-1.5 text-sm font-bold transition"
                style={
                  i === 0
                    ? { background: RED, color: CREAM }
                    : { background: 'transparent', color: '#6a4e34', border: `1.5px solid ${OCHRE}66` }
                }
              >
                {c}
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: OCHRE }}>
              המתכונים
            </p>
            <h2
              className="mt-1 text-4xl"
              style={{ fontFamily: 'var(--font-dm-serif), serif', color: RED }}
            >
              <em>Chapter Two — Recent</em>
            </h2>
          </div>
          <span
            className="rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ borderColor: OCHRE, color: OCHRE, background: 'white' }}
          >
            {RECIPES.length} מתכונים
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RECIPES.map((r) => (
            <article
              key={r.title}
              className="group overflow-hidden rounded-lg border-2 bg-white shadow-[4px_4px_0_0_rgba(168,50,50,0.12)] transition hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(168,50,50,0.2)]"
              style={{ borderColor: OCHRE }}
            >
              <div className="relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.img}
                  alt={r.title}
                  className="aspect-[4/3] w-full object-cover"
                  style={{ filter: 'saturate(1.05) contrast(1.05)' }}
                />
                <span
                  className="absolute right-3 top-3 rounded-full border-2 bg-white px-2.5 py-0.5 text-xs font-black shadow-sm"
                  style={{ borderColor: RED, color: RED }}
                >
                  #{r.num}
                </span>
              </div>
              <div className="p-5 text-center">
                <p
                  className="text-xs font-bold uppercase tracking-[0.25em]"
                  style={{ color: OCHRE }}
                >
                  {r.tag} · {r.min}′
                </p>
                <h3
                  className="mt-2 text-2xl leading-snug"
                  style={{ fontFamily: 'var(--font-dm-serif), serif', color: RED }}
                >
                  {r.title}
                </h3>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="h-px w-8" style={{ background: OCHRE }} />
                  <span style={{ color: OCHRE, fontSize: '0.85rem' }}>✿</span>
                  <span className="h-px w-8" style={{ background: OCHRE }} />
                </div>
              </div>
            </article>
          ))}
        </div>

        <footer
          className="mt-16 rounded-lg border-2 bg-white py-6 text-center text-xs font-bold uppercase tracking-[0.4em] shadow-sm"
          style={{ borderColor: OCHRE, color: OCHRE }}
        >
          ✦ מוקאפ תצוגה — עיצוב ו ✦
        </footer>
      </div>
    </div>
  )
}
