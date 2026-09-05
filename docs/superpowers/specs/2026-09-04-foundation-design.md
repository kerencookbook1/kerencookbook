# Foundation Design — Packages + Supabase + Core Schema

**Date:** 2026-09-04
**Scope:** DB-001 (partial) — No Auth in this phase

---

## Goal

Establish the technical foundation needed to build real CRUD features:
1. Install all approved-stack packages
2. Wire up Supabase browser + server clients
3. Create a single migration with core recipe tables
4. Apply basic RLS so each owner sees only their own data

Auth (login/logout/session middleware) is deferred to a separate phase.

---

## 1. Packages

### Runtime dependencies

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | Supabase JS client |
| `@supabase/ssr` | SSR-safe cookie handling for Next.js |
| `react-hook-form` | Form state management |
| `zod` | Schema validation |
| `@hookform/resolvers` | Connects Zod to React Hook Form |
| `dexie` | IndexedDB wrapper for local drafts |
| `date-fns` | Date formatting and arithmetic |
| `sonner` | Toast notifications |
| `clsx` | Conditional class names |
| `tailwind-merge` | Merges Tailwind classes without conflicts |
| `class-variance-authority` | Variant-based component styling (shadcn) |

### Dev dependencies

| Package | Purpose |
|---|---|
| `vitest` | Unit + integration test runner |
| `@vitest/coverage-v8` | Coverage reports |
| `@testing-library/react` | React component testing |
| `@testing-library/user-event` | Simulates user interactions |
| `jsdom` | DOM environment for Vitest |
| `@playwright/test` | E2E tests |
| `@types/node` | Node types (already present) |

### npm scripts to add

```json
"typecheck": "tsc --noEmit",
"test": "vitest",
"test:integration": "vitest --project integration",
"test:e2e": "playwright test",
"project:check": "npm run lint && npm run typecheck && npm run build"
```

---

## 2. Supabase Client Setup

### `lib/supabase/client.ts` — Browser Client
Used in Client Components only. Creates a singleton browser client.

```ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

### `lib/supabase/server.ts` — Server Client
Used in Server Components, Server Actions, and Route Handlers. Reads cookies from the request.

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}
```

### `lib/supabase/types.ts`
Generated file — populated after running `supabase gen types typescript`. Committed to source control.

---

## 3. Core Schema Migration

Single migration file: `supabase/migrations/0001_core_schema.sql`

### Tables

#### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, references `auth.users(id)` |
| `display_name` | `text` | |
| `avatar_url` | `text` | nullable |
| `created_at` | `timestamptz` | default now() |
| `updated_at` | `timestamptz` | default now() |

#### `recipes`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, gen_random_uuid() |
| `owner_id` | `uuid` | FK → profiles(id) |
| `title` | `text` | not null |
| `description` | `text` | nullable |
| `prep_time` | `integer` | minutes, nullable |
| `cook_time` | `integer` | minutes, nullable |
| `servings` | `integer` | nullable |
| `status` | `text` | 'draft' \| 'published', default 'draft' |
| `created_at` | `timestamptz` | default now() |
| `updated_at` | `timestamptz` | default now() |

#### `ingredient_groups`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `recipe_id` | `uuid` | FK → recipes(id) ON DELETE CASCADE |
| `title` | `text` | nullable |
| `position` | `integer` | sort order |

#### `ingredients`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `recipe_id` | `uuid` | FK → recipes(id) ON DELETE CASCADE |
| `group_id` | `uuid` | FK → ingredient_groups(id), nullable |
| `name` | `text` | not null |
| `amount` | `text` | nullable, stored as text to allow "½ כוס" |
| `unit` | `text` | nullable |
| `position` | `integer` | |

#### `recipe_steps`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `recipe_id` | `uuid` | FK → recipes(id) ON DELETE CASCADE |
| `title` | `text` | nullable |
| `body` | `text` | not null |
| `duration_seconds` | `integer` | nullable, for timers |
| `position` | `integer` | |

#### `recipe_images`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `recipe_id` | `uuid` | FK → recipes(id) ON DELETE CASCADE |
| `storage_path` | `text` | path in Supabase Storage |
| `is_primary` | `boolean` | default false |
| `position` | `integer` | |

---

## 4. RLS Policies

All tables enable RLS. The base rule: a user can access rows only if they own the parent recipe (or profile).

### `profiles`
- SELECT: `auth.uid() = id`
- UPDATE: `auth.uid() = id`
- INSERT: `auth.uid() = id`

### `recipes`
- ALL operations: `auth.uid() = owner_id`

### `ingredient_groups`, `ingredients`, `recipe_steps`, `recipe_images`
- ALL operations: user must own the parent recipe
- Uses a subquery: `EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())`

---

## 5. What This Phase Does NOT Include

- Auth flows (login page, logout, session middleware, protected routes)
- Supabase Storage bucket configuration
- `supabase gen types typescript` run (done after migration is applied)
- shadcn/ui component installation (separate task)
- Any UI changes

---

## Success Criteria

- `npm run typecheck` passes
- `npm run build` passes
- Migration applies cleanly on a fresh Supabase project (`supabase db reset`)
- RLS is confirmed with a manual test: two users cannot see each other's recipes
- Supabase clients are importable in both Server and Client Components without errors
