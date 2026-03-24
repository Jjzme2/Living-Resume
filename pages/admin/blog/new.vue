<template>
  <div class="page-wrap">
    <div class="page-header">
      <NuxtLink to="/admin/blog" class="back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Blog
      </NuxtLink>
      <h1 class="page-title">New Post</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="post-form">
      <!-- Compact frontmatter row -->
      <div class="fm-card">
        <div class="fm-grid">
          <div class="field field-wide">
            <label class="field-label">Title <span class="req">*</span></label>
            <input v-model="form.title" class="field-input" placeholder="Your Post Title" required />
          </div>
          <div class="field">
            <label class="field-label">Category <span class="req">*</span></label>
            <input v-model="form.category" class="field-input" placeholder="tech" required />
          </div>
          <div class="field">
            <label class="field-label">Slug <span class="req">*</span></label>
            <input v-model="form.slug" class="field-input" placeholder="my-post-title" required />
          </div>

          <div class="field field-wide">
            <label class="field-label">Description <span class="req">*</span></label>
            <input v-model="form.description" class="field-input" placeholder="One-line summary for SEO and cards" required />
          </div>
          <div class="field">
            <label class="field-label">Date <span class="req">*</span></label>
            <input v-model="form.date" type="date" class="field-input" required />
          </div>
          <div class="field">
            <label class="field-label">Status</label>
            <select v-model="form.status" class="field-input">
              <option value="published">published</option>
              <option value="draft">draft</option>
            </select>
          </div>

          <div class="field">
            <label class="field-label">Author</label>
            <input v-model="form.author" class="field-input" placeholder="Your Name" />
          </div>
          <div class="field">
            <label class="field-label">Tags</label>
            <input v-model="tagsInput" class="field-input" placeholder="tag1, tag2, tag3" />
          </div>
          <div class="field">
            <label class="field-label">Cover Image</label>
            <input v-model="form.image" class="field-input" placeholder="/images/blog/cover.jpg" />
          </div>
        </div>
        <div class="fm-path">
          <span class="path-label">File:</span>
          <code class="path-code">content/blog/{{ form.category || 'category' }}/{{ form.slug || 'slug' }}.md</code>
          <span class="path-arrow">→</span>
          <code class="path-code">/blog/{{ form.category || 'category' }}/{{ form.slug || 'slug' }}</code>
        </div>
      </div>

      <!-- Side-by-side: editor + preview -->
      <div class="editor-preview-pane">
        <!-- Left: editor -->
        <div class="editor-side">
          <div class="pane-header">
            <span class="pane-label">Markdown</span>
            <div class="toolbar">
              <button type="button" class="tb-btn" @click="insert('**', '**')" title="Bold"><strong>B</strong></button>
              <button type="button" class="tb-btn tb-i" @click="insert('*', '*')" title="Italic">I</button>
              <button type="button" class="tb-btn" @click="insertLine('## ')" title="Heading 2">H2</button>
              <button type="button" class="tb-btn" @click="insertLine('### ')" title="Heading 3">H3</button>
              <button type="button" class="tb-btn" @click="insertLine('- ')" title="List">—</button>
              <button type="button" class="tb-btn" @click="insertLine('> ')" title="Blockquote">"</button>
              <button type="button" class="tb-btn" @click="insert('`', '`')" title="Inline code">&lt;/&gt;</button>
              <button type="button" class="tb-btn" @click="insertCodeBlock" title="Code block">```</button>
              <button type="button" class="tb-btn tb-link" @click="insertLink" title="Link">🔗</button>
            </div>
            <div class="word-count">{{ wordCount }} words</div>
          </div>
          <textarea
            ref="editorEl"
            v-model="form.content"
            class="editor-textarea"
            placeholder="Write your markdown content here…"
            spellcheck="true"
          />
        </div>

        <!-- Right: live rendered preview -->
        <div class="preview-side">
          <div class="pane-header">
            <span class="pane-label">Preview</span>
            <div class="preview-meta">
              <span v-if="form.status === 'draft'" class="draft-badge">draft</span>
              <span class="read-time">~{{ readTime }} min read</span>
            </div>
          </div>
          <div class="preview-scroll">
            <!-- Post header -->
            <div class="preview-post-header">
              <div v-if="form.status === 'draft'" class="preview-draft-banner">Draft — not publicly visible</div>
              <div v-if="previewTags.length" class="preview-tags">
                <span v-for="tag in previewTags" :key="tag" class="preview-tag">{{ tag }}</span>
              </div>
              <h1 class="preview-title">{{ form.title || 'Post Title' }}</h1>
              <p v-if="form.description" class="preview-desc">{{ form.description }}</p>
              <div class="preview-byline">
                <span>{{ form.author || 'Author' }}</span>
                <span class="byline-sep">·</span>
                <span>{{ formatPreviewDate(form.date) }}</span>
              </div>
            </div>

            <!-- Rendered markdown -->
            <div class="preview-content prose" v-html="renderedMarkdown" />

            <!-- Empty state -->
            <div v-if="!form.content.trim()" class="preview-empty">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              <p>Start writing to see the preview</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="action-row">
        <div class="action-left">
          <span class="r2-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
            Saves to R2
          </span>
        </div>
        <div class="action-right">
          <button type="button" class="btn btn-ghost" @click="downloadFile" :disabled="!canSubmit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download .md
          </button>
          <button type="submit" class="btn btn-primary" :disabled="!canSubmit || saving">
            <svg v-if="saving" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {{ saving ? 'Saving…' : 'Save to R2' }}
          </button>
        </div>
      </div>

      <div v-if="error" class="status-msg status-error">{{ error }}</div>
      <div v-if="success" class="status-msg status-success">{{ success }}</div>

      <!-- AI Writing Assistance -->
      <div class="ai-panel">
        <div class="ai-panel-header">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
          AI Writing Assist
          <span class="ai-panel-sub">Grammar, clarity, and focus</span>
        </div>
        <div class="ai-action-row">
          <button type="button" class="ai-btn ai-btn-polish" :disabled="aiWriting || !form.content.trim()" @click="runAiPolish">
            <span v-if="aiWriting === 'polish'" class="ai-spin-sm" />
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            {{ aiWriting === 'polish' ? 'Polishing…' : 'Polish Post' }}
          </button>
          <button type="button" class="ai-btn" :disabled="!!aiWriting || !form.content.trim()" @click="runAiReview">
            <span v-if="aiWriting === 'review'" class="ai-spin-sm" />
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            {{ aiWriting === 'review' ? 'Reviewing…' : 'Review Draft' }}
          </button>
        </div>

        <!-- Polish result -->
        <div v-if="aiPolishResult" class="ai-result-card">
          <div class="ai-result-label">Polished version — review changes before applying:</div>
          <pre class="ai-result-pre">{{ aiPolishResult }}</pre>
          <div class="ai-result-actions">
            <button type="button" class="ai-use-btn" @click="applyPolish">Apply to editor</button>
            <button type="button" class="ai-dismiss-btn" @click="aiPolishResult = null">Dismiss</button>
          </div>
        </div>

        <!-- Review feedback -->
        <div v-if="aiReviewResult" class="ai-result-card ai-result-feedback">
          <div class="ai-result-label">Editorial feedback:</div>
          <div class="ai-review-body">{{ aiReviewResult }}</div>
          <div class="ai-result-actions">
            <button type="button" class="ai-dismiss-btn" @click="aiReviewResult = null">Dismiss</button>
          </div>
        </div>

        <p v-if="aiWriteError" class="ai-write-error">{{ aiWriteError }}</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const editorEl = ref<HTMLTextAreaElement | null>(null)

const today = new Date().toISOString().slice(0, 10)
const form = reactive({
  title: '', description: '', category: '', slug: '',
  date: today, status: 'published', author: '', image: '', content: '',
})
const tagsInput = ref('')

const previousTitle = ref('')
watch(() => form.title, (val) => {
  if (!form.slug || form.slug === slugify(previousTitle.value)) form.slug = slugify(val)
  previousTitle.value = val
})

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const previewTags = computed(() =>
  tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
)

const wordCount = computed(() => {
  const words = form.content.trim().split(/\s+/).filter(Boolean)
  return words.length
})

const readTime = computed(() => Math.max(1, Math.ceil(wordCount.value / 200)))

function formatPreviewDate(d: string) {
  if (!d) return 'Date'
  try { return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d + 'T12:00:00')) }
  catch { return d }
}

// Simple markdown to HTML renderer
function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderMarkdown(md: string): string {
  if (!md.trim()) return ''
  let html = md

  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="lang-${lang || 'text'}">${escHtml(code.trimEnd())}</code></pre>`)

  // Process line by line for block elements
  const lines = html.split('\n')
  const out: string[] = []
  let inList = false
  let inBlockquote = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Skip lines inside code blocks (already replaced)
    if (line.startsWith('<pre>') || line.endsWith('</pre>') || line.includes('</code></pre>')) {
      if (inList) { out.push('</ul>'); inList = false }
      if (inBlockquote) { out.push('</blockquote>'); inBlockquote = false }
      out.push(line)
      continue
    }

    // Headings
    if (/^#{1,6} /.test(line)) {
      if (inList) { out.push('</ul>'); inList = false }
      if (inBlockquote) { out.push('</blockquote>'); inBlockquote = false }
      const level = line.match(/^#+/)![0].length
      const text = inlineRender(line.slice(level + 1))
      out.push(`<h${level}>${text}</h${level}>`)
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      if (inList) { out.push('</ul>'); inList = false }
      if (!inBlockquote) { out.push('<blockquote>'); inBlockquote = true }
      out.push(`<p>${inlineRender(line.slice(2))}</p>`)
      continue
    }
    if (inBlockquote && !line.startsWith('> ')) {
      out.push('</blockquote>')
      inBlockquote = false
    }

    // List item
    if (/^[-*+] /.test(line)) {
      if (inBlockquote) { out.push('</blockquote>'); inBlockquote = false }
      if (!inList) { out.push('<ul>'); inList = true }
      out.push(`<li>${inlineRender(line.slice(2))}</li>`)
      continue
    }
    if (inList && line.trim() === '') {
      out.push('</ul>')
      inList = false
      continue
    }
    if (inList && !/^[-*+] /.test(line)) {
      out.push('</ul>')
      inList = false
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      out.push('<hr />')
      continue
    }

    // Empty line
    if (line.trim() === '') {
      out.push('')
      continue
    }

    // Paragraph
    out.push(`<p>${inlineRender(line)}</p>`)
  }

  if (inList) out.push('</ul>')
  if (inBlockquote) out.push('</blockquote>')

  return out.join('\n')
}

