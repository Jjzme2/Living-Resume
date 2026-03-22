<template>
  <article class="resume-page">
    <!-- Header -->
    <header class="r-header">
      <div class="r-name-block">
        <h1 class="r-name">{{ store.person.fullName }}</h1>
        <p class="r-title">{{ store.person.title }}</p>
      </div>
      <div class="r-contact">
        <a v-if="store.person.email"    :href="`mailto:${store.person.email}`">{{ store.person.email }}</a>
        <a v-if="store.person.phone"    :href="`tel:${store.person.phone.replace(/\D/g,'')}`">{{ store.person.phone }}</a>
        <span v-if="store.person.location">{{ store.person.location }}</span>
        <a v-if="store.siteSettings.siteUrl" :href="store.siteSettings.siteUrl">{{ store.siteSettings.siteUrl.replace('https://', '') }}</a>
        <a v-if="store.social.linkedin" :href="`https://linkedin.com/in/${store.social.linkedin}`">linkedin/{{ store.social.linkedin }}</a>
        <a v-if="store.social.github"   :href="`https://github.com/${store.social.github}`">github/{{ store.social.github }}</a>
      </div>
    </header>

    <hr class="r-rule" />

    <!-- Summary -->
    <section v-if="store.hasBio" class="r-section">
      <h2 class="r-section-title">Summary</h2>
      <p class="r-bio">{{ store.person.bio }}</p>
    </section>

    <!-- Skills -->
    <section v-if="store.hasSkills" class="r-section">
      <h2 class="r-section-title">Skills</h2>
      <div class="r-skills-grid">
        <div
          v-for="(catSkills, category) in store.skillsByCategory"
          :key="category"
          class="r-skill-group"
        >
          <span class="r-skill-category">{{ category }}:</span>
          <span class="r-skill-list">{{ catSkills.map((s) => s.name).join(' · ') }}</span>
        </div>
      </div>
    </section>

    <!-- Experience -->
    <section v-if="store.hasExperience" class="r-section">
      <h2 class="r-section-title">Experience</h2>
      <div class="r-items">
        <div
          v-for="job in store.experience"
          :key="`${job.company}-${job.role}`"
          class="r-item experience-item"
        >
          <div class="r-item-header">
            <div class="r-item-left">
              <strong class="r-item-title">{{ job.role }}</strong>
              <span class="r-item-sub">{{ job.company }}<span v-if="job.location"> · {{ job.location }}</span></span>
            </div>
            <span class="r-item-date">{{ job.startDate }} – {{ job.endDate ?? 'Present' }}</span>
          </div>
          <ul v-if="job.highlights.length" class="r-bullets">
            <li v-for="h in job.highlights" :key="h">{{ h }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Education -->
    <section v-if="store.hasEducation" class="r-section">
      <h2 class="r-section-title">Education</h2>
      <div class="r-items">
        <div
          v-for="edu in store.education"
          :key="edu.institution"
          class="r-item education-item"
        >
          <div class="r-item-header">
            <div class="r-item-left">
              <strong class="r-item-title">{{ edu.degree }}<span v-if="edu.field"> — {{ edu.field }}</span></strong>
              <span class="r-item-sub">{{ edu.institution }}<span v-if="edu.honors"> · {{ edu.honors }}</span></span>
            </div>
            <span v-if="edu.graduationYear" class="r-item-date">{{ edu.graduationYear }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects -->
    <section v-if="store.hasProjects" class="r-section">
      <h2 class="r-section-title">Projects</h2>
      <div class="r-items">
        <div
          v-for="proj in store.projects"
          :key="proj.title"
          class="r-item"
        >
          <div class="r-item-header">
            <div class="r-item-left">
              <strong class="r-item-title">
                {{ proj.title }}
                <span v-if="proj.url" class="r-url print-only"> ({{ proj.url }})</span>
              </strong>
              <span class="r-item-sub">{{ proj.description }}</span>
            </div>
            <div class="r-item-tags">
              <span v-for="tag in proj.tags" :key="tag" class="r-tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Business / LLC -->
    <section v-if="store.hasBusiness" class="r-section">
      <h2 class="r-section-title">Business</h2>
      <div class="r-item">
        <div class="r-item-header">
          <div class="r-item-left">
            <strong class="r-item-title">{{ store.business.name }}</strong>
            <span v-if="store.business.tagline" class="r-item-sub">{{ store.business.tagline }}</span>
          </div>
        </div>
        <p v-if="store.business.description" class="r-bio" style="margin-top: 0.4rem">
          {{ store.business.description }}
        </p>
        <ul v-if="store.hasServices" class="r-bullets">
          <li v-for="s in store.business.services" :key="s.title">
            <strong>{{ s.title }}</strong>: {{ s.description }}
          </li>
        </ul>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
const store = useSiteStore()
</script>

<style scoped>
/* ── Web view ── */
.resume-page {
  max-width: 860px;
  margin: 0 auto;
  padding: var(--sp-16) clamp(1.5rem, 5vw, 3rem) var(--sp-24);
}

.r-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-6);
  margin-bottom: var(--sp-8);
}

