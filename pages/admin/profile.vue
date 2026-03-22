<template>
  <div class="page-wrap">
    <h2 class="page-heading">Profile</h2>
    <p class="page-sub">Your personal information shown across the site.</p>

    <div v-if="loading" class="loading-block" />

    <form v-else class="admin-card" @submit.prevent="save">
      <div class="form-grid">
        <div class="field-group">
          <label class="field-label">Display Name</label>
          <input v-model="form.name" type="text" class="field-input" placeholder="Jj Zettler" />
        </div>
        <div class="field-group">
          <label class="field-label">Full Legal Name</label>
          <input v-model="form.fullName" type="text" class="field-input" placeholder="John Zettler Jr" />
        </div>
        <div class="field-group">
          <label class="field-label">Initials</label>
          <input v-model="form.initials" type="text" class="field-input" placeholder="JZ" maxlength="4" />
        </div>
        <div class="field-group">
          <label class="field-label">Title / Role</label>
          <input v-model="form.title" type="text" class="field-input" placeholder="Developer & Entrepreneur" />
        </div>
        <div class="field-group col-span-2">
          <label class="field-label">Tagline</label>
          <input v-model="form.tagline" type="text" class="field-input" placeholder="Building things people love." />
        </div>
        <div class="field-group">
          <label class="field-label">Location</label>
          <input v-model="form.location" type="text" class="field-input" placeholder="Northeast Ohio" />
        </div>
        <div class="field-group">
          <label class="field-label">Email</label>
          <input v-model="form.email" type="email" class="field-input" placeholder="jj@example.com" />
        </div>
        <div class="field-group">
          <label class="field-label">Phone</label>
          <input v-model="form.phone" type="text" class="field-input" placeholder="+1 (555) 000-0000" />
        </div>
        <div class="field-group">
          <label class="field-label">Avatar URL</label>
          <input v-model="form.avatarUrl" type="text" class="field-input" placeholder="https://... or /images/avatar.jpg" />
        </div>
        <div class="field-group col-span-2">
          <label class="field-label">Resume PDF URL</label>
          <input v-model="form.resumePdfUrl" type="text" class="field-input" placeholder="https://..." />
        </div>
        <div class="field-group col-span-2">
          <label class="field-label">Bio</label>
          <textarea v-model="form.bio" class="field-input field-textarea" rows="4" placeholder="2–4 sentence personal statement…" />
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="btn-spinner" />
          {{ saving ? 'Saving…' : 'Save Profile' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const toast = useState<{ message: string; type: 'success' | 'error' } | null>('admin-toast')

interface PersonForm {
  name: string
  fullName: string
  initials: string
  title: string
  tagline: string
  location: string
  email: string
  phone: string
  bio: string
  avatarUrl: string
  resumePdfUrl: string
}

const loading = ref(true)
const saving = ref(false)
const form = reactive<PersonForm>({
  name: '', fullName: '', initials: '', title: '', tagline: '',
  location: '', email: '', phone: '', bio: '', avatarUrl: '', resumePdfUrl: '',
})

onMounted(async () => {
  try {
    const data = await $fetch<{ person: PersonForm }>('/api/admin/data')
    Object.assign(form, data.person)
  } catch {
    toast.value = { message: 'Failed to load profile data', type: 'error' }
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  try {
    await $fetch('/api/admin/section', { method: 'PUT', body: { section: 'person', data: { ...form } } })
    toast.value = { message: 'Profile saved successfully', type: 'success' }
  } catch {
    toast.value = { message: 'Failed to save profile', type: 'error' }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page-wrap { max-width: 800px; margin: 0 auto; }
.page-heading { font-size: 1.2rem; font-weight: 600; color: var(--text-1); margin-bottom: var(--sp-2); font-family: var(--font-display); }
.page-sub { font-size: 0.875rem; color: var(--text-3); margin-bottom: var(--sp-6); max-width: none; }
.loading-block { height: 400px; background: var(--bg-elevated); border-radius: var(--r-lg); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.admin-card { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); padding: var(--sp-6); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); }
.field-group { display: flex; flex-direction: column; gap: var(--sp-2); }
.col-span-2 { grid-column: span 2; }
.field-label { display: block; font-size: 0.78rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); }
.field-input { width: 100%; padding: var(--sp-3) var(--sp-4); background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: var(--r-md); color: var(--text-1); font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color var(--t-fast); }
.field-input:focus { border-color: var(--accent); }
.field-input::placeholder { color: var(--text-3); }
.field-textarea { resize: vertical; min-height: 100px; }
.form-actions { display: flex; justify-content: flex-end; margin-top: var(--sp-6); padding-top: var(--sp-6); border-top: 1px solid var(--border-xs); gap: var(--sp-3); }
.btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } .col-span-2 { grid-column: span 1; } }
</style>
