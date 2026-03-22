<template>
  <Teleport to="body">
    <Transition name="cp-fade">
      <div
        v-if="isOpen"
        class="cp-overlay no-print"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        @mousedown.self="close"
      >
        <div class="cp-modal" ref="modal">
          <!-- Search bar -->
          <div class="cp-search-wrap">
            <svg class="cp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref="searchInput"
              v-model="query"
              type="text"
              class="cp-input"
              placeholder="Search commands…"
              autocomplete="off"
              spellcheck="false"
              @keydown="onKeydown"
            />
            <kbd class="cp-esc-hint">esc</kbd>
          </div>

          <div class="cp-divider" />

          <!-- Results -->
          <div class="cp-results" ref="resultsList">
            <template v-if="grouped.length">
              <template v-for="group in grouped" :key="group.label">
                <p class="cp-group-label">{{ group.label }}</p>
                <button
                  v-for="cmd in group.commands"
                  :key="cmd.id"
                  class="cp-item"
                  :class="{ 'cp-item--active': activeIndex === cmd._index }"
                  :ref="el => { if (el) itemRefs[cmd._index] = el as HTMLElement }"
                  @mouseenter="activeIndex = cmd._index"
                  @click="run(cmd)"
                >
                  <span class="cp-item-icon" :style="cmd.color ? { color: cmd.color } : {}">
                    {{ cmd.icon }}
                  </span>
                  <span class="cp-item-text">
                    <span class="cp-item-label">{{ cmd.label }}</span>
                    <span v-if="cmd.desc" class="cp-item-desc">{{ cmd.desc }}</span>
                  </span>
                  <kbd v-if="cmd.kbd" class="cp-kbd">{{ cmd.kbd }}</kbd>
                </button>
              </template>
            </template>
            <p v-else class="cp-empty">No results for "{{ query }}"</p>
          </div>

          <!-- Footer -->
          <div class="cp-footer">
            <span class="cp-footer-hint"><kbd>↑↓</kbd> navigate</span>
            <span class="cp-footer-hint"><kbd>↵</kbd> run</span>
            <span class="cp-footer-hint"><kbd>esc</kbd> close</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Command {
  id: string
  group: 'navigate' | 'theme' | 'admin'
  label: string
  desc?: string
  icon: string
  action: () => void
  color?: string
  kbd?: string
  _index: number
}

interface CommandGroup {
  label: string
  commands: Command[]
}

const { isOpen, close } = useCommandPalette()
const { THEMES, currentTheme, publicThemes, hasAltTheme, togglePublicTheme } = useTheme()
const router  = useRouter()
const store   = useSiteStore()

const query       = ref('')
const activeIndex = ref(0)
const searchInput = ref<HTMLInputElement | null>(null)
const resultsList = ref<HTMLElement | null>(null)
const modal       = ref<HTMLElement | null>(null)
const itemRefs    = ref<HTMLElement[]>([])

// ── Build command list ──────────────────────────────────────────────
const allCommands = computed<Command[]>(() => {
  const cmds: Omit<Command, '_index'>[] = []

  // Navigate
  cmds.push({ id: 'nav-home',    group: 'navigate', label: 'Home',     desc: 'Go to homepage',           icon: '🏠', action: () => router.push('/') })
  cmds.push({ id: 'nav-about',   group: 'navigate', label: 'About',    desc: 'About section',            icon: '👤', action: () => router.push('/#about') })
  cmds.push({ id: 'nav-skills',  group: 'navigate', label: 'Skills',   desc: 'Skills & expertise',       icon: '⚡', action: () => router.push('/#skills') })
  cmds.push({ id: 'nav-work',    group: 'navigate', label: 'Work',     desc: 'Work experience',          icon: '💼', action: () => router.push('/#work') })
  if (store.siteSettings.showProjects)
    cmds.push({ id: 'nav-projects', group: 'navigate', label: 'Projects', desc: 'Open-source & side projects', icon: '🛠', action: () => router.push('/projects') })
  if (store.siteSettings.showBlog)
    cmds.push({ id: 'nav-blog',  group: 'navigate', label: 'Blog',     desc: 'Articles & writing',       icon: '✍️', action: () => router.push('/blog') })
  if (store.siteSettings.showContact)
    cmds.push({ id: 'nav-contact', group: 'navigate', label: 'Contact', desc: 'Get in touch',             icon: '✉️', action: () => router.push('/#contact') })
  cmds.push({ id: 'nav-resume',  group: 'navigate', label: 'Resume',   desc: 'View printable resume',    icon: '📄', action: () => router.push('/resume'), kbd: 'R' })

  // Themes — only expose the admin-configured primary/alt pair
  if (hasAltTheme.value) {
    const primary = THEMES.find(t => t.id === publicThemes.value.primary)
    const alt     = THEMES.find(t => t.id === publicThemes.value.alt)
    if (primary) cmds.push({
      id:    'theme-primary',
      group: 'theme',
      label: `${primary.label} theme`,
      desc:  primary.desc,
      icon:  '●',
      color: primary.accent,
      action: togglePublicTheme,
      kbd: currentTheme.value === primary.id ? 'active' : undefined,
    })
    if (alt) cmds.push({
      id:    'theme-alt',
      group: 'theme',
      label: `${alt.label} theme`,
      desc:  alt.desc,
      icon:  '●',
      color: alt.accent,
      action: togglePublicTheme,
      kbd: currentTheme.value === alt.id ? 'active' : undefined,
    })
  }

  // Admin
  cmds.push({ id: 'admin-dash', group: 'admin', label: 'Admin Dashboard', desc: 'Manage content & settings', icon: '⚙️', action: () => router.push('/admin') })

  return cmds.map((c, i) => ({ ...c, _index: i }))
})

