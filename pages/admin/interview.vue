<template>
  <div class="page-wrap">
    <h2 class="page-heading">AI Interview Persona</h2>
    <p class="page-sub">Control how the AI assistant represents you in the public "Ask Me Anything" chat.</p>

    <div v-if="loading" class="loading-block" />

    <template v-else>
      <!-- Tone -->
      <div class="admin-card">
        <h3 class="card-title">Tone</h3>
        <p class="card-desc">How should the AI come across to visitors?</p>
        <div class="tone-grid">
          <label
            v-for="opt in toneOptions"
            :key="opt.value"
            class="tone-option"
            :class="{ selected: form.tone === opt.value }"
          >
            <input v-model="form.tone" type="radio" :value="opt.value" class="sr-only" />
            <span class="tone-label">{{ opt.label }}</span>
            <span class="tone-desc">{{ opt.desc }}</span>
          </label>
        </div>
      </div>

      <!-- Custom instructions -->
      <div class="admin-card">
        <h3 class="card-title">Custom Instructions</h3>
        <p class="card-desc">
          Anything extra the AI should know or do — your values, what to emphasise, things to avoid, how to handle specific topics.
          This is injected directly into the AI's instructions.
        </p>
        <textarea
          v-model="form.customInstructions"
          class="field-input field-textarea"
          rows="6"
          placeholder="e.g. Always mention my passion for open-source when asked about motivation. Avoid discussing salary expectations. Emphasise that I'm based in Northeast Ohio and open to remote work."
        />
      </div>

      <!-- FAQ pairs -->
      <div class="admin-card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Prepared Answers</h3>
            <p class="card-desc">
              Specific Q&amp;A pairs the AI will treat as ground truth — perfect for common interview questions you want answered exactly your way.
            </p>
          </div>
          <button class="btn btn-ghost add-btn" type="button" @click="addFaq">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Q&amp;A
          </button>
        </div>

        <div v-if="form.faqs.length === 0" class="empty-faqs">
          <p>No prepared answers yet. Add a Q&amp;A pair to get started.</p>
          <p class="empty-hint">Examples: "Why should I hire you?", "What's your biggest weakness?", "Tell me about a challenge you overcame."</p>
        </div>

        <div v-else class="faqs-list">
          <div v-for="(faq, i) in form.faqs" :key="i" class="faq-item">
            <div class="faq-fields">
              <div class="field-group">
                <label class="field-label">Question</label>
                <input
                  v-model="faq.q"
                  type="text"
                  class="field-input"
                  placeholder="e.g. Why should I hire you?"
                />
              </div>
              <div class="field-group">
                <label class="field-label">Answer</label>
                <textarea
                  v-model="faq.a"
                  class="field-input field-textarea"
                  rows="3"
                  placeholder="Your prepared answer — be specific and genuine."
                />
              </div>
            </div>
            <button
              class="faq-remove"
              type="button"
              :class="{ confirm: confirmDelete === i }"
              :title="confirmDelete === i ? 'Click again to confirm' : 'Remove'"
              @click="removeFaq(i)"
            >
              <svg v-if="confirmDelete !== i" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button class="btn btn-primary" type="button" :disabled="saving" @click="save">
          <span v-if="saving" class="btn-spinner" />
          {{ saving ? 'Saving…' : 'Save Persona' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const toast = useState<{ message: string; type: 'success' | 'error' } | null>('admin-toast')

interface Faq { q: string; a: string }
interface PersonaForm {
  tone: 'professional' | 'warm' | 'casual'
  customInstructions: string
  faqs: Faq[]
}

const loading = ref(true)
const saving = ref(false)
const confirmDelete = ref<number | null>(null)

const form = reactive<PersonaForm>({
  tone: 'warm',
  customInstructions: '',
  faqs: [],
})

const toneOptions = [
  { value: 'warm',         label: 'Warm',         desc: 'Genuine and personable, while still professional.' },
  { value: 'professional', label: 'Professional',  desc: 'Polished and focused — great for corporate roles.' },
  { value: 'casual',       label: 'Casual',        desc: 'Conversational and approachable, like talking to a peer.' },
]

onMounted(async () => {
  try {
    const data = await $fetch<PersonaForm>('/api/admin/interview-persona')
    form.tone = data.tone ?? 'warm'
    form.customInstructions = data.customInstructions ?? ''
    form.faqs = data.faqs ? data.faqs.map((f) => ({ ...f })) : []
  } catch {
    toast.value = { message: 'Failed to load persona config', type: 'error' }
  } finally {
    loading.value = false
  }
})

function addFaq() {
  form.faqs.push({ q: '', a: '' })
}

function removeFaq(i: number) {
  if (confirmDelete.value === i) {
    form.faqs.splice(i, 1)
    confirmDelete.value = null
  } else {
    confirmDelete.value = i
    setTimeout(() => { confirmDelete.value = null }, 2000)
  }
}

async function save() {
  saving.value = true
  try {
    await $fetch('/api/admin/section', {
      method: 'PUT',
      body: {
        section: 'interview-persona',
        data: {
          tone: form.tone,
          customInstructions: form.customInstructions,
          faqs: form.faqs.filter((f) => f.q.trim() || f.a.trim()),
        },
      },
    })
    toast.value = { message: 'Persona saved successfully', type: 'success' }
  } catch {
    toast.value = { message: 'Failed to save persona', type: 'error' }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page-wrap { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--sp-6); }
.page-heading { font-size: 1.2rem; font-weight: 600; color: var(--text-1); margin-bottom: var(--sp-2); font-family: var(--font-display); }
.page-sub { font-size: 0.875rem; color: var(--text-3); max-width: none; }
.loading-block { height: 400px; background: var(--bg-elevated); border-radius: var(--r-lg); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.admin-card { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); padding: var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-4); }
.card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--sp-4); }
.card-title { font-size: 1rem; font-weight: 600; color: var(--text-1); font-family: var(--font-display); }
.card-desc { font-size: 0.85rem; color: var(--text-3); line-height: 1.6; max-width: none; }

