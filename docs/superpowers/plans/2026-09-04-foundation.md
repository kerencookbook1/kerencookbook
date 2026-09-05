# Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install all approved-stack packages, wire up Supabase browser + server clients, create core recipe schema with RLS, and configure test runners.

**Architecture:** Supabase clients are split into two modules — `lib/supabase/client.ts` for browser (Client Components) and `lib/supabase/server.ts` for server (Server Components, Server Actions). The DB schema lives in a single SQL migration file. Auth is deferred — clients use the publishable key only.

**Tech Stack:** Next.js 16 App Router, Supabase JS v2 + SSR, Vitest + jsdom, Playwright, TypeScript.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `package.json` | Add dependencies + npm scripts |
| Create | `vitest.config.ts` | Vitest + jsdom setup |
| Create | `vitest.setup.ts` | Global test setup |
| Create | `playwright.config.ts` | Playwright E2E config |
| Create | `lib/supabase/client.ts` | Browser Supabase client |
| Create | `lib/supabase/server.ts` | Server Supabase client |
| Create | `lib/supabase/types.ts` | Generated DB types (placeholder → generated) |
| Create | `supabase/migrations/0001_core_schema.sql` | Tables + RLS policies |
| Create | `tests/unit/lib/supabase/client.test.ts` | Smoke test for browser client |

---

## Task 1: Install packages and add npm scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr react-hook-form zod @hookform/resolvers dexie date-fns sonner clsx tailwind-merge class-variance-authority
```

Expected: `added N packages` with no errors.

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D vitest @vitest/coverage-v8 @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom @playwright/test
```

Expected: `added N packages` with no errors.

- [ ] **Step 3: Add missing npm scripts to `package.json`**

