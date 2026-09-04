---
project: Smart Recipe Web App
version: 0.1.0
status: in_progress
current_phase: foundation
last_updated: 2026-09-04
updated_by: codex-orchestrator
---

# PROJECT.md - אפליקציית המתכונים

> סביבת פיתוח ראשית: Codex. הוראות העבודה הקבועות נמצאות ב-`AGENTS.md`, שנקרא אוטומטית בתחילת העבודה. קובץ זה מכיל מצב משתנה בלבד ואינו משכפל הוראות מפורטות.

## 1. מטרת הפרויקט

לבנות ספר מתכונים חכם כ-Web App רספונסיבי על Vercel, המותאם לטלפון ולטאבלט ונתמך גם במחשב. המערכת תרכז מתכונים מצילום, קישורים והזנה ידנית, ותאפשר עריכה, חיפוש, בישול, שיתוף וסנכרון באמצעות Supabase.

## 2. מקור האמת

- אפיון המוצר המלא: `recipe-app-full-spec-he.md`.
- הוראות Codex קצרות ומחייבות: `AGENTS.md`.
- קובץ זה מנהל את מצב הבנייה, הסוכנים, ההחלטות, הבדיקות והפריסות.
- `README.md` יכיל הוראות התקנה והפעלה למפתחים.
- במקרה של סתירה, החלטה מאושרת ומתוארכת ב-`PROJECT.md` גוברת על מידע ישן, ויש לעדכן גם את האפיון.

## 3. היקף הגרסה הנוכחית

### כלול

- Next.js Web App על Vercel.
- ממשק עברי RTL רספונסיבי לטלפון ולטאבלט.
- PWA בסיסי והוספה למסך הבית.
- Supabase Auth, PostgreSQL, Storage ו-RLS.
- יצירה, צפייה, עריכה ומחיקת מתכונים.
- קטגוריות, תגיות, מרכיבים, שלבים, תמונות ושדות אישיים.
- צילום/העלאת מתכון, OCR ומסך אימות.
- ייבוא מתכון מ-URL.
- חיפוש ופילטרים.
- מצב בישול, התאמת מנות וטיימרים.
- טיוטות מקומיות וסנכרון בסיסי.
- היסטוריית גרסאות ושחזור.
- בדיקות Unit, Integration ו-Playwright E2E.

### לא כלול ב-MVP

- אפליקציות Native או קובצי APK/IPA.
- Offline מלא לכל המידע.
- Web Push מלא.
- שליטה קולית.
- המלצות AI מתקדמות ותכנון ארוחות אוטומטי.

## 4. סטאק מאושר

| תחום | טכנולוגיה |
|---|---|
| Framework | Next.js App Router |
| Frontend | React + TypeScript |
| עיצוב | Tailwind CSS + shadcn/ui + Radix UI |
| תכנון UI | UI/UX Pro Max, RTL ו-Responsive |
| Backend | Supabase |
| Hosting | Vercel |
| Forms | React Hook Form + Zod |
| Local data | IndexedDB + Dexie |
| Unit/Component | Vitest + React Testing Library |
| E2E | Playwright |
| נגישות | axe-core + בדיקות ידניות |
| ניטור | Vercel Observability + Sentry + Supabase Logs |

## 5. כללי ארכיטקטורה

- Server Components הם ברירת המחדל.
- Client Components משמשים רק לאינטראקציה בדפדפן.
- רכיבי UI אינם פונים ישירות ל-Supabase.
- כל גישה לנתונים עוברת דרך repository/service מאומת.
- OCR ו-AI נקראים רק מהשרת, דרך שכבת ספקים אחידה.
- תהליכים ארוכים מנוהלים כ-jobs אסינכרוניים.
- RLS מופעלת ונבדקת בכל טבלה חשופה.
- אין לשמור access tokens או סודות ב-`localStorage`.
- שינוי DB מתבצע רק באמצעות migration חדש.

## 6. מבנה תיקיות מתוכנן

```text
app/          routes, layouts, server actions, route handlers
components/   shared UI and responsive layout
features/     domain modules
lib/          Supabase clients, repositories, services, validation
public/       icons, manifest assets, service worker, offline fallback
supabase/     migrations, functions, tests, seed
tests/        unit, integration, e2e
docs/         decisions, progress, test matrix, responsive contract
```

## 7. מסכים ונתיבים

