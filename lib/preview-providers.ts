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

export type ProviderId = 'openai' | 'anthropic' | 'google' | 'openrouter'

export type ModelOption = { id: string; note: string; category?: string }

export const PROVIDER_META: Record<ProviderId, {
  label: string
  hint: string
  keyPrefix: string
  docsUrl: string
  defaultModel: string
  modelOptions: ModelOption[]
}> = {
  openai: {
    label: 'OpenAI',
    hint: 'GPT-4o Vision — לחילוץ מתכונים מתמונות בעברית ואנגלית',
    keyPrefix: 'sk-',
    docsUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-4o',
    modelOptions: [
      { id: 'gpt-4o',      note: 'מעולה לעברית' },
      { id: 'gpt-4o-mini', note: 'זול יותר' },
    ],
  },
  anthropic: {
    label: 'Anthropic',
    hint: 'Claude Sonnet — איכות מעולה בעברית, מומלץ ל-OCR של דפי כרטיסייה',
    keyPrefix: 'sk-ant-',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    defaultModel: 'claude-opus-4-7',
    modelOptions: [
      { id: 'claude-opus-4-7',   note: 'חזק ביותר לכתב יד' },
      { id: 'claude-sonnet-4-6', note: 'מהיר יותר' },
      { id: 'claude-haiku-4-5',  note: 'הכי זול' },
    ],
  },
  google: {
    label: 'Google Gemini',
    hint: 'Gemini Vision — מהיר וזול, תמיכה טובה ב-OCR',
    keyPrefix: 'AIza',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    defaultModel: 'gemini-2.0-flash-001',
    modelOptions: [
      { id: 'gemini-2.0-flash-001', note: 'ברירת מחדל, מהיר וזול' },
      { id: 'gemini-1.5-pro',       note: 'OCR מדויק יותר' },
      { id: 'gemini-1.5-flash',     note: 'הכי מהיר' },
    ],
  },
  openrouter: {
    label: 'OpenRouter',
    hint: 'מפתח אחד לעשרות מודלים — Gemini, GPT-4o, Claude ועוד. מומלץ!',
    keyPrefix: 'sk-or-',
    docsUrl: 'https://openrouter.ai/settings/keys',
    defaultModel: 'google/gemini-2.0-flash-001',
    modelOptions: [
      { id: 'google/gemini-2.0-flash-001',        note: 'מהיר, זול',        category: 'Google Gemini' },
      { id: 'google/gemini-1.5-pro',              note: 'איכותי יותר',      category: 'Google Gemini' },
      { id: 'openai/gpt-4o',                      note: 'מעולה לעברית',     category: 'OpenAI' },
      { id: 'openai/gpt-4o-mini',                 note: 'זול יותר',         category: 'OpenAI' },
      { id: 'anthropic/claude-opus-4-7',          note: 'חזק ביותר',        category: 'Anthropic' },
      { id: 'anthropic/claude-sonnet-4-6',        note: 'מהיר יותר',        category: 'Anthropic' },
      { id: 'meta-llama/llama-4-maverick',        note: 'ראייה חזקה',       category: 'Meta' },
      { id: 'meta-llama/llama-4-scout',           note: 'חינם',             category: 'Meta' },
      { id: 'mistralai/pixtral-large-2411',       note: 'Mistral Vision',   category: 'אחר' },
      { id: 'qwen/qwen2.5-vl-72b-instruct',       note: 'Qwen Vision',      category: 'אחר' },
    ],
  },
}

export type ProviderConfig = {
  key: string
  savedAt: string
  lastTestedAt?: string
  lastTestOk?: boolean
  lastTestError?: string
  model?: string
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
  return id === 'openai' || id === 'anthropic' || id === 'google' || id === 'openrouter'
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
  model?: string
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
      model: cfg?.model ?? undefined,
    }
  })
}
