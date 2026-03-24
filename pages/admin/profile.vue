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
          <div class="label-row">
            <label class="field-label">Tagline</label>
            <button type="button" class="ai-btn" :disabled="aiTagline.loading.value" @click="runTaglineAssist">
              <svg v-if="!aiTagline.loading.value" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
              <span v-else class="ai-spinner" />
              {{ aiTagline.loading.value ? 'Thinking…' : 'AI Suggest' }}
            </button>
          </div>
          <input v-model="form.tagline" type="text" class="field-input" placeholder="Building things people love." />
          <div v-if="aiTagline.result.value" class="ai-suggestion">
            <p class="ai-suggestion-text">{{ aiTagline.result.value }}</p>
            <div class="ai-suggestion-actions">
              <button type="button" class="ai-use-btn" @click="form.tagline = aiTagline.result.value!; aiTagline.dismiss()">Use this</button>
              <button type="button" class="ai-dismiss-btn" @click="aiTagline.dismiss()">Dismiss</button>
            </div>
          </div>
          <p v-if="aiTagline.error.value" class="ai-error">{{ aiTagline.error.value }}</p>
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
          <div class="label-row">
            <label class="field-label">Bio</label>
            <button type="button" class="ai-btn" :disabled="aiBio.loading.value" @click="runBioAssist">
              <svg v-if="!aiBio.loading.value" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
              <span v-else class="ai-spinner" />
              {{ aiBio.loading.value ? 'Thinking…' : 'AI Suggest' }}
            </button>
          </div>
          <textarea v-model="form.bio" class="field-input field-textarea" rows="4" placeholder="2–4 sentence personal statement…" />
          <div v-if="aiBio.result.value" class="ai-suggestion">
            <p class="ai-suggestion-text">{{ aiBio.result.value }}</p>
            <div class="ai-suggestion-actions">
              <button type="button" class="ai-use-btn" @click="form.bio = aiBio.result.value!; aiBio.dismiss()">Use this</button>
              <button type="button" class="ai-dismiss-btn" @click="aiBio.dismiss()">Dismiss</button>
            </div>
          </div>
          <p v-if="aiBio.error.value" class="ai-error">{{ aiBio.error.value }}</p>
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

const aiBio = useAiAssist()
const aiTagline = useAiAssist()

function runBioAssist() {
  aiBio.assist('improve_bio', {
    current: form.bio,
    name: form.name,
    title: form.title,
  })
}

function runTaglineAssist() {
  aiTagline.assist('improve_tagline', {
    current: form.tagline,
    name: form.name,
    title: form.title,
    bio: form.bio,
  })
}

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

/* AI assist */
.label-row { display: flex; align-items: center; justify-content: space-between; }
.ai-btn { display: inline-flex; align-items: center; gap: 5px; font-size: 0.72rem; font-family: var(--font-mono); color: var(--accent); background: var(--accent-dim); border: 1px solid rgba(94,234,212,0.2); border-radius: var(--r-md); padding: 3px 9px; cursor: pointer; transition: background 0.15s, border-color 0.15s; white-space: nowrap; }
.ai-btn:hover:not(:disabled) { background: rgba(94,234,212,0.12); border-color: rgba(94,234,212,0.35); }
.ai-btn:disabled { opacity: 0.5; cursor: default; }
.ai-spinner { width: 10px; height: 10px; border: 1.5px solid rgba(94,234,212,0.3); border-top-color: var(--accent); border-radius: 50%; animation: ai-spin 0.7s linear infinite; }
@keyframes ai-spin { to { transform: rotate(360deg); } }
.ai-suggestion { margin-top: var(--sp-2); background: rgba(94,234,212,0.05); border: 1px solid rgba(94,234,212,0.2); border-radius: var(--r-md); padding: var(--sp-4); }
.ai-suggestion-text { font-size: 0.88rem; color: var(--text-2); line-height: 1.6; white-space: pre-wrap; margin-bottom: var(--sp-3); }
.ai-suggestion-actions { display: flex; gap: var(--sp-2); }
.ai-use-btn { font-size: 0.78rem; font-family: var(--font-mono); background: var(--accent); color: var(--bg-base); border: none; border-radius: var(--r-md); padding: 5px 12px; cursor: pointer; font-weight: 600; }
.ai-use-btn:hover { opacity: 0.9; }
.ai-dismiss-btn { font-size: 0.78rem; font-family: var(--font-mono); background: transparent; color: var(--text-3); border: 1px solid var(--border-sm); border-radius: var(--r-md); padding: 5px 12px; cursor: pointer; }
.ai-dismiss-btn:hover { color: var(--text-2); }
.ai-error { font-size: 0.78rem; color: #f87171; margin-top: var(--sp-2); font-family: var(--font-mono); }
</style>
