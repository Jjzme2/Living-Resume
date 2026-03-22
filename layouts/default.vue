<template>
  <div class="layout-wrapper">
    <div class="bg-radial" aria-hidden="true" />
    <div class="noise-overlay" aria-hidden="true" />
    <SiteHeader />
    <main class="main-content">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { currentTheme, loadPublicTheme } = useTheme()

// Apply theme attribute to <html> on every render
useHead(() => ({
  htmlAttrs: {
    'data-theme': currentTheme.value === 'midnight' ? '' : currentTheme.value,
  },
}))

// Load the admin-chosen public theme on mount
onMounted(async () => {
  await loadPublicTheme()

  // Track page view
  $fetch('/api/analytics/track', {
    method: 'POST',
    body: { path: route.path, referrer: document.referrer || undefined },
  }).catch(() => { /* silently ignore tracking failures */ })
})
</script>

<style scoped>
.layout-wrapper {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  isolation: isolate;
}
.main-content {
  flex: 1;
  position: relative;
  z-index: 1;
}
</style>