Open `package.json` and replace the `"scripts"` section with:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "test:integration": "vitest --project integration",
  "test:e2e": "playwright test",
  "project:check": "npm run lint && npm run typecheck && npm run build"
},
```

- [ ] **Step 4: Verify no type errors from new packages**

```bash
npm run typecheck
```

Expected: exits 0. If it complains about missing `@types/*`, check whether the package ships its own types (most do).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install approved-stack packages and add npm scripts"
```

---

## Task 2: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Install jest-dom matchers**

```bash
npm install -D @testing-library/jest-dom
```

- [ ] **Step 4: Create test directory structure**

```bash
mkdir -p tests/unit/lib/supabase
mkdir -p tests/integration
mkdir -p tests/e2e
```

- [ ] **Step 5: Run Vitest to verify config loads**

```bash
npm run test -- --run
```

Expected: `No test files found` (exits 0 — this is correct, no tests written yet).

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json package-lock.json
git commit -m "feat: configure Vitest with jsdom and React Testing Library"
```

---

## Task 3: Configure Playwright

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 2: Install Playwright browsers**

```bash
npx playwright install --with-deps chromium
```

Expected: downloads Chromium browser. Takes ~1 minute.

- [ ] **Step 3: Verify Playwright config is valid**

```bash
npx playwright --version
```

Expected: prints version like `Version 1.x.x`.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts package.json package-lock.json
git commit -m "feat: configure Playwright for E2E tests (phone + desktop)"
```

---

## Task 4: Supabase browser client

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/types.ts` (placeholder — will be replaced in Task 7)
- Create: `tests/unit/lib/supabase/client.test.ts`

- [ ] **Step 1: Create placeholder types file**

Create `lib/supabase/types.ts`:

```ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          prep_time: number | null
          cook_time: number | null
          servings: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          status?: string
          updated_at?: string
        }
      }
      ingredient_groups: {
        Row: {
          id: string
          recipe_id: string
          title: string | null
          position: number
        }
        Insert: {
          id?: string
          recipe_id: string
          title?: string | null
          position?: number
        }
        Update: {
          title?: string | null
          position?: number
        }
      }
      ingredients: {
        Row: {
          id: string
          recipe_id: string
          group_id: string | null
          name: string
          amount: string | null
          unit: string | null
          position: number
        }
        Insert: {
          id?: string
          recipe_id: string
          group_id?: string | null
          name: string
          amount?: string | null
          unit?: string | null
          position?: number
        }
        Update: {
          group_id?: string | null
          name?: string
          amount?: string | null
          unit?: string | null
          position?: number
        }
      }
      recipe_steps: {
        Row: {
          id: string
          recipe_id: string
          title: string | null
          body: string
          duration_seconds: number | null
          position: number
        }
        Insert: {
          id?: string
          recipe_id: string
          title?: string | null
          body: string
          duration_seconds?: number | null
          position?: number
        }
        Update: {
          title?: string | null
          body?: string
          duration_seconds?: number | null
          position?: number
        }
      }
      recipe_images: {
        Row: {
          id: string
          recipe_id: string
          storage_path: string
          is_primary: boolean
          position: number
        }
        Insert: {
          id?: string
          recipe_id: string
          storage_path: string
          is_primary?: boolean
          position?: number
        }
        Update: {
          storage_path?: string
          is_primary?: boolean
          position?: number
        }
      }
    }
  }
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/unit/lib/supabase/client.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ from: vi.fn() })),
}))

describe('createClient (browser)', () => {
  it('returns a supabase client object', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const client = createClient()
    expect(client).toBeDefined()
    expect(typeof client.from).toBe('function')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm run test -- --run tests/unit/lib/supabase/client.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/supabase/client'`

- [ ] **Step 4: Create `lib/supabase/client.ts`**

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

- [ ] **Step 5: Run test to verify it passes**

```bash
npm run test -- --run tests/unit/lib/supabase/client.test.ts
```

Expected: PASS — 1 test passed.

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/client.ts lib/supabase/types.ts tests/unit/lib/supabase/client.test.ts
git commit -m "feat: add Supabase browser client with typed Database"
```

---

## Task 5: Supabase server client

**Files:**
- Create: `lib/supabase/server.ts`

Note: The server client uses `next/headers` (cookies), which requires a Next.js request context. We test only that the module exports correctly — the actual cookie integration is validated at build time.

- [ ] **Step 1: Create `lib/supabase/server.ts`**

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

```bash
npm run typecheck
```

Expected: exits 0. The `next/headers` import is resolved by Next.js types.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/server.ts
git commit -m "feat: add Supabase server client for Server Components and Actions"
```

---

## Task 6: Write core schema migration

**Files:**
- Create: `supabase/migrations/0001_core_schema.sql`

- [ ] **Step 1: Create migrations directory**

```bash
mkdir -p supabase/migrations
```

- [ ] **Step 2: Create `supabase/migrations/0001_core_schema.sql`**

```sql
-- Core schema for recipe app
-- Migration: 0001_core_schema

-- profiles: one row per auth user
CREATE TABLE profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "owner_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "owner_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- recipes
CREATE TABLE recipes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  prep_time   INTEGER,
  cook_time   INTEGER,
  servings    INTEGER,
  status      TEXT        NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'published')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON recipes FOR ALL USING (auth.uid() = owner_id);

-- ingredient_groups
CREATE TABLE ingredient_groups (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID    NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  title     TEXT,
  position  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE ingredient_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON ingredient_groups FOR ALL USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = ingredient_groups.recipe_id
      AND recipes.owner_id = auth.uid()
  )
);

-- ingredients
-- amount stored as TEXT to support fractions like "½ כוס" or "1-2"
CREATE TABLE ingredients (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID    NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  group_id  UUID    REFERENCES ingredient_groups(id) ON DELETE SET NULL,
  name      TEXT    NOT NULL,
  amount    TEXT,
  unit      TEXT,
  position  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON ingredients FOR ALL USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = ingredients.recipe_id
      AND recipes.owner_id = auth.uid()
  )
);

-- recipe_steps
CREATE TABLE recipe_steps (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id        UUID    NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  title            TEXT,
  body             TEXT    NOT NULL,
  duration_seconds INTEGER,
  position         INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON recipe_steps FOR ALL USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.owner_id = auth.uid()
  )
);

-- recipe_images
CREATE TABLE recipe_images (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id    UUID    NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  storage_path TEXT    NOT NULL,
  is_primary   BOOLEAN NOT NULL DEFAULT FALSE,
  position     INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE recipe_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON recipe_images FOR ALL USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_images.recipe_id
      AND recipes.owner_id = auth.uid()
  )
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_recipes
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

- [ ] **Step 3: Commit the migration file before applying**

```bash
git add supabase/migrations/0001_core_schema.sql
git commit -m "feat: add core schema migration (profiles, recipes, ingredients, steps, images)"
```

---

## Task 7: Apply migration and generate types

**Files:**
- Modify: `lib/supabase/types.ts` (replace placeholder with generated types)

The migration runs against the remote Supabase project (`jhutbbifdbqrlirgzkmz`).

- [ ] **Step 1: Link the project to Supabase CLI**

```bash
npx supabase login
```

This opens a browser. Sign in with the Supabase account that owns the project.

- [ ] **Step 2: Link the remote project**

```bash
npx supabase link --project-ref jhutbbifdbqrlirgzkmz
```

When prompted for the database password, enter the DB password from your Supabase project dashboard (Settings → Database → Connection string).

Expected: `Finished supabase link.`

- [ ] **Step 3: Push migration to remote**

```bash
npx supabase db push
```

Expected output:
```
Applying migration 0001_core_schema.sql...
Finished supabase db push.
```

If it errors with "already exists", the table may have been created manually. Check the Supabase dashboard → Table Editor before retrying.

- [ ] **Step 4: Generate TypeScript types from the live schema**

```bash
npx supabase gen types typescript --project-id jhutbbifdbqrlirgzkmz > lib/supabase/types.ts
```

Expected: `lib/supabase/types.ts` is overwritten with auto-generated types. The file will be longer than the placeholder and include all 6 tables.

- [ ] **Step 5: Verify typecheck still passes after type replacement**

```bash
npm run typecheck
```

Expected: exits 0. The generated types may rename some fields — fix any mismatches in `client.ts` or `server.ts` if needed.

- [ ] **Step 6: Re-run the client unit test**

```bash
npm run test -- --run tests/unit/lib/supabase/client.test.ts
```

Expected: PASS — 1 test passed.

- [ ] **Step 7: Commit generated types**

```bash
git add lib/supabase/types.ts
git commit -m "feat: replace placeholder types with generated Supabase schema types"
```

---

## Task 8: Final verification

- [ ] **Step 1: Run full typecheck**

```bash
npm run typecheck
```

Expected: exits 0, no errors.

- [ ] **Step 2: Run all unit tests**

```bash
npm run test -- --run
```

Expected: 1 test suite, 1 test, all passing.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: `✓ Compiled successfully`. No type errors. No missing module errors.

- [ ] **Step 4: Manual RLS spot-check**

Open the Supabase dashboard → SQL Editor and run:

```sql
-- Should return 0 rows (no data yet), but the query must not error
SELECT * FROM recipes;

-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Expected: all 6 tables have `rowsecurity = true`.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "chore: verify foundation build — typecheck, tests, build all pass"
```

---

## Post-Plan Notes

- Auth (login/logout/session middleware) is the next planned phase — tracked as AUTH-001 in `PROJECT.md`.
- shadcn/ui component installation is a separate task (requires `npx shadcn@latest init`).
- The `lib/supabase/types.ts` file should be re-generated each time the schema changes: `npx supabase gen types typescript --project-id jhutbbifdbqrlirgzkmz > lib/supabase/types.ts`.
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is not used in any client yet — it will be used in server-only admin operations after Auth is in place.