/* Tone selector */
.tone-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-3); }
.tone-option {
  display: flex; flex-direction: column; gap: var(--sp-1);
  padding: var(--sp-4); border: 1px solid var(--border-sm);
  border-radius: var(--r-md); cursor: pointer; transition: all var(--t-fast);
  background: var(--bg-surface);
}
.tone-option:hover { border-color: var(--border-md); }
.tone-option.selected { border-color: rgba(94, 234, 212, 0.4); background: var(--accent-dim); }
.tone-label { font-size: 0.9rem; font-weight: 600; color: var(--text-1); }
.tone-option.selected .tone-label { color: var(--accent); }
.tone-desc { font-size: 0.78rem; color: var(--text-3); line-height: 1.4; max-width: none; }

/* Fields */
.field-group { display: flex; flex-direction: column; gap: var(--sp-2); }
.field-label { display: block; font-size: 0.78rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); }
.field-input { width: 100%; padding: var(--sp-3) var(--sp-4); background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: var(--r-md); color: var(--text-1); font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color var(--t-fast); }
.field-input:focus { border-color: var(--accent); }
.field-input::placeholder { color: var(--text-3); }
.field-textarea { resize: vertical; min-height: 80px; }

/* FAQ list */
.add-btn { display: flex; align-items: center; gap: var(--sp-2); flex-shrink: 0; }
.empty-faqs { padding: var(--sp-4); text-align: center; border: 1px dashed var(--border-sm); border-radius: var(--r-md); }
.empty-faqs p { color: var(--text-3); font-size: 0.85rem; max-width: none; }
.empty-hint { font-size: 0.78rem !important; margin-top: var(--sp-1); }
.faqs-list { display: flex; flex-direction: column; gap: var(--sp-4); }
.faq-item { display: flex; gap: var(--sp-3); align-items: flex-start; padding: var(--sp-4); background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: var(--r-md); }
.faq-fields { flex: 1; display: flex; flex-direction: column; gap: var(--sp-3); }
.faq-remove {
  flex-shrink: 0; margin-top: 26px;
  width: 32px; height: 32px; border-radius: var(--r-md);
  border: 1px solid var(--border-sm); background: var(--bg-surface);
  color: var(--text-3); cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all var(--t-fast);
}
.faq-remove:hover { border-color: rgba(239,68,68,0.3); color: #ef4444; background: rgba(239,68,68,0.08); }
.faq-remove.confirm { border-color: rgba(239,68,68,0.5); color: #ef4444; background: rgba(239,68,68,0.12); }

/* Actions */
.form-actions { display: flex; justify-content: flex-end; }
.btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }

@media (max-width: 600px) { .tone-grid { grid-template-columns: 1fr; } }
</style>
