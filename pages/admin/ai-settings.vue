<template>
  <div class="page-wrap">
    <div class="page-header-row">
      <div>
        <h2 class="page-heading">AI Manager</h2>
        <p class="page-sub">Configure AI providers, API keys, and fallback order. Providers are tried top-to-bottom when waterfall is on.</p>
      </div>
      <button class="btn btn-primary" :disabled="saving" @click="save">
        <span v-if="saving" class="btn-spinner" />
        {{ saving ? 'Saving…' : 'Save' }}
      </button>
    </div>

    <div v-if="loading" class="loading-block" />

    <template v-else>
      <!-- Waterfall toggle -->
      <div class="section-card waterfall-card">
        <div class="waterfall-row">
          <div>
            <div class="card-title">Waterfall Mode</div>
            <p class="card-desc">If the first provider fails, automatically try the next enabled provider in order.</p>
          </div>
          <button
            class="toggle-btn"
            :class="{ 'toggle-on': config.waterfallEnabled }"
            @click="config.waterfallEnabled = !config.waterfallEnabled"
          >
            <span class="toggle-thumb" />
          </button>
        </div>
      </div>

      <!-- Provider cards -->
      <div class="providers-list">
        <div
          v-for="(provider, i) in sortedProviders"
          :key="provider.id"
          class="provider-card"
          :class="{ 'provider-enabled': provider.enabled }"
        >
          <!-- Card header -->
          <div class="provider-header">
            <div class="provider-order-btns">
              <button class="order-btn" :disabled="i === 0" title="Move up" @click="moveUp(provider.id)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
              </button>
              <button class="order-btn" :disabled="i === sortedProviders.length - 1" title="Move down" @click="moveDown(provider.id)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>

            <div class="provider-name-wrap">
              <span class="provider-order-badge">{{ i + 1 }}</span>
              <span class="provider-name">{{ meta[provider.id]?.name }}</span>
              <span v-if="!meta[provider.id]?.needsKey" class="local-badge">local</span>
            </div>

            <div class="provider-header-right">
              <span
                v-if="testResults[provider.id]"
                class="test-result"
                :class="testResults[provider.id]!.ok ? 'test-ok' : 'test-fail'"
                :title="testResults[provider.id]!.ok ? '' : 'Click to see full error'"
                :style="testResults[provider.id]!.ok ? '' : 'cursor:pointer'"
                @click="!testResults[provider.id]!.ok && showError(testResults[provider.id]!.error)"
              >
                {{ testResults[provider.id]!.ok ? `✓ ${testResults[provider.id]!.ms}ms` : `✗ ${testResults[provider.id]!.error?.slice(0, 40)}` }}
              </span>
              <button
                class="test-btn"
                :disabled="testingId === provider.id"
                @click="testProvider(provider.id)"
              >
                <span v-if="testingId === provider.id" class="ai-spinner" />
                {{ testingId === provider.id ? 'Testing…' : 'Test' }}
              </button>
              <button
                class="toggle-btn toggle-sm"
                :class="{ 'toggle-on': provider.enabled }"
                @click="provider.enabled = !provider.enabled"
              >
                <span class="toggle-thumb" />
              </button>
            </div>
          </div>

          <!-- Provider fields (always visible) -->
          <div class="provider-fields">
            <!-- API key (only for providers that need one) -->
            <div v-if="meta[provider.id]?.needsKey" class="field-row">
              <label class="field-label">
                API Key
                <div class="label-right">
                  <span v-if="envKeys[provider.id] && !provider.apiKey" class="env-badge" title="Key is set via environment variable and will be used as fallback">from ENV</span>
                  <a :href="meta[provider.id]?.docsUrl" target="_blank" rel="noopener" class="get-key-link">Get key ↗</a>
                </div>
              </label>
              <div class="key-wrap">
                <input
                  v-model="provider.apiKey"
                  :type="showKeys[provider.id] ? 'text' : 'password'"
                  class="field-input"
                  :placeholder="envKeys[provider.id] && !provider.apiKey ? '(using env var)' : `${meta[provider.id]?.name} API key`"
                  autocomplete="off"
                />
                <button class="eye-btn" @click="showKeys[provider.id] = !showKeys[provider.id]">
                  <svg v-if="!showKeys[provider.id]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>

            <!-- Base URL (Ollama only) -->
            <div v-if="provider.id === 'ollama'" class="field-row">
              <label class="field-label">
                Base URL
                <span v-if="envKeys[provider.id] && !provider.baseUrl" class="env-badge" title="Base URL is set via environment variable">from ENV</span>
              </label>
              <input
                v-model="provider.baseUrl"
                type="text"
                class="field-input"
                placeholder="http://localhost:11434"
              />
            </div>

            <!-- Model -->
            <div class="field-row">
              <label class="field-label">Model</label>
              <div class="model-wrap">
                <input
                  v-model="provider.model"
                  type="text"
                  class="field-input"
                  :placeholder="meta[provider.id]?.defaultModel"
                  :list="`models-list-${provider.id}`"
                />
                <datalist :id="`models-list-${provider.id}`">
                  <option v-for="m in (meta[provider.id]?.suggestedModels ?? [])" :key="m" :value="m" />
                </datalist>
                <button
                  class="browse-btn"
                  :disabled="browseState[provider.id]?.loading"
                  @click="browseModels(provider.id)"
                >
                  <span v-if="browseState[provider.id]?.loading" class="ai-spinner" />
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  {{ browseState[provider.id]?.loading ? '' : 'Browse' }}
                </button>
              </div>
            </div>

            <!-- Model browser panel -->
            <div v-if="browseState[provider.id]?.models?.length || browseState[provider.id]?.error" class="models-panel">
              <div v-if="browseState[provider.id]?.error" class="models-error">
                {{ browseState[provider.id]?.error }}
              </div>
              <template v-else>
                <div class="models-panel-header">
                  <span class="models-count">{{ browseState[provider.id]?.models?.length }} models</span>
                  <button class="models-close" @click="closeBrowse(provider.id)">✕</button>
                </div>
                <div class="models-list-scroll">
                  <div
                    v-for="m in browseState[provider.id]?.models"
                    :key="m.id"
                    class="model-row"
                    :class="{ 'model-selected': provider.model === m.id }"
                    @click="provider.model = m.id"
                  >
                    <div class="model-row-main">
                      <span class="model-id">{{ m.name || m.id }}</span>
                      <span v-if="m.name && m.name !== m.id" class="model-sub-id">{{ m.id }}</span>
                    </div>
                    <div class="model-row-meta">
                      <span v-if="m.size" class="model-meta-tag">{{ m.size }}</span>
                      <span v-if="m.contextWindow" class="model-meta-tag">{{ fmtCtx(m.contextWindow) }} ctx</span>
                      <span v-if="m.inputCostPer1M != null" class="model-meta-tag cost-tag">
                        ${{ m.inputCostPer1M }}&nbsp;/&nbsp;${{ m.outputCostPer1M }}&nbsp;per 1M
                      </span>
                      <span v-if="provider.model === m.id" class="model-active-badge">active</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Env var reference -->
      <details class="env-docs">
        <summary class="env-docs-summary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Setting API keys via environment variables
        </summary>
        <div class="env-docs-body">
          <p>You can provide API keys through environment variables instead of (or as a fallback to) saving them in the UI. UI-saved keys take priority.</p>
          <p><strong>For local development</strong>, add to <code>.env.local</code> in your project root:</p>
          <pre class="env-snippet">ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-...
