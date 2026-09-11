import Link from 'next/link'

export const metadata = { title: 'Bento · המטבח של קרן' }

const RECIPES = [
  { id: 'r1', title: 'שקשוקה חריפה',      minutes: 25, cat: 'ארוחת בוקר',   emoji: '🍳', tint: 'paprika', img: '/images/recipes/shakshuka-default.png' },
  { id: 'r2', title: 'פסטה בעגבניות',     minutes: 30, cat: 'עיקריות',      emoji: '🍅', tint: 'basil',   img: '/images/recipes/tomato-pasta-default.png' },
  { id: 'r3', title: 'סלמון בעשבי תיבול', minutes: 22, cat: 'דגים',         emoji: '🐟', tint: 'sky',     img: '/images/recipes/salmon-default.png' },
  { id: 'r4', title: 'עוגת לימון בחושה',  minutes: 55, cat: 'קינוחים',      emoji: '🍋', tint: 'butter',  img: '/images/recipes/lemon-cake-default.png' },
  { id: 'r5', title: 'מרק דלעת קטיפתי',   minutes: 40, cat: 'מרקים',        emoji: '🎃', tint: 'paprika', img: '/images/recipes/pumpkin-soup-default.png' },
  { id: 'r6', title: 'כדורי בשר',         minutes: 50, cat: 'בשר',          emoji: '🥩', tint: 'cocoa',   img: '/images/recipes/meatballs-default.png' },
]

const TINTS: Record<string, { bg: string; border: string; text: string; soft: string }> = {
  paprika: { bg: '#FEE2E2', border: '#DC2626', text: '#7F1D1D', soft: '#FEF2F2' },
  basil:   { bg: '#DCFCE7', border: '#65A30D', text: '#3F6212', soft: '#F0FDF4' },
  butter:  { bg: '#FEF3C7', border: '#D97706', text: '#78350F', soft: '#FFFBEB' },
  cocoa:   { bg: '#F5EFE6', border: '#7C2D12', text: '#431407', soft: '#FAF6F0' },
  sky:     { bg: '#DBEAFE', border: '#0284C7', text: '#0C4A6E', soft: '#EFF6FF' },
}