| מסך | נתיב | טלפון | טאבלט | סטטוס |
|---|---|---|---|---|
| בית | `/` | עמודה אחת | אזורים מקבילים | pending |
| כניסה | `/login` | מסך מלא | כרטיס ממורכז | pending |
| מתכונים | `/recipes` | רשימה/Grid | רשימה + פרטים | pending |
| מתכון | `/recipes/[id]` | מסך מלא | Master-Detail | pending |
| עריכה | `/recipes/[id]/edit` | טופס מדורג | טופס + Preview | pending |
| מצב בישול | `/recipes/[id]/cook` | שלב אחד | מרכיבים + שלב + טיימרים | pending |
| חיפוש | `/search` | פילטרים ב-drawer | פילטרים קבועים | pending |
| צילום | `/import/photo` | מצלמה/גלריה | מקור + תוצאה | pending |
| ייבוא URL | `/import/url` | טופס + Preview | שתי עמודות | pending |
| קניות | `/shopping` | רשימה | עמודות קטגוריה | future |
| תכנון | `/meal-plans` | ימים בגלילה | שבוע מלא | future |

## 8. Supabase

### טבלאות ליבה

`profiles`, `households`, `household_members`, `recipes`, `recipe_versions`, `ingredient_groups`, `ingredients`, `recipe_ingredients`, `recipe_steps`, `categories`, `recipe_categories`, `tags`, `recipe_tags`, `recipe_images`, `custom_field_definitions`, `recipe_custom_values`, `favorites`, `collections`, `collection_recipes`, `import_jobs`, `audit_log`.

### Storage

- bucket פרטי לתמונות וקובצי מקור.
- נתיב: `households/{householdId}/recipes/{recipeId}/{file}`.
- גישה רק באמצעות session והרשאות RLS/Storage policy.

### תפקידי שיתוף

- `owner`: ניהול מלא והרשאות.
- `editor`: יצירה ועריכה.
- `viewer`: צפייה בלבד.

## 9. משתני סביבה

שמות בלבד. אסור להכניס ערכים או סודות לקובץ זה או ל-Git.

```text
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER_OPENAI_API_KEY=
AI_PROVIDER_ANTHROPIC_API_KEY=
AI_PROVIDER_GOOGLE_API_KEY=
OCR_PROVIDER_API_KEY=
CRON_SECRET=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

יש לייצר `.env.example` עם ערכים ריקים. סודות יישמרו רק ב-Vercel Environment Variables או Supabase Secrets.

### בחירת ספק AI ו-OCR

- בעל החשבון בוחר בהגדרות ספק ומודל מתוך ספקים שהוגדרו מראש על ידי מנהל המערכת; לא מוצגים מפתחות API למשתמש.
- היישום מתחיל עם OpenAI, אך שכבת `ai-provider` מאפשרת הוספת Anthropic, Google או ספק תואם אחר ללא שינוי במסכי הייבוא.
- ספק OCR נבחר בנפרד, עם אפשרות לבחור ספק משולב AI כאשר הוא מוגדר. בחירת ברירת המחדל נשמרת עבור ה-household.
- כל `import_job` מתעד את ספק ה-OCR, ספק ומודל ה-AI, גרסת ה-prompt ומצב העיבוד לצורכי שקיפות, אבחון ושחזור.
- תמונה או טקסט נשלחים רק לספק שהמשתמש בחר לאחר הצגת הודעת פרטיות; תוצאת OCR/AI היא תמיד טיוטה המחייבת אישור אנושי.

## 10. פקודות עבודה

הפקודות יתווספו ל-`package.json` ויעודכנו כאן אם יש שינוי:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:e2e
npm run build
npm run project:check
```

פקודות תשתית:

```bash
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max
npx supabase start
npx supabase db reset
npx supabase gen types typescript
npx vercel
npx vercel --prod
```

## 11. חלוקת עבודה בין סוכנים

| סוכן | אחריות | בעלות עיקרית | סטטוס |
|---|---|---|---|
| orchestrator | תכנון, contracts, אינטגרציה ו-Gates | `PROJECT.md`, backlog | active |
| agent-responsive-ui | Design System, טלפון, טאבלט ו-RTL | `components/`, UI routes | pending |
| agent-web-pwa | Next.js shell, routing, manifest ו-IndexedDB | platform files | pending |
| agent-supabase | schema, migrations, RLS, Auth ו-Storage | `supabase/`, `lib/supabase/` | pending |
| agent-import-ai | OCR, URL import ו-jobs | import feature | pending |
| agent-search-sync | search, Dexie, Outbox ו-conflicts | search/sync feature | pending |
| agent-qa-security | tests, security, accessibility ו-performance | `tests/` | pending |
| agent-integration | configs, CI, Vercel ו-merge | shared config | pending |