function inlineRender(text: string): string {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
}

const renderedMarkdown = computed(() => renderMarkdown(form.content))

// Generated file content
const generatedMarkdown = computed(() => {
  const tags = previewTags.value
  const lines: string[] = ['---']
  lines.push(`title: "${form.title}"`)
  lines.push(`description: "${form.description}"`)
  lines.push(`date: "${form.date}"`)
  if (form.status !== 'published') lines.push(`status: "${form.status}"`)
  if (form.category) lines.push(`category: "${form.category}"`)
  if (form.author) lines.push(`author: "${form.author}"`)
  if (tags.length) lines.push(`tags: [${tags.map(t => `"${t}"`).join(', ')}]`)
  if (form.image) lines.push(`image: "${form.image}"`)
  lines.push('---', '', form.content)
  return lines.join('\n')
})

const canSubmit = computed(() =>
  form.title.trim() && form.description.trim() && form.category.trim() && form.slug.trim() && form.date
)

const saving = ref(false)
const error = ref('')
const success = ref('')

function downloadFile() {
  const blob = new Blob([generatedMarkdown.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${form.slug || 'post'}.md`
  a.click()
  URL.revokeObjectURL(url)
}

async function handleSubmit() {
  if (!canSubmit.value || saving.value) return
  saving.value = true; error.value = ''; success.value = ''
  try {
    const slug = `${form.category}/${form.slug}`
    const tags = previewTags.value
    await $fetch('/api/admin/blog/save', {
      method: 'POST',
      body: {
        slug,
        body: form.content,
        meta: {
          title: form.title,
          description: form.description,
          date: form.date,
          status: form.status,
          category: form.category,
          author: form.author || undefined,
          tags: tags.length ? tags : undefined,
          image: form.image || undefined,
        },
      },
    })
    success.value = `Saved to R2: /blog/${slug}`
  } catch (e: unknown) {
    error.value = (e as { statusMessage?: string; data?: { message?: string } })?.statusMessage
      ?? (e as { data?: { message?: string } })?.data?.message
      ?? 'Failed to save post.'
  } finally {
    saving.value = false
  }
}

// ── AI Writing Assist ─────────────────────────────────────────────
const aiWriting = ref<'polish' | 'review' | null>(null)
const aiPolishResult = ref<string | null>(null)
const aiReviewResult = ref<string | null>(null)
const aiWriteError = ref('')

async function runAiPolish() {
  aiWriting.value = 'polish'
  aiPolishResult.value = null
  aiReviewResult.value = null
  aiWriteError.value = ''
  try {
    const data = await $fetch<{ result: string }>('/api/admin/ai-assist', {
      method: 'POST',
      body: {
        mode: 'polish_blog',
        context: {
          title: form.title,
          description: form.description,
          content: form.content,
        },
      },
    })
    aiPolishResult.value = data.result
  } catch (e: unknown) {
    aiWriteError.value = (e as { statusMessage?: string })?.statusMessage || 'AI polish failed'
  } finally {
    aiWriting.value = null
  }
}

async function runAiReview() {
  aiWriting.value = 'review'
  aiPolishResult.value = null
  aiReviewResult.value = null
  aiWriteError.value = ''
  try {
    const data = await $fetch<{ result: string }>('/api/admin/ai-assist', {
      method: 'POST',
      body: {
        mode: 'review_blog',
        context: {
          title: form.title,
          description: form.description,
          content: form.content,
        },
      },
    })
    aiReviewResult.value = data.result
  } catch (e: unknown) {
    aiWriteError.value = (e as { statusMessage?: string })?.statusMessage || 'AI review failed'
  } finally {
    aiWriting.value = null
  }
}

function applyPolish() {
  if (aiPolishResult.value) {
    form.content = aiPolishResult.value
    aiPolishResult.value = null
  }
}

function insert(before: string, after: string) {
  const el = editorEl.value
  if (!el) return
  const start = el.selectionStart; const end = el.selectionEnd
  const selected = form.content.slice(start, end)
  form.content = form.content.slice(0, start) + before + selected + after + form.content.slice(end)
  nextTick(() => { el.selectionStart = start + before.length; el.selectionEnd = start + before.length + selected.length; el.focus() })
}

function insertLine(prefix: string) {
  const el = editorEl.value
  if (!el) return
  const start = el.selectionStart
  const lineStart = form.content.lastIndexOf('\n', start - 1) + 1
  form.content = form.content.slice(0, lineStart) + prefix + form.content.slice(lineStart)
  nextTick(() => { el.selectionStart = el.selectionEnd = lineStart + prefix.length; el.focus() })
}

function insertCodeBlock() {
  const el = editorEl.value
  if (!el) return
  const start = el.selectionStart
  const snippet = '\n```\n\n```\n'
  form.content = form.content.slice(0, start) + snippet + form.content.slice(start)
  nextTick(() => { el.selectionStart = el.selectionEnd = start + 5; el.focus() })
}

function insertLink() {
  const el = editorEl.value
  if (!el) return
  const start = el.selectionStart; const end = el.selectionEnd
  const selected = form.content.slice(start, end) || 'Link text'
  const snippet = `[${selected}](https://)`
  form.content = form.content.slice(0, start) + snippet + form.content.slice(end)
  nextTick(() => { el.selectionStart = start + selected.length + 3; el.selectionEnd = start + snippet.length - 1; el.focus() })
}
</script>

<style scoped>
.page-wrap { max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; align-items: center; gap: var(--sp-4); margin-bottom: var(--sp-5); }
.back-link { display: inline-flex; align-items: center; gap: var(--sp-2); font-size: 0.8rem; color: var(--text-3); text-decoration: none; transition: color var(--t-fast); flex-shrink: 0; }
.back-link:hover { color: var(--accent); }
.page-title { font-size: 1.3rem; font-weight: 700; color: var(--text-1); font-family: var(--font-display); }

.post-form { display: flex; flex-direction: column; gap: var(--sp-4); }

/* Frontmatter card */
.fm-card { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); padding: var(--sp-5); }
.fm-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: var(--sp-3); margin-bottom: var(--sp-4); }
.field { display: flex; flex-direction: column; gap: var(--sp-1); }
.field-wide { grid-column: span 1; }
.field-label { font-size: 0.72rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); }
.req { color: var(--accent); }
.field-input { background: var(--bg-surface); border: 1px solid var(--border-sm); border-radius: var(--r-md); padding: var(--sp-2) var(--sp-3); font-size: 0.85rem; color: var(--text-1); font-family: inherit; transition: border-color var(--t-fast); }
.field-input:focus { outline: none; border-color: var(--accent); }
.field-input::placeholder { color: var(--text-3); }
.fm-path { display: flex; align-items: center; gap: var(--sp-2); font-size: 0.72rem; flex-wrap: wrap; padding-top: var(--sp-3); border-top: 1px solid var(--border-xs); }
.path-label { color: var(--text-3); font-family: var(--font-mono); }
.path-code { font-family: var(--font-mono); color: var(--accent); background: var(--accent-dim); border: 1px solid rgba(94,234,212,0.2); border-radius: var(--r-sm); padding: 0.15em 0.5em; }
.path-arrow { color: var(--text-3); }

