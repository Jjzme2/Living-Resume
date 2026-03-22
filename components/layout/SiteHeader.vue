<template>
  <header class="site-header" :class="{ scrolled }">
    <div class="container header-inner">
      <!-- Logo -->
      <NuxtLink to="/" class="logo" aria-label="Jj Zettler — Home">
        <span class="logo-initials">JZ</span>
        <span class="logo-name">Jj Zettler</span>
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="nav-desktop" aria-label="Main navigation">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :aria-current="$route.path === link.to ? 'page' : undefined"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- CTA -->
      <div class="header-actions">
        <!-- Theme toggle: only shown when admin has configured two distinct themes -->
        <button
          v-if="hasAltTheme"
          class="theme-toggle no-print"
          :aria-label="`Switch to ${nextTheme?.label} theme`"
          :title="`Switch to ${nextTheme?.label}`"
          @click="togglePublicTheme"
        >
          <span class="tt-option" :class="{ 'tt-option--active': currentTheme === primaryTheme?.id }">
            <span class="tt-dot" :style="{ background: primaryTheme?.accent }" />
            <span class="tt-name">{{ primaryTheme?.label }}</span>
          </span>
          <svg class="tt-swap" width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1 5h10M8 2l3 3-3 3M15 11H5M8 8l-3 3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="tt-option" :class="{ 'tt-option--active': currentTheme === altTheme?.id }">
            <span class="tt-dot" :style="{ background: altTheme?.accent }" />
            <span class="tt-name">{{ altTheme?.label }}</span>
          </span>
        </button>

        <!-- Command palette trigger -->
        <button
          class="cmd-btn no-print"
          title="Command palette (⌘K)"
          aria-label="Open command palette"
          @click="paletteToggle"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
          </svg>
          <span class="cmd-label">⌘K</span>
        </button>

        <NuxtLink to="/resume" class="btn btn-ghost btn-sm no-print">Resume</NuxtLink>
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        class="menu-toggle no-print"
        :aria-expanded="mobileOpen"
        aria-label="Toggle menu"
        @click="mobileOpen = !mobileOpen"
      >
        <span class="bar" />
        <span class="bar" />
        <span class="bar" />
      </button>
    </div>

    <!-- Mobile Nav -->
    <Transition name="mobile-nav">
      <nav v-if="mobileOpen" class="nav-mobile" aria-label="Mobile navigation">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="nav-mobile-link"
          @click="mobileOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
        <div class="mobile-tools">
          <button
            v-if="hasAltTheme"
            class="mobile-theme-toggle"
            @click="togglePublicTheme(); mobileOpen = false"
          >
            <span class="tt-option" :class="{ 'tt-option--active': currentTheme === primaryTheme?.id }">
              <span class="tt-dot" :style="{ background: primaryTheme?.accent }" />
              <span class="tt-name">{{ primaryTheme?.label }}</span>
            </span>
            <svg class="tt-swap" width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M1 5h10M8 2l3 3-3 3M15 11H5M8 8l-3 3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="tt-option" :class="{ 'tt-option--active': currentTheme === altTheme?.id }">
              <span class="tt-dot" :style="{ background: altTheme?.accent }" />
              <span class="tt-name">{{ altTheme?.label }}</span>
            </span>
          </button>
          <button class="cmd-btn" @click="paletteToggle(); mobileOpen = false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
            </svg>
            <span>Command Palette</span>
          </button>
        </div>
        <NuxtLink to="/resume" class="btn btn-primary btn-sm" @click="mobileOpen = false">
          Resume
        </NuxtLink>
      </nav>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const { y: scrollY } = useWindowScroll()
const scrolled = computed(() => scrollY.value > 40)
const mobileOpen = ref(false)

const store = useSiteStore()
const { currentTheme, publicThemes, hasAltTheme, togglePublicTheme, THEMES } = useTheme()
const { toggle: paletteToggle } = useCommandPalette()

const primaryTheme = computed(() => THEMES.find(t => t.id === publicThemes.value.primary))
const altTheme     = computed(() => THEMES.find(t => t.id === publicThemes.value.alt))
const nextTheme    = computed(() =>
  currentTheme.value === publicThemes.value.alt ? primaryTheme.value : altTheme.value,
)

