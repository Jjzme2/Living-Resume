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