כללים:

- כל סוכן קורא את `PROJECT.md` לפני תחילת עבודה.
- אין לשני סוכנים בעלות על אותו קובץ במקביל.
- כל סוכן עובד בענף וב-worktree נפרדים.
- הסוכן מדווח קבצים ששונו, בדיקות, תוצאות וחסימות.
- רק orchestrator או integration מעדכנים קובץ זה וממזגים לענף משותף.

## 12. Backlog ומעקב

סטטוסים מותרים: `pending`, `in_progress`, `blocked`, `review`, `completed`.

| ID | משימה | אחראי | סטטוס | תלות | בדיקת קבלה | תוצאה |
|---|---|---|---|---|---|---|
| SETUP-001 | התקנה ואימות `ui-ux-pro-max` | orchestrator | pending | - | skill מופיע וזמין ל-Codex | - |
| FND-001 | יצירת Next.js shell | agent-web-pwa | in_progress | - | build + responsive smoke | `lint` ו-TypeScript עברו; build ממתין לשחרור נעילת שרת הפיתוח. |
| FND-002 | Design System RTL באמצעות `ui-ux-pro-max` | agent-responsive-ui | in_progress | SETUP-001, FND-001 | visual + axe | נבנו בית, ספרייה, יצירה, OCR, בישול, תכנון ופרופיל; נדרשת בדיקת viewport ו-axe. |
| DB-001 | סכמת Supabase ראשונית | agent-supabase | pending | - | migration from zero | - |
| SEC-001 | RLS לכל טבלאות הליבה | agent-supabase | pending | DB-001 | two-user RLS tests | - |
| AUTH-001 | Supabase SSR Auth | agent-supabase | pending | FND-001 | login/session E2E | - |
| REC-001 | CRUD מתכונים | unassigned | pending | DB-001, AUTH-001 | CRUD integration | - |
| IMP-001 | העלאת תמונה ו-job | agent-import-ai | pending | REC-001 | upload/import E2E | - |
| IMP-002 | שכבת ספקי AI/OCR ובחירת ספק | agent-import-ai | pending | IMP-001, DB-001 | provider selection + fallback + audit tests | - |
| QA-001 | CI ו-Preview checks | agent-integration | pending | FND-001 | required checks pass | - |

משימה תסומן `completed` רק לאחר תיעוד תוצאת הבדיקה.

## 13. Quality Gates

### לפני Merge

- build, lint, TypeScript ובדיקות רלוונטיות עוברים.
- Preview נבדק ברוחב טלפון וטאבלט.
- אין סוד בקוד או בלוגים.
- בוצעה סקירת סוכן נוסף.
- `npm run project:check` עובר.

### לפני Production

- 100% מהתרחישים הקריטיים עוברים.
- RLS מאומתת לכל תפקיד.
- Playwright, axe ו-Lighthouse עברו.
- אין תקלות קריטיות או גבוהות ידועות.
- backup, restore ו-rollback נוסו.
- ניטור והתראות פעילים.
- התקבל אישור בעל המוצר.

## 14. Definition of Done

- הקוד וה-UI תואמים לאפיון.
- בדיקות מתאימות קיימות ועוברות.
- התצוגה נבדקה בטלפון ובטאבלט.
- RTL, נגישות, Offline ושגיאות נבדקו.
- contracts, migrations ותיעוד עודכנו.
- Vercel Deployment Checks עברו.
- `PROJECT.md` עודכן בתוצאה ובצעד הבא.

## 15. פריסות

| סביבה | כתובת | Supabase | גרסה | מצב | נבדק בתאריך |
|---|---|---|---|---|---|
| Local | `http://localhost:3000` | local | - | not_started | - |
| Preview | יתווסף | test/preview | - | not_started | - |
| Staging | יתווסף | staging | - | not_started | - |
| Production | יתווסף | production | - | not_started | - |

## 16. החלטות טכניות