// ── Filter by query ─────────────────────────────────────────────────
const filtered = computed<Command[]>(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return allCommands.value
  return allCommands.value.filter(c =>
    c.label.toLowerCase().includes(q) ||
    (c.desc ?? '').toLowerCase().includes(q),
  )
})

// Re-index after filtering so _index aligns with visual position
const reindexed = computed<Command[]>(() =>
  filtered.value.map((c, i) => ({ ...c, _index: i })),
)

// ── Group for display ───────────────────────────────────────────────
const GROUP_LABELS: Record<string, string> = {
  navigate: 'Navigate',
  theme:    'Themes',
  admin:    'Admin',
}

const grouped = computed<CommandGroup[]>(() => {
  const groups: Record<string, Command[]> = {}
  for (const cmd of reindexed.value) {
    if (!groups[cmd.group]) groups[cmd.group] = []
    groups[cmd.group].push(cmd)
  }
  return Object.entries(groups).map(([key, commands]) => ({
    label: GROUP_LABELS[key] ?? key,
    commands,
  }))
})

const totalResults = computed(() => reindexed.value.length)

// ── Keyboard navigation ─────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close()
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % totalResults.value
    scrollActiveIntoView()
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + totalResults.value) % totalResults.value
    scrollActiveIntoView()
  }
  if (e.key === 'Enter') {
    const cmd = reindexed.value[activeIndex.value]
    if (cmd) run(cmd)
  }
}

function scrollActiveIntoView() {
  nextTick(() => {
    itemRefs.value[activeIndex.value]?.scrollIntoView({ block: 'nearest' })
  })
}

function run(cmd: Command) {
  cmd.action()
  close()
}

// ── Lifecycle ───────────────────────────────────────────────────────
watch(isOpen, async (val) => {
  if (val) {
    query.value       = ''
    activeIndex.value = 0
    itemRefs.value    = []
    await nextTick()
    searchInput.value?.focus()
  }
})

// Reset active index when query changes
watch(query, () => { activeIndex.value = 0 })
</script>

<style scoped>
/* Overlay */
.cp-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: clamp(5vh, 12vh, 120px);
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* Modal */
.cp-modal {
  width: 100%;
  max-width: 580px;
  margin-inline: var(--sp-4);
  background: var(--bg-elevated);
  border: 1px solid var(--border-md);
  border-radius: var(--r-xl);
  box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}

/* Search row */
.cp-search-wrap {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-4);
}

.cp-search-icon {
  color: var(--text-3);
  flex-shrink: 0;
}

.cp-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--text-1);
  caret-color: var(--accent);
}
.cp-input::placeholder { color: var(--text-3); }

.cp-esc-hint {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--text-3);
  background: var(--bg-surface);
  border: 1px solid var(--border-xs);
  border-radius: var(--r-sm);
  padding: 2px 6px;
  flex-shrink: 0;
}

.cp-divider {
  height: 1px;
  background: var(--border-xs);
  flex-shrink: 0;
}

/* Results list */
.cp-results {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-2) var(--sp-2);
  scrollbar-width: thin;
  scrollbar-color: var(--border-md) transparent;
}

.cp-group-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-3);
  padding: var(--sp-2) var(--sp-3) var(--sp-1);
  max-width: none;
}

/* Command row */
.cp-item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  width: 100%;
  padding: 0.55em var(--sp-3);
  background: none;
  border: none;
  border-radius: var(--r-md);
  cursor: pointer;
  text-align: left;
  transition: background var(--t-fast);
}
.cp-item--active {
  background: var(--bg-surface-hv);
}

.cp-item-icon {
  font-size: 0.95rem;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
  line-height: 1;
}

.cp-item-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.cp-item-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-1);
  line-height: 1.3;
}

.cp-item-desc {
  font-size: 0.75rem;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cp-kbd {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--accent);
  background: var(--accent-dim);
  border: 1px solid rgba(94, 234, 212, 0.2);
  border-radius: 4px;
  padding: 2px 6px;
  flex-shrink: 0;
  white-space: nowrap;
}

.cp-empty {
  padding: var(--sp-8) var(--sp-4);
  text-align: center;
  color: var(--text-3);
  font-size: 0.875rem;
  max-width: none;
}

/* Footer */
.cp-footer {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-3) var(--sp-4);
  border-top: 1px solid var(--border-xs);
  flex-shrink: 0;
}

.cp-footer-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: var(--text-3);
}

.cp-footer-hint kbd {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-xs);
  border-radius: 4px;
  padding: 1px 5px;
  color: var(--text-2);
}

/* Transitions */
.cp-fade-enter-active,
.cp-fade-leave-active {
  transition: opacity 0.15s var(--ease-out);
}
.cp-fade-enter-active .cp-modal,
.cp-fade-leave-active .cp-modal {
  transition: transform 0.15s var(--ease-out), opacity 0.15s var(--ease-out);
}
.cp-fade-enter-from,
.cp-fade-leave-to {
  opacity: 0;
}
.cp-fade-enter-from .cp-modal,
.cp-fade-leave-to .cp-modal {
  transform: scale(0.97) translateY(-8px);
  opacity: 0;
}
</style>
