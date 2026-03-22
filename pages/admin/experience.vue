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
            <div class="field-group col-span-2">
              <label class="field-label">Highlights <span class="label-hint">(one per line)</span></label>
              <textarea
                :value="(item.highlights || []).join('\n')"
                class="field-input field-textarea"
                rows="5"
                placeholder="Built X resulting in Y improvement&#10;Led initiative to modernize Z"
                @input="item.highlights = ($event.target as HTMLTextAreaElement).value.split('\n').filter(Boolean)"
              />
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
  highlights: string[]
}

const loading = ref(true)
const saving = ref(false)
const items = ref<ExperienceItem[]>([])
const editingIndex = ref<number | null>(null)
const confirmDeleteIndex = ref<number | null>(null)
let confirmTimer: ReturnType<typeof setTimeout> | null = null

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
  items.value.push({ company: '', role: '', startDate: '', endDate: '', location: '', type: 'full-time', highlights: [] })
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
</style>