MISTRAL_API_KEY=...
GROQ_API_KEY=gsk_...
COHERE_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434</pre>
          <p><strong>For Vercel deployment</strong>, go to your project → Settings → Environment Variables and add the same key names. They are injected at build/runtime — never committed to your repo.</p>
          <p class="env-note">Providers showing <span class="env-badge env-badge-inline">from ENV</span> have a key available via environment variable. You can still override by typing a key into the field above.</p>
        </div>
      </details>

      <p class="key-notice">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
        API keys saved here are stored in your private Firebase database and only accessible server-side by your admin account.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

import type { ProviderId, AiManagerConfig, ModelInfo } from '~/server/utils/ai-manager'

const toast = useState<{ message: string; type: 'success' | 'error' } | null>('admin-toast')

interface ProviderMeta {
  name: string
  defaultModel: string
  suggestedModels: string[]
  needsKey: boolean
  defaultBaseUrl: string
  docsUrl: string
}

interface BrowseState {
  loading: boolean
  models?: ModelInfo[]
  error?: string
}

const loading = ref(true)
const saving = ref(false)
const config = ref<AiManagerConfig>({ providers: [], waterfallEnabled: true })
const meta = ref<Record<ProviderId, ProviderMeta>>({} as Record<ProviderId, ProviderMeta>)
const envKeys = ref<Record<string, boolean>>({})
const showKeys = reactive<Record<string, boolean>>({})
const testingId = ref<ProviderId | null>(null)
const testResults = reactive<Record<string, { ok: boolean; ms: number; error?: string }>>({})
const browseState = reactive<Record<string, BrowseState>>({})

