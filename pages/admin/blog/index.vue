<template>
  <div class="admin-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Blog</h1>
        <p class="page-sub">Manage posts and documentation for creating new content.</p>
      </div>
      <NuxtLink to="/admin/blog/new" class="btn btn-primary">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Post
      </NuxtLink>
    </div>

    <!-- Existing Posts -->
    <section class="admin-card">
      <h2 class="section-title">Posts</h2>
      <div v-if="loading" class="loading-row">Loading posts…</div>
      <div v-else-if="!posts?.length" class="empty-row">No posts yet. Create your first one above.</div>
      <div v-else class="posts-list">
        <div v-for="post in posts" :key="post.slug" class="post-row">
          <div class="post-row-info">
            <div class="post-row-title">{{ post.title }}</div>
            <div class="post-row-meta">
              <span class="meta-chip" :class="post.status === 'draft' ? 'chip-draft' : 'chip-pub'">
                {{ post.status ?? 'published' }}
              </span>
              <span v-if="post.category" class="meta-chip">{{ post.category }}</span>
              <span class="meta-date">{{ formatDate(post.date) }}</span>
            </div>
          </div>
          <div class="post-row-actions">
            <a :href="post.path" target="_blank" rel="noopener" class="btn btn-ghost btn-xs">View</a>
            <button class="btn btn-danger btn-xs" :disabled="deletingSlug === post.slug" @click="deletePost(post.slug)">
              {{ deletingSlug === post.slug ? '…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Documentation -->
    <section class="admin-card docs-card">
      <h2 class="section-title">Post Format Reference</h2>
      <p class="docs-intro">
        Blog posts are Markdown files stored in your <strong>Cloudflare R2</strong> bucket and served via API.
        The URL is <code>/blog/{category}/{slug}</code>. All frontmatter fields below are optional
        unless marked <span class="req">required</span>.
      </p>

      <div class="frontmatter-block">
        <div class="fm-label">Frontmatter template</div>
        <pre class="fm-code">---
title: "Your Post Title"          <span class="fm-req"># required</span>
description: "One-line summary"   <span class="fm-req"># required — used in cards &amp; SEO</span>
date: "YYYY-MM-DD"                <span class="fm-req"># required — ISO date</span>
status: "published"               # published | draft  (draft hides from lists)
category: "tech"                  # overrides the folder name in UI
author: "Your Name"               # shown on post page
lastUpdated: "YYYY-MM-DD"         # shown if different from date
tags: ["tag1", "tag2"]            # appear as chips
image: "/images/blog/cover.jpg"   # hero/thumbnail image (place in public/)
canonical: "https://..."          # sets &lt;link rel=&quot;canonical&quot;&gt; for cross-posts
---

Your Markdown content here.</pre>
      </div>

      <h3 class="docs-sub">Folder → URL mapping</h3>
      <div class="mapping-table">
        <div class="map-row header-row">
          <span>File path</span><span>Public URL</span>
        </div>
        <div class="map-row">
          <code>content/blog/tech/my-post.md</code>
          <code>/blog/tech/my-post</code>
        </div>
        <div class="map-row">
          <code>content/blog/entrepreneurship/lessons.md</code>
          <code>/blog/entrepreneurship/lessons</code>
        </div>
      </div>

      <h3 class="docs-sub">R2 environment variables</h3>
      <p class="docs-p">
        Set these in <code>.env.local</code> (dev) or your Vercel project's environment variables:
        <code>R2_ACCOUNT_ID</code>, <code>R2_ACCESS_KEY_ID</code>, <code>R2_SECRET_ACCESS_KEY</code>,
        <code>R2_BUCKET_NAME</code> (format: <code>bucket-name</code> or <code>bucket-name/prefix</code>).
        Your existing <code>VITE_R2_*</code> variables are used automatically as fallback.
      </p>

      <h3 class="docs-sub">Status field</h3>
      <p class="docs-p">
        Posts with <code>status: "draft"</code> are hidden from all public lists and API responses.
        Omitting <code>status</code> is treated as published.
      </p>

      <h3 class="docs-sub">Index recovery</h3>
      <p class="docs-p">
        If the post list ever gets out of sync, call <code>POST /api/admin/blog/rebuild-index</code>
        (admin-authenticated) to scan the R2 bucket and rebuild the index from scratch.
      </p>

      <h3 class="docs-sub">Images</h3>
      <p class="docs-p">
        Place images in <code>public/images/blog/</code> and reference them as <code>/images/blog/filename.jpg</code>.
        Cover images display as full-width heroes on the post page and as card thumbnails in the index.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

import type { PostMeta } from '~/server/utils/r2'

const toast = useState<{ message: string; type: 'success' | 'error' } | null>('admin-toast')

const loading = ref(false)
const deletingSlug = ref<string | null>(null)

const { data: posts, refresh } = await useAsyncData('admin-blog-list', () =>
  $fetch<PostMeta[]>('/api/admin/blog/posts').catch(() => [])
)

async function deletePost(slug: string) {
  if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return
  deletingSlug.value = slug
  try {
    await $fetch(`/api/admin/blog/${encodeURIComponent(slug)}`, { method: 'DELETE' })
    toast.value = { message: 'Post deleted', type: 'success' }
    await refresh()
  } catch (e: unknown) {
    toast.value = { message: (e as { statusMessage?: string })?.statusMessage ?? 'Delete failed', type: 'error' }
  } finally {
    deletingSlug.value = null
  }
}

function formatDate(d: string) {
  if (!d) return ''
  try { return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d)) }
  catch { return d }
}
</script>

