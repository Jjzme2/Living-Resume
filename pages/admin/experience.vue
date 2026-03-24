<template>
  <div class="page-wrap">
    <div class="page-header-row">
      <div>
        <h2 class="page-heading">Experience</h2>
        <p class="page-sub">Work history. Leave End Date blank for current position.</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" :disabled="saving" @click="saveAll">
          <span v-if="saving" class="btn-spinner" />
          {{ saving ? 'Saving…' : 'Save All' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-block" />

    <div v-else>
      <div v-for="(item, i) in items" :key="i" class="exp-card">
        <div class="exp-card-header">
          <div class="exp-summary">
            <span class="exp-company">{{ item.company || 'New Position' }}</span>
            <span class="exp-role">{{ item.role || '—' }}</span>
            <span class="exp-dates">{{ item.startDate }}{{ item.endDate ? ` – ${item.endDate}` : ' – Present' }}</span>
          </div>
          <div class="exp-actions">
            <button class="btn btn-ghost" @click="toggleEdit(i)">
              {{ editingIndex === i ? 'Collapse' : 'Edit' }}
            </button>
            <button
              class="btn-danger-sm"
              :class="{ 'btn-confirm': confirmDeleteIndex === i }"
              @click="handleDelete(i)"
            >
              {{ confirmDeleteIndex === i ? 'Confirm?' : 'Delete' }}
            </button>
          </div>
        </div>

        <!-- Inline edit form -->
        <div v-if="editingIndex === i" class="exp-form">
          <div class="form-grid">
            <div class="field-group">
              <label class="field-label">Company</label>
              <input v-model="item.company" type="text" class="field-input" placeholder="Company Name" />
            </div>
            <div class="field-group">
              <label class="field-label">Role / Title</label>
              <input v-model="item.role" type="text" class="field-input" placeholder="Senior Developer" />
            </div>
            <div class="field-group">
              <label class="field-label">Start Date</label>
              <input v-model="item.startDate" type="text" class="field-input" placeholder="Jan 2022" />
            </div>
            <div class="field-group">
              <label class="field-label">End Date <span class="label-hint">(blank = current)</span></label>
              <input v-model="item.endDate" type="text" class="field-input" placeholder="Dec 2023" />
            </div>
            <div class="field-group">
              <label class="field-label">Location</label>
              <input v-model="item.location" type="text" class="field-input" placeholder="Remote" />
            </div>
            <div class="field-group">
              <label class="field-label">Type</label>
              <select v-model="item.type" class="field-input">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">Job Category <span class="label-hint">(shown as filter on site)</span></label>
              <input v-model="item.jobType" type="text" class="field-input" placeholder="e.g. Tech / Dev" list="job-type-list" />
              <datalist id="job-type-list">
                <option value="Tech / Dev" />
                <option value="Manufacturing" />
                <option value="Restaurant / Food Service" />
                <option value="Retail" />
                <option value="Service / Hospitality" />
                <option value="Management" />
                <option value="Education" />
                <option value="Other" />
              </datalist>
            </div>
            <div class="field-group col-span-2">
              <div class="label-row">
                <label class="field-label">Highlights <span class="label-hint">(one per line)</span></label>
                <div class="ai-btn-group">
                  <button type="button" class="ai-btn" :disabled="getAiState(i).loading" @click="runGenerateHighlights(i)">
                    <svg v-if="!getAiState(i).loading" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                    <span v-else class="ai-spinner" />
                    {{ getAiState(i).loading ? 'Thinking…' : 'AI Generate' }}
                  </button>
                </div>
              </div>
              <textarea
                :value="(item.highlights || []).join('\n')"
                class="field-input field-textarea"
                rows="5"
                placeholder="Built X resulting in Y improvement&#10;Led initiative to modernize Z"
                @input="item.highlights = ($event.target as HTMLTextAreaElement).value.split('\n').filter(Boolean)"
              />
              <div v-if="getAiState(i).result" class="ai-suggestion">
                <p class="ai-suggestion-label">AI suggested highlights:</p>
                <ul class="ai-highlight-list">
                  <li v-for="line in (getAiState(i).result ?? '').split('\n').filter(Boolean)" :key="line">{{ line }}</li>
                </ul>
                <div class="ai-suggestion-actions">
                  <button type="button" class="ai-use-btn" @click="applyHighlights(i)">Replace all</button>
                  <button type="button" class="ai-use-btn ai-use-btn-secondary" @click="appendHighlights(i)">Append</button>
                  <button type="button" class="ai-dismiss-btn" @click="dismissAi(i)">Dismiss</button>
                </div>
              </div>
              <p v-if="getAiState(i).error" class="ai-error">{{ getAiState(i).error }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="items.length === 0" class="empty-state">No experience yet. Add one below.</div>

      <button class="btn btn-ghost add-btn" @click="addItem">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Experience
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const toast = useState<{ message: string; type: 'success' | 'error' } | null>('admin-toast')

interface ExperienceItem {
  company: string
  role: string
  startDate: string
  endDate?: string
  location?: string
  type?: string
  jobType?: string
  highlights: string[]
}

const loading = ref(true)
const saving = ref(false)
const items = ref<ExperienceItem[]>([])
const editingIndex = ref<number | null>(null)
const confirmDeleteIndex = ref<number | null>(null)
let confirmTimer: ReturnType<typeof setTimeout> | null = null

// Plain reactive state per card — avoids Vue auto-unwrapping refs inside reactive arrays
interface AiState { loading: boolean; result: string | null; error: string | null }
const aiHighlights = reactive<Record<number, AiState>>({})

function getAiState(i: number): AiState {
  if (!aiHighlights[i]) aiHighlights[i] = { loading: false, result: null, error: null }
  return aiHighlights[i]
}

async function runGenerateHighlights(i: number) {
  const state = getAiState(i)
  const item = items.value[i]
  state.loading = true
  state.result = null
  state.error = null
  try {
    const data = await $fetch<{ result: string }>('/api/admin/ai-assist', {
      method: 'POST',
      body: {
        mode: 'generate_highlights',
        context: {
          role: item.role,
          company: item.company,
          startDate: item.startDate,
          endDate: item.endDate ?? '',
          existing: (item.highlights || []).join('\n'),
        },
      },
    })
    state.result = data.result
  } catch (e: unknown) {
    state.error = (e as { statusMessage?: string })?.statusMessage || 'AI assist failed'
  } finally {
    state.loading = false
  }
}

function applyHighlights(i: number) {
  const raw = aiHighlights[i]?.result ?? ''
  items.value[i].highlights = raw.split('\n').filter(Boolean)
  dismissAi(i)
}

function appendHighlights(i: number) {
  const raw = aiHighlights[i]?.result ?? ''
  items.value[i].highlights = [...(items.value[i].highlights || []), ...raw.split('\n').filter(Boolean)]
  dismissAi(i)
}

function dismissAi(i: number) {
  if (aiHighlights[i]) { aiHighlights[i].result = null; aiHighlights[i].error = null }
}

onMounted(async () => {
  try {
    const data = await $fetch<{ experience: ExperienceItem[] }>('/api/admin/data')
    items.value = data.experience.map((e) => ({ ...e, highlights: [...(e.highlights || [])] }))
  } catch {
    toast.value = { message: 'Failed to load experience data', type: 'error' }
  } finally {
    loading.value = false
  }
})

function toggleEdit(i: number) {
  editingIndex.value = editingIndex.value === i ? null : i
}

function addItem() {
  items.value.push({ company: '', role: '', startDate: '', endDate: '', location: '', type: 'full-time', jobType: '', highlights: [] })
  editingIndex.value = items.value.length - 1
}

function handleDelete(i: number) {
  if (confirmDeleteIndex.value === i) {
    items.value.splice(i, 1)
    if (editingIndex.value === i) editingIndex.value = null
    confirmDeleteIndex.value = null
    if (confirmTimer) clearTimeout(confirmTimer)
  } else {
    confirmDeleteIndex.value = i
    if (confirmTimer) clearTimeout(confirmTimer)
    confirmTimer = setTimeout(() => { confirmDeleteIndex.value = null }, 2000)
  }
}

async function saveAll() {
  saving.value = true
  try {
    const cleaned = items.value.map((item) => {
      const obj: ExperienceItem = { ...item, highlights: item.highlights.filter(Boolean) }
      if (!obj.endDate?.trim()) delete obj.endDate
      if (!obj.jobType?.trim()) delete obj.jobType
      return obj
    })
    await $fetch('/api/admin/section', { method: 'PUT', body: { section: 'experience', data: cleaned } })
    toast.value = { message: 'Experience saved', type: 'success' }
  } catch {
    toast.value = { message: 'Failed to save', type: 'error' }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page-wrap { max-width: 800px; margin: 0 auto; }
.page-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--sp-6); gap: var(--sp-4); }
.page-heading { font-size: 1.2rem; font-weight: 600; color: var(--text-1); font-family: var(--font-display); }
.page-sub { font-size: 0.875rem; color: var(--text-3); margin-top: var(--sp-1); max-width: none; }
.loading-block { height: 300px; background: var(--bg-elevated); border-radius: var(--r-lg); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.exp-card { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); margin-bottom: var(--sp-4); overflow: hidden; }
.exp-card-header { display: flex; align-items: center; justify-content: space-between; padding: var(--sp-4) var(--sp-6); gap: var(--sp-4); }
.exp-summary { display: flex; flex-direction: column; gap: 2px; }
.exp-company { font-size: 0.95rem; font-weight: 600; color: var(--text-1); }
.exp-role { font-size: 0.82rem; color: var(--text-2); }
.exp-dates { font-size: 0.75rem; color: var(--text-3); font-family: var(--font-mono); }
.exp-actions { display: flex; gap: var(--sp-2); flex-shrink: 0; }
.exp-form { padding: var(--sp-6); padding-top: 0; border-top: 1px solid var(--border-xs); padding-top: var(--sp-6); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); }
.field-group { display: flex; flex-direction: column; gap: var(--sp-2); }
.col-span-2 { grid-column: span 2; }
.field-label { display: block; font-size: 0.78rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); }
.label-hint { font-size: 0.68rem; color: var(--text-3); text-transform: none; letter-spacing: 0; }
.field-input { width: 100%; padding: var(--sp-3) var(--sp-4); background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: var(--r-md); color: var(--text-1); font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color var(--t-fast); }
.field-input:focus { border-color: var(--accent); }
.field-input::placeholder { color: var(--text-3); }
.field-textarea { resize: vertical; }
.btn-danger-sm { padding: 6px 12px; background: rgba(239,68,68,0.12); color: rgba(239,68,68,0.8); border: 1px solid rgba(239,68,68,0.25); border-radius: var(--r-md); font-size: 0.8rem; cursor: pointer; transition: all var(--t-fast); font-family: inherit; }
.btn-danger-sm:hover { background: rgba(239,68,68,0.2); color: #ef4444; }
.btn-confirm { background: rgba(239,68,68,0.25); color: #ef4444; border-color: rgba(239,68,68,0.5); }
.empty-state { padding: var(--sp-8) 0; text-align: center; color: var(--text-3); font-size: 0.875rem; }
.add-btn { display: flex; align-items: center; gap: var(--sp-2); margin-top: var(--sp-2); }
.header-actions { display: flex; gap: var(--sp-3); }
.btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } .col-span-2 { grid-column: span 1; } }

/* AI assist */
.label-row { display: flex; align-items: center; justify-content: space-between; }
.ai-btn-group { display: flex; gap: var(--sp-2); }
.ai-btn { display: inline-flex; align-items: center; gap: 5px; font-size: 0.72rem; font-family: var(--font-mono); color: var(--accent); background: var(--accent-dim); border: 1px solid rgba(94,234,212,0.2); border-radius: var(--r-md); padding: 3px 9px; cursor: pointer; transition: background 0.15s, border-color 0.15s; white-space: nowrap; }
.ai-btn:hover:not(:disabled) { background: rgba(94,234,212,0.12); border-color: rgba(94,234,212,0.35); }
.ai-btn:disabled { opacity: 0.5; cursor: default; }
.ai-spinner { width: 10px; height: 10px; border: 1.5px solid rgba(94,234,212,0.3); border-top-color: var(--accent); border-radius: 50%; animation: ai-spin 0.7s linear infinite; }
@keyframes ai-spin { to { transform: rotate(360deg); } }
.ai-suggestion { margin-top: var(--sp-2); background: rgba(94,234,212,0.05); border: 1px solid rgba(94,234,212,0.2); border-radius: var(--r-md); padding: var(--sp-4); }
.ai-suggestion-label { font-size: 0.72rem; font-family: var(--font-mono); color: var(--accent); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--sp-3); }
.ai-highlight-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--sp-2); margin-bottom: var(--sp-3); }
.ai-highlight-list li { font-size: 0.88rem; color: var(--text-2); line-height: 1.5; padding-left: var(--sp-4); position: relative; }
.ai-highlight-list li::before { content: '▸'; position: absolute; left: 0; color: var(--accent); font-size: 0.7em; top: 0.22em; }
.ai-suggestion-actions { display: flex; gap: var(--sp-2); flex-wrap: wrap; }
.ai-use-btn { font-size: 0.78rem; font-family: var(--font-mono); background: var(--accent); color: var(--bg-base); border: none; border-radius: var(--r-md); padding: 5px 12px; cursor: pointer; font-weight: 600; }
.ai-use-btn:hover { opacity: 0.9; }
.ai-use-btn-secondary { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(94,234,212,0.3); }
.ai-use-btn-secondary:hover { opacity: 0.9; }
.ai-dismiss-btn { font-size: 0.78rem; font-family: var(--font-mono); background: transparent; color: var(--text-3); border: 1px solid var(--border-sm); border-radius: var(--r-md); padding: 5px 12px; cursor: pointer; }
.ai-dismiss-btn:hover { color: var(--text-2); }
.ai-error { font-size: 0.78rem; color: #f87171; margin-top: var(--sp-2); font-family: var(--font-mono); }
</style>
