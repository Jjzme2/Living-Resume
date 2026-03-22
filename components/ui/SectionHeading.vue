<template>
  <header class="section-header reveal">
    <p v-if="label" class="section-label">{{ label }}</p>
    <h2>
      {{ titleBefore }}
      <span v-if="titleAccent" class="gradient-text">{{ titleAccent }}</span>
      {{ titleAfter }}
    </h2>
    <p v-if="description" class="section-description">{{ description }}</p>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  label?: string
  title: string
  accent?: string   // word(s) to render in gradient
  description?: string
}>()

// Split title around the accent word(s) so we can color just that part
const titleBefore = computed(() => {
  if (!props.accent) return props.title
  const idx = props.title.indexOf(props.accent)
  return idx > -1 ? props.title.slice(0, idx) : props.title
})
const titleAccent = computed(() => props.accent ?? '')
const titleAfter = computed(() => {
  if (!props.accent) return ''
  const idx = props.title.indexOf(props.accent)
  return idx > -1 ? props.title.slice(idx + props.accent.length) : ''
})
</script>

<style scoped>
.section-header {
  margin-bottom: clamp(2.5rem, 5vw, 4rem);
}

.section-header h2 {
  margin-bottom: 0;
}

.section-description {
  margin-top: var(--sp-4);
  font-size: 1.05rem;
  max-width: 54ch;
}
</style>