const sortedProviders = computed(() =>
  [...config.value.providers].sort((a, b) => a.order - b.order)
)

function fmtCtx(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

function moveUp(id: ProviderId) {
  const providers = config.value.providers
  const sorted = [...providers].sort((a, b) => a.order - b.order)
  const sortedIdx = sorted.findIndex((p) => p.id === id)
  if (sortedIdx <= 0) return
  const above = sorted[sortedIdx - 1]
  const curr = sorted[sortedIdx]
  const tmp = above.order
  above.order = curr.order
  curr.order = tmp
}

function moveDown(id: ProviderId) {
  const providers = config.value.providers
  const sorted = [...providers].sort((a, b) => a.order - b.order)
  const sortedIdx = sorted.findIndex((p) => p.id === id)
  if (sortedIdx >= sorted.length - 1) return
  const below = sorted[sortedIdx + 1]
  const curr = sorted[sortedIdx]
  const tmp = below.order
  below.order = curr.order
  curr.order = tmp
}

function showError(msg: string | undefined) {
  if (!msg) return
  toast.value = { message: msg, type: 'error' }
}

async function testProvider(id: ProviderId) {
  testingId.value = id
  delete testResults[id]
  try {
    const result = await $fetch<{ ok: boolean; ms: number; error?: string }>('/api/admin/ai-test', {
      method: 'POST',
      body: { providerId: id },
    })
    testResults[id] = result
  } catch (e: unknown) {
    testResults[id] = { ok: false, ms: 0, error: (e as { statusMessage?: string })?.statusMessage ?? 'Request failed' }
  } finally {
    testingId.value = null
  }
}

async function browseModels(id: ProviderId) {
  browseState[id] = { loading: true }
  try {
    const data = await $fetch<{ models: ModelInfo[] }>('/api/admin/ai-models', {
      method: 'POST',
      body: { providerId: id },
    })
    browseState[id] = { loading: false, models: data.models }
  } catch (e: unknown) {
    const msg = (e as { statusMessage?: string })?.statusMessage ?? 'Failed to fetch models'
    browseState[id] = { loading: false, error: msg }
  }
}

function closeBrowse(id: ProviderId) {
  delete browseState[id]
}

async function save() {
  saving.value = true
  try {
    const sorted = [...config.value.providers].sort((a, b) => a.order - b.order)
    sorted.forEach((p, i) => { p.order = i })
    await $fetch('/api/admin/ai-settings', {
      method: 'PUT',
      body: { config: config.value },
    })
    toast.value = { message: 'AI settings saved', type: 'success' }
  } catch {
    toast.value = { message: 'Failed to save settings', type: 'error' }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const data = await $fetch<{
      config: AiManagerConfig
      meta: Record<ProviderId, ProviderMeta>
      envKeys: Record<string, boolean>
    }>('/api/admin/ai-settings')
    config.value = data.config
    meta.value = data.meta
    envKeys.value = data.envKeys ?? {}
  } catch {
    toast.value = { message: 'Failed to load AI settings', type: 'error' }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-wrap { max-width: 760px; margin: 0 auto; }
.page-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--sp-6); gap: var(--sp-4); }
.page-heading { font-size: 1.2rem; font-weight: 600; color: var(--text-1); font-family: var(--font-display); }
.page-sub { font-size: 0.875rem; color: var(--text-3); margin-top: var(--sp-1); max-width: 480px; }
.loading-block { height: 400px; background: var(--bg-elevated); border-radius: var(--r-lg); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* Waterfall card */
.section-card { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); padding: var(--sp-5) var(--sp-6); margin-bottom: var(--sp-4); }
.waterfall-card { margin-bottom: var(--sp-6); }
.waterfall-row { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-6); }
.card-title { font-size: 0.95rem; font-weight: 600; color: var(--text-1); font-family: var(--font-display); margin-bottom: var(--sp-1); }
.card-desc { font-size: 0.82rem; color: var(--text-3); line-height: 1.5; max-width: 400px; }

/* Toggle */
.toggle-btn { position: relative; width: 40px; height: 22px; background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: 99px; cursor: pointer; transition: background 0.2s, border-color 0.2s; flex-shrink: 0; padding: 0; }
.toggle-btn.toggle-on { background: var(--accent); border-color: var(--accent); }
.toggle-thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: white; border-radius: 50%; transition: transform 0.2s; display: block; }
.toggle-on .toggle-thumb { transform: translateX(18px); }
.toggle-sm { width: 34px; height: 19px; }
.toggle-sm .toggle-thumb { width: 13px; height: 13px; }
.toggle-sm.toggle-on .toggle-thumb { transform: translateX(15px); }

