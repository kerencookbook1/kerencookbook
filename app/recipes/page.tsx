import Link from "next/link";
import Image from "next/image";

const recipes = [
  { title: "שקשוקה ביתית", time: "30 דק׳", tag: "מהיר", image: "/images/recipes/shakshuka-default.png" },
  { title: "כרובית בטחינה לימון", time: "40 דק׳", tag: "צמחוני", image: "/images/recipes/cauliflower-tahini-default.png" },
  { title: "עוגת לימון בחושה", time: "60 דק׳", tag: "מתוקים", image: "/images/recipes/lemon-cake-default.png" },
  { title: "מרק כתום קטיפתי", time: "45 דק׳", tag: "חורף", image: "/images/recipes/pumpkin-soup-default.png" },
  { title: "סלט עשבי תיבול", time: "15 דק׳", tag: "מהיר", image: "/images/recipes/herb-salad-default.png" },
  { title: "פסטה ברוטב עגבניות", time: "25 דק׳", tag: "משפחתי", image: "/images/recipes/tomato-pasta-default.png" },
];

export default function RecipesPage() {
  return (
    <main className="library-shell">
      <header className="library-header">
        <Link className="back-link" href="/">חזרה לבית</Link>
        <p className="eyebrow">הספר האישי שלך</p>
        <div className="library-title-row"><h1>המתכונים שלי</h1><Link className="add-button" href="/recipes/new">+ מתכון חדש</Link></div>
      </header>

      <section className="library-tools" aria-label="חיפוש וסינון מתכונים">
        <label className="library-search" htmlFor="library-search"><span className="sr-only">חיפוש במתכונים</span><input id="library-search" placeholder="חיפוש בשם מתכון או מרכיב" /></label>
        <div className="filter-row" aria-label="קטגוריות"><button type="button" className="filter-pill is-current">הכל</button><button type="button" className="filter-pill">מהיר</button><button type="button" className="filter-pill">צמחוני</button><button type="button" className="filter-pill">מתוקים</button><button type="button" className="filter-pill">מועדפים</button></div>
      </section>

      <div className="library-workspace"><section aria-labelledby="all-recipes-title"><div className="library-count"><h2 id="all-recipes-title">כל המתכונים</h2><span>{recipes.length} מתכונים</span></div><div className="library-grid">{recipes.map((recipe) => <article className="library-card" key={recipe.title}><div className="library-visual"><Image className="recipe-photo" src={recipe.image} alt={`צילום של ${recipe.title}`} fill sizes="(max-width: 720px) 42vw, (max-width: 1024px) 50vw, 260px" /></div><div className="library-card-body"><span className="recipe-tag">{recipe.tag}</span><h3>{recipe.title}</h3><p>{recipe.time}</p></div></article>)}</div></section><aside className="recipe-detail-preview"><div className="detail-visual"><Image className="recipe-photo" src="/images/recipes/shakshuka-default.png" alt="צילום של שקשוקה ביתית" fill sizes="370px" /></div><p className="eyebrow">מתכון נבחר</p><h2>שקשוקה</h2><div className="detail-meta"><span>30 דק׳</span><span>קל</span><span>4 מנות</span></div><h3>הוראות הכנה בקצרה</h3><ol><li>מחממים שמן במחבת רחבה.</li><li>מבשלים רוטב עגבניות מתובל.</li><li>מוסיפים ביצים ומבשלים עד שמוכן.</li></ol><Link className="primary-button" href="/recipes/1/cook">התחלת בישול</Link></aside></div>
    </main>
  );
}
