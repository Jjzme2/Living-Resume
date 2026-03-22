<template>
  <div class="section">
    <div class="container">
      <SectionHeading
        :label="sectionContent.projectsPage.label"
        :title="sectionContent.projectsPage.title"
        :accent="sectionContent.projectsPage.accent"
        :description="sectionContent.projectsPage.description"
      />

      <div v-if="store.hasProjects" class="projects-grid stagger">
        <GlassCard
          v-for="project in store.projects"
          :key="project.title"
          class="project-card"
          :class="{ featured: project.featured }"
          hoverable
          padding="md"
        >
          <div class="card-top">
            <span v-if="project.featured" class="chip">Featured</span>
            <div class="card-links">
              <a v-if="project.repo" :href="project.repo" target="_blank" rel="noopener noreferrer" class="icon-link" aria-label="GitHub">
                <SocialIcon platform="github" :size="18" />
              </a>
              <a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer" class="icon-link" aria-label="Live site">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </div>
          </div>
          <h3 class="project-title">{{ project.title }}</h3>
          <p class="project-desc">{{ project.description }}</p>
          <div class="project-tags">
            <span v-for="tag in project.tags" :key="tag" class="chip">{{ tag }}</span>
          </div>
        </GlassCard>
      </div>

      <div v-else class="empty-state">
        <GlassCard padding="lg" class="empty-card">
          <h3>{{ sectionContent.projectsPage.emptyTitle }}</h3>
          <p>{{ sectionContent.projectsPage.emptyBody }}</p>
          <NuxtLink to="/" class="btn btn-ghost" style="margin-top: var(--sp-4)">← Back Home</NuxtLink>
        </GlassCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sectionContent } from '~/data/sectionContent'
const store = useSiteStore()
useScrollReveal()

useHead({
  title: 'Projects — Jj Zettler',
  meta: [{ name: 'description', content: 'Projects built by Jj Zettler.' }],
})
</script>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--sp-6);
}

.project-card { display: flex; flex-direction: column; gap: var(--sp-4); }
.card-top { display: flex; align-items: center; justify-content: space-between; min-height: 24px; }
.card-links { display: flex; align-items: center; gap: var(--sp-3); margin-left: auto; }
.icon-link { color: var(--text-3); display: flex; transition: color var(--t-fast), transform var(--t-base); }
.icon-link:hover { color: var(--accent); transform: translateY(-1px); opacity: 1; }
.project-title { font-size: 1.1rem; font-weight: 600; margin: 0; }
.project-desc  { font-size: 0.9rem; line-height: 1.7; flex: 1; }
.project-tags  { display: flex; flex-wrap: wrap; gap: var(--sp-1); margin-top: auto; }

.empty-state   { max-width: 480px; }
.empty-card    { text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); }
.empty-card p  { text-align: center; max-width: 40ch; }
</style>
