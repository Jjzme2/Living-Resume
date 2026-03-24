/**
 * AI Manager — Nuxt/Firebase adapter
 *
 * Wraps @ilytat/ai-manager (packages/ai-manager/) with:
 *   - Firebase KV persistence for config
 *   - Env var overlay: keys from runtimeConfig fill in gaps not set via the UI
 *
 * Priority: UI-saved key > env var > nothing
 */
import {
  aiGenerate as _aiGenerate,
  testProvider as _testProvider,
  fetchModels as _fetchModels,
  createDefaultConfig,
  PROVIDER_IDS,
  PROVIDER_META,
} from '@ilytat/ai-manager'
import { kvGet, kvSet } from './kv'

export {
  PROVIDER_IDS,
  PROVIDER_META,
  createDefaultConfig,
} from '@ilytat/ai-manager'

export type {
  ProviderId,
  ProviderConfig,
  AiManagerConfig,
  TestResult,
  ProviderMeta,
  ModelInfo,
} from '@ilytat/ai-manager'

import type { AiManagerConfig, ProviderId, ProviderConfig } from '@ilytat/ai-manager'

// ── Env var map: provider id → runtimeConfig key ─────────────────

function getEnvKeys(): Record<ProviderId, string> {
  const rc = useRuntimeConfig()
  return {
    anthropic: (rc.anthropicApiKey as string) || '',
    gemini:    (rc.geminiApiKey    as string) || '',
    openai:    (rc.openaiApiKey    as string) || '',
    mistral:   (rc.mistralApiKey   as string) || '',
    groq:      (rc.groqApiKey      as string) || '',
    cohere:    (rc.cohereApiKey    as string) || '',
    ollama:    (rc.ollamaBaseUrl   as string) || '',
  }
}

/** Overlay env vars onto providers that have no UI-saved key. */
function applyEnvFallbacks(config: AiManagerConfig): AiManagerConfig {
  const envKeys = getEnvKeys()
  const providers = config.providers.map((p): ProviderConfig => {
    if (p.apiKey) return p   // UI-saved key wins
    const envVal = envKeys[p.id]
    if (!envVal) return p
    // For Ollama, the env var is a base URL, not an API key
    return p.id === 'ollama'
      ? { ...p, baseUrl: envVal }
      : { ...p, apiKey: envVal }
  })
  return { ...config, providers }
}

// ── Config persistence ────────────────────────────────────────────

export async function getAiConfig(): Promise<AiManagerConfig> {
  const stored = await kvGet<AiManagerConfig>('ai:config')
  const base = stored ?? createDefaultConfig()

  // Merge any newly added providers not yet in stored config
  if (stored) {
    const storedIds = new Set(stored.providers.map((p) => p.id))
    const newProviders = PROVIDER_IDS
      .filter((id) => !storedIds.has(id))
      .map((id, i) => ({
        id,
        enabled: false,
        apiKey: '',
        model: PROVIDER_META[id].defaultModel,
        baseUrl: PROVIDER_META[id].defaultBaseUrl,
        order: stored.providers.length + i,
      }))
    if (newProviders.length) base.providers.push(...newProviders)
  }

  return applyEnvFallbacks(base)
}

export async function saveAiConfig(config: AiManagerConfig): Promise<void> {
  await kvSet('ai:config', config)
}

/**
 * Returns which providers have a key available via environment variable.
 * Used by the admin UI to show "from env" badges.
 */
export function getEnvKeyStatus(): Record<ProviderId, boolean> {
  const envKeys = getEnvKeys()
  return Object.fromEntries(
    PROVIDER_IDS.map((id) => [id, !!envKeys[id]])
  ) as Record<ProviderId, boolean>
}

// ── Convenience wrappers ──────────────────────────────────────────

export async function aiGenerate(prompt: string): Promise<string> {
  return _aiGenerate(prompt, await getAiConfig())
}

export async function testProvider(id: ProviderId) {
  return _testProvider(id, await getAiConfig())
}

export async function fetchModels(id: ProviderId) {
  const config = await getAiConfig()
  const provider = config.providers.find((p) => p.id === id)
  if (!provider) throw new Error(`Provider ${id} not found`)
  return _fetchModels(id, provider)
}
