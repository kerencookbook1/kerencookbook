import Link from 'next/link'

export const metadata = { title: 'Cinematic · המטבח של קרן' }

const RECIPES = [
  { id: 'r1', title: 'שקשוקה של בית סבתא', cat: 'ARABIC / EGGS', minutes: 25, chef: 'קרן ל.', img: '/images/recipes/shakshuka-default.png' },
  { id: 'r2', title: 'פסטה בעגבניות שרופות', cat: 'ITALIAN / PASTA', minutes: 30, chef: 'קרן ל.', img: '/images/recipes/tomato-pasta-default.png' },
  { id: 'r3', title: 'סלמון בעשבי תיבול', cat: 'SEAFOOD',       minutes: 22, chef: 'קרן ל.', img: '/images/recipes/salmon-default.png' },
  { id: 'r4', title: 'עוגת לימון בחושה',  cat: 'DESSERT',       minutes: 55, chef: 'קרן ל.', img: '/images/recipes/lemon-cake-default.png' },
  { id: 'r5', title: 'מרק דלעת קטיפתי',   cat: 'AUTUMN / SOUP', minutes: 40, chef: 'קרן ל.', img: '/images/recipes/pumpkin-soup-default.png' },
  { id: 'r6', title: 'כדורי בשר של אמא',  cat: 'HOME / BEEF',   minutes: 50, chef: 'קרן ל.', img: '/images/recipes/meatballs-default.png' },
]

