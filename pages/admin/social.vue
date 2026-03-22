<template>
  <div class="page-wrap">
    <h2 class="page-heading">Social Links</h2>
    <p class="page-sub">Enter your username only for each platform.</p>

    <div v-if="loading" class="loading-block" />

    <form v-else class="admin-card" @submit.prevent="save">
      <div class="field-list">
        <div v-for="platform in platforms" :key="platform.key" class="field-group">
          <label class="field-label">{{ platform.label }}</label>
          <input
            v-model="form[platform.key as keyof typeof form]"
            type="text"
            class="field-input"
            :placeholder="platform.placeholder"
          />
          <p v-if="form[platform.key as keyof typeof form]" class="field-hint">
            Full URL: <span class="hint-url">{{ platform.baseUrl }}{{ form[platform.key as keyof typeof form] }}</span>
          </p>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="btn-spinner" />
          {{ saving ? 'Saving…' : 'Save Social Links' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const toast = useState<{ message: string; type: 'success' | 'error' } | null>('admin-toast')

interface SocialForm {
  github: string
  linkedin: string
  twitter: string
  instagram: string
  youtube: string
}

const platforms = [
  { key: 'github', label: 'GitHub', placeholder: 'yourusername', baseUrl: 'https://github.com/' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'yourusername', baseUrl: 'https://linkedin.com/in/' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'yourusername', baseUrl: 'https://twitter.com/' },
  { key: 'instagram', label: 'Instagram', placeholder: 'yourusername', baseUrl: 'https://instagram.com/' },
  { key: 'youtube', label: 'YouTube', placeholder: 'yourusername', baseUrl: 'https://youtube.com/@' },
]

const loading = ref(true)
const saving = ref(false)
const form = reactive<SocialForm>({
  github: '', linkedin: '', twitter: '', instagram: '', youtube: '',
})

onMounted(async () => {
  try {
    const data = await $fetch<{ social: SocialForm }>('/api/admin/data')
    Object.assign(form, data.social)
  } catch {
    toast.value = { message: 'Failed to load social data', type: 'error' }
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  try {
    await $fetch('/api/admin/section', { method: 'PUT', body: { section: 'social', data: { ...form } } })
    toast.value = { message: 'Social links saved', type: 'success' }
  } catch {
    toast.value = { message: 'Failed to save', type: 'error' }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page-wrap { max-width: 800px; margin: 0 auto; }
.page-heading { font-size: 1.2rem; font-weight: 600; color: var(--text-1); margin-bottom: var(--sp-2); font-family: var(--font-display); }
.page-sub { font-size: 0.875rem; color: var(--text-3); margin-bottom: var(--sp-6); max-width: none; }
.loading-block { height: 300px; background: var(--bg-elevated); border-radius: var(--r-lg); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.admin-card { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); padding: var(--sp-6); }
.field-list { display: flex; flex-direction: column; gap: var(--sp-5); }
.field-group { display: flex; flex-direction: column; gap: var(--sp-2); }
.field-label { display: block; font-size: 0.78rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); }
.field-input { width: 100%; padding: var(--sp-3) var(--sp-4); background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: var(--r-md); color: var(--text-1); font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color var(--t-fast); }
.field-input:focus { border-color: var(--accent); }
.field-input::placeholder { color: var(--text-3); }
.field-hint { font-size: 0.75rem; color: var(--text-3); font-family: var(--font-mono); max-width: none; }
.hint-url { color: var(--accent); }
.form-actions { display: flex; justify-content: flex-end; margin-top: var(--sp-6); padding-top: var(--sp-6); border-top: 1px solid var(--border-xs); }
.btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