/* Side-by-side pane */
.editor-preview-pane { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); height: 620px; }
.editor-side, .preview-side { display: flex; flex-direction: column; background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); overflow: hidden; }

.pane-header { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-2) var(--sp-4); background: var(--bg-surface); border-bottom: 1px solid var(--border-xs); flex-shrink: 0; }
.pane-label { font-size: 0.7rem; font-family: var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-3); }
.toolbar { display: flex; gap: 2px; flex: 1; }
.tb-btn { background: none; border: 1px solid transparent; border-radius: var(--r-sm); color: var(--text-3); font-size: 0.7rem; font-weight: 600; font-family: var(--font-mono); padding: 0.15em 0.45em; cursor: pointer; transition: all var(--t-fast); line-height: 1.4; }
.tb-btn:hover { color: var(--accent); border-color: rgba(94,234,212,0.3); background: var(--accent-dim); }
.tb-i { font-style: italic; }
.tb-link { font-size: 0.7rem; }
.word-count { font-size: 0.68rem; color: var(--text-3); font-family: var(--font-mono); flex-shrink: 0; margin-left: auto; }
.editor-textarea { flex: 1; display: block; width: 100%; resize: none; background: var(--bg-elevated); border: none; padding: var(--sp-4); font-family: var(--font-mono); font-size: 0.83rem; line-height: 1.75; color: var(--text-1); box-sizing: border-box; }
.editor-textarea:focus { outline: none; }

