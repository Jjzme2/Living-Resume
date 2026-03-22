<!-- Clean layout for /resume — minimal chrome, print-optimized -->
<template>
  <div class="resume-layout">
    <div class="bg-radial" aria-hidden="true" />

    <!-- Print toolbar (hidden in print) -->
    <div class="resume-toolbar no-print">
      <div class="container">
        <NuxtLink to="/" class="btn btn-ghost btn-sm">
          ← Back to Site
        </NuxtLink>
        <button class="btn btn-primary btn-sm" @click="printResume">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Download / Print PDF
        </button>
      </div>
    </div>

    <main class="resume-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
function printResume() {
  window.print()
}
</script>

<style scoped>
.resume-layout {
  min-height: 100dvh;
  isolation: isolate;
}

.resume-toolbar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding-block: 0.75rem;
  background: rgba(4, 6, 15, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-xs);
}

.resume-toolbar .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.btn-sm {
  font-size: 0.82rem;
  padding: 0.5em 1.1em;
}

.resume-main {
  position: relative;
  z-index: 1;
}
</style>