/* Provider list */
.providers-list { display: flex; flex-direction: column; gap: var(--sp-3); margin-bottom: var(--sp-4); }

.provider-card { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); overflow: hidden; transition: border-color 0.2s; }
.provider-enabled { border-color: rgba(94,234,212,0.25); }

.provider-header { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-4) var(--sp-5); border-bottom: 1px solid var(--border-xs); }
.provider-order-btns { display: flex; flex-direction: column; gap: 2px; flex-shrink: 0; }
.order-btn { background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: var(--r-sm); color: var(--text-3); cursor: pointer; padding: 3px 5px; line-height: 1; transition: color 0.15s, background 0.15s; }
.order-btn:hover:not(:disabled) { color: var(--text-1); background: var(--bg-elevated); }
.order-btn:disabled { opacity: 0.3; cursor: default; }

.provider-name-wrap { flex: 1; display: flex; align-items: center; gap: var(--sp-2); min-width: 0; }
.provider-order-badge { font-size: 0.65rem; font-family: var(--font-mono); color: var(--text-3); background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: var(--r-sm); padding: 1px 5px; flex-shrink: 0; }
.provider-name { font-size: 0.9rem; font-weight: 600; color: var(--text-1); font-family: var(--font-display); }
.local-badge { font-size: 0.62rem; font-family: var(--font-mono); background: rgba(94,234,212,0.1); color: var(--accent); border: 1px solid rgba(94,234,212,0.2); border-radius: 99px; padding: 1px 6px; }

.provider-header-right { display: flex; align-items: center; gap: var(--sp-3); flex-shrink: 0; }
.test-result { font-size: 0.7rem; font-family: var(--font-mono); white-space: nowrap; max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
.test-ok { color: #34d399; }
.test-fail { color: #f87171; }
.test-btn { font-size: 0.75rem; font-family: var(--font-mono); background: var(--bg-surface); color: var(--text-2); border: 1px solid var(--border-sm); border-radius: var(--r-md); padding: 4px 10px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s; }
.test-btn:hover:not(:disabled) { color: var(--accent); border-color: rgba(94,234,212,0.3); }
.test-btn:disabled { opacity: 0.5; cursor: default; }

/* Fields */
.provider-fields { padding: var(--sp-4) var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-3); }
.field-row { display: flex; flex-direction: column; gap: var(--sp-2); }
.field-label { display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; font-family: var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-3); }
.label-right { display: flex; align-items: center; gap: var(--sp-2); }
.get-key-link { font-size: 0.68rem; color: var(--accent); text-decoration: none; text-transform: none; letter-spacing: 0; }
.get-key-link:hover { text-decoration: underline; }
.field-input { width: 100%; padding: var(--sp-3) var(--sp-4); background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: var(--r-md); color: var(--text-1); font-family: var(--font-mono); font-size: 0.85rem; outline: none; transition: border-color var(--t-fast); }
.field-input:focus { border-color: var(--accent); }
.field-input::placeholder { color: var(--text-3); }
.key-wrap, .model-wrap { display: flex; gap: var(--sp-2); }
.key-wrap .field-input, .model-wrap .field-input { flex: 1; }
.eye-btn { background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: var(--r-md); color: var(--text-3); cursor: pointer; padding: 0 var(--sp-3); flex-shrink: 0; transition: color 0.15s; }
.eye-btn:hover { color: var(--text-1); }

/* ENV badge */
.env-badge { font-size: 0.6rem; font-family: var(--font-mono); letter-spacing: 0.04em; text-transform: uppercase; background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); border-radius: 99px; padding: 1px 6px; white-space: nowrap; }
.env-badge-inline { vertical-align: middle; }

/* Browse button */
.browse-btn { flex-shrink: 0; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; font-family: var(--font-mono); background: var(--bg-surface); color: var(--text-2); border: 1px solid var(--border-sm); border-radius: var(--r-md); padding: 0 var(--sp-3); cursor: pointer; white-space: nowrap; transition: all 0.15s; min-width: 64px; justify-content: center; }
.browse-btn:hover:not(:disabled) { color: var(--accent); border-color: rgba(94,234,212,0.3); }
.browse-btn:disabled { opacity: 0.5; cursor: default; }