<style scoped>
.admin-page { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--sp-8); }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-4);
  flex-wrap: wrap;
}
.page-title { font-size: 1.6rem; font-weight: 700; color: var(--text-1); margin: 0 0 var(--sp-1); }
.page-sub   { font-size: 0.88rem; color: var(--text-3); margin: 0; }

.admin-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-lg);
  padding: var(--sp-6);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-1);
  margin: 0 0 var(--sp-5);
  padding-bottom: var(--sp-3);
  border-bottom: 1px solid var(--border-xs);
}

.loading-row, .empty-row {
  font-size: 0.88rem;
  color: var(--text-3);
  padding: var(--sp-4) 0;
  font-style: italic;
}

.posts-list { display: flex; flex-direction: column; gap: var(--sp-2); }

.post-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-3) var(--sp-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-xs);
  border-radius: var(--r-md);
  gap: var(--sp-4);
}

.post-row-info { flex: 1; min-width: 0; }
.post-row-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.post-row-meta {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-top: var(--sp-1);
  flex-wrap: wrap;
}

.meta-chip {
  font-size: 0.65rem;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.15em 0.6em;
  border-radius: 99px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-xs);
  color: var(--text-3);
}
.chip-draft { color: #f59e0b; border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.08); }
.chip-pub   { color: var(--accent); border-color: rgba(94,234,212,0.3); background: var(--accent-dim); }
.meta-date  { font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-3); }

.post-row-actions { flex-shrink: 0; display: flex; gap: var(--sp-2); }
.btn-xs { font-size: 0.75rem; padding: 0.3em 0.8em; }
.btn-danger { background: rgba(239,68,68,0.08); color: #f87171; border: 1px solid rgba(239,68,68,0.25); border-radius: var(--r-md); cursor: pointer; font-family: inherit; transition: all 0.15s; }
.btn-danger:hover:not(:disabled) { background: rgba(239,68,68,0.15); }
.btn-danger:disabled { opacity: 0.5; cursor: default; }

/* Docs */
.docs-card { display: flex; flex-direction: column; gap: var(--sp-4); }
.docs-intro { font-size: 0.88rem; color: var(--text-2); line-height: 1.7; margin: 0; }
.docs-intro code, .docs-p code { font-family: var(--font-mono); font-size: 0.82em; background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: var(--r-sm); padding: 0.1em 0.4em; color: var(--accent); }
.req { color: var(--accent); }

.docs-sub { font-size: 0.88rem; font-weight: 600; color: var(--text-1); margin: var(--sp-2) 0 var(--sp-1); }
.docs-p   { font-size: 0.85rem; color: var(--text-2); line-height: 1.7; margin: 0; }

.frontmatter-block { background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: var(--r-md); overflow: hidden; }
.fm-label { font-size: 0.7rem; font-family: var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-3); padding: var(--sp-2) var(--sp-4); border-bottom: 1px solid var(--border-xs); }
.fm-code {
  margin: 0;
  padding: var(--sp-4);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1.8;
  color: var(--text-2);
  white-space: pre;
  overflow-x: auto;
}
.fm-req { color: var(--text-3); font-style: italic; }

.mapping-table { display: flex; flex-direction: column; border: 1px solid var(--border-xs); border-radius: var(--r-md); overflow: hidden; }
.map-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-4);
  padding: var(--sp-2) var(--sp-4);
  border-bottom: 1px solid var(--border-xs);
  font-size: 0.78rem;
  font-family: var(--font-mono);
  color: var(--text-2);
}
.map-row:last-child { border-bottom: none; }
.header-row { color: var(--text-3); background: var(--bg-surface); font-weight: 600; }
</style>