export default function BentoDesign() {
  return (
    <div style={{ background: '#FFFBEB', color: '#431407', minHeight: '100vh', fontFamily: '"Nunito", "Heebo", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,900&family=Nunito:wght@400;600;700;800;900&display=swap');
        .bn-display { font-family: 'Fraunces', 'Playfair Display', serif; letter-spacing: -.02em; }
        .bn-tile { transition: transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .28s ease; }
        .bn-tile:hover { transform: translateY(-4px) scale(1.015); }
        .bn-tile:active { transform: translateY(-2px) scale(.99); }
        .bn-btn { transition: transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s ease; }
        .bn-btn:hover { transform: translateY(-2px); }
        .bn-btn:active { transform: translateY(1px); box-shadow: 0 2px 0 0 rgba(0,0,0,.15) !important; }
        @keyframes bnFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
        .bn-float { animation: bnFloat 4.5s ease-in-out infinite; }
        .bn-float-2 { animation: bnFloat 5.2s ease-in-out infinite .8s; }
        @keyframes bnPop { from { opacity: 0; transform: translateY(20px) scale(.94); } to { opacity: 1; transform: none; } }
        .bn-pop { animation: bnPop .6s cubic-bezier(.34,1.56,.64,1) both; }
        .bn-pop-1 { animation-delay: 0s; } .bn-pop-2 { animation-delay: .08s; }
        .bn-pop-3 { animation-delay: .16s; } .bn-pop-4 { animation-delay: .24s; }
        .bn-pop-5 { animation-delay: .32s; } .bn-pop-6 { animation-delay: .4s; }
        .bn-shadow-tile { box-shadow: 0 4px 0 0 rgba(120, 53, 15, .12), 0 12px 32px -8px rgba(120, 53, 15, .18); }
        .bn-shadow-tile:hover { box-shadow: 0 6px 0 0 rgba(120, 53, 15, .18), 0 20px 40px -8px rgba(120, 53, 15, .28); }
      `}</style>

      {/* ═══════════ TOP NAV — chubby ═══════════ */}
      <header className="sticky top-0 z-20" style={{ background: 'rgba(255,251,235,.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(120,53,15,.08)' }}>
        <div className="mx-auto max-w-[1240px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bn-float w-11 h-11 rounded-2xl flex items-center justify-center text-2xl" style={{ background: '#DC2626', boxShadow: '0 4px 0 0 #7F1D1D' }}>🍅</div>
            <div>
              <div className="bn-display text-xl font-black" style={{ color: '#431407' }}>המטבח של קרן</div>
              <div className="text-xs" style={{ color: '#78350F' }}>Bento Edition</div>
            </div>
          </div>
          <nav className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#78350F' }}>
            {['בית', 'מתכונים', 'קניות', 'תכנון'].map(t => (
              <Link key={t} href="/preview/design-bento" className="px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors">{t}</Link>
            ))}
          </nav>
          <button className="bn-btn inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm"
            style={{ background: '#DC2626', color: '#FFF', boxShadow: '0 4px 0 0 #7F1D1D' }}>
            + מתכון חדש
          </button>
        </div>
      </header>

      {/* ═══════════ HERO BENTO GRID ═══════════ */}
      <section className="mx-auto max-w-[1240px] px-6 py-10">
        <div className="grid grid-cols-12 auto-rows-[140px] gap-4">

          {/* Big greeting tile — 6x2 */}
          <div className="bn-tile bn-pop bn-pop-1 col-span-12 md:col-span-6 row-span-2 rounded-3xl p-8 relative overflow-hidden bn-shadow-tile"
            style={{ background: 'linear-gradient(135deg, #FEE2E2 0%, #FEF3C7 100%)', border: '1px solid rgba(220, 38, 38, .15)' }}>
            <div className="bn-float text-6xl absolute top-6 left-6 opacity-30">🍳</div>
            <div className="relative z-10">
              <div className="text-sm font-bold mb-3" style={{ color: '#7F1D1D' }}>17:24 · יום שלישי</div>
              <h1 className="bn-display font-black leading-[.95] mb-4" style={{ fontSize: 'clamp(40px, 5vw, 68px)', color: '#431407' }}>
                שלום קרן,<br />
                <span style={{ color: '#DC2626' }}>מה מבשלים?</span>
              </h1>
              <p className="text-base mb-6 max-w-md" style={{ color: '#78350F' }}>
                יש לך 3 מרכיבים במקרר שיוצרים ארוחה שלמה. רוצה לראות?
              </p>
              <div className="flex gap-3">
                <button className="bn-btn px-6 py-3 rounded-2xl font-bold text-sm"
                  style={{ background: '#DC2626', color: '#FFF', boxShadow: '0 4px 0 0 #7F1D1D' }}>הראה לי →</button>
                <button className="bn-btn px-6 py-3 rounded-2xl font-bold text-sm"
                  style={{ background: '#FFF', color: '#431407', border: '2px solid #431407', boxShadow: '0 4px 0 0 #431407' }}>או משהו אחר</button>
              </div>
            </div>
          </div>

          {/* Stats — 3 small tiles */}
          <div className="bn-tile bn-pop bn-pop-2 col-span-6 md:col-span-3 row-span-1 rounded-3xl p-5 bn-shadow-tile"
            style={{ background: '#DCFCE7', border: '1px solid rgba(101, 163, 13, .2)' }}>
            <div className="text-3xl mb-1">📚</div>
            <div className="bn-display text-3xl font-black" style={{ color: '#3F6212' }}>247</div>
            <div className="text-xs font-semibold" style={{ color: '#65A30D' }}>מתכונים שלך</div>
          </div>

          <div className="bn-tile bn-pop bn-pop-3 col-span-6 md:col-span-3 row-span-1 rounded-3xl p-5 bn-shadow-tile"
            style={{ background: '#FEF3C7', border: '1px solid rgba(217, 119, 6, .2)' }}>
            <div className="text-3xl mb-1">❤️</div>
            <div className="bn-display text-3xl font-black" style={{ color: '#78350F' }}>32</div>
            <div className="text-xs font-semibold" style={{ color: '#D97706' }}>מועדפים</div>
          </div>

          <div className="bn-tile bn-pop bn-pop-4 col-span-6 md:col-span-3 row-span-1 rounded-3xl p-5 bn-shadow-tile"
            style={{ background: '#DBEAFE', border: '1px solid rgba(2, 132, 199, .2)' }}>
            <div className="text-3xl mb-1">🛒</div>
            <div className="bn-display text-3xl font-black" style={{ color: '#0C4A6E' }}>8</div>
            <div className="text-xs font-semibold" style={{ color: '#0284C7' }}>ברשימת קניות</div>
          </div>

          <div className="bn-tile bn-pop bn-pop-5 col-span-6 md:col-span-3 row-span-1 rounded-3xl p-5 bn-shadow-tile"
            style={{ background: '#FEE2E2', border: '1px solid rgba(220, 38, 38, .2)' }}>
            <div className="bn-float-2 text-3xl mb-1">🔥</div>
            <div className="bn-display text-3xl font-black" style={{ color: '#7F1D1D' }}>5</div>
            <div className="text-xs font-semibold" style={{ color: '#DC2626' }}>Cook Streak</div>
          </div>

          {/* Import — 4x1 wide */}
          <div className="bn-tile bn-pop bn-pop-3 col-span-12 md:col-span-6 row-span-1 rounded-3xl p-5 bn-shadow-tile flex items-center gap-4"
            style={{ background: '#F5EFE6', border: '1px solid rgba(124, 45, 18, .15)' }}>
            <div className="flex-1">
              <div className="text-sm font-bold mb-1" style={{ color: '#431407' }}>ייבוא מהיר</div>
              <div className="text-xs" style={{ color: '#78350F' }}>URL · צילום · הקלטה קולית</div>
            </div>
            <div className="flex gap-2">
              {[
                { e: '📷', bg: '#FEE2E2', border: '#7F1D1D' },
                { e: '🔗', bg: '#DBEAFE', border: '#0C4A6E' },
                { e: '🎤', bg: '#FEF3C7', border: '#78350F' },
              ].map((b, i) => (
                <button key={i} className="bn-btn w-11 h-11 rounded-xl text-lg flex items-center justify-center"
                  style={{ background: b.bg, boxShadow: `0 3px 0 0 ${b.border}` }}>{b.e}</button>
              ))}
            </div>
          </div>

          {/* Quote/pantry tile — 4x1 */}
          <div className="bn-tile bn-pop bn-pop-4 col-span-12 md:col-span-6 row-span-1 rounded-3xl p-5 flex items-center gap-4 bn-shadow-tile"
            style={{ background: 'linear-gradient(135deg, #78350F 0%, #431407 100%)', color: '#FEF3C7' }}>
            <div className="text-4xl">🌱</div>
            <div className="flex-1">
              <div className="text-sm font-bold mb-1">מה יש היום במקרר?</div>
              <div className="text-xs opacity-85">עדכני את הרשימה — נציע מתכונים מותאמים</div>
            </div>
            <button className="bn-btn px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#FEF3C7', color: '#431407', boxShadow: '0 3px 0 0 #78350F' }}>פתחי →</button>
          </div>
        </div>
      </section>

      {/* ═══════════ RECIPE GRID ═══════════ */}
      <section className="mx-auto max-w-[1240px] px-6 pb-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="bn-display text-4xl font-black" style={{ color: '#431407' }}>המתכונים <span style={{ color: '#DC2626' }}>שלך</span></h2>
          <div className="flex gap-2">
            {['הכל', 'מהיר', 'צמחוני', 'מתוקים'].map((t, i) => (
              <button key={t} className={`bn-btn px-4 py-2 rounded-full text-sm font-bold ${i===0 ? '' : ''}`}
                style={i===0
                  ? { background: '#431407', color: '#FEF3C7', boxShadow: '0 3px 0 0 #000' }
                  : { background: '#FFF', color: '#78350F', border: '1px solid rgba(120,53,15,.2)' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {RECIPES.map((r, i) => {
            const t = TINTS[r.tint]
            return (
              <Link key={r.id} href="/preview/design-bento" className={`bn-tile bn-pop bn-pop-${(i%6)+1} rounded-3xl overflow-hidden bn-shadow-tile block`}
                style={{ background: '#FFF', border: `1px solid ${t.border}22` }}>
                <div className="relative aspect-[5/4] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: t.bg, color: t.text }}>
                    <span className="ml-1">{r.emoji}</span>{r.cat}
                  </div>
                  <button className="absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,.9)', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
                    <span style={{ color: '#DC2626', fontSize: 16 }}>♡</span>
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="bn-display text-xl font-black mb-2 leading-tight" style={{ color: '#431407' }}>{r.title}</h3>
                  <div className="flex items-center justify-between text-xs font-semibold" style={{ color: '#78350F' }}>
                    <span className="flex items-center gap-1.5"><span>⏱</span>{r.minutes} דק&apos;</span>
                    <span className="px-3 py-1 rounded-full" style={{ background: t.soft, color: t.text }}>קל להכנה</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ═══════════ SINGLE RECIPE PREVIEW ═══════════ */}
      <section className="mx-auto max-w-[1240px] px-6 pb-16">
        <div className="rounded-[32px] overflow-hidden bn-shadow-tile" style={{ background: '#FFF', border: '1px solid rgba(120,53,15,.15)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* Left — big image */}
            <div className="lg:col-span-5 relative aspect-square lg:aspect-auto min-h-[400px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/recipes/tomato-pasta-default.png" alt="" className="w-full h-full object-cover" />
              <div className="absolute top-5 right-5 px-4 py-2 rounded-full text-sm font-bold"
                style={{ background: '#DC2626', color: '#FFF', boxShadow: '0 4px 0 0 #7F1D1D' }}>🍅 עיקריות</div>
              <div className="absolute bottom-5 right-5 flex gap-2">
                {['30 דק', '4 סועדים', 'קל'].map(x => (
                  <span key={x} className="px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: 'rgba(255,255,255,.92)', color: '#431407', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>{x}</span>
                ))}
              </div>
            </div>

            {/* Right — content */}
            <div className="lg:col-span-7 p-8 lg:p-10">
              <div className="text-xs font-bold mb-2" style={{ color: '#DC2626' }}>המנה של השבוע · Chef&apos;s Pick</div>
              <h2 className="bn-display font-black leading-[.95] mb-6" style={{ fontSize: 'clamp(36px, 4vw, 56px)', color: '#431407' }}>
                פסטה בעגבניות <span style={{ color: '#DC2626' }}>שרופות</span>
              </h2>

              {/* Ingredients — bento sub-grid */}
              <div className="mb-8">
                <div className="text-xs font-black mb-3" style={{ color: '#78350F', letterSpacing: '.1em' }}>המרכיבים</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { q: '400ג', name: 'פסטה', e: '🍝', tint: TINTS.butter },
                    { q: '1ק"ג', name: 'עגבניות', e: '🍅', tint: TINTS.paprika },
                    { q: '4 שיני', name: 'שום', e: '🧄', tint: TINTS.cocoa },
                    { q: '½ כוס', name: 'שמן זית', e: '🫒', tint: TINTS.basil },
                    { q: 'חופן', name: 'בזיליקום', e: '🌿', tint: TINTS.basil },
                    { q: '—', name: 'מלח·פלפל', e: '🧂', tint: TINTS.sky },
                  ].map(ing => (
                    <div key={ing.name} className="rounded-2xl p-3 text-center bn-tile"
                      style={{ background: ing.tint.soft, border: `1px solid ${ing.tint.border}22` }}>
                      <div className="text-xl mb-0.5">{ing.e}</div>
                      <div className="bn-display text-sm font-black" style={{ color: ing.tint.text }}>{ing.q}</div>
                      <div className="text-xs font-semibold" style={{ color: ing.tint.text, opacity: .8 }}>{ing.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps preview */}
              <div className="mb-8">
                <div className="text-xs font-black mb-3" style={{ color: '#78350F', letterSpacing: '.1em' }}>ההכנה · 4 שלבים</div>
                <div className="space-y-2">
                  {[
                    'חממי מחבת ברזל. הוסיפי עגבניות יבשות עד השחמה.',
                    'הוסיפי שמן זית ושום פרוס. הריחות הם הסימן.',
                    'בשלי פסטה al dente. שמרי כוס ממי הבישול.',
                    'ערבבי, סיימי בבזיליקום ושמן זית.',
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 rounded-2xl bn-tile" style={{ background: '#FFFBEB', border: '1px solid rgba(217,119,6,.15)' }}>
                      <div className="bn-display flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm"
                        style={{ background: '#DC2626', color: '#FFF', boxShadow: '0 2px 0 0 #7F1D1D' }}>{i+1}</div>
                      <p className="text-sm pt-1" style={{ color: '#431407' }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-3">
                <button className="bn-btn flex-1 py-4 rounded-2xl font-black text-base"
                  style={{ background: '#DC2626', color: '#FFF', boxShadow: '0 5px 0 0 #7F1D1D' }}>
                  התחילי לבשל 🔥
                </button>
                <button className="bn-btn px-5 py-4 rounded-2xl font-bold text-base"
                  style={{ background: '#FFF', color: '#431407', border: '2px solid #431407', boxShadow: '0 5px 0 0 #431407' }}>
                  ♡
                </button>
                <button className="bn-btn px-5 py-4 rounded-2xl font-bold text-base"
                  style={{ background: '#FFF', color: '#431407', border: '2px solid #431407', boxShadow: '0 5px 0 0 #431407' }}>
                  🛒
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[1240px] px-6 py-10 flex justify-between items-center border-t" style={{ borderColor: 'rgba(120,53,15,.1)' }}>
        <div className="text-sm font-bold" style={{ color: '#431407' }}>🍅 המטבח של קרן · Bento</div>
        <div className="text-xs" style={{ color: '#78350F' }}>Preview · Design 02 of 04</div>
      </footer>
    </div>
  )
}
