"use client";

import Link from "next/link";
import { useState } from "react";
import { createRecipe } from "@/lib/actions/recipes";
import { CATEGORIES, isCategoryId, type CategoryId } from "@/lib/categories";

type ImportResult = {
  title: string;
  description?: string | null;
  category?: string | null;
  servings?: number | null;
  prep_minutes?: number | null;
  cook_minutes?: number | null;
  ingredients: string[];
  steps: string[];
  provider?: string;
  source_url: string;
  source_site?: string;
  image_url?: string;
  method: "json-ld" | "ai";
};

export default function ImportUrlPage() {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<"input" | "loading" | "review">("input");
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<ImportResult | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryId | "">("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setError(null);
    setStage("loading");
    try {
      const res = await fetch("/api/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('[import-url response]', res.status, data);
        const details = data.candidateIds ? ` (ספקים שנוסו: ${data.candidateIds.join(", ")})` : "";
        throw new Error((data.error || `שגיאה ${res.status}`) + details);
      }
      const extracted = data as ImportResult;
      setRecipe(extracted);
      setTitle(extracted.title || "");
      setDescription(extracted.description || "");
      setCategory(isCategoryId(extracted.category) ? extracted.category : "");
      setIngredients((extracted.ingredients || []).join("\n"));
      setSteps((extracted.steps || []).map((s, i) => `${i + 1}. ${s}`).join("\n"));
      setStage("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStage("input");
    }
  }

  function reset() {
    setRecipe(null);
    setError(null);
    setSaveError(null);
    setStage("input");
  }

  async function handleSave() {
    setSaveError(null);
    setSaving(true);
    try {
      const ingredientItems = ingredients
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => ({ name: line, amount: "", unit: "" }));

      const stepItems = steps
        .split("\n")
        .map((l) => l.trim().replace(/^\d+[\.\)]\s*/, ""))
        .filter(Boolean)
        .map((body) => ({ title: "", body, durationSeconds: null }));

      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      if (category) fd.append("category", category);
      if (recipe?.prep_minutes != null) fd.append("prepTime", String(recipe.prep_minutes));
      if (recipe?.cook_minutes != null) fd.append("cookTime", String(recipe.cook_minutes));
      if (recipe?.servings != null) fd.append("servings", String(recipe.servings));
      fd.append("ingredientsJson", JSON.stringify(ingredientItems));
      fd.append("stepsJson", JSON.stringify(stepItems));
      if (recipe?.image_url) fd.append("imageUrl", recipe.image_url);

      const result = await createRecipe(null, fd);
      if (result?.error) setSaveError(result.error);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("NEXT_REDIRECT")) setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <Link href="/import" className="back-link">← הוספת מתכון</Link>
        <p className="eyebrow">ייבוא מקישור</p>
        <h1>ייבוא מכתובת אתר</h1>
        <p>הדביקי קישור למתכון — נחלץ את כל הפרטים, ותוכלי לבדוק ולערוך לפני השמירה.</p>
      </header>

      {stage === "input" && (
        <div className="import-layout">
          <div className="upload-panel">
            <form onSubmit={handleFetch} style={{ display: "grid", gap: 14 }}>
              <label htmlFor="recipe-url" style={{ fontWeight: 800 }}>
                כתובת URL של המתכון
                <input
                  id="recipe-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.example.com/recipe/..."
                  style={{
                    display: "block",
                    width: "100%",
                    minHeight: 54,
                    marginTop: 8,
                    border: "1px solid #cfbfae",
                    borderRadius: 12,
                    padding: "0 14px",
                    background: "#fffdfa",
                    fontSize: "1rem",
                    direction: "ltr",
                    textAlign: "left",
                  }}
                />
              </label>
              {error && (
                <div role="alert" style={{ padding: 14, borderRadius: 12, background: "#fdecea", color: "#8a1c14", fontSize: ".9rem", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  <strong style={{ display: "block", marginBottom: 6 }}>הייבוא נכשל:</strong>
                  {error}
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(error); }}
                    style={{ marginTop: 10, padding: "6px 12px", fontSize: ".8rem", borderRadius: 8, border: "1px solid #8a1c14", background: "transparent", color: "#8a1c14", cursor: "pointer" }}
                  >
                    העתק הודעת שגיאה
                  </button>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="submit" className="primary-button" disabled={!url.trim()}>חילוץ מתכון</button>
                <Link href="/import" className="outline-button">ביטול</Link>
              </div>
            </form>
          </div>

          <aside className="provider-card">
            <div style={{ minHeight: 180, border: "2px dashed #cfbfae", borderRadius: 16, display: "grid", placeItems: "center", color: "var(--muted)", background: "#fdf9f4" }}>
              <span style={{ textAlign: "center", fontSize: ".9rem" }}>תצוגה מקדימה<br />תופיע כאן</span>
            </div>
            <h2 style={{ marginTop: 20 }}>ייבוא חכם</h2>
            <p>מזהים קודם JSON-LD סטנדרטי של מתכונים, ואם אין — משתמשים ב־AI לחילוץ מהטקסט.</p>
          </aside>
        </div>
      )}

      {stage === "loading" && (
        <div className="import-layout">
          <div className="upload-panel" style={{ textAlign: "center" }}>
            <svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ display: "block", margin: "0 auto 10px", animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <h2>מוצא ומחלץ את המתכון…</h2>
            <p style={{ color: "var(--muted)" }}>קורא את הדף ומזהה מרכיבים ושלבים.</p>
          </div>
        </div>
      )}

      {stage === "review" && recipe && (
        <section className="review-layout">
          <div className="source-preview">
            {recipe.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={recipe.image_url} alt="תמונת מקור" style={{ width: "100%", borderRadius: 12, objectFit: "cover", maxHeight: 320 }} />
            ) : (
              <div className="paper-preview">
                <p>{recipe.title}</p>
                <span>{recipe.source_site || recipe.source_url}</span>
              </div>
            )}
            <p>מקור: <a href={recipe.source_url} target="_blank" rel="noreferrer" style={{ direction: "ltr", unicodeBidi: "isolate" }}>{recipe.source_site || recipe.source_url}</a></p>
          </div>

          <form className="review-form" onSubmit={(e) => e.preventDefault()}>
            <div className="review-status">
              <span>טיוטה מוכנה לבדיקה</span>
              <small>שיטה: {recipe.method === "json-ld" ? "schema.org (JSON-LD)" : `AI (${recipe.provider ?? ""})`}</small>
            </div>
            <label>שם המתכון
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>תיאור (אפשר להשאיר ריק)
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="תיאור קצר של המתכון…"
              />
            </label>
            <label>קטגוריה
              <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId | "")}>
                <option value="">בחרי קטגוריה…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.id}</option>
                ))}
              </select>
            </label>
            {(recipe.prep_minutes != null || recipe.cook_minutes != null || recipe.servings != null) && (
              <p style={{ margin: 0, fontSize: ".85rem", color: "var(--muted)" }}>
                {recipe.prep_minutes != null && <>הכנה: {recipe.prep_minutes} דק׳ · </>}
                {recipe.cook_minutes != null && <>בישול: {recipe.cook_minutes} דק׳ · </>}
                {recipe.servings != null && <>מנות: {recipe.servings}</>}
              </p>
            )}
            <label>מרכיבים
              <textarea rows={8} value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
            </label>
            <label>שלבי הכנה
              <textarea rows={8} value={steps} onChange={(e) => setSteps(e.target.value)} />
            </label>
            {saveError && (
              <div role="alert" style={{ padding: 12, borderRadius: 12, background: "#fdecea", color: "#8a1c14", fontSize: ".9rem" }}>
                {saveError}
              </div>
            )}
            <div className="review-actions">
              <button className="outline-button" type="button" onClick={reset} disabled={saving}>ייבוא מקישור אחר</button>
              <button className="primary-button" type="button" onClick={handleSave} disabled={saving || !title.trim()}>
                {saving ? "שומר…" : "אישור ושמירה"}
              </button>
            </div>
            <p style={{ margin: 0, fontSize: ".8rem", color: "var(--muted)" }}>לאחר השמירה תועברי לעמוד המתכון, שם יש כפתור עריכה.</p>
          </form>
        </section>
      )}
    </main>
  );
}
