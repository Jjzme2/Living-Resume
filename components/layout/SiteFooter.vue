<template>
  <footer class="site-footer no-print">
    <div class="footer-glow" aria-hidden="true" />
    <div class="container">
      <hr class="divider" />
      <div class="footer-inner">
        <!-- Left: Brand -->
        <div class="footer-brand">
          <p class="footer-name">Jj Zettler</p>
          <p class="footer-copy">
            © {{ store.siteSettings.copyrightYear }} John Zettler Jr.
            All rights reserved.
          </p>
        </div>

        <!-- Center: Nav -->
        <nav class="footer-nav" aria-label="Footer navigation">
          <NuxtLink to="/">Home</NuxtLink>
          <NuxtLink to="/#about">About</NuxtLink>
          <NuxtLink to="/resume">Resume</NuxtLink>
          <NuxtLink v-if="store.siteSettings.showProjects" to="/projects">Projects</NuxtLink>
          <NuxtLink v-if="store.siteSettings.showBlog" to="/blog">Blog</NuxtLink>
          <NuxtLink v-if="store.siteSettings.showContact" to="/#contact">Contact</NuxtLink>
        </nav>

        <!-- Right: Social -->
        <div v-if="store.hasSocial" class="footer-social">
          <a
            v-for="link in store.socialLinks"
            :key="link.platform"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="social-icon"
            :aria-label="link.label"
          >
            <SocialIcon :platform="link.platform" :size="18" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const store = useSiteStore()
</script>

<style scoped>
.site-footer {
  position: relative;
  padding-bottom: var(--sp-8);
  overflow: hidden;
}

.footer-glow {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 200px;
  background: radial-gradient(ellipse at center bottom, rgba(94, 234, 212, 0.04) 0%, transparent 70%);
  pointer-events: none;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-6);
  padding-top: var(--sp-8);
}

.footer-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-1);
  margin-bottom: var(--sp-1);
  max-width: none;
}

.footer-copy {
  font-size: 0.78rem;
  color: var(--text-3);
  max-width: none;
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1) var(--sp-4);
}

.footer-nav a {
  font-size: 0.85rem;
  color: var(--text-2);
  transition: color var(--t-fast);
}
.footer-nav a:hover { color: var(--accent); opacity: 1; }

.footer-social {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.social-icon {
  color: var(--text-3);
  transition: color var(--t-fast), transform var(--t-base);
  display: flex;
}
.social-icon:hover {
  color: var(--accent);
  transform: translateY(-2px);
  opacity: 1;
}

@media (max-width: 640px) {
  .footer-inner {
    flex-direction: column;
    gap: var(--sp-6);
  }
  .footer-nav { justify-content: center; }
  .footer-social { justify-content: center; }
  .footer-brand { text-align: center; }
}
</style>
