import Link from 'next/link'

export const metadata = { title: 'תכנון שבועי — המטבח של קרן' }

const TODAY = new Date()
const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

// Build the current week (Sun–Sat)
function getWeek() {
  const dayOfWeek = TODAY.getDay()
  const sunday = new Date(TODAY)
  sunday.setDate(TODAY.getDate() - dayOfWeek)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    return { day: DAYS_HE[i], date: d.getDate(), isToday: d.toDateString() === TODAY.toDateString() }
  })
}

const SAMPLE_MEALS: Record<number, { time: string; title: string }[]> = {
  0: [{ time: 'ערב', title: 'מרק עגבניות' }],
  2: [{ time: 'צהריים', title: 'פסטה עגבניות' }, { time: 'ערב', title: 'כרובית בטחינה' }],
  4: [{ time: 'ערב', title: 'שקשוקה ביתית' }],
  5: [{ time: 'ערב', title: 'ארוחת שישי חגיגית' }],
  6: [{ time: 'בוקר', title: 'עוגת לימון' }],
}

export default function MealPlansPage() {
  const week = getWeek()
  const rangeStart = week[0].date
  const rangeEnd = week[6].date
  const monthHe = TODAY.toLocaleDateString('he-IL', { month: 'long' })

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <p className="eyebrow">תכנון שבועי</p>
        <h1>מה מבשלים השבוע?</h1>
        <p>תכנון רגוע שמתחיל מהמתכונים שכבר אהובים עליכם.</p>
      </header>

      <section className="week-card">
        <div className="week-toolbar">
          <strong>{rangeStart}–{rangeEnd} ב{monthHe}</strong>
          <div>
            <button className="outline-button" type="button">שבוע קודם</button>
            <button className="outline-button" type="button">שבוע הבא</button>
            <Link href="/recipes" className="primary-button" style={{ textDecoration: 'none' }}>
              + הוספת ארוחה
            </Link>
          </div>
        </div>
        <div className="week-grid">
          {week.map(({ day, date, isToday }, index) => (
            <article
              key={day}
              className="day-card"
              style={isToday ? { background: '#fff8f2', borderRight: '3px solid var(--terracotta)' } : undefined}
            >
              <span>{day}</span>
              <strong style={isToday ? { color: 'var(--terracotta)' } : undefined}>{date}</strong>
              {(SAMPLE_MEALS[index] ?? []).map((meal) => (
                <div key={meal.title} className="meal-slot">
                  <small>{meal.time}</small>
                  <p>{meal.title}</p>
                </div>
              ))}
              <button
                type="button"
                className="add-slot"
                aria-label={`הוספת ארוחה ליום ${day}`}
              >
                +
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="planning-note">
        <div>
          <p className="eyebrow">רשימת קניות</p>
          <h2>התחילי מהשבוע שלך</h2>
          <p>ניצור רשימת קניות מהמנות שתבחרי, ישירות מהמתכונים השמורים.</p>
        </div>
        <button className="outline-button" type="button">לרשימת הקניות</button>
      </section>
    </main>
  )
}
