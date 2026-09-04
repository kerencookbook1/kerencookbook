# אפיון מלא - אפליקציית מתכונים חכמה ב-Web

גרסה: 2.0  
ייעוד: מסמך דרישות מלא לבנייה באמצעות Codex עם עבודה מרובת סוכנים  
פלטפורמה: Web App רספונסיבי המאוחסן ב-Vercel  
מכשירי יעד: טלפונים וטאבלטים דרך הדפדפן, עם תמיכה גם במחשב  
שפה ראשית: עברית RTL, עם הכנה לאנגלית

## 1. החלטת המוצר

המוצר ייבנה כאפליקציית Web אחת ולא כאפליקציית Android/iOS נפרדת. המשתמש ייכנס דרך כתובת אינטרנט מאובטחת מכל טלפון או טאבלט. האפליקציה תהיה Responsive ו-Adaptive, ותוכל לפעול גם כ-PWA שניתן להוסיף למסך הבית ולקבל מראה דמוי אפליקציה.

```text
דפדפן בטלפון / טאבלט / מחשב
              ↓
       Next.js Web App
              ↓
 Vercel Hosting + Server Functions
              ↓
 Supabase Auth + Database + Storage + Realtime
              ↓
      OCR / AI דרך שרת מאובטח
```

## 2. חזון ועקרונות מחייבים

ספר מתכונים אישי ומשפחתי שמרכז מתכונים מכל מקור - צילום דף או כרטיסייה, קישור, חיפוש באינטרנט, שיתוף קישור או הזנה ידנית - והופך אותם למידע אחיד, ניתן לעריכה, לחיפוש, לסנכרון ולבישול.

- כל מתכון ניתן לעריכה מלאה, גם אם הגיע מצילום או מאתר.
- המקור נשמר בנפרד מהגרסה האישית ואינו נדרס ללא אישור מפורש.
- נשמרות טיוטות אוטומטיות והיסטוריית גרסאות.
- הנתונים והתמונות נשמרים ב-Supabase.
- הממשק מותאם לכל רוחב מסך ואינו רק מוקטן או מוגדל.
- OCR ו-AI יוצרים טיוטה בלבד; המשתמש בודק ומאשר.
- האפליקציה נפתחת באמצעות URL ואינה דורשת חנות אפליקציות.
- ניתן להתקין אותה כ-PWA במסך הבית, אך היא זמינה גם בדפדפן רגיל.
- יכולת שאינה נתמכת בדפדפן מסוים מקבלת חלופה ברורה.

## 3. קהל יעד ותרחישי חובה

- משתמש פרטי שמרכז מתכונים ממחברות, ספרים ואתרים.
- משפחה שמשתפת ספר מתכונים ורשימת קניות.
- משתמש שמבשל מול טלפון או טאבלט.
- משתמש שמחפש לפי מרכיבים, זמן, סגנון, כשרות או מגבלות תזונתיות.

תרחישים מרכזיים:

1. פתיחת האתר, הרשמה וכניסה מכל דפדפן נתמך.
2. צילום מתכון במצלמת הטלפון או העלאה מהגלריה.
3. חילוץ OCR, תיקון ידני ואישור.
4. ייבוא מתכון מקישור ושמירת המקור.
5. יצירה ועריכה ידנית מלאה.
6. הוספת שדה אישי חדש ללא שינוי קוד.
7. חיפוש ופילטרים, כולל שפה טבעית.
8. מצב בישול, שינוי מספר מנות וטיימרים.
9. התחלת עריכה בטלפון והמשך בטאבלט.
10. עבודה חלקית ללא רשת וסנכרון לאחר החיבור.
11. שיתוף ספר מתכונים משפחתי לפי הרשאות.
12. יצירת רשימת קניות ותכנון ארוחות.

## 4. היקף גרסאות

### MVP - גרסה 1.0

- Web App מלא על Vercel עם דומיין ו-HTTPS.
- הרשמה, כניסה, יציאה, איפוס סיסמה ופרופיל.
- בית, קטגוריות, כל המתכונים ומועדפים.
- יצירה ידנית ועריכה מלאה.
- מרכיבים בקבוצות, שלבים, תמונות, זמנים, מנות, תגיות ושדות אישיים.
- צילום/גלריה + OCR/Vision + מסך אימות.
- ייבוא מתכון מ-URL + מסך אימות.
- חיפוש טקסטואלי ופילטרים.
- מצב בישול והתאמת כמויות.
- Supabase Auth, PostgreSQL, Storage ו-RLS.
- שמירת טיוטה מקומית וסנכרון בסיסי.
- היסטוריית גרסאות.
- התאמה מלאה לטלפון ולטאבלט, Portrait ו-Landscape.
- PWA בסיסי: manifest, אייקונים, התקנה למסך הבית ו-shell זמין לאחר טעינה ראשונה.
- בדיקות אוטומטיות למסלולים הקריטיים.

