"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { createRecipe } from "@/lib/actions/recipes";
import { DietFieldControl, type DietOverride } from "@/components/recipes/diet-field-control";
import { IngredientPicker } from "@/components/recipes/ingredient-picker";
import { parseIngredientLine } from "@/lib/ingredients";

function appendIngredient(current: string, name: string): string {
  const trimmed = current.replace(/\s+$/, "");
  return trimmed ? `${trimmed}\n${name}` : name;
}

type SourceMetadata = {
  sourceKind: string;
  sourceUrl: string | null;
  title: string | null;
  author: string | null;
  thumbnailUrl: string | null;
  requiredAudioTranscription: boolean;
  transcriptChars: number;
};

type ExtractedRecipe = {
  title: string;
  description?: string | null;
  category?: string | null;
  servings?: number | null;
  prep_minutes?: number | null;
  cook_minutes?: number | null;
  ingredients: string[];
  steps: string[];
  provider?: string;
  sourceMetadata?: SourceMetadata;
};

type Mode = "url" | "file";

const MAX_UPLOAD_MB = 25;

export default function ImportVideoPage() {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<"input" | "loading" | "review">("input");
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<ExtractedRecipe | null>(null);
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dietOverride, setDietOverride] = useState<DietOverride>("auto");
  const fileRef = useRef<HTMLInputElement>(null);

  const ingredientNames = useMemo(
    () => ingredients.split("\n").map((l) => l.trim()).filter(Boolean),
    [ingredients],
  );

  const canSubmit = mode === "url" ? url.trim().length > 0 : !!file;

  async function handleExtract(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setStage("loading");

    try {
      const form = new FormData();
      if (mode === "url") form.append("url", url.trim());
      else if (file) form.append("file", file, file.name);

      const res = await fetch("/api/import-video", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        // NO_CAPTIONS is a soft error — invite the user to upload the file.
        if (data?.code === "NO_CAPTIONS") {
          setMode("file");
          setError(data.error || "אין כתוביות. אפשר להעלות קובץ אודיו/וידאו במקום.");
        } else {
          setError(data?.error || `שגיאה ${res.status}`);
        }
        setStage("input");
        return;
      }

      const extracted = data as ExtractedRecipe;
      setRecipe(extracted);
      setTitle(extracted.title || extracted.sourceMetadata?.title || "");
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
        .map(parseIngredientLine);

      const stepItems = steps
        .split("\n")
        .map((l) => l.trim().replace(/^\d+[.)]\s*/, ""))
        .filter(Boolean)
        .map((body) => ({ title: "", body, durationSeconds: null }));

      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", recipe?.description ?? "");
      if (recipe?.category) fd.append("category", recipe.category);
      if (recipe?.prep_minutes != null) fd.append("prepTime", String(recipe.prep_minutes));
      if (recipe?.cook_minutes != null) fd.append("cookTime", String(recipe.cook_minutes));
      if (recipe?.servings != null) fd.append("servings", String(recipe.servings));
      fd.append("ingredientsJson", JSON.stringify(ingredientItems));
      fd.append("stepsJson", JSON.stringify(stepItems));
      fd.append("isDietOverride", dietOverride);

      // If the source gave us a thumbnail URL, ship it as the initial primary image.
      if (recipe?.sourceMetadata?.thumbnailUrl) {
        fd.append("imageUrl", recipe.sourceMetadata.thumbnailUrl);
      }
      // Attribution — channel becomes author, YouTube (or filename) becomes source.
      if (recipe?.sourceMetadata?.author) {
        fd.append("author", recipe.sourceMetadata.author);
      }
      if (recipe?.sourceMetadata?.sourceKind === 'youtube') {
        fd.append("sourceName", "YouTube");
      }
      if (recipe?.sourceMetadata?.sourceUrl) {
        fd.append("sourceUrl", recipe.sourceMetadata.sourceUrl);
      }

      const result = await createRecipe(null, fd);
      if (result?.error) setSaveError(result.error);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("NEXT_REDIRECT")) setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  function onPickFile(files: FileList | null) {
    const f = files?.[0] ?? null;
    if (!f) return;
    if (f.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`הקובץ גדול מדי (${(f.size / 1024 / 1024).toFixed(1)}MB). מקסימום ${MAX_UPLOAD_MB}MB.`);
      return;
    }
    setError(null);
    setFile(f);
  }

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <Link href="/import" className="back-link">← הוספת מתכון</Link>
        <p className="eyebrow">ייבוא מוידאו</p>
        <h1>מוידאו לביצה על הצלחת</h1>
        <p>הדביקי קישור ליוטיוב, או העלי קובץ אודיו/וידאו — ה־AI יזהה את המרכיבים והשלבים.</p>
      </header>

      {stage === "input" && (
        <div className="import-layout">
          <div className="upload-panel">
            <div style={{ display: "flex", gap: 6, background: "#f3ece0", padding: 4, borderRadius: 12, marginBottom: 18 }}>
              <button
                type="button"
                onClick={() => { setMode("url"); setError(null); }}
                style={tabStyle(mode === "url")}
              >
                🔗 קישור YouTube
              </button>
              <button
                type="button"
                onClick={() => { setMode("file"); setError(null); }}
                style={tabStyle(mode === "file")}
              >
                🎙️ קובץ אודיו/וידאו
              </button>
            </div>

            <form onSubmit={handleExtract} style={{ display: "grid", gap: 14 }}>
              {mode === "url" ? (
                <label htmlFor="video-url" style={{ fontWeight: 800 }}>
                  קישור לסרטון
                  <input
                    id="video-url"
                    type="url"
                    inputMode="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    dir="ltr"
                    style={inputStyle}
                  />
                  <span style={{ display: "block", marginTop: 6, fontSize: ".85rem", color: "var(--muted)" }}>
                    תומך ב-YouTube (כולל Shorts). אם לסרטון אין כתוביות בעברית או באנגלית, נציע לך להעלות קובץ.
                  </span>
                </label>
              ) : (
                <div>
                  <label htmlFor="video-file" style={{ fontWeight: 800, display: "block", marginBottom: 8 }}>
                    קובץ אודיו/וידאו (עד {MAX_UPLOAD_MB}MB)
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
                    style={{
                      border: "2px dashed #cfbfae",
                      borderRadius: 16,
                      padding: 22,
                      textAlign: "center",
                      background: file ? "#eaf1e3" : "#fdf9f4",
                      cursor: "pointer",
                      minHeight: 130,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {file ? (
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>✓ {file.name}</div>
                        <div style={{ fontSize: ".85rem", color: "var(--muted)" }}>
                          {(file.size / 1024 / 1024).toFixed(2)}MB · לחצי לבחירה אחרת
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 32, marginBottom: 4 }}>🎙️</div>
                        <div style={{ fontWeight: 700 }}>לחצי לבחירת קובץ</div>
                        <div style={{ fontSize: ".85rem", color: "var(--muted)", marginTop: 4 }}>
                          MP3 · MP4 · M4A · WAV · WebM
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileRef}
                      id="video-file"
                      type="file"
                      accept="audio/*,video/*"
                      onChange={(e) => onPickFile(e.target.files)}
                      hidden
                    />
                  </div>
                  <span style={{ display: "block", marginTop: 6, fontSize: ".85rem", color: "var(--muted)" }}>
                    התמלול נעשה עם Whisper של OpenAI. עלות: כ־1 סנט לדקה של אודיו.
                  </span>
                </div>
              )}

              {error && (
                <div role="alert" style={{ padding: 12, borderRadius: 12, background: "#fdecea", color: "#8a1c14", fontSize: ".9rem" }}>
                  {error}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="submit" className="primary-button" disabled={!canSubmit}>חילוץ מתכון</button>
                <Link href="/import" className="outline-button">ביטול</Link>
              </div>
            </form>
          </div>

          <aside className="provider-card">
            <div style={{ minHeight: 180, border: "2px dashed #cfbfae", borderRadius: 16, display: "grid", placeItems: "center", color: "var(--muted)", background: "#fdf9f4" }}>
              <span style={{ textAlign: "center", fontSize: ".9rem", padding: 12 }}>
                🎬 YouTube / 🎙️ אודיו<br />
                → תמלול<br />
                → AI מחלץ מתכון
              </span>
            </div>
            <h2 style={{ marginTop: 20 }}>איך זה עובד</h2>
            <p>
              ליוטיוב אני קורא את הכתוביות (חינם). לקובץ אודיו/וידאו — Whisper מתמלל אותו לעברית. בשני המקרים ה־AI קורא את הטקסט ומזהה שם, מרכיבים ושלבים.
            </p>
            <p className="privacy-note" style={{ marginTop: 12 }}>
              הכתובת/הקובץ נשלחים לספק ה־AI הפעיל שלך. תמונת ה-thumbnail של הסרטון תוצמד אוטומטית כתמונה ראשית.
            </p>
          </aside>
        </div>
      )}

      {stage === "loading" && (
        <div className="import-layout">
          <div className="upload-panel" style={{ textAlign: "center" }}>
            <svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ display: "block", margin: "0 auto 10px", animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <h2>מתמלל ומחלץ…</h2>
            <p style={{ color: "var(--muted)" }}>
              {mode === "url" ? "מוריד כתוביות ומזהה מרכיבים ושלבים." : "Whisper מתמלל. זה יכול לקחת 10–30 שניות תלוי באורך."}
            </p>
          </div>
        </div>
      )}

      {stage === "review" && recipe && (
        <section className="review-layout">
          <div className="source-preview">
            {recipe.sourceMetadata?.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={recipe.sourceMetadata.thumbnailUrl}
                alt=""
                style={{ width: "100%", borderRadius: 14, aspectRatio: "16/9", objectFit: "cover" }}
              />
            ) : (
              <div style={{ padding: 20, border: "2px dashed #cfbfae", borderRadius: 14, textAlign: "center", background: "#fdf9f4" }}>
                🎙️ תמלול מקובץ שהעלית
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: ".85rem", color: "var(--muted)" }}>
              {recipe.sourceMetadata?.author && <>מאת: <strong>{recipe.sourceMetadata.author}</strong> · </>}
              {recipe.sourceMetadata?.transcriptChars != null && (
                <>{recipe.sourceMetadata.transcriptChars.toLocaleString("he")} תווים בתמלול</>
              )}
              {recipe.sourceMetadata?.requiredAudioTranscription && <> · <span style={{ color: "#7A1F2B" }}>Whisper</span></>}
            </div>
          </div>

          <form className="review-form" onSubmit={(e) => e.preventDefault()}>
            <div className="review-status">
              <span>טיוטה מוכנה לבדיקה</span>
              {recipe.provider && <small>עובד עם {recipe.provider}</small>}
            </div>
            <label>שם המתכון
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
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
            <IngredientPicker onPick={(name) => setIngredients((v) => appendIngredient(v, name))} />
            <label>שלבי הכנה
              <textarea rows={8} value={steps} onChange={(e) => setSteps(e.target.value)} />
            </label>
            <DietFieldControl
              title={title}
              ingredientNames={ingredientNames}
              override={dietOverride}
              onOverrideChange={setDietOverride}
            />
            {saveError && (
              <div role="alert" style={{ padding: 12, borderRadius: 12, background: "#fdecea", color: "#8a1c14", fontSize: ".9rem" }}>
                {saveError}
              </div>
            )}
            <div className="review-actions">
              <button className="outline-button" type="button" onClick={reset} disabled={saving}>ייבוא סרטון אחר</button>
              <button className="primary-button" type="button" onClick={handleSave} disabled={saving || !title.trim()}>
                {saving ? "שומר…" : "אישור ושמירה"}
              </button>
            </div>
            <p style={{ margin: 0, fontSize: ".8rem", color: "var(--muted)" }}>
              לאחר השמירה תועברי לעמוד המתכון, שם יש כפתור עריכה.
            </p>
          </form>
        </section>
      )}
    </main>
  );
}

// ── local style helpers ───────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 8,
  border: "1px solid #cfbfae",
  borderRadius: 12,
  padding: "12px 14px",
  background: "#fffdfa",
  fontSize: ".95rem",
  fontFamily: "inherit",
  minHeight: 46,
};

function tabStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: ".9rem",
    background: active ? "#fff" : "transparent",
    color: active ? "var(--ink, #171717)" : "var(--muted, #525252)",
    boxShadow: active ? "0 2px 6px rgba(0,0,0,.06)" : "none",
    transition: "all .15s ease",
  };
}
