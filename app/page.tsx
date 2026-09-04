"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type IconName = "book" | "clock" | "heart" | "home" | "plus" | "search" | "sparkle" | "user";

const recipes = [
  { id: 1, title: "שקשוקה", time: "30 דק׳", category: "מהיר", image: "/images/recipes/shakshuka-default.png" },
  { id: 2, title: "סלמון בתנור", time: "45 דק׳", category: "דגים", image: "/images/recipes/salmon-default.png" },
  { id: 3, title: "קציצות ברוטב עגבניות", time: "60 דק׳", category: "בשר", image: "/images/recipes/meatballs-default.png" },
  { id: 4, title: "פסטה ברוטב שמנת", time: "25 דק׳", category: "מהיר", image: "/images/recipes/creamy-pasta-default.png" },
];

function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "search") return <svg {...props}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>;
  if (name === "plus") return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "clock") return <svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></svg>;
  if (name === "heart") return <svg {...props}><path d="M20.8 8.6c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10A4.5 4.5 0 0 1 12 6.3a4.5 4.5 0 0 1 8.8 2.3Z" /></svg>;
  if (name === "home") return <svg {...props}><path d="m3.5 10 8.5-7 8.5 7v9.5H14v-6h-4v6H3.5Z" /></svg>;
  if (name === "book") return <svg {...props}><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17.5H7.5A2.5 2.5 0 0 0 5 22Z" /><path d="M5 4.5V22M8.5 6h7" /></svg>;
  if (name === "user") return <svg {...props}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>;
  return <svg {...props}><path d="m12 3 1.3 5.2L18 9.5l-4.7 1.3L12 16l-1.3-5.2L6 9.5l4.7-1.3Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z" /></svg>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const filtered = recipes.filter((recipe) => recipe.title.includes(query.trim()) && (!category || recipe.category === category));

  return <main className="reference-home">
    <a className="skip-link" href="#content">דלגי לתוכן</a>
    <header className="mobile-appbar">
      <button className="icon-square" type="button" aria-label="פתיחת תפריט"><span aria-hidden="true">≡</span></button>
      <div><p>מה בא לך</p><h1>להכין היום?</h1></div>
      <Link className="icon-square" href="/profile" aria-label="פתיחת הפרופיל"><Icon name="user" size={21} /></Link>
    </header>
    <label className="reference-search" htmlFor="recipe-search"><Icon name="search" size={20} /><span className="sr-only">חיפוש מתכון</span><input id="recipe-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש מתכון, מרכיב, קטגוריה..." /></label>
    <section className="source-shortcuts" aria-label="הוספת מתכון">
      <Link href="/recipes/new" className="source-shortcut accent"><strong>+</strong><span>מתכון חדש</span></Link>
      <Link href="/import/photo" className="source-shortcut"><strong>◎</strong><span>ייבוא מהאינטרנט</span></Link>
      <Link href="/import/photo" className="source-shortcut sage"><strong>▣</strong><span>צילום מתכון</span></Link>
    </section>
    <section className="reference-categories" aria-labelledby="categories-title"><div className="mini-heading"><h2 id="categories-title">קטגוריות</h2><button type="button" onClick={() => setCategory(null)}>הצג הכל</button></div><div className="category-tiles">{["בשר", "עוף", "דגים", "פסטה", "סלטים", "מרקים", "קינוחים", "לחמים"].map((item, index) => <button key={item} type="button" className={`category-tile tile-${index} ${category === item ? "is-selected" : ""}`} onClick={() => setCategory((current) => current === item ? null : item)}>{item}</button>)}</div></section>
    <section className="reference-recipes" id="content" aria-labelledby="popular-title">
      <div className="mini-heading"><h2 id="popular-title">המועדפים שלי</h2><Link href="/recipes">הצג הכל</Link></div>
      {filtered.length ? <div className="recipe-grid">{filtered.map((recipe) => {
        const favorite = favorites.includes(recipe.id);
        return <article className="recipe-card" key={recipe.id}>
          <div className="recipe-visual"><Image className="recipe-photo" src={recipe.image} alt={`צילום של ${recipe.title}`} fill sizes="(max-width: 759px) 42vw, 300px" /></div>
          <button className={`favorite-button ${favorite ? "is-favorite" : ""}`} type="button" aria-label={favorite ? `הסירי את ${recipe.title} מהמועדפים` : `הוסיפי את ${recipe.title} למועדפים`} aria-pressed={favorite} onClick={() => setFavorites((current) => favorite ? current.filter((id) => id !== recipe.id) : [...current, recipe.id])}><Icon name="heart" size={21} /></button>
          <div className="recipe-info"><h3>{recipe.title}</h3><span><Icon name="clock" size={16} />{recipe.time}</span></div>
        </article>;
      })}</div> : <div className="empty-state"><Icon name="search" size={28} /><p>לא מצאנו מתכון שמתאים לחיפוש הזה.</p><button className="text-button" type="button" onClick={() => { setQuery(""); setCategory(null); }}>ניקוי חיפוש</button></div>}
    </section>

  </main>;
}
