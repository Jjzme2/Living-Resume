<template>
  <section v-if="store.siteSettings.showBlog" id="blog" class="section">
    <div class="container">
      <div class="blog-header">
        <SectionHeading
          :label="sectionContent.blog.previewLabel"
          :title="sectionContent.blog.previewTitle"
          :accent="sectionContent.blog.previewAccent"
          :description="sectionContent.blog.previewDescription"
        />
        <NuxtLink to="/blog" class="btn btn-ghost btn-sm see-all-link reveal">
          {{ sectionContent.blog.ctaAllPosts }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </NuxtLink>
      </div>

      <!-- Posts grid or empty state -->
      <div v-if="posts && posts.length" class="blog-grid stagger">
        <NuxtLink
          v-for="post in posts.slice(0, 3)"
          :key="post._path"
          :to="post._path"
          class="blog-card glass glass-hover"
        >
          <div class="post-meta">
            <time :datetime="post.date" class="post-date">{{ formatDate(post.date) }}</time>
            <div v-if="post.tags?.length" class="post-tags">
              <span v-for="tag in post.tags.slice(0, 2)" :key="tag" class="chip">{{ tag }}</span>
            </div>
          </div>
          <h3 class="post-title">{{ post.title }}</h3>
          <p v-if="post.description" class="post-excerpt">{{ post.description }}</p>
          <span class="post-read-more">Read more →</span>
        </NuxtLink>
      </div>

      <!-- Empty state — encourages first post -->
      <div v-else class="blog-empty stagger">
        <GlassCard padding="lg" class="empty-card">
          <div class="empty-icon" aria-hidden="true">✍️</div>
          <h3>{{ sectionContent.blog.previewEmptyTitle }}</h3>
          <p>{{ sectionContent.blog.previewEmptyBody }}</p>
        </GlassCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { sectionContent } from '~/data/sectionContent'
const store = useSiteStore()

const { data: posts } = await useAsyncData('blog-preview', () =>
  queryContent('/blog')
    .sort({ date: -1 })
    .limit(3)
    .find()
    .catch(() => [])
)

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}
</script>

<style scoped>
.blog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-4);
}

.see-all-link {
  margin-top: 2.5rem; /* align with h2 baseline */
  flex-shrink: 0;
  font-size: 0.82rem;
  padding: 0.45em 1em;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--sp-6);
}

.blog-card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-6);
  text-decoration: none;
  cursor: pointer;
}

.post-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.post-date {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-3);
  letter-spacing: 0.06em;
}

.post-tags {
  display: flex;
  gap: var(--sp-1);
  flex-wrap: wrap;
}

.post-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-1);
  line-height: 1.35;
  margin: 0;
  transition: color var(--t-fast);
}
.blog-card:hover .post-title { color: var(--accent); }

.post-excerpt {
  font-size: 0.88rem;
  line-height: 1.7;
  flex: 1;
}

.post-read-more {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--accent);
  margin-top: auto;
  transition: opacity var(--t-fast);
}

/* Empty state */
.blog-empty {
  max-width: 480px;
}

.empty-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
}

.empty-icon {
  font-size: 2.5rem;
}

.empty-card h3 { margin-bottom: 0; }
.empty-card p  { text-align: center; max-width: 40ch; }
</style>