.r-name {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: var(--sp-1);
}

.r-title {
  font-size: 1rem;
  color: var(--accent);
  font-weight: 500;
  max-width: none;
}

.r-contact {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--sp-1);
  text-align: right;
}

.r-contact a,
.r-contact span {
  font-size: 0.82rem;
  color: var(--text-2);
  text-decoration: none;
  max-width: none;
}
.r-contact a:hover { color: var(--accent); opacity: 1; }

.r-rule {
  border: none;
  border-top: 1px solid var(--border-sm);
  margin-bottom: var(--sp-8);
}

.r-section {
  margin-bottom: var(--sp-8);
}

.r-section-title {
  font-size: 0.7rem;
  font-family: var(--font-mono);
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: var(--sp-4);
  padding-bottom: var(--sp-2);
  border-bottom: 1px solid var(--border-xs);
}

.r-bio {
  font-size: 0.92rem;
  line-height: 1.8;
  color: var(--text-2);
  max-width: 75ch;
}

.r-skills-grid {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.r-skill-group {
  font-size: 0.88rem;
  line-height: 1.6;
}

.r-skill-category {
  color: var(--text-1);
  font-weight: 600;
  margin-right: var(--sp-2);
}

.r-skill-list {
  color: var(--text-2);
}

.r-items {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

.r-item {}

.r-item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-bottom: var(--sp-2);
}

.r-item-left {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  flex: 1;
}

.r-item-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-1);
}

.r-item-sub {
  font-size: 0.85rem;
  color: var(--text-2);
}

.r-item-date {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-3);
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 2px;
}

.r-item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: var(--sp-2);
}

.r-tag {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 0.15em 0.6em;
  background: var(--accent-dim);
  color: var(--accent);
  border-radius: 4px;
}

.r-bullets {
  margin-top: var(--sp-2);
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.r-bullets li {
  font-size: 0.88rem;
  color: var(--text-2);
  padding-left: 1.2em;
  position: relative;
  line-height: 1.65;
}
.r-bullets li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--accent);
}

.r-url { font-weight: 400; font-size: 0.8em; color: var(--text-3); }

/* ── Print overrides ── */
@media print {
  .resume-page {
    padding: 0;
    max-width: 100%;
  }

  .r-header { margin-bottom: 0.8rem; }
  .r-rule   { margin-bottom: 0.6rem; }
  .r-section { margin-bottom: 0.7rem; }
  .r-items  { gap: 0.5rem; }

  .r-name  { font-size: 22pt; color: #111; }
  .r-title { color: #0891b2; }
  .r-section-title { color: #0891b2; }
  .r-item-title { color: #111; }
  .r-item-sub, .r-bio, .r-skill-list { color: #374151; }
  .r-item-date, .r-skill-category { color: #6b7280; }

  .r-tag {
    background: #f0f9ff;
    color: #0891b2;
  }

  .r-bullets li { color: #374151; }
  .r-bullets li::before { color: #0891b2; }

  .r-contact a,
  .r-contact span { color: #374151; }
}
</style>