### גרסה 1.1

- Offline מתקדם עם תור שינויים מלא.
- רשימות קניות ושיתוף בזמן אמת.
- ספרים משפחתיים ותפקידי owner/editor/viewer.
- תכנון ארוחות שבועי.
- זיהוי כפילויות משופר.
- "מה יש לי בבית?".

### גרסה 2.0

- שאל את השף: החלפות, גרסאות פרווה/טבעוניות והסברים.
- בניית ארוחה ורשימת קניות באמצעות AI.
- קלט קולי ושליטה קולית כאשר הדפדפן תומך.
- Web Push למכשירים ודפדפנים תומכים.
- חיפוש אינטרנט מובנה ממקורות מורשים.
- מידע תזונתי מתקדם והמלצות אישיות.

## 5. סטאק טכנולוגי חדש

- Framework: Next.js App Router + React + TypeScript.
- Hosting: Vercel.
- Styling: Tailwind CSS.
- UI primitives: shadcn/ui + Radix UI, מותאמים ל-RTL.
- Design process: הסקיל `ui-ux-pro-max` להגדרת השפה החזותית וה-responsive rules. אם אינו מותקן, יש להתקין אותו לפני עבודת UI באמצעות `npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max` ולאמת שהוא זמין ל-Codex.
- Forms: React Hook Form + Zod.
- Server state: TanStack Query באזורים אינטראקטיביים שזקוקים ל-cache ו-mutations.
- Client state: Zustand עבור מצב מקומי מצומצם.
- Backend: Supabase Auth, PostgreSQL, Storage ו-Realtime.
- Server layer: Next.js Route Handlers ו-Server Actions לפי הצורך.
- Background/AI jobs: Supabase Edge Functions או worker אסינכרוני, כדי לא להשאיר בקשת דפדפן פתוחה בזמן OCR.
- AI/OCR providers: שכבת ספקים אחידה בצד השרת. OpenAI הוא ספק התחלתי, עם אפשרות להגדיר גם Anthropic, Google או ספק תואם נוסף ללא שינוי במסכי המוצר.
- Local storage: IndexedDB באמצעות Dexie עבור טיוטות, cache ו-Outbox.
- `localStorage`: העדפות לא רגישות בלבד.
- PWA: Web App Manifest, Service Worker, Cache Storage ואייקוני התקנה.
- Images: `next/image` לתצוגה; דחיסה וחיתוך לפני העלאה.
- Tests: Vitest, React Testing Library ו-Playwright.
- Accessibility: axe-core + בדיקות ידניות עם VoiceOver/TalkBack.
- Monitoring: Vercel Observability, Sentry ו-Supabase Logs.
- CI/CD: GitHub Actions + Vercel Preview Deployments + Deployment Checks.

לא ייעשה שימוש ב-Expo, React Native, Expo Router, EAS, SecureStore, Maestro או קובצי APK/IPA.

## 6. ארכיטקטורת Web

### צד דפדפן

- Server Components כברירת מחדל להצגת מידע.
- Client Components רק למצלמה, drag and drop, טפסים, טיימרים, Offline ופעולות אינטראקטיביות.
- אין לחשוף מפתחות סודיים בחבילת הדפדפן.
- Supabase public key בלבד רשאי להיות בצד הלקוח, בכפוף ל-RLS.
- session cookies מאובטחים עבור Auth; אין לשמור access token ב-`localStorage`.

### צד שרת

- Server Actions לשינויים פשוטים מתוך טפסים מאומתים.
- Route Handlers ל-webhooks, callbacks, jobs ו-API בעל חוזה ברור.
- ספק OCR/AI נקרא רק מהשרת.
- המשתמש בוחר ספק ומודל רק מתוך רשימת ספקים שהוגדרה מראש; מפתחות API אינם מוצגים או נשמרים בדפדפן.
- פעולות ארוכות הופכות ל-job אסינכרוני עם status polling או Realtime.
- כל בקשת שרת: אימות session, Zod validation, authorization, rate limit, request ID ולוג מובנה.

### חלוקת אחריות

| תחום | מערכת אחראית |
|---|---|
| Hosting, CDN, Preview ו-Production | Vercel |
| rendering, routes ו-server actions | Next.js ב-Vercel |
| משתמשים ו-session | Supabase Auth + cookies |
| נתונים וקשרים | Supabase PostgreSQL |
| תמונות וקובצי מקור | Supabase Storage |
| הרשאות ברמת שורה | Supabase RLS |
| עדכונים משפחתיים חיים | Supabase Realtime |
| OCR/AI ארוך | job אסינכרוני מאובטח |

### ספקי AI ו-OCR

