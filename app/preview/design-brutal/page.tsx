import Link from 'next/link'

export const metadata = { title: 'Brutal · המטבח של קרן' }

const RECIPES = [
  { id: 'r1', num: '001', title: 'שקשוקה חריפה',       cat: 'BREAKFAST', minutes: 25, ing: 8,  bg: '#EAB308', text: '#0A0A0A', img: '/images/recipes/shakshuka-default.png' },
  { id: 'r2', num: '002', title: 'פסטה בעגבניות',      cat: 'MAINS',     minutes: 30, ing: 6,  bg: '#EC4899', text: '#FFFDF7', img: '/images/recipes/tomato-pasta-default.png' },
  { id: 'r3', num: '003', title: 'סלמון בעשבי תיבול',  cat: 'SEAFOOD',   minutes: 22, ing: 5,  bg: '#84CC16', text: '#0A0A0A', img: '/images/recipes/salmon-default.png' },
  { id: 'r4', num: '004', title: 'עוגת לימון בחושה',   cat: 'DESSERT',   minutes: 55, ing: 9,  bg: '#F97316', text: '#0A0A0A', img: '/images/recipes/lemon-cake-default.png' },
  { id: 'r5', num: '005', title: 'מרק דלעת קטיפתי',    cat: 'SOUP',      minutes: 40, ing: 7,  bg: '#E11D48', text: '#FFFDF7', img: '/images/recipes/pumpkin-soup-default.png' },
  { id: 'r6', num: '006', title: 'כדורי בשר של אמא',   cat: 'BEEF',      minutes: 50, ing: 10, bg: '#7C3AED', text: '#FFFDF7', img: '/images/recipes/meatballs-default.png' },
]

