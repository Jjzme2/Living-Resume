<template>
  <div class="section post-page">
    <div class="container">
      <!-- Back link -->
      <NuxtLink to="/blog" class="back-link no-print">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        {{ sectionContent.blog.backLabel }}
      </NuxtLink>

      <div v-if="post">
        <!-- Cover image -->
        <div v-if="post.image" class="post-cover reveal">
          <img :src="post.image" :alt="post.title" class="cover-img" loading="lazy" />
        </div>

        <!-- Post header -->
        <header class="post-header reveal">
          <div class="post-meta">
            <time :datetime="post.date" class="post-date">{{ formatDate(post.date) }}</time>
            <span v-if="post.lastUpdated && post.lastUpdated !== post.date" class="post-updated">
              Updated {{ formatDate(post.lastUpdated) }}
            </span>
            <span v-if="category" class="chip category-chip">{{ category }}</span>
            <div v-if="post.tags?.length" class="post-tags">
              <span v-for="tag in post.tags" :key="tag" class="chip">{{ tag }}</span>
            </div>
            <span v-if="readingTime" class="reading-time">{{ readingTime }} min read</span>
          </div>
          <h1 class="post-title">{{ post.title }}</h1>
          <p v-if="post.description" class="post-excerpt">{{ post.description }}</p>
          <div v-if="post.author" class="post-author">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {{ post.author }}
          </div>
        </header>

        <hr class="divider" />

        <!-- Post body (rendered markdown) -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="post-body reveal" v-html="renderedBody" />

        <hr class="divider" />

        <!-- Footer navigation -->
        <div class="post-footer reveal">
          <NuxtLink to="/blog" class="btn btn-ghost">{{ sectionContent.blog.backLabel }}</NuxtLink>
        </div>
      </div>

      <!-- 404 state -->
      <div v-else class="not-found">
        <GlassCard padding="lg">
          <h2>{{ sectionContent.blog.notFoundTitle }}</h2>
          <p>{{ sectionContent.blog.notFoundBody }}</p>
          <NuxtLink to="/blog" class="btn btn-ghost" style="margin-top: var(--sp-4)">{{ sectionContent.blog.backLabel }}</NuxtLink>
        </GlassCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sectionContent } from '~/data/sectionContent'
import type { BlogPost } from '~/server/utils/r2'

useScrollReveal()

const route = useRoute()
const store = useSiteStore()
const { renderMarkdown } = useMarkdown()

const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
const slug = slugParts.join('/')

const { data: post } = await useAsyncData(`blog-${slug}`, () =>
  $fetch<BlogPost>(`/api/blog/${slug}`).catch(() => null)
)

const category = computed(() =>
  post.value?.category ?? (slugParts.length > 1 ? slugParts[0] : null)
)

const renderedBody = computed(() =>
  post.value?.body ? renderMarkdown(post.value.body) : ''
)

const readingTime = computed(() => {
  if (!post.value?.body) return null
  const words = post.value.body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
})

// ── Head / SEO ────────────────────────────────────────────────────────────────
if (post.value) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.value.title,
    description: post.value.description ?? '',
    author: { '@type': 'Person', name: post.value.author ?? store.person.name },
    datePublished: post.value.date,
    dateModified: post.value.lastUpdated ?? post.value.date,
    ...(post.value.image ? { image: post.value.image } : {}),
    publisher: { '@type': 'Organization', name: store.person.name },
  }

  useHead({
    title: `${post.value.title} — ${store.person.name}`,
    meta: [
      { name: 'description', content: post.value.description ?? '' },
      { property: 'og:title', content: post.value.title },
      { property: 'og:description', content: post.value.description ?? '' },
      ...(post.value.image ? [{ property: 'og:image', content: post.value.image }] : []),
    ],
    link: [
      ...(post.value.canonical ? [{ rel: 'canonical', href: post.value.canonical }] : []),
    ],
    script: [
      { type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd) },
    ],
  })
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}
</script>

<style scoped>
.post-page {
  padding-top: calc(var(--section-py) + 80px);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.85rem;
  color: var(--text-2);
  margin-bottom: var(--sp-8);
  transition: color var(--t-fast);
}
.back-link:hover { color: var(--accent); opacity: 1; }

.post-cover {
  margin-bottom: var(--sp-8);
  border-radius: var(--r-lg);
  overflow: hidden;
  border: 1px solid var(--border-sm);
}
.cover-img {
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  display: block;
}

.post-header {
  max-width: 720px;
  margin-bottom: var(--sp-8);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  flex-wrap: wrap;
  margin-bottom: var(--sp-4);
}

.post-date {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-3);
  letter-spacing: 0.08em;
}

.post-updated {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-3);
  font-style: italic;
}

.reading-time {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-3);
  letter-spacing: 0.06em;
}

.category-chip {
  text-transform: capitalize;
  color: var(--accent);
  border-color: rgba(94, 234, 212, 0.3);
  background: var(--accent-dim);
}

.post-tags { display: flex; gap: var(--sp-1); flex-wrap: wrap; }

.post-title {
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: var(--sp-4);
}

.post-excerpt {
  font-size: 1.1rem;
  color: var(--text-2);
  line-height: 1.8;
  max-width: 60ch;
}

.post-author {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.82rem;
  color: var(--text-3);
  margin-top: var(--sp-3);
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}

/* Prose styles */
.post-body {
  max-width: 720px;
  font-size: 1.0rem;
  line-height: 1.85;
  color: var(--text-2);
}

:deep(.post-body h1),
:deep(.post-body h2),
:deep(.post-body h3),
:deep(.post-body h4) {
  color: var(--text-1);
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}

:deep(.post-body p)       { margin-bottom: 1.4rem; }
:deep(.post-body ul),
:deep(.post-body ol)      { padding-left: 1.5rem; margin-bottom: 1.4rem; }
:deep(.post-body li)      { margin-bottom: 0.4rem; }
:deep(.post-body ul li)   { list-style: disc; }
:deep(.post-body ol li)   { list-style: decimal; }

:deep(.post-body a) {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

:deep(.post-body blockquote) {
  border-left: 3px solid var(--accent);
  padding-left: 1.25rem;
  color: var(--text-2);
  font-style: italic;
  margin: 2rem 0;
}

:deep(.post-body pre) {
  background: var(--bg-elevated);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-md);
  padding: 1.25rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  font-size: 0.875rem;
}

:deep(.post-body code) {
  background: var(--bg-elevated);
  border: 1px solid var(--border-xs);
  border-radius: var(--r-sm);
  padding: 0.15em 0.4em;
  font-size: 0.875em;
}

:deep(.post-body pre code) { background: none; border: none; padding: 0; }

:deep(.post-body img) {
  border-radius: var(--r-md);
  margin: 2rem auto;
  border: 1px solid var(--border-sm);
}

:deep(.post-body table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.88rem;
}

:deep(.post-body th),
:deep(.post-body td) {
  padding: var(--sp-2) var(--sp-4);
  border: 1px solid var(--border-sm);
  text-align: left;
}

:deep(.post-body th) {
  background: var(--bg-elevated);
  color: var(--text-1);
  font-weight: 600;
}

:deep(.post-body hr) {
  border: none;
  border-top: 1px solid var(--border-sm);
  margin: 3rem 0;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-4);
  margin-top: var(--sp-8);
}

.not-found { max-width: 480px; }
</style>