- הגדרת חיבורים, מפתחות, מודלים ומגבלות שימוש נעשית ב-Vercel Environment Variables או Supabase Secrets בלבד.
- בהגדרות ה-household ניתן לבחור ספק AI, מודל וספק OCR מתוך חיבורים פעילים. אם ספק אינו זמין, היישום משתמש בברירת מחדל מאושרת או מציג שגיאה ברורה ללא אובדן הטיוטה.
- חוזה אחיד מחזיר `extractedText`, נתונים מובנים של המתכון, שדות בעלי ביטחון נמוך ומטא-נתונים של הספק. כך החלפת ספק אינה משנה את מסך האימות או את מבנה המתכון.
- לכל job נשמרים מזהי ספק/מודל, גרסת prompt, עלות או מספר טוקנים אם זמינים, וזמן העיבוד. תוכן המתכון אינו נשלח ל-analytics.
- לפני העיבוד הראשון מוצגת הודעת פרטיות: התמונה והטקסט יישלחו לספק שנבחר לצורך החילוץ בלבד. המשתמש יכול לבטל את ה-job לפני שהחל העיבוד.

## 7. מבנה הפרויקט

```text
app/
  (auth)/login/
  (auth)/signup/
  (auth)/forgot-password/
  (app)/layout.tsx
  (app)/page.tsx
  (app)/recipes/
  (app)/recipes/[id]/
  (app)/recipes/[id]/edit/
  (app)/recipes/[id]/cook/
  (app)/search/
  (app)/shopping/
  (app)/meal-plans/
  (app)/collections/
  (app)/profile/
  import/photo/
  import/url/
  api/imports/
  api/webhooks/
  manifest.ts
components/
  ui/
  layout/
  recipes/
  imports/
  cooking/
features/
  auth/ recipes/ categories/ import/ search/
  cooking/ shopping/ meal-plans/ households/ sync/
lib/
  supabase/browser.ts
  supabase/server.ts
  supabase/proxy.ts
  repositories/
  services/
  contracts/
  validation/
  offline/
  security/
public/
  icons/
  offline.html
  service-worker.js
supabase/
  migrations/
  functions/
  tests/
  seed.sql
tests/
  unit/
  integration/
  e2e/
docs/
PROJECT.md
```

אין לפזר קריאות Supabase בתוך רכיבי UI. הגישה תעבור דרך repositories/services ו-contracts משותפים.

### קובץ PROJECT.md מחייב

עם הקמת הפרויקט המערכת תיצור בשורש הפרויקט קובץ `PROJECT.md`. הקובץ יהיה מקור האמת התפעולי של הפרויקט וילווה את הבנייה מתחילתה ועד Production.

הקובץ יכלול:

- מטרת המוצר, היקף הגרסה והדברים שאינם כלולים כרגע.
- הסטאק הטכנולוגי והארכיטקטורה המאושרת.
- מבנה התיקיות, המסכים והנתיבים.
- טבלאות Supabase, migrations, RLS, Storage ו-Edge Functions.
- שמות משתני הסביבה בלבד, ללא סודות או ערכים.
- פקודות התקנה, פיתוח, בדיקה, build ופריסה.
- backlog ומעקב משימות עם אחראי, תלות, סטטוס ותוצאת בדיקה.
- חלוקת בעלות בין הסוכנים ורשימת הקבצים שכל סוכן רשאי לשנות.
- Quality Gates, Definition of Done ומטריצת הבדיקות.
- החלטות טכניות, סיכונים, חסימות והיסטוריית שינויים.
- מצב הפריסה האחרונה והצעד הבא לביצוע.

מדיניות עדכון:

- רק Orchestrator או Integration Agent מעדכן את `PROJECT.md`.
- כל סוכן חייב לקרוא אותו לפני תחילת משימה.
- הוא מתעדכן בתחילת ובסיום כל שלב, לפני Merge ולפני Deployment.
- משימה לא תסומן `completed` בלי בדיקה ותוצאה מתועדת.
- החלטה שמשנה ארכיטקטורה, DB, API או UI נרשמת לפני המימוש.
- חסימה נרשמת מיד ולא מוסתרת כהשלמה חלקית.
- בסוף כל סשן נרשמים השלב הנוכחי, המשימה הבאה, בדיקות שנכשלו והקבצים המרכזיים ששונו.
- `README.md` מסביר כיצד להתקין ולהריץ; `PROJECT.md` מנהל את העבודה, הסוכנים, ההתקדמות והאימות.
- יש ליצור פקודת `npm run project:check` שבודקת שהקובץ קיים, כולל את הכותרות המחייבות ואינו מכיל סודות.

## 8. מודל הנתונים ב-Supabase

