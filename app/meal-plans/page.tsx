import Link from "next/link";

const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const meals = ["מרק כתום", "פסטה עגבניות", "כרובית בטחינה", "שקשוקה ביתית", "סלט עשבים", "ארוחת שישי", "עוגת לימון"];

export default function MealPlansPage() {
  return <main className="screen-shell"><header className="screen-header"><Link className="back-link" href="/">חזרה לבית</Link><p className="eyebrow">תכנון שבועי</p><h1>מה מבשלים השבוע?</h1><p>תכנון רגוע שמתחיל מהמתכונים שכבר אהובים עליכם.</p></header><section className="week-card"><div className="week-toolbar"><strong>8–14 בספטמבר</strong><div><button className="outline-button" type="button">שבוע קודם</button><button className="primary-button" type="button">הוספת ארוחה</button></div></div><div className="week-grid">{days.map((day, index) => <article className="day-card" key={day}><span>{day}</span><strong>{index + 8}</strong><div className="meal-slot"><small>ערב</small><p>{meals[index]}</p></div><button type="button" className="add-slot" aria-label={`הוספת ארוחה ליום ${day}`}>+</button></article>)}</div></section><section className="planning-note"><div><p className="eyebrow">רשימת קניות</p><h2>התחילי מהשבוע שלך</h2><p>ניצור רשימת קניות מהמנות שתבחרי, לאחר חיבור הנתונים.</p></div><button className="outline-button" type="button">לרשימת הקניות</button></section></main>;
}