export default function BrutalDesign() {
  return (
    <div style={{ background: '#FFFDF7', color: '#0A0A0A', minHeight: '100vh', fontFamily: '"Space Grotesk", "Heebo", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .br-display { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -.03em; }
        .br-mono    { font-family: 'JetBrains Mono', ui-monospace, monospace; letter-spacing: .01em; }
        .br-btn { transition: transform .1s ease, box-shadow .1s ease; box-shadow: 4px 4px 0 0 #0A0A0A; border: 2px solid #0A0A0A; }
        .br-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 0 #0A0A0A; }
        .br-btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 0 #0A0A0A; }
        .br-card { transition: transform .12s ease, box-shadow .12s ease; box-shadow: 6px 6px 0 0 #0A0A0A; border: 2.5px solid #0A0A0A; background: #FFFDF7; }
        .br-card:hover { transform: translate(-3px, -3px); box-shadow: 9px 9px 0 0 #0A0A0A; }
        .br-chip { border: 2px solid #0A0A0A; box-shadow: 3px 3px 0 0 #0A0A0A; }
        .br-marquee { animation: brMarquee 25s linear infinite; }
        @keyframes brMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>

      {/* ═══════════ MARQUEE TOP ═══════════ */}
      <div style={{ background: '#0A0A0A', color: '#EAB308', borderBottom: '2.5px solid #0A0A0A', overflow: 'hidden' }}>
        <div className="br-marquee br-mono text-sm py-2.5 whitespace-nowrap flex" style={{ width: 'max-content' }}>
          {Array(2).fill(0).map((_, i) => (
            <span key={i} className="inline-flex">
              {['🍅 247 RECIPES', '⚡ NOW COOKING · SHAKSHUKA', '⏱ 25 MIN', '🔥 COOK STREAK · 5 DAYS', '★ NEW · TOMATO PASTA', '🛒 8 ITEMS ON LIST', '👥 3 FAMILY MEMBERS'].map((t, j) => (
                <span key={j} className="px-8">{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════ TOP NAV ═══════════ */}
      <header style={{ borderBottom: '2.5px solid #0A0A0A' }}>
        <div className="mx-auto max-w-[1320px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center text-2xl br-chip" style={{ background: '#EAB308' }}>🍳</div>
            <div>
              <div className="br-display text-2xl leading-none">KEREN/COOKBOOK</div>
              <div className="br-mono text-[10px] uppercase mt-1" style={{ color: '#525252' }}>v3.0 · Brutal Edition</div>
            </div>
          </div>
          <nav className="flex gap-2 br-mono text-xs uppercase font-bold">
            {[
              { l: 'HOME', a: true },
              { l: 'RECIPES', a: false },
              { l: 'LISTS',   a: false },
              { l: 'PLAN',    a: false },
            ].map(n => (
              <Link key={n.l} href="/preview/design-brutal" className="px-4 py-2.5 br-chip"
                style={n.a ? { background: '#0A0A0A', color: '#EAB308' } : { background: '#FFFDF7', color: '#0A0A0A' }}>
                {n.l}
              </Link>
            ))}
          </nav>
          <button className="br-btn br-mono text-xs uppercase font-bold px-5 py-3" style={{ background: '#EC4899', color: '#FFFDF7' }}>
            [+] NEW RECIPE
          </button>
        </div>
      </header>

      {/* ═══════════ HERO — massive block ═══════════ */}
      <section style={{ background: '#EAB308', borderBottom: '2.5px solid #0A0A0A' }}>
        <div className="mx-auto max-w-[1320px] px-6 py-16 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 lg:col-span-7">
            <div className="br-mono text-xs font-bold mb-6 inline-block br-chip px-3 py-1.5" style={{ background: '#0A0A0A', color: '#EAB308' }}>
              &gt; NOW SERVING · TUESDAY 17:24
            </div>
            <h1 className="br-display leading-[.85]" style={{ fontSize: 'clamp(72px, 11vw, 168px)' }}>
              מה<br />
              <span style={{ background: '#0A0A0A', color: '#EAB308', padding: '0 .1em', display: 'inline-block' }}>אוכלים,</span><br />
              קרן?
            </h1>
            <p className="br-mono text-base mt-8 max-w-md font-medium" style={{ color: '#0A0A0A' }}>
              {'// 247 RECIPES · 32 FAVORITES · 3 DRAFTS'}<br />
              {'// 8 INGREDIENTS ON SHOPPING LIST'}<br />
              {'// NEXT UP: TOMATO PASTA (30 MIN)'}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button className="br-btn br-mono text-sm uppercase font-bold px-7 py-4" style={{ background: '#0A0A0A', color: '#FFFDF7' }}>
                ▶ START COOKING
              </button>
              <button className="br-btn br-mono text-sm uppercase font-bold px-7 py-4" style={{ background: '#FFFDF7', color: '#0A0A0A' }}>
                🎲 SURPRISE ME
              </button>
              <button className="br-btn br-mono text-sm uppercase font-bold px-7 py-4" style={{ background: '#EC4899', color: '#FFFDF7' }}>
                📷 SCAN NEW
              </button>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 relative">
            <div className="br-card p-0 relative" style={{ background: '#FFFDF7', aspectRatio: '4/5', overflow: 'hidden', boxShadow: '10px 10px 0 0 #0A0A0A' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/recipes/shakshuka-default.png" alt="" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 br-mono text-xs font-bold br-chip px-3 py-1.5" style={{ background: '#EC4899', color: '#FFFDF7' }}>
                FEATURED
              </div>
              <div className="absolute bottom-0 inset-x-0 p-5" style={{ background: '#0A0A0A', color: '#FFFDF7', borderTop: '2.5px solid #0A0A0A' }}>
                <div className="br-mono text-[10px] mb-1" style={{ color: '#EAB308' }}>#001 · BREAKFAST</div>
                <div className="br-display text-2xl leading-tight">שקשוקה חריפה</div>
                <div className="br-mono text-xs mt-2 flex gap-3" style={{ color: '#A3A3A3' }}>
                  <span>⏱ 25 MIN</span>
                  <span>·</span>
                  <span>ING · 8</span>
                  <span>·</span>
                  <span>EASY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ROW ═══════════ */}
      <section style={{ borderBottom: '2.5px solid #0A0A0A' }}>
        <div className="mx-auto max-w-[1320px] grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-x-reverse" style={{ borderColor: '#0A0A0A' }}>
          {[
            { n: '247', l: 'RECIPES',   bg: '#84CC16' },
            { n: '032', l: 'FAVORITES', bg: '#EC4899', tc: '#FFFDF7' },
            { n: '008', l: 'ON LIST',   bg: '#EAB308' },
            { n: '005', l: 'STREAK',    bg: '#F97316' },
          ].map(s => (
            <div key={s.l} className="p-8" style={{ background: s.bg, color: s.tc || '#0A0A0A', borderRight: '2.5px solid #0A0A0A' }}>
              <div className="br-display" style={{ fontSize: 'clamp(56px, 7vw, 92px)', lineHeight: .9 }}>{s.n}</div>
              <div className="br-mono text-xs font-bold uppercase mt-2">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FILTERS ═══════════ */}
      <section style={{ borderBottom: '2.5px solid #0A0A0A', background: '#FFFDF7' }}>
        <div className="mx-auto max-w-[1320px] px-6 py-6 flex items-center gap-3 flex-wrap">
          <span className="br-mono text-xs uppercase font-bold ml-2" style={{ color: '#525252' }}>&gt; FILTER:</span>
          {[
            { l: 'ALL',        a: true,  bg: '#0A0A0A', tc: '#EAB308' },
            { l: 'FAST',       a: false, bg: '#EAB308' },
            { l: 'VEGETARIAN', a: false, bg: '#84CC16' },
            { l: 'SWEETS',     a: false, bg: '#EC4899', tc: '#FFFDF7' },
            { l: 'PROTEIN',    a: false, bg: '#E11D48', tc: '#FFFDF7' },
            { l: 'SOUPS',      a: false, bg: '#F97316' },
          ].map(f => (
            <button key={f.l} className="br-chip br-mono text-xs uppercase font-bold px-4 py-2"
              style={{ background: f.a ? f.bg : '#FFFDF7', color: f.a ? (f.tc || '#0A0A0A') : '#0A0A0A' }}>
              {f.l}
            </button>
          ))}
          <div className="ml-auto br-mono text-xs" style={{ color: '#525252' }}>SHOWING 06 / 247</div>
        </div>
      </section>

      {/* ═══════════ RECIPE GRID ═══════════ */}
      <section className="mx-auto max-w-[1320px] px-6 py-16">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="br-display text-6xl">RECIPES<span style={{ color: '#EC4899' }}>.</span></h2>
          <div className="br-mono text-xs uppercase" style={{ color: '#525252' }}>[SORT: RECENT ↓]</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RECIPES.map(r => (
            <Link key={r.id} href="/preview/design-brutal" className="br-card block">
              <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', borderBottom: '2.5px solid #0A0A0A' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.img} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 br-mono text-xs font-bold br-chip px-3 py-1.5"
                  style={{ background: r.bg, color: r.text }}>
                  #{r.num} · {r.cat}
                </div>
                <button className="absolute top-3 left-3 br-chip w-10 h-10 flex items-center justify-center text-lg" style={{ background: '#FFFDF7', color: '#EC4899' }}>♡</button>
              </div>
              <div className="p-5">
                <h3 className="br-display text-2xl mb-3 leading-tight">{r.title}</h3>
                <div className="flex items-center justify-between br-mono text-xs uppercase font-bold" style={{ color: '#525252' }}>
                  <span>⏱ {r.minutes} MIN</span>
                  <span>ING · {r.ing}</span>
                  <span style={{ background: '#0A0A0A', color: '#EAB308', padding: '3px 8px' }}>OPEN →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ SINGLE RECIPE PREVIEW ═══════════ */}
      <section style={{ borderTop: '2.5px solid #0A0A0A' }}>
        {/* Colored hero strip */}
        <div style={{ background: '#EC4899', color: '#FFFDF7', borderBottom: '2.5px solid #0A0A0A' }}>
          <div className="mx-auto max-w-[1320px] px-6 py-12">
            <div className="br-mono text-xs font-bold mb-4">&gt; RECIPE_002 · MAINS · ITALIAN</div>
            <h2 className="br-display leading-[.85]" style={{ fontSize: 'clamp(64px, 10vw, 148px)' }}>
              פסטה<br />בעגבניות<br />
              <span style={{ background: '#0A0A0A', color: '#EC4899', padding: '0 .1em', display: 'inline-block' }}>שרופות.</span>
            </h2>
          </div>
        </div>

        {/* Meta strip */}
        <div style={{ borderBottom: '2.5px solid #0A0A0A' }}>
          <div className="mx-auto max-w-[1320px] grid grid-cols-2 md:grid-cols-5 divide-x-2 divide-x-reverse" style={{ borderColor: '#0A0A0A' }}>
            {[
              { l: 'DURATION',   v: '30', s: 'MIN' },
              { l: 'SERVES',     v: '04', s: 'PPL' },
              { l: 'INGREDIENTS', v: '06', s: 'ITEMS' },
              { l: 'STEPS',      v: '04', s: 'PHASES' },
              { l: 'LEVEL',      v: 'EASY', s: '★★☆☆☆' },
            ].map((m, i) => (
              <div key={m.l} className="p-6" style={{ background: i%2 ? '#FFFDF7' : '#FEF3C7', borderRight: '2.5px solid #0A0A0A' }}>
                <div className="br-mono text-[10px] uppercase font-bold mb-2" style={{ color: '#525252' }}>{m.l}</div>
                <div className="br-display text-4xl leading-none">{m.v}</div>
                <div className="br-mono text-[10px] uppercase mt-1" style={{ color: '#525252' }}>{m.s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-[1320px] px-6 py-16 grid grid-cols-12 gap-6">
          {/* Ingredients block */}
          <div className="col-span-12 lg:col-span-5">
            <div className="br-card p-6" style={{ background: '#84CC16' }}>
              <h3 className="br-display text-3xl mb-1">INGREDIENTS</h3>
              <div className="br-mono text-xs mb-6 font-bold">{'// 6 ITEMS · CHECK ALL'}</div>
              <ul className="space-y-3">
                {[
                  { q: '400g',   n: 'פסטה יבשה' },
                  { q: '1kg',    n: 'עגבניות שרי' },
                  { q: '4x',     n: 'שיני שום' },
                  { q: '½ cup',  n: 'שמן זית' },
                  { q: '1 חופן', n: 'בזיליקום' },
                  { q: '—',      n: 'מלח ופלפל' },
                ].map(i => (
                  <li key={i.n} className="flex items-center gap-4 br-mono text-sm p-3" style={{ background: '#FFFDF7', border: '2px solid #0A0A0A', boxShadow: '3px 3px 0 0 #0A0A0A' }}>
                    <span className="w-6 h-6 border-2 border-black flex-shrink-0" />
                    <span className="br-display text-base font-bold" style={{ minWidth: 70 }}>{i.q}</span>
                    <span className="font-medium">{i.n}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA block */}
            <div className="mt-6 br-card p-6" style={{ background: '#0A0A0A', color: '#EAB308' }}>
              <div className="br-mono text-xs mb-3">{'// READY TO COOK?'}</div>
              <button className="br-btn br-display text-xl w-full py-5" style={{ background: '#EAB308', color: '#0A0A0A' }}>
                ▶ ENTER COOK MODE
              </button>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button className="br-btn br-mono text-xs uppercase font-bold py-3" style={{ background: '#FFFDF7', color: '#0A0A0A' }}>+ SHOPPING</button>
                <button className="br-btn br-mono text-xs uppercase font-bold py-3" style={{ background: '#EC4899', color: '#FFFDF7' }}>♡ SAVE</button>
              </div>
            </div>
          </div>

          {/* Steps block */}
          <div className="col-span-12 lg:col-span-7">
            <h3 className="br-display text-3xl mb-6">METHOD.</h3>
            <div className="space-y-4">
              {[
                { t: 'HIGH HEAT', d: '4 MIN', s: 'חממו מחבת ברזל כבדה על אש גבוהה. הוסיפו את העגבניות יבשות — בלי שמן. תנו להן להישחר על כל הצדדים.', bg: '#E11D48', tc: '#FFFDF7' },
                { t: 'AROMA',     d: '2 MIN', s: 'רק כשהן שרופות, הוסיפו את שמן הזית והשום הפרוס. הריחות הם הסימן שהגעתם.', bg: '#EAB308' },
                { t: 'BOIL',      d: '9 MIN', s: 'הרתיחו סיר מים עם מלח, בשלו את הפסטה עד al dente. שמרו כוס ממי הבישול.', bg: '#84CC16' },
                { t: 'PLATING',   d: '2 MIN', s: 'ערבבו את הפסטה עם הרוטב במחבת. הוסיפו מהמים לפי הצורך. סיימו בבזיליקום.', bg: '#F97316' },
              ].map((step, i) => (
                <div key={i} className="br-card grid grid-cols-12" style={{ background: step.bg, color: step.tc || '#0A0A0A' }}>
                  <div className="col-span-3 lg:col-span-2 p-5 flex flex-col justify-center border-l-2" style={{ borderColor: '#0A0A0A' }}>
                    <div className="br-display text-6xl leading-none">{`0${i+1}`}</div>
                    <div className="br-mono text-[10px] uppercase font-bold mt-2">{step.t}</div>
                    <div className="br-mono text-[10px] font-bold">{step.d}</div>
                  </div>
                  <div className="col-span-9 lg:col-span-10 p-5">
                    <p className="text-lg leading-snug font-medium">{step.s}</p>
                    <div className="mt-4 flex gap-2">
                      <button className="br-mono text-[10px] uppercase font-bold px-3 py-1.5" style={{ background: '#0A0A0A', color: '#FFFDF7' }}>⏱ START TIMER</button>
                      <button className="br-mono text-[10px] uppercase font-bold px-3 py-1.5" style={{ background: '#FFFDF7', color: '#0A0A0A', border: '2px solid #0A0A0A' }}>✓ DONE</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ background: '#0A0A0A', color: '#EAB308', borderTop: '2.5px solid #0A0A0A' }}>
        <div className="mx-auto max-w-[1320px] px-6 py-8 flex flex-wrap justify-between items-center gap-4">
          <div className="br-display text-2xl">KEREN/COOKBOOK<span style={{ color: '#EC4899' }}>.</span></div>
          <div className="br-mono text-xs uppercase">PREVIEW · DESIGN 04 OF 04 · BRUTAL</div>
          <div className="br-mono text-xs" style={{ color: '#A3A3A3' }}>© 2026 · NO NONSENSE</div>
        </div>
      </footer>
    </div>
  )
}
