import Link from 'next/link'

export const metadata = { title: 'Editorial · המטבח של קרן' }

const RECIPES = [
  { id: 'r1', title: 'שקשוקה של בית סבתא', chapter: 'ארוחות בוקר',   minutes: 25, img: '/images/recipes/shakshuka-default.png' },
  { id: 'r2', title: 'פסטה בעגבניות שרופות', chapter: 'עיקריות',       minutes: 30, img: '/images/recipes/tomato-pasta-default.png' },
  { id: 'r3', title: 'סלמון בחמאת עשבי תיבול', chapter: 'עיקריות דגים', minutes: 22, img: '/images/recipes/salmon-default.png' },
  { id: 'r4', title: 'עוגת לימון בחושה', chapter: 'קינוחים',           minutes: 55, img: '/images/recipes/lemon-cake-default.png' },
  { id: 'r5', title: 'מרק דלעת קטיפתי',   chapter: 'מרקים',            minutes: 40, img: '/images/recipes/pumpkin-soup-default.png' },
  { id: 'r6', title: 'כדורי בשר של אמא',  chapter: 'עיקריות בשר',      minutes: 50, img: '/images/recipes/meatballs-default.png' },
]

export default function EditorialDesign() {
  return (
    <div style={{
      background: '#FBF7F0',
      color: '#2A1810',
      minHeight: '100vh',
      fontFamily: '"Inter", "Heebo", system-ui, sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,900&family=Inter:wght@300;400;500;700&display=swap');
        .ed-title { font-family: 'Fraunces', 'Playfair Display', serif; font-optical-sizing: auto; font-variation-settings: 'opsz' 144; }
        .ed-italic { font-style: italic; font-weight: 400; }
        .ed-body { font-family: 'Inter', 'Heebo', sans-serif; }
        .ed-eyebrow { font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: #7A1F2B; font-weight: 500; }
        .ed-rule { height: 1px; background: #2A1810; opacity: .18; }
        .ed-rule-thick { height: 2px; background: #2A1810; }
        .ed-hover-lift { transition: transform .5s cubic-bezier(.2,.7,.2,1), box-shadow .5s ease; }
        .ed-hover-lift:hover { transform: translateY(-4px); }
        .ed-img-wrap img { transition: transform 1.2s cubic-bezier(.2,.7,.2,1), filter .5s ease; }
        .ed-img-wrap:hover img { transform: scale(1.04); }
        .ed-dropcap::first-letter { font-family: 'Fraunces', serif; font-size: 5.5rem; float: right; line-height: .85; margin: 4px 0 0 12px; color: #7A1F2B; font-weight: 900; }
        @keyframes edFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .ed-fade { animation: edFadeUp .9s cubic-bezier(.2,.7,.2,1) both; }
        .ed-fade-1 { animation-delay: .05s; } .ed-fade-2 { animation-delay: .18s; } .ed-fade-3 { animation-delay: .3s; }
      `}</style>

      {/* ═══════════ TOP MASTHEAD ═══════════ */}
      <header style={{ borderBottom: '2px solid #2A1810', background: '#FBF7F0' }}>
        <div className="mx-auto max-w-[1240px] px-8 py-4 flex items-center justify-between">
          <div className="ed-eyebrow">גיליון 09 · ספטמבר 2026</div>
          <div className="ed-title text-2xl tracking-tight" style={{ fontWeight: 900 }}>המטבח <span className="ed-italic" style={{ color: '#7A1F2B' }}>של קרן</span></div>
          <nav className="ed-body text-sm flex gap-6" style={{ color: '#2A1810' }}>
            <Link href="/preview/design-editorial">בית</Link>
            <Link href="/preview/design-editorial">מדורים</Link>
            <Link href="/preview/design-editorial">אוספים</Link>
            <Link href="/preview/design-editorial" style={{ color: '#7A1F2B', fontWeight: 500 }}>מתכון חדש +</Link>
          </nav>
        </div>
      </header>

      {/* ═══════════ HERO — full-bleed magazine cover ═══════════ */}
      <section className="relative overflow-hidden" style={{ height: '78vh', minHeight: 620 }}>
        <div className="absolute inset-0 ed-img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/recipes/shakshuka-default.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(251,247,240,0) 0%, rgba(251,247,240,.15) 40%, rgba(251,247,240,.92) 100%)' }} />
        </div>
        <div className="relative mx-auto max-w-[1240px] px-8 h-full flex flex-col justify-end pb-16">
          <div className="ed-fade ed-fade-1 ed-eyebrow mb-6">המנה של השבוע · Chef&apos;s Feature</div>
          <h1 className="ed-fade ed-fade-2 ed-title" style={{ fontSize: 'clamp(56px, 8vw, 128px)', lineHeight: .92, letterSpacing: '-.02em', fontWeight: 900, maxWidth: 900 }}>
            שקשוקה,<br />
            <span className="ed-italic" style={{ color: '#7A1F2B' }}>לאט לאט.</span>
          </h1>
          <p className="ed-fade ed-fade-3 ed-body mt-6 max-w-xl" style={{ fontSize: 20, lineHeight: 1.55, color: '#4A2E20' }}>
            הסוד לא בעגבניות. הסוד הוא בזמן. שלושים דקות של סבלנות, פלפלים שנרקבים לתוך הרוטב, וביצה שיודעת מתי לרדת מהאש.
          </p>
          <div className="ed-fade ed-fade-3 mt-8 flex items-center gap-6">
            <Link href="/preview/design-editorial" className="ed-body inline-flex items-center gap-3 px-8 py-4"
              style={{ background: '#2A1810', color: '#FBF7F0', fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 500 }}>
              קראו את המתכון
            </Link>
            <span className="ed-body text-sm" style={{ color: '#4A2E20' }}>25 דקות · 4 סועדים · קל</span>
          </div>
        </div>
      </section>

      {/* ═══════════ EYEBROW SECTION — chapter TOC ═══════════ */}
      <section className="mx-auto max-w-[1240px] px-8 pt-20 pb-10">
        <div className="ed-rule-thick mb-4" />
        <div className="flex items-baseline justify-between">
          <div>
            <div className="ed-eyebrow mb-2">בגיליון הזה</div>
            <h2 className="ed-title" style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-.01em' }}>שישה מתכונים <span className="ed-italic" style={{ color: '#7A1F2B' }}>לעונה הזאת</span></h2>
          </div>
          <div className="ed-body text-sm flex gap-6" style={{ color: '#7A1F2B' }}>
            <button>הכל</button>
            <button style={{ color: '#2A1810', borderBottom: '1px solid #2A1810' }}>עיקריות</button>
            <button>קינוחים</button>
            <button>מרקים</button>
          </div>
        </div>
        <div className="ed-rule mt-8" />
      </section>

      {/* ═══════════ ASYMMETRIC MAGAZINE GRID ═══════════ */}
      <section className="mx-auto max-w-[1240px] px-8 pb-24">
        <div className="grid grid-cols-12 gap-x-8 gap-y-16">

          {/* Big lead — 8 cols */}
          <article className="col-span-12 lg:col-span-8 ed-hover-lift">
            <Link href="/preview/design-editorial">
              <div className="ed-img-wrap overflow-hidden" style={{ aspectRatio: '16/10' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={RECIPES[1].img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="pt-6">
                <div className="ed-eyebrow mb-3">{RECIPES[1].chapter} · {RECIPES[1].minutes} דק&apos;</div>
                <h3 className="ed-title" style={{ fontSize: 44, lineHeight: 1.05, fontWeight: 600, letterSpacing: '-.01em' }}>{RECIPES[1].title}</h3>
                <p className="ed-body mt-4 text-lg" style={{ color: '#4A2E20', lineHeight: 1.6 }}>
                  עגבניות שרופות במחבת ברזל, שום שנפרש בשמן זית, ופסטה שיודעת לספוג. חמישה מרכיבים, שלושים דקות.
                </p>
              </div>
            </Link>
          </article>

          {/* Sidebar column — 4 cols, small cards */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-10 border-r border-neutral-900/15 lg:pr-8">
            {[RECIPES[2], RECIPES[3]].map((r) => (
              <article key={r.id} className="ed-hover-lift">
                <Link href="/preview/design-editorial">
                  <div className="ed-img-wrap overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.img} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="pt-4">
                    <div className="ed-eyebrow mb-2">{r.chapter} · {r.minutes} דק&apos;</div>
                    <h4 className="ed-title" style={{ fontSize: 22, lineHeight: 1.15, fontWeight: 600 }}>{r.title}</h4>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Second row — 3 equal cards */}
          {[RECIPES[4], RECIPES[5], RECIPES[0]].map((r, i) => (
            <article key={r.id} className="col-span-12 md:col-span-6 lg:col-span-4 ed-hover-lift">
              <Link href="/preview/design-editorial">
                <div className="ed-img-wrap overflow-hidden" style={{ aspectRatio: '4/5' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.img} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="pt-4">
                  <div className="ed-eyebrow mb-2">№ 0{i+4} · {r.chapter}</div>
                  <h3 className="ed-title" style={{ fontSize: 26, lineHeight: 1.1, fontWeight: 600 }}>{r.title}</h3>
                  <div className="ed-body text-sm mt-2" style={{ color: '#7A1F2B' }}>{r.minutes} דקות הכנה →</div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ SINGLE RECIPE PREVIEW ═══════════ */}
      <section style={{ background: '#F3EBDD', borderTop: '2px solid #2A1810' }}>
        <div className="mx-auto max-w-[1240px] px-8 py-24">
          <div className="grid grid-cols-12 gap-12">
            {/* Left — text column */}
            <div className="col-span-12 lg:col-span-7">
              <div className="ed-eyebrow mb-4">מדור העיקריות · מתכון מלא</div>
              <h2 className="ed-title mb-6" style={{ fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: .95, fontWeight: 900, letterSpacing: '-.02em' }}>
                פסטה<br /><span className="ed-italic" style={{ color: '#7A1F2B' }}>בעגבניות שרופות</span>
              </h2>
              <div className="ed-body flex gap-8 mb-8 text-sm" style={{ color: '#4A2E20' }}>
                <span><strong style={{ color: '#2A1810', fontWeight: 600 }}>30</strong> דקות</span>
                <span><strong style={{ color: '#2A1810', fontWeight: 600 }}>4</strong> סועדים</span>
                <span><strong style={{ color: '#2A1810', fontWeight: 600 }}>קל</strong> · 5 מרכיבים</span>
              </div>
              <p className="ed-body ed-dropcap text-lg mb-10" style={{ lineHeight: 1.65, color: '#2A1810' }}>
                {'אין הרבה מנות שמפחידות פחות ומספקות יותר. פסטה בעגבניות היא הבטחה — שאפילו במטבח ריק, יש דרך לצאת עם צלחת שלמה. הסוד הוא לתת לעגבניות להישרף, לא רק להתבשל. הפחם הקל שנוצר במחבת הוא מה שהופך את הרוטב מ"ממש טוב" ל"בואי שוב מחר".'}
              </p>

              {/* Ingredients as editorial list */}
              <div className="ed-rule mb-6" />
              <div className="ed-eyebrow mb-6">המרכיבים</div>
              <ul className="ed-body grid grid-cols-2 gap-y-3 text-base mb-12" style={{ color: '#2A1810' }}>
                {[
                  ['400 גרם', 'פסטה יבשה'],
                  ['1 קילו', 'עגבניות שרי'],
                  ['4 שיני', 'שום'],
                  ['1/2 כוס', 'שמן זית'],
                  ['חופן', 'בזיליקום טרי'],
                  ['לפי הטעם', 'מלח ופלפל'],
                ].map(([q, name]) => (
                  <li key={name} className="flex gap-4 items-baseline border-b border-neutral-900/10 pb-3">
                    <span className="ed-title" style={{ fontWeight: 600, color: '#7A1F2B', minWidth: 80 }}>{q}</span>
                    <span>{name}</span>
                  </li>
                ))}
              </ul>

              {/* Steps */}
              <div className="ed-rule mb-6" />
              <div className="ed-eyebrow mb-6">ההכנה</div>
              <ol className="ed-body space-y-6 text-lg" style={{ lineHeight: 1.65, color: '#2A1810' }}>
                {[
                  'חממו מחבת ברזל כבדה על אש גבוהה. הוסיפו את העגבניות יבשות — בלי שמן. תנו להן להישחר על כל הצדדים.',
                  'רק כשהן שרופות, הוסיפו את שמן הזית והשום הפרוס. הריחות הם הסימן שהגעתם.',
                  'הרתיחו סיר מים עם מלח, בשלו את הפסטה עד al dente. שמרו כוס ממי הבישול.',
                  'ערבבו את הפסטה עם הרוטב במחבת, הוסיפו מהמים לפי הצורך. סיימו בבזיליקום.',
                ].map((step, i) => (
                  <li key={i} className="flex gap-5">
                    <span className="ed-title flex-shrink-0" style={{ fontSize: 40, fontWeight: 900, color: '#7A1F2B', lineHeight: .9, minWidth: 60 }}>0{i+1}</span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Right — image column */}
            <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-8 self-start">
              <div className="ed-img-wrap overflow-hidden" style={{ aspectRatio: '3/4' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/recipes/tomato-pasta-default.png" alt="" className="w-full h-full object-cover" />
              </div>
              <p className="ed-body ed-italic text-sm mt-3" style={{ color: '#4A2E20' }}>
                צילום: המחבת אחרי 12 דקות · המטבח של קרן
              </p>

              {/* Action panel */}
              <div className="mt-8 p-6 border-2 border-neutral-900" style={{ background: '#FBF7F0' }}>
                <div className="ed-eyebrow mb-4">Cook Mode</div>
                <p className="ed-body text-sm mb-4" style={{ color: '#4A2E20', lineHeight: 1.55 }}>עברו למצב בישול — שלב אחד בכל פעם, טיימרים אוטומטיים, המסך לא נכבה.</p>
                <button className="w-full py-4 ed-body" style={{ background: '#7A1F2B', color: '#FBF7F0', fontSize: 13, letterSpacing: '.15em', textTransform: 'uppercase', fontWeight: 500 }}>
                  התחילי לבשל →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ COLOPHON ═══════════ */}
      <footer style={{ background: '#2A1810', color: '#FBF7F0' }}>
        <div className="mx-auto max-w-[1240px] px-8 py-16 flex justify-between items-end">
          <div>
            <div className="ed-title text-4xl mb-2" style={{ fontWeight: 900 }}>המטבח <span className="ed-italic" style={{ color: '#E8B4B8' }}>של קרן</span></div>
            <p className="ed-body text-sm opacity-70">Edition 09 · ספטמבר 2026 · Editorial Direction</p>
          </div>
          <div className="ed-body text-xs opacity-60" style={{ letterSpacing: '.1em', textTransform: 'uppercase' }}>Preview · Design 01 of 04</div>
        </div>
      </footer>
    </div>
  )
}