export default function CinematicDesign() {
  return (
    <div style={{ background: '#0A0A0A', color: '#FAFAF9', minHeight: '100vh', fontFamily: '"Inter", "Heebo", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
        .cn-title  { font-family: 'Instrument Serif', 'Playfair Display', serif; letter-spacing: -.015em; font-weight: 400; }
        .cn-italic { font-family: 'Instrument Serif', serif; font-style: italic; }
        .cn-mono   { font-family: 'Geist Mono', ui-monospace, monospace; letter-spacing: .04em; }
        .cn-eyebrow { font-family: 'Geist Mono', monospace; font-size: 10px; letter-spacing: .25em; text-transform: uppercase; color: #F59E0B; }
        .cn-card { transition: transform .55s cubic-bezier(.16,.84,.24,1); overflow: hidden; }
        .cn-card:hover { transform: translateY(-6px); }
        .cn-img-zoom img { transition: transform 1.4s cubic-bezier(.16,.84,.24,1), filter .7s ease; will-change: transform; }
        .cn-card:hover .cn-img-zoom img { transform: scale(1.08); filter: brightness(1.1) contrast(1.05); }
        .cn-card .cn-reveal { opacity: 0; transform: translateY(12px); transition: opacity .5s .1s ease, transform .5s .1s cubic-bezier(.16,.84,.24,1); }
        .cn-card:hover .cn-reveal { opacity: 1; transform: none; }
        @keyframes cnKenBurns { 0% { transform: scale(1) translateX(0); } 100% { transform: scale(1.12) translateX(-2%); } }
        .cn-hero-img { animation: cnKenBurns 22s ease-in-out infinite alternate; }
        @keyframes cnFadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
        .cn-fade { animation: cnFadeUp 1.1s cubic-bezier(.16,.84,.24,1) both; }
        .cn-fade-1 { animation-delay: .2s; } .cn-fade-2 { animation-delay: .5s; } .cn-fade-3 { animation-delay: .8s; }
        .cn-grain::before { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .05; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
      `}</style>

      {/* ═══════════ TOP BAR ═══════════ */}
      <header className="fixed top-0 inset-x-0 z-30" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,.85) 0%, rgba(10,10,10,0) 100%)' }}>
        <div className="mx-auto max-w-[1440px] px-8 py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-8">
            <div className="cn-title text-xl">
              המטבח <span className="cn-italic" style={{ color: '#F59E0B' }}>של קרן</span>
            </div>
            <nav className="hidden md:flex gap-6 cn-mono text-xs uppercase" style={{ color: '#A3A3A3' }}>
              <Link href="/preview/design-cinematic" style={{ color: '#FAFAF9' }}>Home</Link>
              <Link href="/preview/design-cinematic">Series</Link>
              <Link href="/preview/design-cinematic">Chefs</Link>
              <Link href="/preview/design-cinematic">Collections</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="cn-mono text-xs uppercase px-4 py-2" style={{ color: '#A3A3A3' }}>Search</button>
            <button className="cn-mono text-xs uppercase px-5 py-2.5 border" style={{ borderColor: '#F59E0B', color: '#F59E0B' }}>+ Add Recipe</button>
          </div>
        </div>
      </header>

      {/* ═══════════ HERO — cinematic cover ═══════════ */}
      <section className="relative overflow-hidden cn-grain" style={{ height: '100vh', minHeight: 700 }}>
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/recipes/salmon-default.png" alt="" className="cn-hero-img w-full h-full object-cover" style={{ filter: 'brightness(.65) contrast(1.15) saturate(1.1)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,.4) 0%, rgba(10,10,10,.1) 45%, rgba(10,10,10,.9) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 60%, transparent 0%, rgba(10,10,10,.6) 80%)' }} />
        </div>

        <div className="relative h-full mx-auto max-w-[1440px] px-8 flex flex-col justify-end pb-24">
          <div className="cn-fade cn-fade-1 flex items-center gap-4 mb-8">
            <span className="cn-eyebrow">S03 · Episode 12</span>
            <span className="w-8 h-px bg-amber-500" />
            <span className="cn-mono text-xs" style={{ color: '#A3A3A3' }}>NOW COOKING</span>
          </div>

          <h1 className="cn-fade cn-fade-2 cn-title max-w-4xl leading-[.9]" style={{ fontSize: 'clamp(64px, 10vw, 156px)' }}>
            סלמון,<br />
            <span className="cn-italic" style={{ color: '#F59E0B' }}>עשן ומלח.</span>
          </h1>

          <p className="cn-fade cn-fade-3 mt-8 max-w-xl text-lg" style={{ color: '#D4D4D4', lineHeight: 1.55 }}>
            עשרים ושתיים דקות. חמאה שהופכת לזהב. לימון שנשרף על גבי הדג.
            סרט קצר על מנה שנראית מסובכת ואינה.
          </p>

          <div className="cn-fade cn-fade-3 mt-10 flex items-center gap-6">
            <button className="cn-mono text-xs uppercase px-8 py-4 flex items-center gap-3" style={{ background: '#F59E0B', color: '#0A0A0A' }}>
              <span>▶</span> Play Recipe
            </button>
            <button className="cn-mono text-xs uppercase px-8 py-4 border" style={{ borderColor: '#FAFAF9', color: '#FAFAF9' }}>
              + My List
            </button>
            <div className="cn-mono text-xs" style={{ color: '#A3A3A3' }}>
              22 MIN · SERVES 2 · <span style={{ color: '#F59E0B' }}>★★★★☆</span>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 right-8 cn-mono text-[10px] uppercase" style={{ color: '#737373' }}>Scroll to continue ↓</div>
      </section>

      {/* ═══════════ CAROUSEL — Netflix rail ═══════════ */}
      <section className="py-20">
        <div className="mx-auto max-w-[1440px] px-8 mb-8 flex items-baseline justify-between">
          <div>
            <div className="cn-eyebrow mb-3">Continue Cooking</div>
            <h2 className="cn-title text-5xl">המתכונים <span className="cn-italic" style={{ color: '#F59E0B' }}>שלך.</span></h2>
          </div>
          <div className="cn-mono text-xs uppercase" style={{ color: '#A3A3A3' }}>
            <button style={{ color: '#FAFAF9' }}>← Prev</button> · <button style={{ color: '#FAFAF9' }}>Next →</button>
          </div>
        </div>

        <div className="overflow-x-auto pb-6" style={{ scrollbarWidth: 'thin' }}>
          <div className="flex gap-5 px-8 mx-auto" style={{ maxWidth: 'fit-content' }}>
            {RECIPES.map((r) => (
              <Link key={r.id} href="/preview/design-cinematic" className="cn-card block relative flex-shrink-0" style={{ width: 340 }}>
                <div className="cn-img-zoom relative overflow-hidden" style={{ aspectRatio: '3/4', background: '#171717' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.img} alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(.85) contrast(1.1)' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0) 40%, rgba(10,10,10,.95) 100%)' }} />
                </div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="cn-eyebrow mb-2">{r.cat}</div>
                  <h3 className="cn-title text-2xl leading-[.95] mb-3">{r.title}</h3>
                  <div className="cn-mono text-[11px] flex justify-between" style={{ color: '#A3A3A3' }}>
                    <span>{r.minutes} MIN</span>
                    <span>by {r.chef}</span>
                  </div>
                  <div className="cn-reveal mt-4 pt-4 border-t border-white/10">
                    <div className="cn-mono text-[10px] uppercase mb-2" style={{ color: '#F59E0B' }}>Watch Trailer</div>
                    <div className="flex gap-2">
                      <button className="cn-mono text-[10px] uppercase px-3 py-2" style={{ background: '#F59E0B', color: '#0A0A0A' }}>▶ Play</button>
                      <button className="cn-mono text-[10px] uppercase px-3 py-2 border border-white/40">+</button>
                      <button className="cn-mono text-[10px] uppercase px-3 py-2 border border-white/40">♡</button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED CHAPTERS ═══════════ */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-[1440px] px-8">
          <div className="cn-eyebrow mb-3">This Week&apos;s Chapters</div>
          <h2 className="cn-title text-5xl mb-12">שישה מתכונים, <span className="cn-italic" style={{ color: '#F59E0B' }}>שלוש עונות.</span></h2>

          <div className="grid grid-cols-12 gap-6">
            {/* Big feature */}
            <Link href="/preview/design-cinematic" className="cn-card col-span-12 lg:col-span-8 relative block" style={{ aspectRatio: '16/9' }}>
              <div className="cn-img-zoom relative w-full h-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={RECIPES[1].img} alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(.75)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(10,10,10,.9) 0%, rgba(10,10,10,.1) 60%)' }} />
              </div>
              <div className="absolute inset-0 p-10 flex flex-col justify-center max-w-lg">
                <div className="cn-eyebrow mb-4">Chapter One · Autumn</div>
                <h3 className="cn-title text-5xl leading-[.95] mb-4">{RECIPES[1].title}</h3>
                <p className="text-base mb-6" style={{ color: '#D4D4D4' }}>העגבניות משתנות כשהן נשרפות. הרוטב נהיה עמוק, כמעט מר, לרגע — ואז השמן זית מציל.</p>
                <div className="cn-mono text-xs" style={{ color: '#F59E0B' }}>▶ 30 MIN · EASY</div>
              </div>
            </Link>

            {/* Two stacked cards */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              {[RECIPES[3], RECIPES[5]].map((r) => (
                <Link key={r.id} href="/preview/design-cinematic" className="cn-card relative block flex-1" style={{ aspectRatio: '16/9' }}>
                  <div className="cn-img-zoom relative w-full h-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.img} alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(.7)' }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0) 45%, rgba(10,10,10,.9) 100%)' }} />
                  </div>
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="cn-eyebrow mb-1.5">{r.cat}</div>
                    <h3 className="cn-title text-2xl leading-[.95]">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SINGLE RECIPE PREVIEW — cinematic ═══════════ */}
      <section className="relative border-t border-white/5">
        {/* Backdrop */}
        <div className="relative overflow-hidden" style={{ height: 480 }}>
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/recipes/tomato-pasta-default.png" alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(.55) blur(0px)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,.3) 0%, rgba(10,10,10,.95) 100%)' }} />
          </div>
          <div className="relative h-full mx-auto max-w-[1440px] px-8 flex flex-col justify-end pb-16">
            <div className="cn-eyebrow mb-3">Now Playing · Recipe Detail</div>
            <h2 className="cn-title text-7xl md:text-8xl leading-[.9]">
              פסטה<br /><span className="cn-italic" style={{ color: '#F59E0B' }}>בעגבניות שרופות.</span>
            </h2>
          </div>
        </div>

        {/* Detail body */}
        <div className="mx-auto max-w-[1440px] px-8 py-20 grid grid-cols-12 gap-12">
          {/* Metadata bar */}
          <div className="col-span-12 flex flex-wrap gap-x-10 gap-y-4 items-center pb-8 border-b border-white/10">
            <div><div className="cn-mono text-[10px] uppercase" style={{ color: '#737373' }}>Duration</div><div className="cn-title text-2xl mt-1">30 <span className="cn-mono text-sm" style={{ color: '#A3A3A3' }}>MIN</span></div></div>
            <div><div className="cn-mono text-[10px] uppercase" style={{ color: '#737373' }}>Serves</div><div className="cn-title text-2xl mt-1">4</div></div>
            <div><div className="cn-mono text-[10px] uppercase" style={{ color: '#737373' }}>Level</div><div className="cn-title text-2xl mt-1 cn-italic" style={{ color: '#F59E0B' }}>Easy</div></div>
            <div><div className="cn-mono text-[10px] uppercase" style={{ color: '#737373' }}>Chef</div><div className="cn-title text-2xl mt-1">קרן</div></div>
            <div className="ml-auto flex gap-3">
              <button className="cn-mono text-xs uppercase px-6 py-3" style={{ background: '#F59E0B', color: '#0A0A0A' }}>▶ Cook Mode</button>
              <button className="cn-mono text-xs uppercase px-6 py-3 border border-white/40">+ Shopping List</button>
            </div>
          </div>

          {/* Left — ingredients */}
          <div className="col-span-12 lg:col-span-5">
            <div className="cn-eyebrow mb-6">01 · Ingredients</div>
            <div className="space-y-1">
              {[
                ['400', 'g',  'פסטה יבשה'],
                ['1',   'kg', 'עגבניות שרי'],
                ['4',   '',   'שיני שום'],
                ['½',   'cup', 'שמן זית'],
                ['1',   '',    'חופן בזיליקום'],
                ['—',   '',    'מלח ופלפל שחור'],
              ].map(([q, u, name]) => (
                <div key={name} className="flex items-baseline gap-4 py-4 border-b border-white/10">
                  <span className="cn-title text-3xl" style={{ color: '#F59E0B', minWidth: 60 }}>{q}</span>
                  <span className="cn-mono text-xs uppercase" style={{ color: '#737373', minWidth: 40 }}>{u}</span>
                  <span className="text-base flex-1" style={{ color: '#FAFAF9' }}>{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — steps as film reel */}
          <div className="col-span-12 lg:col-span-7">
            <div className="cn-eyebrow mb-6">02 · Method</div>
            <div className="space-y-6">
              {[
                { t: 'HIGH HEAT · 4 MIN', s: 'חממו מחבת ברזל כבדה על אש גבוהה. הוסיפו את העגבניות יבשות — בלי שמן. תנו להן להישחר על כל הצדדים.' },
                { t: 'AROMA · 2 MIN',      s: 'רק כשהן שרופות, הוסיפו את שמן הזית והשום הפרוס. הריחות הם הסימן שהגעתם.' },
                { t: 'BOIL · 9 MIN',       s: 'הרתיחו סיר מים עם מלח, בשלו את הפסטה עד al dente. שמרו כוס ממי הבישול.' },
                { t: 'PLATING · 2 MIN',    s: 'ערבבו את הפסטה עם הרוטב במחבת. הוסיפו מהמים לפי הצורך. סיימו בבזיליקום.' },
              ].map((step, i) => (
                <div key={i} className="grid grid-cols-12 gap-5 p-6" style={{ background: '#171717', border: '1px solid rgba(255,255,255,.06)' }}>
                  <div className="col-span-2 flex flex-col">
                    <span className="cn-title text-6xl leading-none" style={{ color: '#F59E0B' }}>0{i+1}</span>
                    <span className="cn-mono text-[10px] mt-3 uppercase" style={{ color: '#737373' }}>{step.t}</span>
                  </div>
                  <p className="col-span-10 text-lg pt-1" style={{ color: '#FAFAF9', lineHeight: 1.55 }}>{step.s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto max-w-[1440px] px-8 flex justify-between items-center">
          <div className="cn-title text-lg">המטבח <span className="cn-italic" style={{ color: '#F59E0B' }}>של קרן</span></div>
          <div className="cn-mono text-[10px] uppercase" style={{ color: '#737373' }}>Preview · Design 03 of 04 · Cinematic</div>
        </div>
      </footer>
    </div>
  )
}
