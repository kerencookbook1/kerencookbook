import Link from 'next/link'

export const metadata = { title: 'עיצוב ג — Modern Fresh — המטבח של קרן' }

const RECIPES = [
  { title: 'שקשוקה ביתית', min: 30, img: '/images/recipes/shakshuka-default.png', tag: 'ארוחת בוקר', diet: true },
  { title: 'סלמון בגלייז דבש', min: 25, img: '/images/recipes/salmon-default.png', tag: 'דגים', diet: true },
  { title: 'כרובית בטחינה לימון', min: 40, img: '/images/recipes/cauliflower-tahini-default.png', tag: 'ירקות', diet: true },
  { title: 'עוגת לימון בחושה', min: 60, img: '/images/recipes/lemon-cake-default.png', tag: 'קינוחים', diet: false },
  { title: 'קציצות ברוטב עגבניות', min: 45, img: '/images/recipes/meatballs-default.png', tag: 'בשרים', diet: false },
  { title: 'פסטה שמנת פטריות', min: 20, img: '/images/recipes/creamy-pasta-default.png', tag: 'פסטה', diet: false },
]

const CATEGORIES = ['הכל', 'בשר', 'עוף', 'דגים', 'חלבי', 'פסטה', 'קינוחים']
const ACCENT = '#65a30d' // lime-600
const ACCENT_SOFT = '#ecfccb' // lime-100

export default function DesignCPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: '#fafaf9',
        color: '#171717',
        fontFamily: 'var(--font-sans), system-ui, sans-serif',
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/preview/designs"
          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900"
        >
          ← חזרה לבחירת עיצוב
        </Link>

        <header className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              המטבח של קרן
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
              ברוכה השבה, קרן 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50">
              ⌘K חיפוש
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              style={{ background: ACCENT }}
            >
              <span className="text-base leading-none">+</span>
              <span>מתכון חדש</span>
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            { label: 'סה"כ מתכונים', value: '47' },
            { label: 'ייבואים החודש', value: '12' },
            { label: 'דיאטטיים', value: '18' },
            { label: 'מועדפים', value: '9' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                {s.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1 rounded-lg border border-neutral-200 bg-white p-1 shadow-sm">
            {CATEGORIES.map((c, i) => (
              <button
                key={c}
                className="rounded-md px-3 py-1.5 text-sm font-medium transition"
                style={
                  i === 0
                    ? { background: '#171717', color: '#fff' }
                    : { color: '#525252' }
                }
              >
                {c}
              </button>
            ))}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium shadow-sm">
            <span
              className="inline-flex h-5 w-9 items-center rounded-full p-0.5 transition"
              style={{ background: ACCENT }}
            >
              <span className="h-4 w-4 rounded-full bg-white shadow" style={{ marginRight: 'auto' }} />
            </span>
            דיאטטי בלבד
          </label>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RECIPES.map((r) => (
            <article
              key={r.title}
              className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.img}
                  alt={r.title}
                  className="aspect-[4/3] w-full object-cover"
                />
                {r.diet && (
                  <span
                    className="absolute right-3 top-3 rounded-full px-2 py-1 text-xs font-semibold shadow-sm"
                    style={{ background: ACCENT_SOFT, color: ACCENT }}
                  >
                    ✓ דיאטטי
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-semibold"
                    style={{ background: '#f5f5f4', color: '#525252' }}
                  >
                    {r.tag}
                  </span>
                  <span className="text-xs text-neutral-500">{r.min} דק׳</span>
                </div>
                <h3 className="mt-2 text-base font-semibold leading-snug">
                  {r.title}
                </h3>
                <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
                  <button className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-900">
                    צפייה →
                  </button>
                  <div className="flex items-center gap-1">
                    <button className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900">
                      ☆
                    </button>
                    <button className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900">
                      ⋯
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <footer className="mt-16 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-400">
          זה מוקאפ תצוגה — עיצוב ג
        </footer>
      </div>
    </div>
  )
}
