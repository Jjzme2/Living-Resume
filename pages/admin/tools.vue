<template>
  <div class="page-wrap">
    <h2 class="page-heading">Tools</h2>
    <p class="page-sub">Utilities, integrations, and helpful resources.</p>

    <div class="tools-grid">
      <!-- Data Management -->
      <div class="card">
        <h3 class="card-heading">Data Management</h3>

        <div class="tool-row">
          <div class="tool-info">
            <span class="tool-name">Export Site Data</span>
            <span class="tool-desc">Download all your portfolio data as a JSON file. Useful for backups and migrating between environments.</span>
          </div>
          <button class="btn btn-ghost btn-sm" :disabled="exporting" @click="exportData">
            <span v-if="exporting" class="btn-spinner" />
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {{ exporting ? 'Exporting…' : 'Export JSON' }}
          </button>
        </div>

        <div class="divider" />

        <div class="tool-row align-start">
          <div class="tool-info">
            <span class="tool-name">Reset Section to Defaults</span>
            <span class="tool-desc">Clear a specific section from the database and revert to the config file defaults. This is destructive and cannot be undone.</span>
          </div>
          <div class="reset-controls">
            <select v-model="resetSection" class="field-input select-sm">
              <option value="">Choose section…</option>
              <option value="person">Profile</option>
              <option value="social">Social Links</option>
              <option value="skills">Skills</option>
              <option value="experience">Experience</option>
              <option value="education">Education</option>
              <option value="projects">Projects</option>
              <option value="settings">Site Settings</option>
              <option value="business">Business Info</option>
            </select>
            <button
              class="btn-danger-sm"
              :class="{ 'btn-confirm': confirmReset }"
              :disabled="!resetSection || resetting"
              @click="handleReset"
            >
              <span v-if="resetting" class="btn-spinner btn-spinner-red" />
              {{ confirmReset ? 'Confirm Reset?' : 'Reset' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Integration Status -->
      <div class="card">
        <h3 class="card-heading">Integration Status</h3>
        <div v-if="loadingStatus" class="status-skeleton" v-for="i in 4" :key="i" />
        <div v-else class="integration-list">
          <div v-for="item in integrations" :key="item.label" class="integration-row">
            <div class="int-header">
              <div class="status-dot" :class="item.ok ? 'dot-ok' : 'dot-off'" />
              <span class="int-label">{{ item.label }}</span>
              <span class="int-badge" :class="item.ok ? 'badge-ok' : 'badge-off'">
                {{ item.ok ? 'Connected' : 'Not set' }}
              </span>
            </div>
            <p class="int-desc">{{ item.desc }}</p>
            <div v-if="!item.ok" class="int-vars">
              <span class="vars-label">Required:</span>
              <code v-for="v in item.vars" :key="v" class="env-var">{{ v }}</code>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Navigation -->
    <div class="card">
      <h3 class="card-heading">Site Pages</h3>
      <div class="links-grid">
        <a v-for="link in siteLinks" :key="link.href" :href="link.href" target="_blank" rel="noopener" class="site-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          {{ link.label }}
        </a>
      </div>
    </div>

    <!-- Resources -->
    <div class="card">
      <h3 class="card-heading">Resources & Docs</h3>
      <div class="resources-grid">
        <a v-for="r in resources" :key="r.href" :href="r.href" target="_blank" rel="noopener" class="resource-card">
          <span class="resource-name">{{ r.name }}</span>
          <span class="resource-desc">{{ r.desc }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const toast = useState<{ message: string; type: 'success' | 'error' } | null>('admin-toast')

interface StatusData { db: boolean; email: boolean; ai: boolean; github: boolean }

const loadingStatus = ref(true)
const status = ref<StatusData | null>(null)
const exporting = ref(false)
const resetSection = ref('')
const resetting = ref(false)
const confirmReset = ref(false)
let confirmTimer: ReturnType<typeof setTimeout> | null = null

const integrations = computed(() => [
  {
    label: 'Firebase (database)',
    ok: status.value?.db ?? false,
    desc: 'Persistent storage for all site data, messages, and analytics. Set up a Firestore database in your Firebase project.',
    vars: ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'],
  },
  {
    label: 'Resend (email notifications)',
    ok: status.value?.email ?? false,
    desc: 'Sends you an email when someone submits the contact form, and delivers daily analytics digests.',
    vars: ['RESEND_API_KEY', 'CONTACT_TO_EMAIL'],
  },
  {
    label: 'Anthropic (AI resume parser)',
    ok: status.value?.ai ?? false,
    desc: 'Powers the Resume Parser tool — paste any resume text and have it auto-fill your portfolio.',
    vars: ['ANTHROPIC_API_KEY'],
  },
  {
    label: 'GitHub (blog publishing)',
    ok: status.value?.github ?? false,
    desc: 'Lets you publish blog posts directly to your GitHub repo from the admin panel.',
    vars: ['GITHUB_TOKEN', 'GITHUB_REPO'],
  },
])

const siteLinks = [
  { href: '/', label: 'Home' },
  { href: '/resume', label: 'Resume' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
]

const resources = [
  { name: 'Firebase Console', desc: 'Manage Firestore database, rules, and service accounts', href: 'https://console.firebase.google.com' },
  { name: 'Vercel Dashboard', desc: 'Manage deployments and environment variables', href: 'https://vercel.com/dashboard' },
  { name: 'Resend Dashboard', desc: 'View email delivery logs and manage API keys', href: 'https://resend.com/dashboard' },
  { name: 'Anthropic Console', desc: 'Manage Claude API keys and usage', href: 'https://console.anthropic.com' },
  { name: 'Nuxt 3 Docs', desc: 'Framework documentation for this site', href: 'https://nuxt.com/docs' },
  { name: 'Nuxt Content Docs', desc: 'How blog markdown files are queried and rendered', href: 'https://content.nuxt.com' },
]

async function exportData() {
  exporting.value = true
  try {
    const data = await $fetch('/api/admin/data')
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.value = { message: 'Data exported successfully', type: 'success' }
  } catch {
    toast.value = { message: 'Export failed', type: 'error' }
  } finally {
    exporting.value = false
  }
}

function handleReset() {
  if (!resetSection.value) return
  if (confirmReset.value) {
    doReset()
  } else {
    confirmReset.value = true
    if (confirmTimer) clearTimeout(confirmTimer)
    confirmTimer = setTimeout(() => { confirmReset.value = false }, 3000)
  }
}

async function doReset() {
  resetting.value = true
  confirmReset.value = false
  try {
    await $fetch('/api/admin/section/reset', { method: 'DELETE', body: { section: resetSection.value } })
    toast.value = { message: `${resetSection.value} reset to defaults`, type: 'success' }
    resetSection.value = ''
  } catch {
    toast.value = { message: 'Reset failed', type: 'error' }
  } finally {
    resetting.value = false
  }
}

onMounted(async () => {
  try {
    status.value = await $fetch<StatusData>('/api/admin/status')
  } catch { /* ignore */ } finally {
    loadingStatus.value = false
  }
})
</script>

<style scoped>
.page-wrap { max-width: 900px; margin: 0 auto; }
.page-heading { font-size: 1.2rem; font-weight: 600; color: var(--text-1); margin-bottom: var(--sp-2); font-family: var(--font-display); }
.page-sub { font-size: 0.875rem; color: var(--text-3); margin-bottom: var(--sp-6); max-width: none; }

.tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-6); margin-bottom: var(--sp-6); }

.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-lg);
  padding: var(--sp-6);
  margin-bottom: var(--sp-6);
}
.tools-grid .card { margin-bottom: 0; }