| טבלה | מטרה |
|---|---|
| `profiles` | משתמש והעדפות |
| `households` | ספר מתכונים אישי/משפחתי |
| `household_members` | חברות ותפקידים |
| `recipes` | נתוני בסיס וסטטוס |
| `recipe_versions` | snapshots, שחזור והשוואה |
| `ingredient_groups` | לבצק, למילוי וכדומה |
| `ingredients` | מילון מרכיבים אחיד |
| `recipe_ingredients` | כמות, יחידה, הערה וסדר |
| `recipe_steps` | טקסט, זמן, טמפרטורה וסדר |
| `categories`, `recipe_categories` | קטגוריות |
| `tags`, `recipe_tags` | תגיות |
| `recipe_images` | מקור, שער ותמונות תוצאה |
| `custom_field_definitions` | הגדרת פרט מותאם |
| `recipe_custom_values` | ערך הפרט למתכון |
| `favorites` | מועדפים |
| `recipe_notes`, `recipe_ratings` | הערות ודירוג |
| `collections`, `collection_recipes` | ספרים ואוספים |
| `shopping_lists`, `shopping_list_items` | קניות |
| `meal_plans`, `meal_plan_items` | תכנון ארוחות |
| `import_jobs` | OCR וייבוא URL |
| `web_push_subscriptions` | הרשאות Push אופציונליות |
| `audit_log` | פעולות הרשאה ומחיקות |

שדות חובה ב-`recipes`:

```text
id uuid primary key
household_id uuid not null
owner_id uuid not null
title text not null
description text
servings numeric
prep_minutes integer
cook_minutes integer
difficulty enum
diet_type enum
source_type enum
source_url text
source_text text
original_snapshot jsonb
status enum(draft, processing, ready, failed, archived)
revision integer
created_at timestamptz
updated_at timestamptz
deleted_at timestamptz
```

כל ישות מסונכרנת כוללת `updated_at`, `deleted_at` ו-`revision`. שינוי DB מתבצע באמצעות migration חדש בלבד.

## 9. הרשאות, אבטחה ופרטיות

- RLS מופעלת בכל טבלה חשופה.
- משתמש קורא רק מידע שלו או של household שבו הוא חבר.
- `viewer` קורא בלבד; `editor` יוצר ועורך; `owner` מנהל חברים והרשאות.
- Storage לפי נתיב `households/{householdId}/recipes/{recipeId}/{file}`.
- Service Role ומפתחות AI נשמרים רק ב-Vercel Environment Variables או Supabase Secrets.
- משתנה שמתחיל `NEXT_PUBLIC_` לעולם אינו מכיל סוד.
- cookies מוגדרים Secure, HttpOnly כשאפשר ו-SameSite מתאים.
- CSRF protection לפעולות רגישות, origin checks ו-CSP.
- הסרת EXIF/GPS מתמונות כברירת מחדל.
- הגבלת סוג, גודל וקצב העלאת קבצים.
- Sanitization לתוכן מיובא לפני הצגה.
- ייבוא URL: HTTPS בלבד, חסימת רשתות פרטיות, redirects מוגבלים, timeout ומניעת SSRF.
- Rate limiting ל-login, OCR, AI, import והזמנות שיתוף.
- מחיקת חשבון כוללת נתונים וקבצים לפי המדיניות.
- אין לשלוח תמונות או טקסט מתכונים ל-analytics.
- Headers: CSP, Referrer-Policy, Permissions-Policy, X-Content-Type-Options ו-frame protection.

## 10. כניסה וניהול Session ב-Web

- Supabase SSR client נפרד ל-Browser ול-Server.
- session נשמר ומרוענן באמצעות cookies בהתאם לזרימת Supabase SSR.
- route protection מתבצע בשרת ולא רק בהסתרת כפתורים.
- redirect בטוח לאחר כניסה; אין לקבל redirect חיצוני בלתי מאומת.
- מסכים: הרשמה, כניסה, אימות דוא"ל, איפוס סיסמה, session שפג ויציאה מכל המכשירים.
- כל פעולה רגישה מבצעת authorization מחדש בצד השרת.

## 11. צילום והעלאת תמונות בדפדפן

בטלפון ובטאבלט יוצגו שתי אפשרויות:

- "צלם עכשיו" באמצעות `input type=file` עם `accept=image/*` ו-`capture=environment` כאשר נתמך.
- "בחר מהגלריה/קבצים" כחלופה בכל דפדפן.

במכשירים תומכים ניתן להשתמש ב-`getUserMedia` לתצוגה מקדימה חיה. אם ההרשאה נדחית או אינה נתמכת, המערכת חוזרת לבחירת קובץ. לפני העלאה: חיתוך, סיבוב, תיקון כיוון, דחיסה והסרת metadata.

המערכת חייבת להתמודד עם הרשאה חסומה, פורמט לא נתמך, תמונה גדולה, מספר עמודים, רשת חלשה והעלאה שנקטעה.

## 12. זרימת OCR וייבוא

### צילום/OCR

