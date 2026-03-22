<template>
  <div class="section">
    <div class="container">
      <SectionHeading
        :label="sectionContent.blog.indexLabel"
        :title="sectionContent.blog.indexTitle"
        :accent="sectionContent.blog.indexAccent"
        :description="sectionContent.blog.indexDescription"
      />

      <div v-if="posts && posts.length" class="blog-grid stagger">
        <NuxtLink
          v-for="post in posts"
          :key="post._path"
          :to="post._path"
          class="blog-card glass glass-hover"
        >
          <img v-if="post.image" :src="post.image" :alt="post.title" class="card-cover" loading="lazy" />
          <div class="post-meta">
            <time :datetime="post.date" class="post-date">{{ formatDate(post.date) }}</time>
            <div class="post-tags">
              <span class="chip category-chip">{{ post.category ?? categoryOf(post._path) }}</span>
              <span v-for="tag in post.tags?.slice(0, 2)" :key="tag" class="chip">{{ tag }}</span>
            </div>
          </div>
          <h2 class="post-title">{{ post.title }}</h2>
          <p v-if="post.description" class="post-excerpt">{{ post.description }}</p>
          <div class="card-footer">
            <span v-if="post.author" class="post-author">{{ post.author }}</span>
            <span class="post-read-more">Read more →</span>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="empty-state stagger">
        <GlassCard padding="lg" class="empty-card">
          <div class="empty-icon">✍️</div>
          <h3>{{ sectionContent.blog.indexEmptyTitle }}</h3>
          <p>{{ sectionContent.blog.indexEmptyBody }}</p>
          <NuxtLink to="/" class="btn btn-ghost" style="margin-top: var(--sp-4)">← Back Home</NuxtLink>
        </GlassCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sectionContent } from '~/data/sectionContent'
useScrollReveal()

const { data: posts } = await useAsyncData('blog-all', () =>
  queryContent('/blog')
    .where({ status: { $ne: 'draft' } })
    .sort({ date: -1 })
    .find()
    .catch(() => [])
)

// Extract category from path: /blog/tech/my-post → "tech"
function categoryOf(path: string): string | null {
  const parts = path?.split('/').filter(Boolean) // ['blog', 'tech', 'my-post']
  return parts?.length === 3 ? parts[1] : null
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

useHead({
  title: 'Blog — Jj Zettler',
  meta: [{ name: 'description', content: 'Thoughts on development and entrepreneurship by Jj Zettler.' }],
})
</script>

<style scoped>
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--sp-6);
}

.blog-card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-6);
  text-decoration: none;
}

.post-meta { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--sp-2); }
.post-date  { font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-3); letter-spacing: 0.06em; }
.post-tags  { display: flex; gap: var(--sp-1); flex-wrap: wrap; }

.category-chip {
  text-transform: capitalize;
  color: var(--accent);
  border-color: rgba(94, 234, 212, 0.3);
  background: var(--accent-dim);
}

.post-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-1);
  line-height: 1.35;
  margin: 0;
  transition: color var(--t-fast);
}
.blog-card:hover .post-title { color: var(--accent); }

.card-cover {
  width: calc(100% + var(--sp-12));
  margin: calc(-1 * var(--sp-6)) calc(-1 * var(--sp-6)) var(--sp-4);
  height: 180px;
  object-fit: cover;
  border-radius: var(--r-md) var(--r-md) 0 0;
  display: block;
}

.post-excerpt  { font-size: 0.9rem; line-height: 1.75; flex: 1; }

.card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.post-author { font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-3); letter-spacing: 0.04em; }
.post-read-more { font-size: 0.8rem; font-weight: 500; color: var(--accent); }

.empty-state { max-width: 520px; }
.empty-card  { text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); }
.empty-icon  { font-size: 2.5rem; }
.empty-card p { text-align: center; max-width: 42ch; }
</style>
