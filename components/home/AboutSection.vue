<template>
  <section v-if="show" id="about" class="section">
    <div class="container about-grid">
      <!-- Text -->
      <div class="about-text">
        <SectionHeading
          :label="sectionContent.about.label"
          :title="sectionContent.about.title"
          :accent="sectionContent.about.accent"
        />

        <div class="bio-body reveal">
          <p v-if="store.hasBio">{{ store.person.bio }}</p>
          <p v-else class="placeholder-note">
            {{ sectionContent.about.bioPlaceholder }}
          </p>
        </div>

        <!-- LLC callout -->
        <GlassCard
          v-if="store.hasBusiness"
          class="llc-card reveal"
          padding="md"
          hoverable
        >
          <p class="llc-label section-label">LLC</p>
          <h3 class="llc-name">{{ store.business.name }}</h3>
          <p v-if="store.business.tagline" class="llc-tagline">{{ store.business.tagline }}</p>
          <p v-if="store.business.description" class="llc-desc">{{ store.business.description }}</p>
          <a
            v-if="store.business.url"
            :href="store.business.url"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-sm"
            style="margin-top: var(--sp-4)"
          >
            Visit Site
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </GlassCard>

        <!-- Quick facts (contact info) -->
        <div v-if="store.person.location || store.person.email" class="quick-facts stagger">
          <div v-if="store.person.location" class="fact">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{{ store.person.location }}</span>
          </div>
          <div v-if="store.person.email" class="fact">
            <SocialIcon platform="email" :size="14" />
            <a :href="`mailto:${store.person.email}`">{{ store.person.email }}</a>
          </div>
        </div>
      </div>

      <!-- Visual side -->
      <div class="about-visual reveal-right">
        <div class="avatar-container">
          <img
            v-if="store.person.avatarUrl"
            :src="store.person.avatarUrl"
            :alt="`${store.person.name} photo`"
            class="avatar"
            loading="lazy"
          />
          <div v-else class="avatar-placeholder">
            <span>{{ store.person.initials }}</span>
          </div>
          <!-- Glow ring -->
          <div class="avatar-glow" aria-hidden="true" />
        </div>

        <!-- Floating stats card -->
        <GlassCard class="stats-card stagger" hoverable>
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="stat"
          >
            <span class="stat-value gradient-text">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </GlassCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { sectionContent } from '~/data/sectionContent'
const store = useSiteStore()

// Show section if we have any content to show
const show = computed(() =>
  store.siteSettings.showAbout &&
  (store.hasBio || store.hasBusiness || store.person.location || store.person.email)
)

const stats = computed(() => {
  const result = []
  if (store.hasExperience) {
    const earliestYear = store.experience
      .map((e) => parseInt(e.startDate))
      .filter(Boolean)
      .sort((a, b) => a - b)[0]
    if (earliestYear) {
      result.push({ value: `${new Date().getFullYear() - earliestYear}+`, label: 'Years Experience' })
    }
  }
  if (store.hasProjects) {
    result.push({ value: `${store.projects.length}+`, label: 'Projects Built' })
  }
  if (store.hasSkills) {
    result.push({ value: `${store.skills.length}`, label: 'Skills' })
  }
  return result
})
</script>

<style scoped>
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(3rem, 6vw, 6rem);
  align-items: start;
}

.about-text {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

.bio-body p {
  font-size: 1.05rem;
  line-height: 1.85;
  color: var(--text-2);
  max-width: 60ch;
}

.placeholder-note {
  color: var(--text-3) !important;
  font-style: italic;
}

.llc-card {
  margin-top: var(--sp-2);
}

.llc-label { margin-bottom: var(--sp-2); }
.llc-name  { font-size: 1.3rem; margin-bottom: var(--sp-2); }
.llc-tagline {
  color: var(--accent);
  font-size: 0.92rem;
  font-weight: 500;
  max-width: none;
  margin-bottom: var(--sp-2);
}
.llc-desc { font-size: 0.9rem; }

.btn-sm { font-size: 0.82rem; padding: 0.45em 1em; }

.quick-facts {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.fact {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.88rem;
  color: var(--text-2);
}
.fact a { color: var(--text-2); }
.fact a:hover { color: var(--accent); opacity: 1; }

/* Visual side */
.about-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-6);
  position: sticky;
  top: 100px;
}

.avatar-container {
  position: relative;
  width: min(280px, 60vw);
  aspect-ratio: 1;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: var(--r-xl);
  object-fit: cover;
  border: 1px solid var(--border-sm);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: var(--r-xl);
  background: var(--bg-surface);
  border: 1px solid var(--border-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder span {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 700;
  background: var(--grad-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.avatar-glow {
  position: absolute;
  inset: -20%;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(94, 234, 212, 0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
  animation: pulse-glow 4s ease-in-out infinite;
}

.stats-card {
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: var(--sp-6);
  gap: var(--sp-4);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  text-align: center;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.72rem;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
}

@media (max-width: 900px) {
  .about-grid {
    grid-template-columns: 1fr;
  }
  .about-visual {
    order: -1;
    position: static;
  }
}
</style>
