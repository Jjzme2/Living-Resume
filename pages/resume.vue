<template>
  <div>
    <ResumeDoc />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'resume',
})

const store = useSiteStore()

useHead({
  title: `${store.person.fullName} — Resume`,
  meta: [
    { name: 'description', content: `Resume of ${store.person.fullName} — ${store.person.title}` },
    { name: 'robots', content: 'noindex' }, // keep resume off search (link directly)
  ],
})
</script>