צילום/גלריה -> עיבוד מקומי -> העלאה ישירה ל-Supabase Storage באמצעות URL מורשה -> בחירת ספק OCR/AI -> יצירת `import_job` -> עיבוד אסינכרוני -> JSON מאומת -> עדכון status -> השוואת מקור/חילוץ -> תיקון -> אישור -> מתכון פעיל.

מצבי job: `queued`, `uploading`, `processing`, `needs_review`, `completed`, `failed`, `cancelled`.

המסך מציג מידע בביטחון נמוך, מידע שה-AI השלים, שדות חסרים וטקסט שלא סווג. המשתמש יכול לבחור ספק אחר ולהריץ מחדש את הטיוטה, בלי לדרוס את התוצאה הקודמת. Refresh או סגירת הטאב אינם מאבדים את ה-job.

### URL

הדבקת URL -> בדיקת אבטחה בשרת -> חילוץ JSON-LD מסוג Recipe -> fallback לחילוץ תוכן מורשה -> נרמול -> preview -> תיקון -> אישור. נשמרים האתר, הקישור, תאריך הייבוא והמקור המקורי.

### שיתוף קישור מהטלפון

ב-MVP המשתמש מדביק URL. בגרסה מתקדמת PWA יכולה להירשם כ-Web Share Target במכשירים תומכים. כשאין תמיכה מוצגת האפשרות "העתק קישור והדבק באפליקציה".

## 13. חיפוש ופילטרים

- שם, תיאור, מרכיבים, תגיות והערות בעברית ובאנגלית.
- חיפוש חלקי ושגיאות כתיב באמצעות `pg_trgm`.
- קטגוריה, זמן, קושי, מנות, בשרי/חלבי/פרווה, טבעוני/צמחוני, ללא גלוטן, אלרגנים, מועדפים, מקור, דירוג ותאריך הכנה.
- כולל/ללא מרכיב, כל המצרכים או עד X חסרים.
- חיפוש בשפה טבעית מתורגם לפילטרים מובנים; AI אינו מייצר SQL להרצה.
- URL משקף חיפוש ופילטרים כדי לאפשר Back, Refresh ושיתוף תוצאה.
- pagination או infinite scroll, virtualization ואינדקסים מתאימים.

## 14. Offline ו-PWA

PWA אינה תנאי לשימוש. האתר פועל בדפדפן רגיל, והתקנה למסך הבית מוסיפה חוויה נוחה יותר.

- `app/manifest.ts` עם שם, short name, צבעים, icons, start URL ו-`display: standalone`.
- Service Worker מטפל ב-app shell, assets, fallback offline ועדכוני גרסה.
- Cache Storage עבור assets בטוחים; responses פרטיים אינם נשמרים ללא אסטרטגיה מפורשת.
- IndexedDB/Dexie עבור טיוטות, מתכונים שנפתחו לאחרונה ו-Outbox.
- שינוי נכתב מקומית, מקבל idempotency key ונשלח כשיש רשת.
- מחיקה רכה מאפשרת הפצת מחיקות.
- חיווי: Online, Offline, נשמר מקומית, מסנכרן, נכשל או conflict.
- לפני עדכון Service Worker נשמרות טיוטות ומוצג "יש גרסה חדשה - רענן".
- התנגשות משמעותית מציגה השוואה ואינה דורסת בשקט.

מגבלות:

- התקנה, מצלמה, Push ותהליכים ברקע משתנים בין Safari, Chrome ו-Firefox.
- Offline מלא יושלם ב-1.1; ב-MVP מובטחות טיוטות מקומיות וקריאת תוכן שכבר נשמר.
- הדפדפן עשוי לפנות cache מקומי; Supabase הוא מקור האמת לאחר סנכרון.

## 15. UX/UI רספונסיבי

עיצוב נקי, חם וביתי. Design Tokens ראשוניים:

- Primary `#657A45`
- Accent `#D97845`
- Background `#FAF7F1`
- Surface `#FFFFFF`
- Text `#24231F`
- Error `#C64242`
- spacing: 4, 8, 12, 16, 24, 32
- radius: 14-18
- גופן: Heebo או Assistant
- אזור לחיצה: 48x48 מומלץ, 44x44 מינימום

UI/UX Pro Max נדרש להפיק לפני הקוד Design System מאושר: tokens, typography, grid, components, states, responsive rules ו-RTL.

| רוחב viewport | מבנה |
|---|---|
| 320-599px | טלפון, עמודה אחת, ניווט תחתון ופעולות נגישות לאגודל |
| 600-839px | טאבלט קטן/טלפון לרוחב, שתי עמודות לפי התוכן |
| 840-1199px | טאבלט, Navigation Rail ו-Master-Detail |
| 1200px ומעלה | מחשב, sidebar, תוכן מוגבל רוחב ופאנל נוסף לפי צורך |

הפריסה נקבעת לפי viewport, container queries ויכולות הדפדפן ולא רק לפי user-agent. משתמשים ביחידות גמישות וב-safe-area insets.

