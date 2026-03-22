<template>
  <section v-if="store.siteSettings.showSkills && store.hasSkills" id="skills" class="section">
    <div class="container">
      <SectionHeading
        :label="sectionContent.skills.label"
        :title="sectionContent.skills.title"
        :accent="sectionContent.skills.accent"
      />

      <div class="categories">
        <div
          v-for="(categorySkills, category) in store.skillsByCategory"
          :key="category"
          class="category-block reveal"
        >
          <h4 class="category-label">{{ category }}</h4>
          <div class="skills-row stagger">
            <div
              v-for="skill in categorySkills"
              :key="skill.name"
              class="skill-item"
            >
              <div class="skill-info">
                <span class="skill-name">{{ skill.name }}</span>
                <span v-if="skill.level" class="skill-level">{{ skill.level }}%</span>
              </div>
              <div v-if="skill.level" class="skill-bar">
                <div
                  class="skill-fill"
                  :style="{ '--target': `${skill.level}%` }"
                />
              </div>
            </div>
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
.categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--sp-8);
}

.category-block {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.category-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-3);
  padding-bottom: var(--sp-2);
  border-bottom: 1px solid var(--border-xs);
}

.skills-row {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.skill-item {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.skill-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.skill-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-1);
}

.skill-level {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--accent);
}

.skill-bar {
  height: 3px;
  background: var(--border-xs);
  border-radius: 2px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  width: 0;
  background: var(--grad-accent);
  border-radius: 2px;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animate bar when parent becomes visible */
.stagger.visible .skill-fill {
  width: var(--target);
}
</style>
