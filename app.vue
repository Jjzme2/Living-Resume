<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const store = useSiteStore()

const { data } = await useAsyncData('site-init', () =>
  $fetch('/api/site-data').catch(() => null)
)

if (data.value) {
  store.$patch(data.value as Parameters<typeof store.$patch>[0])
}
</script>