.preview-meta { display: flex; align-items: center; gap: var(--sp-3); margin-left: auto; }
.draft-badge { font-size: 0.65rem; font-family: var(--font-mono); padding: 0.15em 0.6em; border-radius: 99px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); color: #f59e0b; text-transform: uppercase; letter-spacing: 0.08em; }
.read-time { font-size: 0.68rem; color: var(--text-3); font-family: var(--font-mono); }

.preview-scroll { flex: 1; overflow-y: auto; padding: var(--sp-6); }

.preview-post-header { margin-bottom: var(--sp-6); padding-bottom: var(--sp-6); border-bottom: 1px solid var(--border-xs); }
.preview-draft-banner { font-size: 0.72rem; font-family: var(--font-mono); color: #f59e0b; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: var(--r-md); padding: var(--sp-2) var(--sp-3); margin-bottom: var(--sp-3); text-align: center; }
.preview-tags { display: flex; gap: var(--sp-2); flex-wrap: wrap; margin-bottom: var(--sp-3); }
.preview-tag { font-size: 0.68rem; font-family: var(--font-mono); padding: 0.2em 0.6em; border-radius: 99px; background: var(--accent-dim); border: 1px solid rgba(94,234,212,0.2); color: var(--accent); }
.preview-title { font-size: 1.6rem; font-weight: 700; color: var(--text-1); font-family: var(--font-display); line-height: 1.2; margin: 0 0 var(--sp-3); }
.preview-desc { font-size: 0.9rem; color: var(--text-3); margin: 0 0 var(--sp-3); line-height: 1.5; max-width: none; }
.preview-byline { font-size: 0.78rem; color: var(--text-3); font-family: var(--font-mono); display: flex; gap: var(--sp-2); align-items: center; }
.byline-sep { color: var(--border-sm); }

.preview-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--sp-3); padding: var(--sp-12) 0; color: var(--text-3); text-align: center; }
.preview-empty p { font-size: 0.875rem; max-width: none; }

