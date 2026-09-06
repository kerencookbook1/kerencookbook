import { createClient } from '@/lib/supabase/server'
import { PROVIDER_META, maskKey, type ProviderId, type ProviderStatus } from './preview-providers'

export type { ProviderId, ProviderStatus } from './preview-providers'
export { PROVIDER_META, maskKey } from './preview-providers'

type ProviderRow = {
  owner_id: string
  provider: ProviderId
  api_key: string
  is_active: boolean
  saved_at: string
  last_tested_at: string | null
  last_test_ok: boolean | null
  last_test_error: string | null
}

async function getSupabase() {
  return await createClient()
}

async function requireUserId(): Promise<string | null> {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

/**
 * Ensure a profiles row exists for the current user before writing to any
 * table that FKs to profiles.id. Signup does not auto-create a profile in
 * this schema, so we upsert on first write.
 */
async function ensureProfileFor(userId: string): Promise<void> {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split('@')[0] ??
    null
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, display_name: displayName }, { onConflict: 'id' })
  if (error) throw new Error(`יצירת פרופיל נכשלה: ${error.message}`)
}

/** List all provider rows for the current user (empty if not authed). */
async function listRows(): Promise<ProviderRow[]> {
  const userId = await requireUserId()
  if (!userId) return []
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('owner_id', userId)
  if (error) throw new Error(`DB error: ${error.message}`)
  return (data ?? []) as ProviderRow[]
}

/** Public status list — never includes raw keys. */
export async function listStatuses(): Promise<{ active: ProviderId | null; providers: ProviderStatus[] }> {
  const rows = await listRows()
  const rowByProvider = new Map(rows.map((r) => [r.provider, r]))
  const active = rows.find((r) => r.is_active)?.provider ?? null

  const providers = (Object.keys(PROVIDER_META) as ProviderId[]).map((id): ProviderStatus => {
    const meta = PROVIDER_META[id]
    const row = rowByProvider.get(id)
    return {
      id,
      label: meta.label,
      hint: meta.hint,
      docsUrl: meta.docsUrl,
      keyMasked: row ? maskKey(row.api_key) : undefined,
      savedAt: row?.saved_at,
      lastTestedAt: row?.last_tested_at ?? undefined,
      lastTestOk: row?.last_test_ok ?? undefined,
      lastTestError: row?.last_test_error ?? undefined,
      isActive: !!row?.is_active,
    }
  })

  return { active, providers }
}

/** Upsert an API key. Resets any prior test status. */
export async function saveKey(provider: ProviderId, apiKey: string): Promise<void> {
  const userId = await requireUserId()
  if (!userId) throw new Error('לא מחובר')
  await ensureProfileFor(userId)
  const supabase = await getSupabase()
  const { error } = await supabase.from('ai_providers').upsert(
    {
      owner_id: userId,
      provider,
      api_key: apiKey,
      saved_at: new Date().toISOString(),
      last_tested_at: null,
      last_test_ok: null,
      last_test_error: null,
    },
    { onConflict: 'owner_id,provider' }
  )
  if (error) throw new Error(`שמירה נכשלה: ${error.message}`)
}

/** Delete a provider row; clears active flag automatically via delete. */
export async function deleteKey(provider: ProviderId): Promise<void> {
  const userId = await requireUserId()
  if (!userId) throw new Error('לא מחובר')
  const supabase = await getSupabase()
  const { error } = await supabase
    .from('ai_providers')
    .delete()
    .eq('owner_id', userId)
    .eq('provider', provider)
  if (error) throw new Error(`מחיקה נכשלה: ${error.message}`)
}

/** Set active provider (or clear when passed null). */
export async function setActive(provider: ProviderId | null): Promise<void> {
  const userId = await requireUserId()
  if (!userId) throw new Error('לא מחובר')
  const supabase = await getSupabase()

  // First clear any active flag for this user
  const clear = await supabase
    .from('ai_providers')
    .update({ is_active: false })
    .eq('owner_id', userId)
    .eq('is_active', true)
  if (clear.error) throw new Error(`עדכון נכשל: ${clear.error.message}`)

  if (provider === null) return

  // Set target active (must already have a key)
  const set = await supabase
    .from('ai_providers')
    .update({ is_active: true })
    .eq('owner_id', userId)
    .eq('provider', provider)
    .select('provider')
  if (set.error) throw new Error(`עדכון נכשל: ${set.error.message}`)
  if (!set.data || set.data.length === 0) {
    throw new Error('לא ניתן להפוך לפעיל ספק שאין לו מפתח שמור')
  }
}

/** Record a test result against a provider. */
export async function recordTestResult(
  provider: ProviderId,
  ok: boolean,
  error?: string
): Promise<void> {
  const userId = await requireUserId()
  if (!userId) throw new Error('לא מחובר')
  const supabase = await getSupabase()
  const { error: dbError } = await supabase
    .from('ai_providers')
    .update({
      last_tested_at: new Date().toISOString(),
      last_test_ok: ok,
      last_test_error: error ?? null,
    })
    .eq('owner_id', userId)
    .eq('provider', provider)
  if (dbError) throw new Error(`עדכון בדיקה נכשל: ${dbError.message}`)
}

/**
 * Get ordered list of candidate keys for the current user.
 * Order: active first, then any others by provider order. Falls back to env vars if no user keys.
 */
export async function getKeyCandidates(): Promise<{ id: ProviderId; key: string; source: string }[]> {
  const rows = await listRows()
  const candidates: { id: ProviderId; key: string; source: string }[] = []

  const active = rows.find((r) => r.is_active)
  if (active) candidates.push({ id: active.provider, key: active.api_key, source: 'user:active' })

  for (const id of ['anthropic', 'openai', 'google'] as ProviderId[]) {
    const row = rows.find((r) => r.provider === id)
    if (row && !candidates.find((c) => c.id === id)) {
      candidates.push({ id, key: row.api_key, source: 'user' })
    }
  }

  if (candidates.length === 0) {
    const envMap: [ProviderId, string | undefined][] = [
      ['anthropic', process.env.AI_PROVIDER_ANTHROPIC_API_KEY],
      ['openai', process.env.AI_PROVIDER_OPENAI_API_KEY],
      ['google', process.env.AI_PROVIDER_GOOGLE_API_KEY],
    ]
    for (const [id, key] of envMap) {
      if (key) candidates.push({ id, key, source: 'env' })
    }
  }

  return candidates
}

/** Get the API key for a specific provider (for testing an already-saved key). */
export async function getKeyFor(provider: ProviderId): Promise<string | null> {
  const rows = await listRows()
  const row = rows.find((r) => r.provider === provider)
  return row?.api_key ?? null
}
