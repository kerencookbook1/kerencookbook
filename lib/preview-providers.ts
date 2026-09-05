import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/**
 * Storage location resolution:
 *   - Local dev (writable cwd) → `<cwd>/.data/preview-providers.json`
 *   - Vercel/serverless (read-only fs) → `<os.tmpdir()>/kerencookbook-providers.json`
 * On Vercel, /tmp is ephemeral: keys reset on every cold start.
 * For persistent production storage move to Vercel KV, Supabase, or Env Vars.
 */
const IS_SERVERLESS = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
const DATA_DIR = IS_SERVERLESS
  ? os.tmpdir()
  : path.join(process.cwd(), '.data')
const FILE = path.join(DATA_DIR, 'preview-providers.json')

export type ProviderId = 'openai' | 'anthropic' | 'google'

export const PROVIDER_META: Record<ProviderId, {
  label: string
  hint: string
  keyPrefix: string
  docsUrl: string
}> = {
  openai: {
    label: 'OpenAI',
    hint: 'GPT-4o Vision — לחילוץ מתכונים מתמונות בעברית ואנגלית',
    keyPrefix: 'sk-',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    label: 'Anthropic',
    hint: 'Claude Sonnet — איכות מעולה בעברית, מומלץ ל-OCR של דפי כרטיסייה',
    keyPrefix: 'sk-ant-',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  google: {
    label: 'Google Gemini',
    hint: 'Gemini Vision — מהיר וזול, תמיכה טובה ב-OCR',
    keyPrefix: 'AIza',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
}

export type ProviderConfig = {
  key: string
  savedAt: string
  lastTestedAt?: string
  lastTestOk?: boolean
  lastTestError?: string
}

export type Store = {
  active?: ProviderId
  providers: Partial<Record<ProviderId, ProviderConfig>>
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

export async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(FILE, 'utf8')
    const parsed = JSON.parse(raw) as Store
    if (!parsed.providers) parsed.providers = {}
    return parsed
  } catch {
    return { providers: {} }
  }
}

export async function writeStore(store: Store): Promise<void> {
  await ensureDir()
  await fs.writeFile(FILE, JSON.stringify(store, null, 2), 'utf8')
}

export function maskKey(key: string): string {
  if (!key) return ''
  if (key.length <= 12) return '••••••••'
  return `${key.slice(0, 6)}${'•'.repeat(8)}${key.slice(-4)}`
}

export function isValidProviderId(id: unknown): id is ProviderId {
  return id === 'openai' || id === 'anthropic' || id === 'google'
}

/**
 * Public status shape — never includes the raw key.
 */
export type ProviderStatus = {
  id: ProviderId
  label: string
  hint: string
  docsUrl: string
  keyMasked?: string
  savedAt?: string
  lastTestedAt?: string
  lastTestOk?: boolean
  lastTestError?: string
  isActive: boolean
}

export function toStatus(store: Store): ProviderStatus[] {
  return (Object.keys(PROVIDER_META) as ProviderId[]).map((id) => {
    const meta = PROVIDER_META[id]
    const cfg = store.providers[id]
    return {
      id,
      label: meta.label,
      hint: meta.hint,
      docsUrl: meta.docsUrl,
      keyMasked: cfg ? maskKey(cfg.key) : undefined,
      savedAt: cfg?.savedAt,
      lastTestedAt: cfg?.lastTestedAt,
      lastTestOk: cfg?.lastTestOk,
      lastTestError: cfg?.lastTestError,
      isActive: store.active === id,
    }
  })
}
