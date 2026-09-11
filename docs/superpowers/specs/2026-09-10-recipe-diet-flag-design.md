# Recipe Diet Flag — Design

**Date:** 2026-09-10
**Status:** Approved for planning
**Owner:** claude-code
**Related:** `lib/categories.ts`, `supabase/migrations/0004_recipe_category.sql`, `components/recipes/recipe-form.tsx`, `app/recipes/page.tsx`

## 1. Goal

Let users mark a recipe as **dietetic** (`דיאטטי`) and let the system pre-fill that mark automatically from the recipe's title and ingredients. Users can filter the recipe library to show only dietetic recipes.

## 2. Requirements

- Every recipe carries an effective boolean "is diet" state derived from either:
  - **Auto-detection** — keyword scoring over title + ingredient names, recomputed on every save.
  - **Manual override** — once the user checks or unchecks the box, that value is locked and auto-detection no longer overwrites it.
- The manual override wins forever until the user explicitly resets it back to auto.
- A single filter toggle on the recipes library page shows only dietetic recipes; toggle state is reflected in the URL as `?diet=1`.
- Detection uses two keyword lists (positive and negative) with weighted scoring — no AI calls in v1.

## 3. Non-Goals (v1)

- No visual badge on the recipe card. The library filter is the only surface.
- No AI-based nutritional analysis. Keyword scoring only.
- No `dietary_reason` field explaining *why* a recipe was flagged.
- No separate category tile for "דיאטטי" in the category browser — the primary category (`בשר`, `עוף`, …) is unchanged.

## 4. Data Model

New columns on `recipes` in a new migration `supabase/migrations/0007_recipe_diet.sql`:

```sql
ALTER TABLE recipes ADD COLUMN is_diet_auto     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE recipes ADD COLUMN is_diet_override BOOLEAN;  -- NULL = not locked

-- Partial index for fast filtering on the library page
CREATE INDEX recipes_owner_diet_idx ON recipes (owner_id)
  WHERE COALESCE(is_diet_override, is_diet_auto) = TRUE;

COMMENT ON COLUMN recipes.is_diet_auto IS 'Computed at save time by lib/diet.ts scoreDiet(); overwritten on every update.';
COMMENT ON COLUMN recipes.is_diet_override IS 'User manual choice; NULL means auto-detection is in effect.';
```

**Effective value** (used everywhere for filtering and display):

```
is_diet_effective = COALESCE(is_diet_override, is_diet_auto)
```

Existing RLS on `recipes` already covers the new columns; no policy changes needed.

## 5. Detection Logic — `lib/diet.ts`

New module, pure functions, no I/O:

```ts
export const DIET_POSITIVE_KEYWORDS: string[] = [
  'אפוי', 'בתנור', 'מאודה', 'גריל', 'ללא שמן',
  'דל שומן', 'דל קלוריות', 'לייט', 'טבעוני',
  'כרובית', 'טופו', 'קינואה', 'בטטה',
  'יוגורט 0%', 'קוטג׳ 3%', 'גבינה 5%',
  'אבוקדו', 'סלט', 'ירקות', 'חזה עוף',
]

export const DIET_NEGATIVE_KEYWORDS: string[] = [
  'מטוגן', 'טיגון עמוק', 'שמנת מתוקה', 'מיונז',
  'חמאה', 'מרגרינה', 'שוקולד לבן',
  'קרם פטיסייר', 'בצק עלים',
]

export const DIET_SCORE_THRESHOLD = 2

export function scoreDiet(
  title: string,
  ingredientNames: string[] = []
): { score: number; isDiet: boolean }

export function isDietAuto(title: string, ingredientNames: string[]): boolean
```

Scoring rules:
- Each positive keyword hit anywhere in `title` or any `ingredientNames[i]` adds **+1**.
- Each negative keyword hit subtracts **−2**.
- A keyword matches on lowercased substring inclusion, same as `guessCategory` in `lib/categories.ts` (uses `haystack.includes(keyword.toLowerCase())`).
- Each keyword counts at most once even if it appears multiple times (dedupe by matched keyword to keep behaviour predictable).
- `isDiet = score >= DIET_SCORE_THRESHOLD`.

**"Sugar above 1 cup" is deliberately excluded from v1.** Amounts are stored as free-text (`amount TEXT`), so numeric thresholds are unreliable without parsing. If needed, add later with a dedicated amount parser.

## 6. Server Actions

In `lib/actions/recipes.ts`:

- On **create** (`createRecipe`): compute `is_diet_auto` from the incoming `title` + `ingredients[].name`. Insert with `is_diet_override = NULL` unless the form explicitly sent an override.
- On **update** (`updateRecipe`): recompute `is_diet_auto` from the new title + ingredient names and update it. Update `is_diet_override` **only if the form field for it changed** (see form contract below).

