<template>
  <div ref="container" class="theme-switcher no-print">
    <button
      class="ts-btn"
      :class="{ active: open }"
      title="Switch theme"
      aria-label="Open theme switcher"
      @click="open = !open"
    >
      <!-- Paint palette icon -->
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" stroke="none"/>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" stroke="none"/>
        <circle cx="8.5"  cy="7.5"  r=".5" fill="currentColor" stroke="none"/>
        <circle cx="6.5"  cy="12.5" r=".5" fill="currentColor" stroke="none"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      </svg>
      <!-- Active theme accent dot -->
      <span
        class="ts-dot"
        :style="{ background: currentAccent }"
      />
    </button>

    <Transition name="ts-dropdown">
      <div v-if="open" class="ts-panel" role="dialog" aria-label="Theme selection">
        <p class="ts-heading">Choose theme</p>
        <div class="ts-grid">
          <button
            v-for="theme in THEMES"
            :key="theme.id"
            class="ts-swatch"
            :class="{ 'ts-swatch--active': currentTheme === theme.id }"
            :title="theme.desc"
            @click="pickTheme(theme.id)"
          >
            <span
              class="ts-preview"
              :style="{ background: theme.bg }"
            >
              <span
                class="ts-preview-bar"
                :style="{ background: theme.accent }"
              />
            </span>
            <span class="ts-label">{{ theme.label }}</span>
            <svg v-if="currentTheme === theme.id" class="ts-check" width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <p class="ts-tip">Saved to your browser</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { THEMES, currentTheme, applyTheme } = useTheme()
const open = ref(false)
const container = ref<HTMLElement | null>(null)

const currentAccent = computed(
  () => THEMES.find(t => t.id === currentTheme.value)?.accent ?? 'var(--accent)',
)

function pickTheme(id: string) {
  applyTheme(id)
  if (process.client) {
    localStorage.setItem('lr-theme', id)
  }
  open.value = false
}

onClickOutside(container, () => { open.value = false })

// Close on Escape
useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') open.value = false
})
</script>

<style scoped>
.theme-switcher {
  position: relative;
}

/* Trigger button */
.ts-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  background: var(--bg-surface);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-md);
  color: var(--text-2);
  cursor: pointer;
  transition: color var(--t-fast), border-color var(--t-fast), background var(--t-fast);
}
.ts-btn:hover,
.ts-btn.active {
  color: var(--text-1);
  border-color: var(--accent);
  background: var(--bg-surface-hv);
}

.ts-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background var(--t-base);
}

/* Dropdown panel */
.ts-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-md);
  border-radius: var(--r-lg);
  padding: var(--sp-3);
  box-shadow: var(--shadow-float);
  backdrop-filter: blur(20px);
  z-index: 300;
}

.ts-heading {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: var(--sp-3);
  max-width: none;
}

.ts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-2);
}

/* Individual swatch */
.ts-swatch {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid var(--border-xs);
  border-radius: var(--r-sm);
  padding: 5px 2px;
  cursor: pointer;
  transition: border-color var(--t-fast), background var(--t-fast);
}
.ts-swatch:hover {
  border-color: var(--border-md);
  background: var(--bg-surface);
}
.ts-swatch--active {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.ts-preview {
  width: 100%;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
  padding-bottom: 4px;
  overflow: hidden;
}

.ts-preview-bar {
  display: block;
  width: 60%;
  height: 3px;
  margin-inline: auto;
  border-radius: 99px;
  opacity: 0.9;
}

.ts-label {
  font-size: 0.6rem;
  font-family: var(--font-mono);
  color: var(--text-2);
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.ts-swatch--active .ts-label {
  color: var(--accent);
}

.ts-check {
  position: absolute;
  top: 3px;
  right: 3px;
  color: var(--accent);
}

.ts-tip {
  font-size: 0.62rem;
  color: var(--text-3);
  text-align: center;
  margin-top: var(--sp-2);
  max-width: none;
}

/* Transition */
.ts-dropdown-enter-active,
.ts-dropdown-leave-active {
  transition: opacity 0.15s var(--ease-out), transform 0.15s var(--ease-out);
}
.ts-dropdown-enter-from,
.ts-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
