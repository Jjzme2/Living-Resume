<template>
  <div class="page-wrap">
    <div class="page-header-row">
      <div>
        <h2 class="page-heading">Projects</h2>
        <p class="page-sub">Manage your portfolio projects.</p>
      </div>
      <button class="btn btn-primary" :disabled="saving" @click="saveAll">
        <span v-if="saving" class="btn-spinner" />
        {{ saving ? 'Saving…' : 'Save All' }}
      </button>
    </div>

    <div v-if="loading" class="loading-block" />

    <div v-else>
      <div v-for="(item, i) in items" :key="i" class="proj-card">
        <div class="proj-card-header">
          <div class="proj-summary">
            <div class="proj-title-row">
              <span class="proj-title">{{ item.title || 'New Project' }}</span>
              <span v-if="item.featured" class="featured-badge">Featured</span>
            </div>
            <span class="proj-tags">{{ item.tags.join(', ') || '—' }}</span>
          </div>
          <div class="proj-actions">
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

        <div v-if="editingIndex === i" class="proj-form">
          <div class="form-grid">
            <div class="field-group col-span-2">
              <label class="field-label">Title</label>
              <input v-model="item.title" type="text" class="field-input" placeholder="Project Name" />
            </div>
            <div class="field-group col-span-2">
              <label class="field-label">Description</label>
              <textarea v-model="item.description" class="field-input field-textarea" rows="3" placeholder="What it does and why it matters." />
            </div>
            <div class="field-group col-span-2">
              <label class="field-label">Tags <span class="label-hint">(comma-separated)</span></label>
              <input
                :value="item.tags.join(', ')"
                type="text"
                class="field-input"
                placeholder="Nuxt, TypeScript, Pinia"
                @input="item.tags = ($event.target as HTMLInputElement).value.split(',').map(t => t.trim()).filter(Boolean)"
              />
            </div>
            <div class="field-group">
              <label class="field-label">Live URL</label>
              <input v-model="item.url" type="text" class="field-input" placeholder="https://example.com" />
            </div>
            <div class="field-group">
              <label class="field-label">Repo URL</label>
              <input v-model="item.repo" type="text" class="field-input" placeholder="https://github.com/user/repo" />
            </div>
            <div class="field-group col-span-2">
              <label class="field-label">Image URL</label>
              <input v-model="item.image" type="text" class="field-input" placeholder="/images/project.jpg or https://..." />
            </div>
            <div class="field-group col-span-2">
              <label class="featured-toggle">
                <input v-model="item.featured" type="checkbox" class="toggle-checkbox" />
                <span class="toggle-label">Featured project</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div v-if="items.length === 0" class="empty-state">No projects yet. Add one below.</div>

      <button class="btn btn-ghost add-btn" @click="addItem">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Project
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const toast = useState<{ message: string; type: 'success' | 'error' } | null>('admin-toast')

interface Project {
  title: string
  description: string
  tags: string[]
  url?: string
  repo?: string
  featured: boolean
  image?: string
}

const loading = ref(true)
const saving = ref(false)
const items = ref<Project[]>([])
const editingIndex = ref<number | null>(null)
const confirmDeleteIndex = ref<number | null>(null)
let confirmTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  try {
    const data = await $fetch<{ projects: Project[] }>('/api/admin/data')
    items.value = data.projects.map((p) => ({ ...p, tags: [...(p.tags || [])] }))
  } catch {
    toast.value = { message: 'Failed to load projects', type: 'error' }
  } finally {
    loading.value = false
  }
})

function toggleEdit(i: number) {
  editingIndex.value = editingIndex.value === i ? null : i
}

function addItem() {
  items.value.push({ title: '', description: '', tags: [], url: '', repo: '', featured: false, image: '' })
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
    await $fetch('/api/admin/section', { method: 'PUT', body: { section: 'projects', data: items.value } })
    toast.value = { message: 'Projects saved', type: 'success' }
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
.proj-card { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); margin-bottom: var(--sp-4); overflow: hidden; }
.proj-card-header { display: flex; align-items: center; justify-content: space-between; padding: var(--sp-4) var(--sp-6); gap: var(--sp-4); }
.proj-summary { display: flex; flex-direction: column; gap: var(--sp-1); }
.proj-title-row { display: flex; align-items: center; gap: var(--sp-3); }
.proj-title { font-size: 0.95rem; font-weight: 600; color: var(--text-1); }
.featured-badge { font-size: 0.65rem; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em; background: var(--accent-dim); color: var(--accent); padding: 2px 8px; border-radius: 999px; border: 1px solid rgba(94,234,212,0.3); }
.proj-tags { font-size: 0.78rem; color: var(--text-3); font-family: var(--font-mono); }
.proj-actions { display: flex; gap: var(--sp-2); flex-shrink: 0; }
.proj-form { padding: var(--sp-6); border-top: 1px solid var(--border-xs); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); }
.field-group { display: flex; flex-direction: column; gap: var(--sp-2); }
.col-span-2 { grid-column: span 2; }
.field-label { display: block; font-size: 0.78rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); }
.label-hint { font-size: 0.68rem; color: var(--text-3); text-transform: none; letter-spacing: 0; }
.field-input { width: 100%; padding: var(--sp-3) var(--sp-4); background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: var(--r-md); color: var(--text-1); font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color var(--t-fast); }
.field-input:focus { border-color: var(--accent); }
.field-input::placeholder { color: var(--text-3); }
.field-textarea { resize: vertical; }
.featured-toggle { display: flex; align-items: center; gap: var(--sp-3); cursor: pointer; }
.toggle-checkbox { width: 16px; height: 16px; accent-color: var(--accent); cursor: pointer; }
.toggle-label { font-size: 0.875rem; color: var(--text-2); }
.btn-danger-sm { padding: 6px 12px; background: rgba(239,68,68,0.12); color: rgba(239,68,68,0.8); border: 1px solid rgba(239,68,68,0.25); border-radius: var(--r-md); font-size: 0.8rem; cursor: pointer; transition: all var(--t-fast); font-family: inherit; }
.btn-danger-sm:hover { background: rgba(239,68,68,0.2); color: #ef4444; }
.btn-confirm { background: rgba(239,68,68,0.25); color: #ef4444; border-color: rgba(239,68,68,0.5); }
.empty-state { padding: var(--sp-8) 0; text-align: center; color: var(--text-3); font-size: 0.875rem; }
.add-btn { display: flex; align-items: center; gap: var(--sp-2); margin-top: var(--sp-2); }
.btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } .col-span-2 { grid-column: span 1; } }
</style>