The Zod schema for the recipe form gains one optional field:

```ts
isDietOverride: z.enum(['auto', 'on', 'off']).default('auto')
// 'auto' -> NULL; 'on' -> TRUE; 'off' -> FALSE
```

The repository layer (`lib/repositories/recipes.ts`) selects both columns and exposes `is_diet_effective` as a computed field on the returned row for the UI.

## 7. UI — Recipe Form

**Location:** in `components/recipes/recipe-form.tsx`, directly after the category select.

**Markup (RTL, plain CSS to match existing form):**

```
☑  מתכון דיאטטי
    מסומן אוטומטית לפי המרכיבים — סמן/בטל כדי לנעול
    ננעל • [החזר לזיהוי אוטומטי]         ← visible only when override is locked
```

**State behaviour:**

- Initial state comes from the loaded recipe: `override === null ? 'auto' : (override ? 'on' : 'off')`.
- The checkbox is **controlled** and shows:
  - `is_diet_auto` (live, recomputed from current form fields) when state is `'auto'`.
  - the override value when state is `'on'` / `'off'`.
- First user interaction with the checkbox flips state to `'on'` or `'off'` and displays the "ננעל" hint plus the reset link.
- Clicking "החזר לזיהוי אוטומטי" sets state back to `'auto'`, hides the hint, and the checkbox again mirrors `is_diet_auto`.
- Auto value in the form is computed client-side by calling `scoreDiet` on every relevant change (title / ingredient list) using a lightweight `useMemo`.

**Accessibility:** the checkbox has a visible `<label>`; the hint text uses `aria-describedby` on the input. The reset link is a real `<button type="button">` with focus-visible styling.

## 8. UI — Library Filter (`app/recipes/page.tsx`)

Add a single toggle above the recipe list, aligned with existing category filter controls:

```
[ ] דיאטטי בלבד
```

- Toggle state is stored in the URL search params as `?diet=1`; absence of the param means off. This keeps links shareable and back/forward navigation predictable.
- Server component reads `searchParams.diet` and passes `dietOnly: true` down to the recipes repository query.
- Query in `lib/repositories/recipes.ts` adds when `dietOnly`:
  ```sql
  AND COALESCE(is_diet_override, is_diet_auto) = TRUE
  ```
- Combines cleanly with any existing category filter.

## 9. Testing

**Unit — `lib/diet.test.ts`:**
- Positive-only hit reaches threshold: "חזה עוף בתנור" → `isDiet = true`.
- Negative dominates: "שניצל מטוגן" → `isDiet = false`.
- Score exactly at threshold (score = 2) → `true`.
- Score just below (score = 1) → `false`.
- Same positive keyword repeated in title and ingredients counts once.
- Empty title + empty ingredients → `false`.
- Mixed: "חזה עוף אפוי עם מיונז" — one positive (+1), one negative (−2) → below threshold, `false`.

**Integration — `tests/integration/recipes-diet.test.ts`:**
- Create recipe with dietetic ingredients → row has `is_diet_auto = true`, `is_diet_override = NULL`.
- Update same recipe, user unchecks the box → `is_diet_override = false`, `is_diet_auto` still recomputed to `true`, effective value = `false`.
- Update again with only title change → `is_diet_auto` recomputed, `is_diet_override` untouched.
- Reset override → `is_diet_override = NULL`, effective value returns to auto.

**E2E — `tests/e2e/diet-flag.spec.ts` (Playwright, RTL, phone viewport):**
- Create a recipe with title "סלט קינואה עם אבוקדו", no override → shows up when the "דיאטטי בלבד" toggle is on.
- Uncheck the box manually, save, navigate away and back → recipe no longer appears in the diet filter, and the checkbox is still unchecked on reload with the "ננעל" hint.
- Click "החזר לזיהוי אוטומטי" → checkbox reverts to auto-detected value.

## 10. Rollout

1. Write and run migration `0007_recipe_diet.sql`. All existing rows get `is_diet_auto = FALSE` and `is_diet_override = NULL` — same as if they had never triggered detection. No backfill needed for v1; the values will populate as users edit recipes.
2. Optional one-off backfill (deferred): a SQL statement that recomputes `is_diet_auto` for existing rows by calling a plpgsql helper — not part of v1 unless requested.
3. Ship `lib/diet.ts`, action wiring, form field, library filter, and tests together.

## 11. Open Questions

None outstanding. Design approved by user on 2026-09-10 in the brainstorming session.
