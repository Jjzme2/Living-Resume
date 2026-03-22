<template>
  <div class="page-wrap">
    <div class="page-header-row">
      <div>
        <h2 class="page-heading">Skills</h2>
        <p class="page-sub">Manage your skill set. Level is 0–100.</p>
      </div>
      <button class="btn btn-primary" :disabled="saving" @click="saveAll">
        <span v-if="saving" class="btn-spinner" />
        {{ saving ? 'Saving…' : 'Save All' }}
      </button>
    </div>

    <div v-if="loading" class="loading-block" />

    <div v-else class="admin-card">
      <!-- Skills table -->
      <div v-if="skills.length > 0" class="skills-table-wrap">
        <table class="skills-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(skill, i) in skills" :key="i">
              <td>
                <input v-model="skill.name" type="text" class="field-input field-input-sm" placeholder="Skill name" />
              </td>
              <td>
                <select v-model="skill.category" class="field-input field-input-sm">
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </td>
              <td>
                <input v-model.number="skill.level" type="number" min="0" max="100" class="field-input field-input-sm field-input-level" />
              </td>
              <td>
                <button
                  class="btn-danger-sm"
                  :class="{ 'btn-confirm': confirmDeleteIndex === i }"
                  @click="handleDelete(i)"
                >
                  {{ confirmDeleteIndex === i ? 'Confirm?' : 'Delete' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">No skills yet. Add one below.</div>

      <!-- Add new skill -->
      <div class="add-section">
        <h3 class="add-heading">Add New Skill</h3>
        <div class="add-row">
          <input v-model="newSkill.name" type="text" class="field-input" placeholder="Skill name" />
          <select v-model="newSkill.category" class="field-input">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <input v-model.number="newSkill.level" type="number" min="0" max="100" class="field-input field-input-level" placeholder="75" />
          <button class="btn btn-primary" :disabled="!newSkill.name.trim()" @click="addSkill">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const toast = useState<{ message: string; type: 'success' | 'error' } | null>('admin-toast')

interface Skill {
  name: string
  category: string
  level: number
}

const categories = ['Frontend', 'Backend', 'DevOps', 'Tools', 'Soft Skills']

const loading = ref(true)
const saving = ref(false)
const skills = ref<Skill[]>([])
const confirmDeleteIndex = ref<number | null>(null)
let confirmTimer: ReturnType<typeof setTimeout> | null = null

const newSkill = reactive<Skill>({ name: '', category: 'Frontend', level: 75 })

onMounted(async () => {
  try {
    const data = await $fetch<{ skills: Skill[] }>('/api/admin/data')
    skills.value = data.skills.map((s) => ({ ...s }))
  } catch {
    toast.value = { message: 'Failed to load skills', type: 'error' }
  } finally {
    loading.value = false
  }
})

function handleDelete(i: number) {
  if (confirmDeleteIndex.value === i) {
    skills.value.splice(i, 1)
    confirmDeleteIndex.value = null
    if (confirmTimer) clearTimeout(confirmTimer)
  } else {
    confirmDeleteIndex.value = i
    if (confirmTimer) clearTimeout(confirmTimer)
    confirmTimer = setTimeout(() => { confirmDeleteIndex.value = null }, 2000)
  }
}

function addSkill() {
  if (!newSkill.name.trim()) return
  skills.value.push({ name: newSkill.name.trim(), category: newSkill.category, level: newSkill.level })
  newSkill.name = ''
  newSkill.level = 75
}

async function saveAll() {
  saving.value = true
  try {
    await $fetch('/api/admin/section', { method: 'PUT', body: { section: 'skills', data: skills.value } })
    toast.value = { message: 'Skills saved', type: 'success' }
  } catch {
    toast.value = { message: 'Failed to save skills', type: 'error' }
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
.admin-card { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); padding: var(--sp-6); }
.skills-table-wrap { overflow-x: auto; margin-bottom: var(--sp-6); }
.skills-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.skills-table th { padding: var(--sp-2) var(--sp-3); text-align: left; font-size: 0.72rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); border-bottom: 1px solid var(--border-sm); }
.skills-table td { padding: var(--sp-2) var(--sp-3); border-bottom: 1px solid var(--border-xs); }
.field-input { width: 100%; padding: var(--sp-3) var(--sp-4); background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: var(--r-md); color: var(--text-1); font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color var(--t-fast); }
.field-input:focus { border-color: var(--accent); }
.field-input::placeholder { color: var(--text-3); }
.field-input-sm { padding: var(--sp-2) var(--sp-3); font-size: 0.82rem; }
.field-input-level { width: 70px; }
.btn-danger-sm { padding: 4px 10px; background: rgba(239,68,68,0.12); color: rgba(239,68,68,0.8); border: 1px solid rgba(239,68,68,0.25); border-radius: var(--r-md); font-size: 0.75rem; cursor: pointer; transition: all var(--t-fast); }
.btn-danger-sm:hover { background: rgba(239,68,68,0.2); color: #ef4444; }
.btn-confirm { background: rgba(239,68,68,0.25); color: #ef4444; border-color: rgba(239,68,68,0.5); }
.empty-state { padding: var(--sp-8) 0; text-align: center; color: var(--text-3); font-size: 0.875rem; }
.add-section { border-top: 1px solid var(--border-xs); padding-top: var(--sp-6); }
.add-heading { font-size: 0.85rem; font-weight: 600; color: var(--text-2); margin-bottom: var(--sp-3); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.06em; }
.add-row { display: flex; gap: var(--sp-3); align-items: flex-end; }
.add-row .field-input { flex: 1; }
.add-row .field-input-level { flex: 0 0 80px; }
.btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 600px) { .add-row { flex-wrap: wrap; } }
</style>