const navLinks = computed(() => {
  const links = [
    { to: '/',         label: 'Home' },
    { to: '/#about',   label: 'About' },
    { to: '/#skills',  label: 'Skills' },
    { to: '/#work',    label: 'Work' },
  ]
  if (store.siteSettings.showProjects)
    links.push({ to: '/projects', label: 'Projects' })
  if (store.siteSettings.showBlog)
    links.push({ to: '/blog', label: 'Blog' })
  if (store.siteSettings.showContact)
    links.push({ to: '/#contact', label: 'Contact' })
  return links
})

// Close mobile nav on route change
const route = useRoute()
watch(() => route.path, () => { mobileOpen.value = false })
</script>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  padding-block: 1.1rem;
  transition: background var(--t-base), border-color var(--t-base), padding var(--t-base);
}

.site-header.scrolled {
  background: rgba(4, 6, 15, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-xs);
  padding-block: 0.75rem;
}

.header-inner {
  display: flex;
  align-items: center;
  gap: var(--sp-6);
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  text-decoration: none;
  flex-shrink: 0;
}

.logo-initials {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--grad-accent);
  color: #03050c;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
  border-radius: var(--r-md);
  flex-shrink: 0;
  letter-spacing: 0;
}

.logo-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-1);
  letter-spacing: -0.02em;
}

/* Desktop Nav */
.nav-desktop {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  margin-left: auto;
}

.nav-link {
  padding: 0.4em 0.8em;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-2);
  border-radius: var(--r-sm);
  transition: color var(--t-fast), background var(--t-fast);
  text-decoration: none;
}
.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text-1);
  background: var(--bg-surface);
  opacity: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.btn-sm {
  font-size: 0.82rem;
  padding: 0.45em 1em;
}

/* Theme toggle pill */
.theme-toggle {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 5px 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: border-color var(--t-fast), background var(--t-fast);
}
.theme-toggle:hover {
  border-color: var(--accent);
  background: var(--bg-surface-hv);
}

.tt-option {
  display: flex;
  align-items: center;
  gap: 5px;
  transition: opacity var(--t-fast);
  opacity: 0.38;
}
.tt-option--active {
  opacity: 1;
}

.tt-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tt-name {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--text-1);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.tt-swap {
  color: var(--text-3);
  flex-shrink: 0;
  transition: color var(--t-fast);
}
.theme-toggle:hover .tt-swap {
  color: var(--accent);
}

/* Command palette button */
.cmd-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  background: var(--bg-surface);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-md);
  color: var(--text-2);
  cursor: pointer;
  font-size: 0.82rem;
  font-family: var(--font-mono);
  transition: color var(--t-fast), border-color var(--t-fast), background var(--t-fast);
}
.cmd-btn:hover {
  color: var(--text-1);
  border-color: var(--accent);
  background: var(--bg-surface-hv);
}

.cmd-label {
  font-size: 0.72rem;
  letter-spacing: 0.02em;
}

/* Hamburger */
.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: auto;
}

.bar {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text-1);
  border-radius: 2px;
  transition: all var(--t-base);
}

/* Mobile nav */
.nav-mobile {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  padding: var(--sp-4) clamp(1.25rem, 5vw, 2.5rem) var(--sp-6);
  background: rgba(4, 6, 15, 0.96);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-xs);
}

.nav-mobile-link {
  padding: var(--sp-3) var(--sp-2);
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-2);
  text-decoration: none;
  border-bottom: 1px solid var(--border-xs);
  transition: color var(--t-fast);
}
.nav-mobile-link:last-of-type { border: none; }
.nav-mobile-link:hover { color: var(--accent); }

.mobile-tools {
  padding: var(--sp-2) 0;
  border-bottom: 1px solid var(--border-xs);
}
.mobile-theme-toggle {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  width: 100%;
  padding: var(--sp-3) var(--sp-2);
  background: none;
  border: none;
  border-bottom: 1px solid var(--border-xs);
  cursor: pointer;
}
.mobile-theme-toggle:hover .tt-option:not(.tt-option--active) {
  opacity: 0.6;
}

.mobile-tools .cmd-btn {
  width: 100%;
  justify-content: flex-start;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-2);
  background: none;
  border: none;
  border-radius: 0;
  font-size: 1rem;
  font-family: var(--font-body);
  color: var(--text-2);
}
.mobile-tools .cmd-btn:hover {
  color: var(--accent);
  background: none;
  border: none;
}

/* Transitions */
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: opacity 0.2s var(--ease-out), transform 0.2s var(--ease-out);
}
.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .nav-desktop,
  .header-actions {
    display: none;
  }
  .menu-toggle {
    display: flex;
  }
}
</style>
