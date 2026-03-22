<template>
  <div class="page-wrap">
    <h2 class="page-heading">Settings</h2>
    <p class="page-sub">Control site visibility and business information.</p>

    <div v-if="loading" class="loading-block" />

    <div v-else>
      <!-- Theme Selector -->
      <div class="admin-card" style="margin-bottom: var(--sp-6)">
        <h3 class="card-heading">Visitor Themes</h3>
        <p class="theme-hint">
          Choose up to two themes your visitors can switch between. If both are the same, no toggle is shown to visitors.
          Clicking a swatch previews it live on this page.
        </p>

        <!-- Preview indicator -->
        <Transition name="preview-fade">
          <div v-if="previewingTheme" class="preview-banner">
            <span class="preview-dot" :style="{ background: THEMES.find(t => t.id === previewingTheme)?.accent }" />
            Previewing <strong>{{ THEMES.find(t => t.id === previewingTheme)?.label }}</strong>
            — click to set as Primary or Alternate
          </div>
        </Transition>

        <div class="theme-pair">
          <!-- Primary -->
          <div class="theme-slot">
            <div class="theme-slot-header">
              <span class="slot-badge slot-badge--primary">1</span>
              <span class="slot-label">Primary</span>
            </div>
            <div class="theme-grid" @mouseleave="clearHoverPreview">
              <button
                v-for="t in THEMES"
                :key="t.id"
                class="theme-swatch"
                :class="{ 'theme-swatch--active': primaryTheme === t.id }"
                :style="{ '--swatch-bg': t.bg, '--swatch-accent': t.accent }"
                @mouseenter="hoverPreview(t.id)"
                @click="setPrimary(t.id)"
              >
                <span class="swatch-dot" />
                <span class="swatch-name">{{ t.label }}</span>
              </button>
            </div>
          </div>

          <!-- Alternate -->
          <div class="theme-slot">
            <div class="theme-slot-header">
              <span class="slot-badge slot-badge--alt">2</span>
              <span class="slot-label">Alternate</span>
              <span class="slot-hint">optional — gives visitors a toggle</span>
            </div>
            <div class="theme-grid" @mouseleave="clearHoverPreview">
              <button
                v-for="t in THEMES"
                :key="t.id"
                class="theme-swatch"
                :class="{ 'theme-swatch--active': altTheme === t.id }"
                :style="{ '--swatch-bg': t.bg, '--swatch-accent': t.accent }"
                @mouseenter="hoverPreview(t.id)"
                @click="setAlt(t.id)"
              >
                <span class="swatch-dot" />
                <span class="swatch-name">{{ t.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="form-actions" style="padding-top: var(--sp-4); margin-top: var(--sp-4); border-top: 1px solid var(--border-xs)">
          <span class="theme-current">
            Live:
            <strong>{{ THEMES.find(t => t.id === liveTheme.primary)?.label ?? liveTheme.primary }}</strong>
            <template v-if="liveTheme.primary !== liveTheme.alt">
              + <strong>{{ THEMES.find(t => t.id === liveTheme.alt)?.label ?? liveTheme.alt }}</strong>
            </template>
          </span>
          <button class="btn btn-primary" :disabled="savingTheme" @click="saveTheme">
            <span v-if="savingTheme" class="btn-spinner" />
            {{ savingTheme ? 'Saving…' : 'Save Themes' }}
          </button>
        </div>
      </div>

      <!-- Site Settings -->
      <div class="admin-card" style="margin-bottom: var(--sp-6)">
        <h3 class="card-heading">Site Visibility</h3>
        <div class="toggles-list">
          <div v-for="toggle in toggles" :key="toggle.key" class="toggle-row">
            <div class="toggle-info">
              <span class="toggle-label">{{ toggle.label }}</span>
              <span class="toggle-desc">{{ toggle.desc }}</span>
            </div>
            <label class="switch">
              <input v-model="settings[toggle.key as keyof typeof settings]" type="checkbox" />
              <span class="switch-track" />
            </label>
          </div>
        </div>

        <div class="field-row" style="margin-top: var(--sp-6)">
          <div class="field-group">
            <label class="field-label">Site URL</label>
            <input v-model="settings.siteUrl" type="text" class="field-input" placeholder="https://jjzettler.com" />
          </div>
          <div class="field-group">
            <label class="field-label">Copyright Year</label>
            <input v-model.number="settings.copyrightYear" type="number" class="field-input" placeholder="2026" />
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" :disabled="savingSettings" @click="saveSettings">
            <span v-if="savingSettings" class="btn-spinner" />
            {{ savingSettings ? 'Saving…' : 'Save Settings' }}
          </button>
        </div>
      </div>

      <!-- Business Info -->
      <div class="admin-card">
        <h3 class="card-heading">Business Info</h3>
        <div class="form-grid">
          <div class="field-group">
            <label class="field-label">Business Name</label>
            <input v-model="business.name" type="text" class="field-input" placeholder="Zettler Solutions LLC" />
          </div>
          <div class="field-group">
            <label class="field-label">Tagline</label>
            <input v-model="business.tagline" type="text" class="field-input" placeholder="Web solutions for small businesses." />
          </div>
          <div class="field-group col-span-2">
            <label class="field-label">Description</label>
            <textarea v-model="business.description" class="field-input field-textarea" rows="3" />
          </div>
          <div class="field-group col-span-2">
            <label class="field-label">Business URL</label>
            <input v-model="business.url" type="text" class="field-input" placeholder="https://zettlersolutions.com" />
          </div>
        </div>

        <!-- Services -->
        <div class="services-section">
          <div class="services-header">
            <h4 class="services-title">Services</h4>
            <button class="btn btn-ghost btn-sm" @click="addService">+ Add Service</button>
          </div>
          <div v-for="(svc, i) in business.services" :key="i" class="service-row">
            <div class="field-group" style="flex:1">
              <label class="field-label">Title</label>
              <input v-model="svc.title" type="text" class="field-input" placeholder="Web Development" />
            </div>
            <div class="field-group" style="flex:2">
              <label class="field-label">Description</label>
              <input v-model="svc.description" type="text" class="field-input" placeholder="Custom sites and apps built to perform." />
            </div>
            <button class="btn-danger-sm service-del" @click="removeService(i)">×</button>
          </div>
          <div v-if="business.services.length === 0" class="empty-state-sm">No services. Add one above.</div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" :disabled="savingBusiness" @click="saveBusiness">
            <span v-if="savingBusiness" class="btn-spinner" />
            {{ savingBusiness ? 'Saving…' : 'Save Business Info' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const toast = useState<{ message: string; type: 'success' | 'error' } | null>('admin-toast')

// ── Theme ─────────────────────────────────────────────────────────
const { THEMES, applyTheme, setPublicThemes } = useTheme()
const primaryTheme    = ref<string>('midnight')
const altTheme        = ref<string>('midnight')
const liveTheme       = ref<{ primary: string; alt: string }>({ primary: 'midnight', alt: 'midnight' })
const savingTheme     = ref(false)
const previewingTheme = ref<string | null>(null)
const lastCommitted   = ref<string>('midnight') // last theme applied via click

function hoverPreview(id: string) {
  previewingTheme.value = id
  applyTheme(id)
}

function clearHoverPreview() {
  previewingTheme.value = null
  applyTheme(lastCommitted.value)
}

function setPrimary(id: string) {
  primaryTheme.value = id
  lastCommitted.value = id
  applyTheme(id)
}

function setAlt(id: string) {
  altTheme.value = id
  lastCommitted.value = id
  applyTheme(id)
}

async function saveTheme() {
  savingTheme.value = true
  try {
    await setPublicThemes(primaryTheme.value, altTheme.value)
    liveTheme.value = { primary: primaryTheme.value, alt: altTheme.value }
    const p = THEMES.find(t => t.id === primaryTheme.value)?.label ?? primaryTheme.value
    const a = THEMES.find(t => t.id === altTheme.value)?.label ?? altTheme.value
    toast.value = { message: primaryTheme.value === altTheme.value ? `Theme set to ${p}` : `Themes set: ${p} + ${a}`, type: 'success' }
  } catch {
    toast.value = { message: 'Failed to save themes', type: 'error' }
  } finally {
    savingTheme.value = false
  }
}

interface SiteSettings {
  showAbout: boolean
  showSkills: boolean
  showExperience: boolean
  showProjects: boolean
  showBlog: boolean
  showContact: boolean
  showServices: boolean
  showInterview: boolean
  siteUrl: string
  copyrightYear: number
}

interface Service { title: string; description: string }
interface BusinessInfo { name: string; tagline: string; description: string; url: string; services: Service[] }

const loading = ref(true)
const savingSettings = ref(false)
const savingBusiness = ref(false)

const settings = reactive<SiteSettings>({
  showAbout: true, showSkills: true, showExperience: true,
  showProjects: true, showBlog: true, showContact: true, showServices: true,
  showInterview: false,
  siteUrl: '', copyrightYear: 2026,
})

const business = reactive<BusinessInfo>({
  name: '', tagline: '', description: '', url: '', services: [],
})

const toggles = [
  { key: 'showAbout', label: 'About Section', desc: 'Show the About / Bio section' },
  { key: 'showSkills', label: 'Skills Section', desc: 'Show the Skills section' },
  { key: 'showExperience', label: 'Experience Section', desc: 'Show the Experience section' },
  { key: 'showProjects', label: 'Projects Section', desc: 'Show the Projects section' },
  { key: 'showBlog', label: 'Blog Section', desc: 'Show the Blog preview section' },
  { key: 'showContact', label: 'Contact Section', desc: 'Show the Contact section' },
  { key: 'showServices', label: 'Services Section', desc: 'Show the Services section' },
  { key: 'showInterview', label: 'Ask Me Anything (AI Chat)', desc: 'Enable the AI-powered interview chat — requires Anthropic API credits' },
]

onMounted(async () => {
  try {
    const data = await $fetch<{ siteSettings: SiteSettings & { theme?: string }; business: BusinessInfo }>('/api/admin/data')
    Object.assign(settings, data.siteSettings)
    Object.assign(business, { ...data.business, services: [...(data.business.services || [])] })
    const savedPrimary = (data.siteSettings as Record<string, unknown>).theme    as string ?? 'midnight'
    const savedAlt     = (data.siteSettings as Record<string, unknown>).themeAlt as string ?? savedPrimary
    primaryTheme.value  = savedPrimary
    altTheme.value      = savedAlt
    liveTheme.value     = { primary: savedPrimary, alt: savedAlt }
    lastCommitted.value = savedPrimary
  } catch {
    toast.value = { message: 'Failed to load settings', type: 'error' }
  } finally {
    loading.value = false
  }
})

function addService() {
  business.services.push({ title: '', description: '' })
}

function removeService(i: number) {
  business.services.splice(i, 1)
}

async function saveSettings() {
  savingSettings.value = true
  try {
    await $fetch('/api/admin/section', { method: 'PUT', body: { section: 'settings', data: { ...settings } } })
    toast.value = { message: 'Settings saved', type: 'success' }
  } catch {
    toast.value = { message: 'Failed to save settings', type: 'error' }
  } finally {
    savingSettings.value = false
  }
}

async function saveBusiness() {
  savingBusiness.value = true
  try {
    await $fetch('/api/admin/section', { method: 'PUT', body: { section: 'business', data: { ...business } } })
    toast.value = { message: 'Business info saved', type: 'success' }
  } catch {
    toast.value = { message: 'Failed to save business info', type: 'error' }
  } finally {
    savingBusiness.value = false
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
.card-heading { font-size: 1rem; font-weight: 600; color: var(--text-1); margin-bottom: var(--sp-6); padding-bottom: var(--sp-3); border-bottom: 1px solid var(--border-sm); font-family: var(--font-display); }
.toggles-list { display: flex; flex-direction: column; gap: var(--sp-3); }
.toggle-row { display: flex; align-items: center; justify-content: space-between; padding: var(--sp-3) var(--sp-4); background: var(--bg-surface); border-radius: var(--r-md); }
.toggle-info { display: flex; flex-direction: column; gap: 2px; }
.toggle-label { font-size: 0.875rem; font-weight: 500; color: var(--text-1); }
.toggle-desc { font-size: 0.75rem; color: var(--text-3); }
/* Toggle switch */
.switch { position: relative; display: inline-block; width: 40px; height: 22px; cursor: pointer; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.switch-track { position: absolute; inset: 0; background: var(--bg-base); border: 1px solid var(--border-sm); border-radius: 999px; transition: all var(--t-fast); }
.switch-track::after { content: ''; position: absolute; width: 16px; height: 16px; left: 2px; top: 50%; transform: translateY(-50%); background: var(--text-3); border-radius: 50%; transition: all var(--t-fast); }
.switch input:checked + .switch-track { background: var(--accent-dim); border-color: rgba(94,234,212,0.4); }
.switch input:checked + .switch-track::after { transform: translate(18px, -50%); background: var(--accent); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); margin-bottom: var(--sp-4); }
.field-group { display: flex; flex-direction: column; gap: var(--sp-2); }
.col-span-2 { grid-column: span 2; }
.field-label { display: block; font-size: 0.78rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); }
.field-input { width: 100%; padding: var(--sp-3) var(--sp-4); background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: var(--r-md); color: var(--text-1); font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color var(--t-fast); }
.field-input:focus { border-color: var(--accent); }
.field-input::placeholder { color: var(--text-3); }
.field-textarea { resize: vertical; }
.services-section { margin-top: var(--sp-6); padding-top: var(--sp-6); border-top: 1px solid var(--border-xs); }
.services-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-4); }
.services-title { font-size: 0.85rem; font-weight: 600; color: var(--text-2); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.06em; }
.btn-sm { font-size: 0.8rem; padding: var(--sp-2) var(--sp-3); }
.service-row { display: flex; gap: var(--sp-3); align-items: flex-end; margin-bottom: var(--sp-3); }
.service-del { padding: 8px 10px; align-self: flex-end; margin-bottom: 0; }
.btn-danger-sm { background: rgba(239,68,68,0.12); color: rgba(239,68,68,0.8); border: 1px solid rgba(239,68,68,0.25); border-radius: var(--r-md); font-size: 0.8rem; cursor: pointer; transition: all var(--t-fast); font-family: inherit; }
.btn-danger-sm:hover { background: rgba(239,68,68,0.2); color: #ef4444; }
.empty-state-sm { font-size: 0.82rem; color: var(--text-3); padding: var(--sp-3) 0; }
.form-actions { display: flex; justify-content: flex-end; margin-top: var(--sp-6); padding-top: var(--sp-6); border-top: 1px solid var(--border-xs); }
.btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
/* Theme selector */
.theme-hint { font-size: 0.82rem; color: var(--text-3); margin-bottom: var(--sp-4); max-width: none; line-height: 1.5; }
.preview-banner { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); background: var(--accent-dim); border: 1px solid rgba(94,234,212,0.2); border-radius: var(--r-md); font-size: 0.82rem; color: var(--text-2); margin-bottom: var(--sp-4); }
.preview-banner strong { color: var(--accent); }
.preview-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 6px currentColor; }
.preview-fade-enter-active, .preview-fade-leave-active { transition: opacity 0.15s, transform 0.15s; }
.preview-fade-enter-from, .preview-fade-leave-to { opacity: 0; transform: translateY(-4px); }
.theme-pair { display: flex; flex-direction: column; gap: var(--sp-6); }
.theme-slot { display: flex; flex-direction: column; gap: var(--sp-3); }
.theme-slot-header { display: flex; align-items: center; gap: var(--sp-2); margin-bottom: var(--sp-1); }
.slot-badge { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; font-size: 0.72rem; font-weight: 700; font-family: var(--font-mono); flex-shrink: 0; }
.slot-badge--primary { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(94,234,212,0.3); }
.slot-badge--alt     { background: rgba(129,140,248,0.10); color: #818cf8; border: 1px solid rgba(129,140,248,0.3); }
.slot-label { font-size: 0.82rem; font-weight: 600; color: var(--text-2); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.06em; }
.slot-hint  { font-size: 0.72rem; color: var(--text-3); }
.theme-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-2); }
.theme-swatch {
  display: flex; flex-direction: column; gap: var(--sp-1);
  padding: var(--sp-4); background: var(--swatch-bg, var(--bg-surface));
  border: 2px solid transparent; border-radius: var(--r-lg); cursor: pointer;
  text-align: left; transition: all var(--t-fast); font-family: inherit;
  position: relative; overflow: hidden;
}
.theme-swatch::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, var(--swatch-accent, var(--accent)) 0%, transparent 60%);
  opacity: 0.08; pointer-events: none;
}
.theme-swatch:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-1px); }
.theme-swatch--active { border-color: var(--accent) !important; }
.swatch-dot {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--swatch-accent, var(--accent));
  box-shadow: 0 0 8px var(--swatch-accent, var(--accent));
  margin-bottom: var(--sp-1);
}
.swatch-name { font-size: 0.78rem; font-weight: 600; color: #fff; }
/* Dawn swatch: dark text on light bg */
.theme-swatch[style*="fef8f0"] .swatch-name,
.theme-swatch[style*="fef8f0"] { color: #1c0e06; }
.theme-current { font-size: 0.8rem; color: var(--text-3); font-family: var(--font-mono); align-self: center; }
.theme-current strong { color: var(--text-2); }
@media (max-width: 600px) { .form-grid, .field-row { grid-template-columns: 1fr; } .col-span-2 { grid-column: span 1; } .service-row { flex-wrap: wrap; } .theme-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