ניווט:

- טלפון: Bottom Navigation קבוע.
- טאבלט: Navigation Rail בצד ימין ב-RTL.
- מחשב: Sidebar מורחב.
- כתובות URL קבועות לכל מסך מרכזי.
- Back של הדפדפן מחזיר למצב צפוי ושומר טיוטה.

## 16. מסכים

1. Landing קצר או redirect לאפליקציה.
2. כניסה, הרשמה, אימות ואיפוס סיסמה.
3. בית: חיפוש, פעולות מהירות, קטגוריות, אחרונים ומועדפים.
4. המתכונים שלי: Grid/List, אוספים, מיון ופעולות מהירות.
5. חיפוש: תוצאות, chips, פילטרים והיסטוריה.
6. הוספה: מצלמה, גלריה, URL או ידני.
7. עורך מתכון מלא עם autosave.
8. OCR Review: מקור מול תוצאה, confidence ותיקון.
9. פרטי מתכון: תמונה, מקור, מנות, מרכיבים, שלבים וגרסאות.
10. מצב בישול: Wake Lock כאשר נתמך, כתב גדול, שלב נוכחי וטיימרים.
11. גרסאות: השוואה ושחזור.
12. מה יש בבית.
13. רשימת קניות.
14. תכנון ארוחות.
15. קטגוריות, תגיות ואוספים.
16. שיתוף משפחתי והרשאות.
17. שאל את השף.
18. פרופיל, PWA/install, פרטיות, ייצוא ומחיקת חשבון.

בטאבלט: רשימה ופרטים זה לצד זה, מקור מול עורך, פילטרים קבועים, ומצב בישול עם מרכיבים + שלב + טיימרים. בטלפון: מסך אחד בכל פעם. במחשב: רוחב התוכן מוגבל כדי לשמור על קריאות.

## 17. רכיבי Design System

`AppHeader`, `BottomNavigation`, `NavigationRail`, `DesktopSidebar`, `SearchBar`, `RecipeCard`, `CategoryCard`, `FilterChip`, `FilterPanel`, `IngredientRow`, `IngredientGroup`, `StepEditor`, `CookingStepCard`, `TimerCard`, `ServingSelector`, `DietBadge`, `SourceBadge`, `SyncIndicator`, `ImageUploader`, `CameraCapture`, `OCRConfidenceField`, `CustomField`, `VersionCard`, `ShoppingItem`, `MealPlanCell`, `InstallPwaPrompt`, `UpdateAvailableBanner`, `SkeletonLoader`, `EmptyState`, `ErrorState`, `UndoToast`, `OfflineBanner`.

לכל רכיב: default, hover, pressed, focus-visible, selected, disabled, loading, error ו-success. Hover אינו הדרך היחידה להגיע לפעולה, מפני שבמסכי מגע הוא אינו קיים.

לכל מסך: loading, empty, no results, offline, server error, permission denied, syncing, failed sync, unsaved, duplicate, partial data, session expired ו-conflict.

## 18. נגישות וחוויית דפדפן

- WCAG 2.2 AA.
- HTML סמנטי לפני ARIA.
- הגדלת טקסט עד 200% ללא חיתוך או גלילה אופקית מיותרת.
- VoiceOver, TalkBack וניווט מקלדת.
- focus-visible ברור ו-focus order נכון ב-RTL.
- אין הסתמכות על צבע בלבד.
- Reduce Motion וניגודיות תקינה.
- alt text ניתן לעריכה.
- חלופה ל-Drag & Drop באמצעות כפתורי העבר למעלה/למטה.
- modals ו-drawers עם focus trap והחזרת focus.
- תמיכה ב-safe areas, מקלדת וירטואלית ו-zoom בדפדפן.

## 19. חלוקת עבודה לסוכנים במקביל

| סוכן | בעלות | אינו משנה |
|---|---|---|
| Orchestrator | backlog, contracts, החלטות, gates ומיזוג | קוד פיצ'ר ללא משימה |
| Responsive UI | Design System, טלפון, טאבלט, RTL ונגישות | migrations ו-RLS |
| Web Platform/PWA | Next.js shell, routing, metadata, service worker ו-IndexedDB | schema עסקי |
| Supabase | schema, migrations, RLS, Auth SSR ו-Storage | עיצוב מסכים |
| Import/AI | OCR, URL parser, jobs, schemas ותיקון | navigation גלובלי |
| Search/Sync | חיפוש, Dexie, Outbox ו-conflicts | Design System |
| QA/Security | Vitest, Playwright, axe, threat model וביצועים | הרחבת scope |
| Integration/Release | shared files, CI, Vercel deployments ו-release | פיצ'רים ללא issue |

כללי עבודה:

- Worktree וענף נפרד לכל סוכן/משימה.
- לפני עבודה: תוכנית ורשימת קבצים לשינוי.
- אין שני סוכנים שמשנים אותו קובץ במקביל.
- `package.json`, root layout, shared contracts ו-configs בבעלות Integration בלבד.
- שינויי DB רק ב-migration חדש.
- כל PR קטן, עם acceptance criteria ובדיקות.
- שינוי UI כולל צילומי טלפון וטאבלט מ-Preview deployment.
- סוכן אחר מבצע code review.
- רק Orchestrator/Integration ממזגים לענפים המשותפים.

גלים:

1. יסודות: contracts, schema/RLS, Auth SSR, Design System, responsive shell, CI ו-Vercel Preview.
2. ליבה: CRUD, editor, Storage, חיפוש, טיוטות מקומיות ובדיקות.
3. ייבוא: upload, OCR/URL jobs, review UI ותסריטי כשל.
4. PWA וסנכרון: manifest, service worker, IndexedDB, Outbox ו-conflicts.
5. הרחבות: קניות, שיתוף ותכנון.
6. הקשחה: E2E, אבטחה, Core Web Vitals, נגישות ו-Production Candidate.

## 20. תוכנית בדיקות חדשה ל-Web

### Unit

- scaling למנות, יחידות, validation וסידור פריטים.
- Custom Fields, כפילויות, filters ו-conflict resolution.
- OCR/URL parsers באמצעות fixtures.
- autosave, Outbox, undo/redo וגרסאות.

יעד: 80% כיסוי כללי ו-90% בקוד עסקי קריטי.

### Component ו-Integration

- React components ו-forms בכל viewport.
- Supabase Auth SSR, CRUD, Storage ו-RLS לשני משתמשים.
- OCR/URL job עד שמירה.
- IndexedDB וחזרה לרשת.
- migrations מ-DB ריק ומשדרוג.
- service worker update ללא אובדן טיוטה.
- session refresh ו-route protection.

### Playwright E2E קריטי

1. הרשמה, אימות, כניסה ויציאה.
2. מתכון ידני, autosave ופתיחה מחדש.
3. העלאת צילום -> תיקון -> אישור.
4. URL -> תיקון -> אישור.
5. חיפוש ופילטרים עם Back/Refresh.
6. התאמת מנות ומועדפים.
7. מצב בישול וטיימר.
8. Offline, draft ו-sync.
9. אותו חשבון בטלפון ובטאבלט.
10. הרשאות ספר משפחתי.
11. גרסה ושחזור.
12. RTL, rotation וטקסט מוגדל.
13. refresh באמצע עריכה ושחזור טיוטה.
14. installability ו-offline fallback של PWA.

### Browser/Device Matrix

| קבוצה | כיסוי |
|---|---|
| Android Phone | Chrome, רוחב קטן ונפוץ, Portrait/Landscape |
| Android Tablet | Chrome, 8 ו-10-12 אינץ', Portrait/Landscape |
| iPhone | Safari, מסך קטן וגדול |
| iPad | Safari, Portrait/Landscape ו-Split View |
| Desktop | Chrome, Edge, Safari ו-Firefox בגרסאות נתמכות |
| תנאים | Offline, רשת איטית, camera denied, storage quota, session expired |

Playwright מריץ viewports של טלפון וטאבלט בכל PR. לפני Production מבוצעות בדיקות גם במכשיר Android פיזי, iPhone/iPad או שירות device cloud.

### אבטחה

- RLS לכל CRUD ולכל תפקיד.
- ניסיון גישה ישירה ל-URL או API של משתמש אחר.
- cookies, CSRF, XSS, CSP ו-open redirect.
- SSRF בייבוא URL.
- file upload, MIME spoofing, קובץ גדול ו-malware policy.
- rate limits, session expiry ו-revocation.
- secret scanning ו-dependency audit.

### נגישות וביצועים

- axe-core אוטומטי ותסריטי מקלדת.
- VoiceOver/TalkBack למסלולים הקריטיים.
- Lighthouse CI לעמודים מרכזיים.
- Core Web Vitals אמיתיים ב-Vercel/Sentry.
- בדיקת רשימות גדולות, תמונות ורשת איטית.

## 21. יעדי ביצועים ואמינות

- LCP עד 2.5 שניות ב-p75 במובייל בתנאים מוסכמים.
- INP עד 200ms ו-CLS עד 0.1 ב-p75.
- פתיחת מתכון מה-cache עד 500ms.
- חיפוש server p95 עד 500ms, לא כולל latency חיצוני חריג.
- משוב שמירה מקומי מיידי; סנכרון רגיל עד 2 שניות.
- הצלחת סנכרון 99.5% ומעלה עם retry ו-idempotency.
- תמונות עם compression, responsive sizes, thumbnail ו-lazy loading.
- Client Components מוגבלים לאינטראקציה כדי לצמצם JavaScript.

## 22. Vercel, סביבות ו-CI/CD