/* Model browser panel */
.models-panel { background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: var(--r-md); overflow: hidden; }
.models-error { padding: var(--sp-3) var(--sp-4); font-size: 0.8rem; color: #f87171; font-family: var(--font-mono); }
.models-panel-header { display: flex; align-items: center; justify-content: space-between; padding: var(--sp-2) var(--sp-4); border-bottom: 1px solid var(--border-xs); }
.models-count { font-size: 0.7rem; font-family: var(--font-mono); color: var(--text-3); }
.models-close { background: none; border: none; color: var(--text-3); cursor: pointer; font-size: 0.8rem; padding: 2px 4px; line-height: 1; }
.models-close:hover { color: var(--text-1); }
.models-list-scroll { max-height: 260px; overflow-y: auto; }
.model-row { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--sp-3); padding: var(--sp-2) var(--sp-4); cursor: pointer; transition: background 0.1s; border-bottom: 1px solid var(--border-xs); }
.model-row:last-child { border-bottom: none; }
.model-row:hover { background: var(--bg-elevated); }
.model-selected { background: rgba(94,234,212,0.05); }
.model-row-main { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.model-id { font-size: 0.8rem; font-family: var(--font-mono); color: var(--text-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.model-sub-id { font-size: 0.68rem; font-family: var(--font-mono); color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.model-row-meta { display: flex; align-items: center; gap: var(--sp-2); flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
.model-meta-tag { font-size: 0.62rem; font-family: var(--font-mono); color: var(--text-3); background: var(--bg-elevated); border: 1px solid var(--border-xs); border-radius: var(--r-sm); padding: 1px 5px; white-space: nowrap; }
.cost-tag { color: #34d399; border-color: rgba(52,211,153,0.2); background: rgba(52,211,153,0.05); }
.model-active-badge { font-size: 0.6rem; font-family: var(--font-mono); color: var(--accent); border: 1px solid rgba(94,234,212,0.3); border-radius: 99px; padding: 1px 5px; }

/* Env docs accordion */
.env-docs { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); margin-bottom: var(--sp-4); overflow: hidden; }
.env-docs-summary { display: flex; align-items: center; gap: var(--sp-2); font-size: 0.82rem; color: var(--text-2); cursor: pointer; padding: var(--sp-4) var(--sp-5); user-select: none; list-style: none; }
.env-docs-summary::-webkit-details-marker { display: none; }
.env-docs-summary::before { content: '▶'; font-size: 0.6rem; color: var(--text-3); margin-right: 2px; transition: transform 0.15s; }
details[open] .env-docs-summary::before { transform: rotate(90deg); }
.env-docs-body { padding: var(--sp-2) var(--sp-5) var(--sp-5); border-top: 1px solid var(--border-xs); display: flex; flex-direction: column; gap: var(--sp-3); }
.env-docs-body p { font-size: 0.82rem; color: var(--text-2); line-height: 1.6; margin: 0; }
.env-docs-body strong { color: var(--text-1); }
.env-docs-body code { font-family: var(--font-mono); font-size: 0.8rem; background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: var(--r-sm); padding: 1px 5px; }
.env-snippet { font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-2); background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: var(--r-md); padding: var(--sp-4); line-height: 1.7; margin: 0; overflow-x: auto; white-space: pre; }
.env-note { font-size: 0.78rem !important; color: var(--text-3) !important; }

/* Footer notice */
.key-notice { display: flex; align-items: flex-start; gap: var(--sp-2); font-size: 0.78rem; color: var(--text-3); line-height: 1.5; padding: var(--sp-4); background: rgba(94,234,212,0.03); border: 1px solid var(--border-xs); border-radius: var(--r-md); }
.key-notice svg { flex-shrink: 0; margin-top: 1px; color: var(--text-3); }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: var(--sp-2); padding: var(--sp-2) var(--sp-5); border-radius: var(--r-md); font-size: 0.875rem; font-weight: 500; cursor: pointer; border: none; font-family: inherit; transition: opacity var(--t-fast); }
.btn-primary { background: var(--accent); color: var(--bg-base); }
.btn-primary:hover:not(:disabled) { opacity: 0.88; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }
.btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.2); border-top-color: var(--bg-base); border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }
.ai-spinner { width: 10px; height: 10px; border: 1.5px solid rgba(94,234,212,0.3); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }

@media (max-width: 600px) {
  .provider-header { flex-wrap: wrap; gap: var(--sp-2); }
  .test-result { display: none; }
  .model-row { flex-direction: column; gap: var(--sp-1); }
  .model-row-meta { justify-content: flex-start; }
}
</style>
