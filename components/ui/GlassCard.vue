<template>
  <div
    class="glass-card glass"
    :class="[
      hoverable && 'glass-hover',
      glow && 'glow-border',
      padding && `pad-${padding}`,
    ]"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hoverable?: boolean
  glow?: boolean
  padding?: 'sm' | 'md' | 'lg'
}>()
</script>

<style scoped>
.glass-card {
  position: relative;
  overflow: hidden;
}

/* Inner shine line at top */
.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent);
  pointer-events: none;
}

.glow-border {
  border-color: rgba(94, 234, 212, 0.2) !important;
  box-shadow: 0 0 0 1px rgba(94, 234, 212, 0.08), var(--shadow-glow);
}

/* Padding variants */
.pad-sm { padding: var(--sp-4);  }
.pad-md { padding: var(--sp-6);  }
.pad-lg { padding: var(--sp-8); }
</style>
