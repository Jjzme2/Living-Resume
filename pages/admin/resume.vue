<template>
  <div class="page-wrap">
    <h2 class="page-heading">Resume Parser</h2>
    <p class="page-sub">Paste resume text to automatically extract structured data using Claude AI. Review before applying.</p>

    <div class="info-banner">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>Parsing uses Claude AI to extract structured data from raw text. PDF files are not directly supported — copy-paste the text content instead. Review all fields before applying.</span>
    </div>

    <!-- Step 1: Input -->
    <div v-if="step === 'input'" class="admin-card">
      <h3 class="card-heading">Step 1: Provide Resume Text</h3>

      <div class="field-group" style="margin-bottom: var(--sp-4)">
        <label class="field-label">Paste Resume Text</label>
        <textarea
          v-model="resumeText"
          class="field-input field-textarea"
          rows="16"
          placeholder="Paste the full text of your resume here. You can copy-paste from a PDF viewer, Word document, or any text source…"
        />
      </div>

      <div class="field-group" style="margin-bottom: var(--sp-6)">
        <label class="field-label">Or Upload a Text / Markdown File</label>
        <input type="file" accept=".txt,.md" class="file-input" @change="handleFile" />
        <p class="field-hint">Accepts .txt and .md files. For PDF, use your PDF viewer's copy-paste feature.</p>
      </div>

      <div class="form-actions">
        <button
          class="btn btn-primary"
          :disabled="!resumeText.trim() || parsing"
          @click="parseResume"
        >
          <span v-if="parsing" class="btn-spinner" />
          {{ parsing ? 'Parsing with AI…' : 'Parse with AI' }}
        </button>
      </div>

      <div v-if="parseError" class="error-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ parseError }}
      </div>
    </div>

    <!-- Step 2: Preview -->
    <div v-if="step === 'preview' && parsed" class="preview-wrap">
      <div class="admin-card" style="margin-bottom: var(--sp-4)">
        <h3 class="card-heading">Step 2: Review Parsed Data</h3>
        <p style="font-size: 0.875rem; color: var(--text-3); max-width: none; margin-bottom: var(--sp-4)">
          Review the extracted information below. Click "Apply to Site" to save all sections.
        </p>
        <div class="preview-actions">
          <button class="btn btn-primary" :disabled="applying" @click="applyToSite">
            <span v-if="applying" class="btn-spinner" />
            {{ applying ? 'Applying…' : 'Apply to Site' }}
          </button>
          <button class="btn btn-ghost" @click="step = 'input'">Back</button>
        </div>
      </div>

      <!-- Person -->
      <div v-if="parsed.person" class="preview-section">
        <h4 class="preview-heading">Person / Identity</h4>
        <div class="preview-grid">
          <div v-for="(val, key) in parsed.person" :key="key" class="preview-field">
            <span class="pf-key">{{ key }}</span>
            <span class="pf-val">{{ val || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Skills -->
      <div v-if="parsed.skills?.length" class="preview-section">
        <h4 class="preview-heading">Skills ({{ parsed.skills.length }})</h4>
        <div class="skills-preview">
          <div v-for="(sk, i) in parsed.skills" :key="i" class="skill-chip">
            <span>{{ sk.name }}</span>
            <span class="chip-cat">{{ sk.category }}</span>
            <span class="chip-level">{{ sk.level }}</span>
          </div>
        </div>
      </div>

      <!-- Experience -->
      <div v-if="parsed.experience?.length" class="preview-section">
        <h4 class="preview-heading">Experience ({{ parsed.experience.length }})</h4>
        <div v-for="(exp, i) in parsed.experience" :key="i" class="preview-card">
          <div class="pc-title">{{ exp.company }} — {{ exp.role }}</div>
          <div class="pc-sub">{{ exp.startDate }} – {{ exp.endDate ?? 'Present' }} · {{ exp.location }} · {{ exp.type }}</div>
          <ul class="pc-list">
            <li v-for="(h, j) in exp.highlights" :key="j">{{ h }}</li>
          </ul>
        </div>
      </div>

      <!-- Education -->
      <div v-if="parsed.education?.length" class="preview-section">
        <h4 class="preview-heading">Education ({{ parsed.education.length }})</h4>
        <div v-for="(ed, i) in parsed.education" :key="i" class="preview-card">
          <div class="pc-title">{{ ed.institution }}</div>
          <div class="pc-sub">{{ ed.degree }}{{ ed.field ? `, ${ed.field}` : '' }} · {{ ed.graduationYear }}</div>
          <div v-if="ed.honors" class="pc-honors">{{ ed.honors }}</div>
        </div>
      </div>

      <!-- Projects -->
      <div v-if="parsed.projects?.length" class="preview-section">
        <h4 class="preview-heading">Projects ({{ parsed.projects.length }})</h4>
        <div v-for="(proj, i) in parsed.projects" :key="i" class="preview-card">
          <div class="pc-title">{{ proj.title }}</div>
          <div class="pc-sub">{{ proj.tags?.join(', ') }}</div>
          <div class="pc-desc">{{ proj.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const toast = useState<{ message: string; type: 'success' | 'error' } | null>('admin-toast')

const step = ref<'input' | 'preview'>('input')
const resumeText = ref('')
const parsing = ref(false)
const applying = ref(false)
const parseError = ref('')
const parsed = ref<Record<string, unknown> | null>(null)

function handleFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => { resumeText.value = e.target?.result as string ?? '' }
  reader.readAsText(file)
}

async function parseResume() {
  if (!resumeText.value.trim()) return
  parsing.value = true
  parseError.value = ''
  try {
    const result = await $fetch<Record<string, unknown>>('/api/admin/parse-resume', {
      method: 'POST',
      body: { text: resumeText.value },
    })
    parsed.value = result
    step.value = 'preview'
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    parseError.value = e?.data?.statusMessage ?? 'Parsing failed. Please try again.'
  } finally {
    parsing.value = false
  }
}

async function applyToSite() {
  if (!parsed.value) return
  applying.value = true

  const sectionMap: Record<string, string> = {
    person: 'person',
    skills: 'skills',
    experience: 'experience',
    education: 'education',
    projects: 'projects',
  }

  const results = await Promise.allSettled(
    Object.entries(sectionMap)
      .filter(([key]) => parsed.value![key] !== undefined)
      .map(([key, section]) =>
        $fetch('/api/admin/section', {
          method: 'PUT',
          body: { section, data: parsed.value![key] },
        })
      )
  )

  const failed = results.filter((r) => r.status === 'rejected').length
  applying.value = false

  if (failed === 0) {
    toast.value = { message: 'All sections applied successfully!', type: 'success' }
    step.value = 'input'
    resumeText.value = ''
    parsed.value = null
  } else {
    toast.value = { message: `${failed} section(s) failed to save. Try again.`, type: 'error' }
  }
}
</script>

<style scoped>
.page-wrap { max-width: 800px; margin: 0 auto; }
.page-heading { font-size: 1.2rem; font-weight: 600; color: var(--text-1); margin-bottom: var(--sp-2); font-family: var(--font-display); }
.page-sub { font-size: 0.875rem; color: var(--text-3); margin-bottom: var(--sp-4); max-width: none; }
.info-banner { display: flex; align-items: flex-start; gap: var(--sp-3); padding: var(--sp-3) var(--sp-4); background: rgba(129,140,248,0.08); border: 1px solid rgba(129,140,248,0.2); border-radius: var(--r-md); font-size: 0.82rem; color: #a5b4fc; margin-bottom: var(--sp-6); }
.info-banner svg { flex-shrink: 0; margin-top: 2px; stroke: #a5b4fc; }
.admin-card { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); padding: var(--sp-6); }
.card-heading { font-size: 1rem; font-weight: 600; color: var(--text-1); margin-bottom: var(--sp-4); font-family: var(--font-display); padding-bottom: var(--sp-3); border-bottom: 1px solid var(--border-sm); }
.field-group { display: flex; flex-direction: column; gap: var(--sp-2); }
.field-label { display: block; font-size: 0.78rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); }
.field-input { width: 100%; padding: var(--sp-3) var(--sp-4); background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: var(--r-md); color: var(--text-1); font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color var(--t-fast); }
.field-input:focus { border-color: var(--accent); }
.field-input::placeholder { color: var(--text-3); }
.field-textarea { resize: vertical; font-family: var(--font-mono); font-size: 0.82rem; }
.file-input { color: var(--text-2); font-size: 0.875rem; }
.field-hint { font-size: 0.75rem; color: var(--text-3); max-width: none; }
.form-actions { display: flex; gap: var(--sp-3); }
.error-banner { display: flex; align-items: flex-start; gap: var(--sp-3); padding: var(--sp-3) var(--sp-4); background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: var(--r-md); font-size: 0.82rem; color: #ef4444; margin-top: var(--sp-4); }
.preview-actions { display: flex; gap: var(--sp-3); }
.preview-section { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); padding: var(--sp-6); margin-bottom: var(--sp-4); }
.preview-heading { font-size: 0.85rem; font-weight: 600; color: var(--accent); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: var(--sp-4); }
.preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-3); }
.preview-field { display: flex; flex-direction: column; gap: 2px; }
.pf-key { font-size: 0.7rem; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-3); }
.pf-val { font-size: 0.875rem; color: var(--text-1); }
.skills-preview { display: flex; flex-wrap: wrap; gap: var(--sp-2); }
.skill-chip { display: inline-flex; align-items: center; gap: var(--sp-2); padding: 4px 10px; background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: 999px; font-size: 0.78rem; color: var(--text-2); }
.chip-cat { color: var(--text-3); font-family: var(--font-mono); font-size: 0.68rem; }
.chip-level { background: var(--accent-dim); color: var(--accent); font-family: var(--font-mono); font-size: 0.68rem; padding: 1px 5px; border-radius: 999px; }
.preview-card { padding: var(--sp-4); background: var(--bg-surface); border-radius: var(--r-md); margin-bottom: var(--sp-3); }
.pc-title { font-size: 0.9rem; font-weight: 600; color: var(--text-1); margin-bottom: var(--sp-1); }
.pc-sub { font-size: 0.78rem; color: var(--text-3); font-family: var(--font-mono); margin-bottom: var(--sp-2); }
.pc-desc { font-size: 0.82rem; color: var(--text-2); max-width: none; }
.pc-honors { font-size: 0.78rem; color: var(--accent); font-family: var(--font-mono); }
.pc-list { padding-left: var(--sp-4); display: flex; flex-direction: column; gap: 2px; }
.pc-list li { font-size: 0.82rem; color: var(--text-2); }
.btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 600px) { .preview-grid { grid-template-columns: 1fr; } }
</style>