| תאריך | החלטה | סיבה | השפעה |
|---|---|---|---|
| 2026-09-04 | Web במקום Native | כניסה מכל טלפון וטאבלט דרך URL ופריסה ב-Vercel | Next.js/PWA במקום Expo |
| 2026-09-04 | Supabase כמקור אמת | סנכרון, Auth, DB, Storage ו-RLS במקום אחד | כל מידע קבוע נשמר ב-Supabase |
| 2026-09-04 | PROJECT.md מחייב | רציפות בין סוכנים ותיעוד בדיקות | מתעדכן בכל שלב, Merge ופריסה |
| 2026-09-04 | Codex + AGENTS.md | חיסכון בטוקנים והוראות אוטומטיות ממוקדות | Codex קורא AGENTS.md; האפיון נטען לפי צורך בלבד |
| 2026-09-04 | התקנת UI/UX Pro Max | שימוש בסקיל המבוקש לפני בניית הממשק | Codex מתקין ומאמת באמצעות פקודת `npx skills add` |
| 2026-09-04 | ספקי AI/OCR ניתנים לבחירה | בחירת ספק/מודל מתוך ספקים מוגדרים, ללא חשיפת מפתחות | שכבת ספקים, תיעוד job ואישור משתמש לפני שמירה |

## 17. סיכונים וחסימות

| ID | תיאור | חומרה | אחראי | טיפול |
|---|---|---|---|---|
| RISK-001 | הבדלים במצלמה/PWA בין דפדפנים | medium | agent-web-pwa | feature detection ו-file upload fallback |
| RISK-002 | OCR לא מדויק בכתב יד | high | agent-import-ai | confidence, review ואישור ידני |
| RISK-003 | אובדן טיוטה בניתוק | high | agent-search-sync | IndexedDB, autosave ו-Outbox |
| RISK-004 | הרשאות נתונים שגויות | critical | agent-supabase | RLS tests עם שני משתמשים ותפקידים |

## 18. מצב נוכחי והצעד הבא

- מצב: Foundation בבנייה.
- הושלם: Next.js shell, PWA manifest ושכבת UI עם נתיבים לבית, ספרייה, יצירה, OCR, בישול, תכנון ופרופיל.
- הבא: בדיקה חזותית בטלפון ובטאבלט, ואז חיבור Supabase Auth/Database/Storage ויישום OCR מול ספקים מוגדרים.
- חסימות נוכחיות: טרם נבחר שם מסחרי, דומיין ורשימת ספקי AI/OCR שיוגדרו בגרסת ההשקה.

## 19. היסטוריית שינויים

| תאריך | גרסה | שינוי | בדיקות | מבצע |
|---|---|---|---|---|
| 2026-09-04 | 0.1.0 | יצירת קובץ ניהול הפרויקט | מבנה ותוכן נבדקו ידנית | orchestrator |
| 2026-09-04 | 0.1.1 | מעבר ל-Codex והוספת AGENTS.md חסכוני | בדיקת קישורים והוראות | codex-orchestrator |
| 2026-09-04 | 0.1.2 | הוספת בחירת ספקי AI/OCR ותיעוד עקרונות אבטחה | בדיקת עקביות אפיון ידנית | codex-orchestrator |
| 2026-09-04 | 0.1.2 | הוספת התקנת `ui-ux-pro-max` כשלב Setup מחייב | הפקודה וה-dependency נבדקו במסמכים | codex-orchestrator |
| 2026-09-04 | 0.1.3 | התחלת בניית Next.js ומסך בית RTL | `npm run lint`, `tsc --noEmit --incremental false`, preview מקומי | codex |
| 2026-09-04 | 0.1.4 | השלמת שכבת UI מרכזית ו-PWA manifest | lint, TypeScript וכל נתיבי ה-UI מחזירים 200 מקומית | codex |

## 20. מדיניות עדכון

- מעדכנים בתחילת ובסיום כל שלב.
- מעדכנים לפני ואחרי Merge או Deployment.
- החלטה ארכיטקטונית נרשמת לפני מימוש.
- חסימה נרשמת מיד.
- בסוף כל סשן נרשמים מצב, הצעד הבא, בדיקות שנכשלו וקבצים מרכזיים ששונו.
- אסור למחוק היסטוריית החלטות; החלטה חדשה מסומנת כמחליפה החלטה קודמת.
- אין להכניס מפתחות, tokens, סיסמאות או מידע אישי.
