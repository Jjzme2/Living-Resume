<template>
  <section v-if="store.siteSettings.showProjects && store.hasProjects" id="projects" class="section">
    <div class="container">
      <SectionHeading
        :label="sectionContent.projects.label"
        :title="sectionContent.projects.title"
        :accent="sectionContent.projects.accent"
      />

      <div class="projects-grid stagger">
        <GlassCard
          v-for="project in visibleProjects"
          :key="project.title"
          class="project-card"
          :class="{ featured: project.featured }"
          hoverable
          padding="md"
        >
          <div class="card-top">
            <!-- Featured badge -->
            <span v-if="project.featured" class="chip featured-badge">Featured</span>

            <!-- External links -->
            <div class="card-links">
              <a
                v-if="project.repo"
                :href="project.repo"
                target="_blank"
                rel="noopener noreferrer"
                class="icon-link"
                aria-label="View source on GitHub"
              >
                <SocialIcon platform="github" :size="18" />
              </a>
              <a
                v-if="project.url"
                :href="project.url"
                target="_blank"
                rel="noopener noreferrer"
                class="icon-link"
                aria-label="Visit live project"
              >
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

      <!-- See all link if there are more -->
      <div v-if="store.projects.length > 6" class="see-all reveal">
        <NuxtLink to="/projects" class="btn btn-ghost">
          {{ sectionContent.projects.ctaViewAll }}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { sectionContent } from '~/data/sectionContent'
const store = useSiteStore()

// Show up to 6 on home, prioritize featured
const visibleProjects = computed(() => {
  const featured = store.projects.filter((p) => p.featured)
  const rest = store.projects.filter((p) => !p.featured)
  return [...featured, ...rest].slice(0, 6)
})
</script>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--sp-6);
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.project-card.featured {
  border-color: rgba(94, 234, 212, 0.2);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
}

.featured-badge {
  font-size: 0.7rem;
}

.card-links {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-left: auto;
}

.icon-link {
  color: var(--text-3);
  display: flex;
  transition: color var(--t-fast), transform var(--t-base);
}
.icon-link:hover {
  color: var(--accent);
  transform: translateY(-1px);
  opacity: 1;
}

.project-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-1);
  line-height: 1.3;
  margin: 0;
}

.project-desc {
  font-size: 0.9rem;
  line-height: 1.7;
  flex: 1;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1);
  margin-top: auto;
}

.see-all {
  margin-top: var(--sp-12);
  display: flex;
  justify-content: center;
}
</style>
