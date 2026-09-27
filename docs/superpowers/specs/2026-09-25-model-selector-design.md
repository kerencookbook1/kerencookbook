# בורר מודל לכל ספק + פידבק בזמן אמת בסריקה

**תאריך:** 2026-09-25
**סטטוס:** מאושר

---

## מטרה

לאפשר למשתמש לבחור מודל AI ספציפי לכל ספק (Anthropic, OpenAI, Google, OpenRouter), ולראות בזמן אמת איזה מודל מטפל בסריקה — כדי שיוכל להשוות ולמצוא את הטוב ביותר לכתב היד שלו.

---

## 1. בורר מודל בדף החיבורים

### עיצוב
כל כרטיס ספק מקבל שורה קומפקטית שמציגה את המודל הנוכחי. לחיצה פותחת רשימה מקופלת; בחירה סוגרת ושומרת.

```
🤖 מודל: gemini-2.0-flash-001   [שנה ▼]
         ↓ לאחר לחיצה:
  [Google Gemini]
  ✓ gemini-2.0-flash-001   מהיר, זול
    gemini-1.5-pro          איכותי יותר
  [OpenAI]
    gpt-4o                  מעולה לעברית
    ...
```

### רשימות מודלים לכל ספק

| ספק | מודלים |
|-----|--------|
| **OpenRouter** | 10 מודלים, 5 קטגוריות (ראה טבלה) |
| **Google** | gemini-2.0-flash-001 ✓, gemini-1.5-pro, gemini-1.5-flash |
| **OpenAI** | gpt-4o ✓, gpt-4o-mini |
| **Anthropic** | claude-opus-4-7 ✓, claude-sonnet-4-6, claude-haiku-4-5 |

**OpenRouter — 10 מודלים מומלצים:**
| קטגוריה | מודל | הערה |
|---------|------|------|
| Google Gemini | google/gemini-2.0-flash-001 ✓ | מהיר, זול |
| Google Gemini | google/gemini-1.5-pro | איכותי יותר |
| OpenAI | openai/gpt-4o | מעולה לעברית |
| OpenAI | openai/gpt-4o-mini | זול יותר |
| Anthropic | anthropic/claude-opus-4-7 | חזק ביותר |
| Anthropic | anthropic/claude-sonnet-4-6 | מהיר יותר |
| Meta | meta-llama/llama-4-maverick | ראייה חזקה |
| Meta | meta-llama/llama-4-scout | חינם |
| Mistral | mistralai/pixtral-large-2411 | Mistral Vision |
| Qwen | qwen/qwen2.5-vl-72b-instruct | Qwen Vision |

### שמירה
הבחירה נשמרת ב-DB ונשמרת לאורך זמן (לא רק לסשן).

---

## 2. פידבק בזמן אמת בדף הסריקה

### מצב "סורק"
```
⏳ שלב 1 — OCR עם claude-opus-4-7   [● מהבהב]
```

### מצב "הצליח"
```
✓ זוהה עם claude-opus-4-7 · התאמה 97%
  שנה מודל →
```

### מצב "נכשל, עובר לספק הבא"
```
✕ OpenRouter נכשל
⏳ מנסה עם gpt-4o (OpenAI)   [● מהבהב]
```

---

## שינויים טכניים

### DB — migration חדש
```sql
ALTER TABLE ai_providers
  ADD COLUMN model TEXT;
-- NULL = השתמש בברירת המחדל של הספק
```

### `lib/preview-providers.ts`
הוספת `defaultModel` ו-`modelOptions` ל-`PROVIDER_META`:
```ts
openai: {
  defaultModel: 'gpt-4o',
  modelOptions: [
    { id: 'gpt-4o', label: 'gpt-4o', note: 'מעולה לעברית' },
    { id: 'gpt-4o-mini', label: 'gpt-4o-mini', note: 'זול יותר' },
  ],
  ...
}
```

### `lib/ai-providers.ts`
- `saveKey(provider, apiKey, model?)` — שמירה כוללת מודל אופציונלי
- `getModelFor(provider)` — מחזיר מודל שמור או defaultModel

### `lib/provider-adapters.ts`
כל פונקציית OCR ו-extractText מקבלת פרמטר `model?: string` ומשתמשת בו במקום הקבוע.

### `app/api/providers/route.ts`
- `GET` — מחזיר שדה `model` לכל ספק
- `POST` — מקבל `model` אופציונלי

### `app/profile/connections/page.tsx`
הוספת בורר מודל מקופל לכל כרטיס.

### `app/import/photo/page.tsx`
הצגת badge עם שם המודל + סטטוס בזמן אמת.

---

## מה לא בסקופ
- שליפה דינמית של מודלים מה-API של OpenRouter (רשימה קבועה)
- היסטוריית סריקות נפרדת (קיים ב-`ocr_scan_logs` אבל אין UI)
- השוואת תוצאות side-by-side בין מודלים