.card-heading {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-1);
  font-family: var(--font-display);
  margin-bottom: var(--sp-5);
  padding-bottom: var(--sp-3);
  border-bottom: 1px solid var(--border-xs);
}

/* Tool rows */
.tool-row { display: flex; align-items: center; gap: var(--sp-4); justify-content: space-between; }
.tool-row.align-start { align-items: flex-start; }
.tool-info { display: flex; flex-direction: column; gap: var(--sp-1); flex: 1; }
.tool-name { font-size: 0.875rem; font-weight: 500; color: var(--text-1); }
.tool-desc { font-size: 0.8rem; color: var(--text-3); line-height: 1.5; max-width: none; }

.divider { height: 1px; background: var(--border-xs); margin: var(--sp-5) 0; }

.reset-controls { display: flex; flex-direction: column; gap: var(--sp-2); flex-shrink: 0; min-width: 160px; }
.select-sm { font-size: 0.8rem; padding: var(--sp-2) var(--sp-3); }
.field-input { width: 100%; padding: var(--sp-3) var(--sp-4); background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: var(--r-md); color: var(--text-1); font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color var(--t-fast); }
.field-input:focus { border-color: var(--accent); }

.btn-sm { font-size: 0.8rem; padding: var(--sp-2) var(--sp-3); }
.btn-spinner { width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
.btn-spinner-red { border-color: rgba(239,68,68,0.3); border-top-color: #ef4444; }

.btn-danger-sm { padding: 7px 14px; background: rgba(239,68,68,0.12); color: rgba(239,68,68,0.8); border: 1px solid rgba(239,68,68,0.25); border-radius: var(--r-md); font-size: 0.8rem; cursor: pointer; transition: all var(--t-fast); font-family: inherit; display: flex; align-items: center; gap: var(--sp-2); justify-content: center; }
.btn-danger-sm:hover:not(:disabled) { background: rgba(239,68,68,0.2); color: #ef4444; }
.btn-danger-sm:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-confirm { background: rgba(239,68,68,0.25); color: #ef4444; border-color: rgba(239,68,68,0.5); }

/* Integration list */
.status-skeleton { height: 80px; background: var(--bg-surface); border-radius: var(--r-md); margin-bottom: var(--sp-3); animation: pulse 1.5s ease-in-out infinite; }
.integration-list { display: flex; flex-direction: column; gap: var(--sp-4); }
.integration-row { padding: var(--sp-4); background: var(--bg-surface); border-radius: var(--r-md); border: 1px solid var(--border-xs); }
.int-header { display: flex; align-items: center; gap: var(--sp-2); margin-bottom: var(--sp-2); }

.status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.dot-ok { background: var(--accent); box-shadow: 0 0 5px var(--accent); }
.dot-off { background: var(--border-sm); }

.int-label { font-size: 0.875rem; font-weight: 500; color: var(--text-1); flex: 1; }
.int-badge { font-size: 0.7rem; font-family: var(--font-mono); padding: 2px 8px; border-radius: 999px; }
.badge-ok { background: rgba(94,234,212,0.12); color: var(--accent); border: 1px solid rgba(94,234,212,0.25); }
.badge-off { background: rgba(255,255,255,0.04); color: var(--text-3); border: 1px solid var(--border-xs); }

.int-desc { font-size: 0.8rem; color: var(--text-3); line-height: 1.5; margin-bottom: var(--sp-2); max-width: none; }
.int-vars { display: flex; align-items: center; gap: var(--sp-2); flex-wrap: wrap; }
.vars-label { font-size: 0.72rem; color: var(--text-3); font-family: var(--font-mono); }
.env-var { font-size: 0.72rem; font-family: var(--font-mono); background: var(--bg-base); border: 1px solid var(--border-sm); border-radius: var(--r-sm); padding: 1px 6px; color: var(--text-2); }

/* Site links */
.links-grid { display: flex; gap: var(--sp-3); flex-wrap: wrap; }
.site-link { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-2) var(--sp-4); background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: var(--r-md); font-size: 0.82rem; color: var(--text-2); text-decoration: none; font-family: var(--font-mono); transition: all var(--t-fast); }
.site-link:hover { border-color: rgba(94,234,212,0.3); color: var(--accent); }

/* Resources */
.resources-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-3); }
.resource-card { display: flex; flex-direction: column; gap: var(--sp-1); padding: var(--sp-4); background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: var(--r-md); text-decoration: none; transition: all var(--t-fast); }
.resource-card:hover { border-color: rgba(94,234,212,0.2); background: var(--accent-dim); }
.resource-name { font-size: 0.875rem; font-weight: 500; color: var(--text-1); }
.resource-desc { font-size: 0.75rem; color: var(--text-3); line-height: 1.4; max-width: none; }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .tools-grid { grid-template-columns: 1fr; }
  .resources-grid { grid-template-columns: 1fr 1fr; }
  .tool-row { flex-direction: column; align-items: flex-start; }
  .reset-controls { width: 100%; }
}
</style>