/* Prose styles for markdown preview */
.prose :deep(h1) { font-size: 1.5rem; font-weight: 700; color: var(--text-1); margin: var(--sp-6) 0 var(--sp-3); font-family: var(--font-display); }
.prose :deep(h2) { font-size: 1.2rem; font-weight: 600; color: var(--text-1); margin: var(--sp-6) 0 var(--sp-3); font-family: var(--font-display); }
.prose :deep(h3) { font-size: 1rem; font-weight: 600; color: var(--text-2); margin: var(--sp-4) 0 var(--sp-2); }
.prose :deep(p) { font-size: 0.9rem; color: var(--text-2); line-height: 1.75; margin: 0 0 var(--sp-4); max-width: none; }
.prose :deep(ul) { padding-left: var(--sp-6); margin: 0 0 var(--sp-4); }
.prose :deep(li) { font-size: 0.9rem; color: var(--text-2); line-height: 1.7; margin-bottom: var(--sp-1); }
.prose :deep(blockquote) { border-left: 3px solid var(--accent); padding: var(--sp-3) var(--sp-4); background: var(--accent-dim); border-radius: 0 var(--r-md) var(--r-md) 0; margin: var(--sp-4) 0; }
.prose :deep(blockquote p) { color: var(--text-2); margin: 0; }
.prose :deep(code) { font-family: var(--font-mono); font-size: 0.82em; background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: 3px; padding: 0.1em 0.4em; color: var(--accent); }
.prose :deep(pre) { background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: var(--r-md); padding: var(--sp-4); margin: var(--sp-4) 0; overflow-x: auto; }
.prose :deep(pre code) { background: none; border: none; padding: 0; font-size: 0.82rem; color: var(--text-2); }
.prose :deep(a) { color: var(--accent); text-decoration: underline; text-underline-offset: 2px; }
.prose :deep(strong) { color: var(--text-1); font-weight: 600; }
.prose :deep(em) { color: var(--text-2); font-style: italic; }
.prose :deep(del) { color: var(--text-3); text-decoration: line-through; }
.prose :deep(hr) { border: none; border-top: 1px solid var(--border-sm); margin: var(--sp-6) 0; }

