<template>
  <section
    v-if="store.siteSettings.showExperience && (store.hasExperience || store.hasEducation)"
    id="work"
    class="section"
  >
    <div class="container">
      <SectionHeading
        :label="sectionContent.experience.label"
        :title="sectionContent.experience.title"
        :accent="sectionContent.experience.accent"
      />

      <div class="timeline-layout">
        <!-- Experience -->
        <div v-if="store.hasExperience" class="timeline-column">
          <h3 class="column-title stagger">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
            {{ sectionContent.experience.workColumnTitle }}
          </h3>

          <div class="timeline">
            <GlassCard
              v-for="(job, i) in store.experience"
              :key="i"
              class="timeline-item reveal"
              hoverable
              padding="md"
            >
              <div class="timeline-dot" aria-hidden="true" />

              <div class="item-header">
                <div>
                  <h4 class="item-role">{{ job.role }}</h4>
                  <p class="item-company">{{ job.company }}</p>
                </div>
                <div class="item-meta">
                  <span class="date-badge">
                    {{ job.startDate }} – {{ job.endDate ?? sectionContent.experience.currentJobLabel }}
                  </span>
                  <span v-if="job.location" class="location-badge">
                    {{ job.location }}
                  </span>
                  <span v-if="job.type" class="chip chip-indigo">{{ job.type }}</span>
                </div>
              </div>

              <ul v-if="job.highlights.length" class="highlights">
                <li v-for="(h, j) in job.highlights" :key="j">{{ h }}</li>
              </ul>
            </GlassCard>
          </div>
        </div>

        <!-- Education -->
        <div v-if="store.hasEducation" class="timeline-column">
          <h3 class="column-title stagger">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            {{ sectionContent.experience.educationColumnTitle }}
          </h3>

          <div class="timeline">
            <GlassCard
              v-for="(edu, i) in store.education"
              :key="i"
              class="timeline-item reveal"
              hoverable
              padding="md"
            >
              <div class="timeline-dot" aria-hidden="true" />
              <h4 class="item-role">{{ edu.degree }}<span v-if="edu.field"> · {{ edu.field }}</span></h4>
              <p class="item-company">{{ edu.institution }}</p>
              <div class="item-meta" style="margin-top: var(--sp-2)">
                <span v-if="edu.graduationYear" class="date-badge">{{ edu.graduationYear }}</span>
                <span v-if="edu.honors" class="chip">{{ edu.honors }}</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { sectionContent } from '~/data/sectionContent'
const store = useSiteStore()
</script>

<style scoped>
.timeline-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: clamp(2rem, 5vw, 5rem);
  align-items: start;
}

.column-title {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: var(--sp-6);
  font-family: var(--font-display);
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  position: relative;
}

/* Vertical connector line */
.timeline::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, var(--accent), var(--accent2), transparent);
  opacity: 0.3;
}

.timeline-item {
  position: relative;
  margin-left: var(--sp-6);
}

.timeline-dot {
  position: absolute;
  left: calc(-1 * var(--sp-6) - 5px);
  top: 1.2rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent-glow);
  z-index: 1;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-bottom: var(--sp-3);
}

.item-role {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-1);
  line-height: 1.3;
  margin-bottom: var(--sp-1);
}

.item-company {
  font-size: 0.88rem;
  color: var(--accent);
  font-weight: 500;
  max-width: none;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.date-badge {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-3);
  white-space: nowrap;
}

.location-badge {
  font-size: 0.72rem;
  color: var(--text-3);
  white-space: nowrap;
}

.highlights {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.highlights li {
  font-size: 0.88rem;
  color: var(--text-2);
  padding-left: var(--sp-4);
  position: relative;
  line-height: 1.6;
}

.highlights li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-size: 0.7em;
  top: 0.22em;
}
</style>
