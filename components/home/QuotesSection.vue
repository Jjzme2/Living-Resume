<template>
  <section v-if="quotes.length" class="quotes-section reveal" id="quotes">
    <div class="container">
      <div class="quotes-inner">
        <!-- Decorative quote mark -->
        <div class="quote-mark" aria-hidden="true">"</div>

        <transition name="quote-fade" mode="out-in">
          <div :key="currentIndex" class="quote-card">
            <blockquote class="quote-text">{{ current.content }}</blockquote>
            <footer class="quote-footer">
              <span class="quote-author">— {{ current.author }}</span>
              <span v-if="current.source" class="quote-source">{{ current.source }}</span>
            </footer>
            <div v-if="current.tags?.length" class="quote-tags">
              <span v-for="tag in current.tags.slice(0, 3)" :key="tag" class="quote-tag">{{ tag }}</span>
            </div>
          </div>
        </transition>

        <!-- Navigation dots -->
        <div class="quote-nav">
          <button
            v-for="(_, i) in quotes"
            :key="i"
            class="nav-dot"
            :class="{ 'nav-dot--active': i === currentIndex }"
            :aria-label="`Quote ${i + 1}`"
            @click="goTo(i)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Quote {
  id?: string
  content: string
  author: string
  source?: string
  tags?: string[]
  notes?: string
}

interface QuotesResponse {
  status: string
  metadata?: unknown
  payload: Quote[]
}

const QUOTES_URL = 'https://common.ilytat.com/reader/quotes.json'
const CYCLE_MS = 8000

const quotes = ref<Quote[]>([])
const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const current = computed(() => quotes.value[currentIndex.value] ?? { content: '', author: '' })

function goTo(i: number) {
  currentIndex.value = i
  resetTimer()
}

function advance() {
  currentIndex.value = (currentIndex.value + 1) % quotes.value.length
}

function resetTimer() {
  if (timer) clearInterval(timer)
  timer = setInterval(advance, CYCLE_MS)
}

onMounted(async () => {
  try {
    const data = await $fetch<QuotesResponse>(QUOTES_URL)
    if (data?.payload?.length) {
      // Shuffle so the order feels fresh each visit
      quotes.value = [...data.payload].sort(() => Math.random() - 0.5)
      resetTimer()
    }
  } catch {
    // Silently skip if fetch fails — section just won't render
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.quotes-section {
  padding: var(--sp-20) 0;
  position: relative;
}

.quotes-inner {
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  padding: var(--sp-10) var(--sp-8);
  background: var(--bg-elevated);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-xl);
}

.quote-mark {
  position: absolute;
  top: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 5rem;
  line-height: 1;
  color: var(--accent);
  opacity: 0.15;
  font-family: Georgia, serif;
  pointer-events: none;
  user-select: none;
}

.quote-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-5);
  min-height: 180px;
  justify-content: center;
}

.quote-text {
  font-size: clamp(1rem, 2.2vw, 1.25rem);
  font-style: italic;
  color: var(--text-1);
  line-height: 1.7;
  margin: 0;
  max-width: 56ch;
  font-family: var(--font-body);
}

.quote-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
}

.quote-author {
  font-size: 0.82rem;
  font-family: var(--font-mono);
  color: var(--accent);
  letter-spacing: 0.06em;
}

.quote-source {
  font-size: 0.72rem;
  color: var(--text-3);
  font-style: italic;
}

.quote-tags {
  display: flex;
  gap: var(--sp-2);
  flex-wrap: wrap;
  justify-content: center;
}

.quote-tag {
  font-size: 0.68rem;
  font-family: var(--font-mono);
  color: var(--text-3);
  background: var(--bg-surface);
  border: 1px solid var(--border-xs);
  border-radius: 99px;
  padding: 2px 10px;
  text-transform: lowercase;
  letter-spacing: 0.04em;
}

/* Navigation dots */
.quote-nav {
  display: flex;
  gap: var(--sp-2);
  justify-content: center;
  margin-top: var(--sp-6);
  flex-wrap: wrap;
}

.nav-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--border-md);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all var(--t-fast);
}

.nav-dot--active {
  background: var(--accent);
  box-shadow: 0 0 5px var(--accent);
  width: 18px;
  border-radius: 3px;
}

.nav-dot:hover:not(.nav-dot--active) {
  background: var(--text-3);
}

/* Fade transition */
.quote-fade-enter-active,
.quote-fade-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.quote-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.quote-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .quotes-inner { padding: var(--sp-8) var(--sp-5); }
  .quote-text { font-size: 1rem; }
}
</style>