/* Actions */
.action-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--sp-3); }
.action-left { display: flex; align-items: center; }
.action-right { display: flex; align-items: center; gap: var(--sp-3); }
.r2-badge { display: inline-flex; align-items: center; gap: var(--sp-2); font-size: 0.72rem; font-family: var(--font-mono); color: var(--accent); background: var(--accent-dim); border: 1px solid rgba(94,234,212,0.2); border-radius: 99px; padding: 0.3em 0.8em; }
.status-msg { padding: var(--sp-3) var(--sp-4); border-radius: var(--r-md); font-size: 0.85rem; line-height: 1.5; }
.status-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #f87171; }
.status-success { background: var(--accent-dim); border: 1px solid rgba(94,234,212,0.25); color: var(--accent); }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* AI writing panel */
.ai-panel { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-4); }
.ai-panel-header { display: flex; align-items: center; gap: var(--sp-2); font-size: 0.88rem; font-weight: 600; color: var(--text-1); font-family: var(--font-display); }
.ai-panel-sub { font-size: 0.75rem; color: var(--text-3); font-weight: 400; margin-left: var(--sp-2); }
.ai-action-row { display: flex; gap: var(--sp-3); flex-wrap: wrap; }
.ai-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; font-family: var(--font-mono); color: var(--accent); background: var(--accent-dim); border: 1px solid rgba(94,234,212,0.2); border-radius: var(--r-md); padding: 6px 14px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.ai-btn:hover:not(:disabled) { background: rgba(94,234,212,0.12); border-color: rgba(94,234,212,0.35); }
.ai-btn:disabled { opacity: 0.5; cursor: default; }
.ai-btn-polish { background: rgba(94,234,212,0.08); border-color: rgba(94,234,212,0.3); }
.ai-spin-sm { width: 11px; height: 11px; border: 1.5px solid rgba(94,234,212,0.3); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
.ai-result-card { background: var(--bg-surface); border: 1px solid rgba(94,234,212,0.2); border-radius: var(--r-md); padding: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-3); }
.ai-result-feedback { border-color: rgba(251,191,36,0.2); }
.ai-result-label { font-size: 0.7rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
.ai-result-feedback .ai-result-label { color: #fbbf24; }
.ai-result-pre { font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.7; color: var(--text-2); white-space: pre-wrap; margin: 0; max-height: 320px; overflow-y: auto; }
.ai-review-body { font-size: 0.85rem; line-height: 1.7; color: var(--text-2); white-space: pre-wrap; max-height: 400px; overflow-y: auto; }
.ai-result-actions { display: flex; gap: var(--sp-2); padding-top: var(--sp-2); border-top: 1px solid var(--border-xs); }
.ai-use-btn { font-size: 0.78rem; font-family: var(--font-mono); background: var(--accent); color: var(--bg-base); border: none; border-radius: var(--r-md); padding: 5px 14px; cursor: pointer; font-weight: 600; }
.ai-use-btn:hover { opacity: 0.9; }
.ai-dismiss-btn { font-size: 0.78rem; font-family: var(--font-mono); background: transparent; color: var(--text-3); border: 1px solid var(--border-sm); border-radius: var(--r-md); padding: 5px 12px; cursor: pointer; }
.ai-dismiss-btn:hover { color: var(--text-2); }
.ai-write-error { font-size: 0.78rem; color: #f87171; font-family: var(--font-mono); margin: 0; }

@media (max-width: 960px) {
  .fm-grid { grid-template-columns: 1fr 1fr; }
  .editor-preview-pane { grid-template-columns: 1fr; height: auto; }
  .editor-side { height: 400px; }
  .preview-side { height: 500px; }
}
@media (max-width: 640px) {
  .fm-grid { grid-template-columns: 1fr; }
  .action-row { flex-direction: column; align-items: stretch; }
  .action-right { flex-direction: column; }
  .action-right .btn { width: 100%; justify-content: center; }
}
</style>