- Local: Supabase מקומי ו-`.env.local` שאינו נכנס ל-Git.
- Preview: כל Pull Request מקבל URL זמני ב-Vercel.
- Staging: ענף קבוע עם Supabase project נפרד.
- Production: ענף `main`, Supabase Production ודומיין קבוע.
- Environment Variables נפרדים לכל סביבה.
- אין להשתמש בנתוני Production בבדיקות.

בכל PR:

1. התקנת dependencies נעולה.
2. format, lint ו-TypeScript.
3. unit/component/integration.
4. Supabase local + migrations + RLS tests.
5. Playwright על Preview ב-viewports טלפון וטאבלט.
6. axe + Lighthouse budget.
7. secret scan ו-dependency scan.
8. Vercel Deployment Checks חוסמים קידום אם בדיקה מחייבת נכשלה.

Rollback: קידום deployment תקין קודם ב-Vercel; שינוי DB מתוקן באמצעות forward migration מאושרת. אין שינוי ידני ב-Production.

## 23. Quality Gates

### Gate 1 - לפני פיתוח

- User Stories, schema, contracts, responsive wireframes, Design System ו-threat model מאושרים.

### Gate 2 - לפני Merge

- build, TypeScript, lint, unit ו-integration עוברים.
- Preview deployment נפתח בטלפון ובטאבלט.
- אין secrets או vulnerability קריטית.
- code review של סוכן אחר.

### Gate 3 - לפני Staging

- migrations נבדקו מאפס ומשדרוג.
- Playwright קריטי, RLS, axe ו-PWA checks עוברים.
- אין Severity 1 או 2 פתוח.

### Gate 4 - לפני Production

- Browser/Device Matrix קריטית עברה.
- Core Web Vitals, אבטחה, גיבוי, restore ו-rollback נוסו.
- ניטור והתראות פעילים.
- 100% מהתרחישים הקריטיים המאושרים עוברים.
- אפס תקלות קריטיות או גבוהות ידועות.
- אישור ידני של בעל המוצר ומנהל QA.

## 24. Definition of Done

משימה גמורה רק כאשר הקוד וה-UI תואמים לאפיון, הבדיקות המתאימות עוברות, המסך נבדק ב-Preview בטלפון ובטאבלט, RTL/מקלדת/נגישות/Offline/שגיאות נבדקו, אין secrets או מידע אישי בלוגים, migrations ו-contracts עודכנו, סוכן אחר סקר את השינוי וכל Vercel Deployment Checks עברו.

## 25. הנחיית פתיחה ל-Orchestrator

לפני כתיבת קוד:

1. קרא את `AGENTS.md`, שנטען אוטומטית על ידי Codex.
2. בדוק אם `ui-ux-pro-max` מותקן. אם לא, הרץ `npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max` ואמת שהסקיל זמין.
3. קרא מתוך `PROJECT.md` רק את המצב הנוכחי והמשימות הפעילות.
4. אתר בעזרת `rg` את הסעיפים הרלוונטיים במסמך זה. אל תטען את כולו בכל משימה אלא אם משתנה הארכיטקטורה.
5. הצג תוכנית, assumptions, סוכנים, ענפים וקבצים שכל אחד ישנה.
6. ודא שקיימים `PROJECT.md`, `docs/decisions.md`, `docs/progress.md`, `docs/test-matrix.md` ו-`docs/responsive-contract.md`.
7. הגדר contracts, schema ו-RLS לפני עבודה מקבילה.
8. הקם Next.js shell, Supabase SSR ו-Vercel Preview לפני פיצ'רים.
9. בקש אישור לשינויי scope מהותיים.
10. הפעל סוכנים בגלים לפי סעיף 19.
11. כל סוכן מוסר commit קטן עם בדיקות.
12. Integration ממזג, מריץ את כל ה-CI ומעדכן את `PROJECT.md` בתוצאות.
13. לפני כל Merge ופריסה הרץ `npm run project:check`.
14. אין להכריז על השלמה לפני מעבר Gate 4.

## 26. הגדרת "עובד 100%"

אין דרך מקצועית להבטיח אפס תקלות בכל דפדפן, מכשיר, מצב רשת ושירות חיצוני. ההגדרה המחייבת היא: 100% מהתרחישים הקריטיים המאושרים עוברים, כל בדיקות CI ו-Playwright עוברות, RLS מאומתת, אין תקלות קריטיות או גבוהות ידועות, וקיימים Preview, Staging, ניטור ו-Rollback לפני Production.

## 27. מקורות טכניים רשמיים ששימשו לעדכון

- Next.js App Router ו-PWA: manifest, service worker, installability ו-HTTPS.
- Supabase SSR ל-Next.js: clients נפרדים לדפדפן ולשרת וניהול session באמצעות cookies.
- Vercel Environments ו-Deployment Checks: Preview, Production ובדיקות חוסמות לפני קידום.
