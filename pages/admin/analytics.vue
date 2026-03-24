<template>
  <div class="page-wrap">
    <div class="page-header">
      <div>
        <h2 class="page-heading">Analytics</h2>
        <p class="page-sub">Page views and visitor insights.</p>
      </div>
      <div class="refresh-info">
        <span class="refresh-dot" />
        <span class="refresh-label">Updates in real-time</span>
      </div>
    </div>

    <div v-if="loading" class="loading-grid">
      <div class="loading-card" v-for="i in 3" :key="i" />
    </div>

    <template v-else>
      <!-- Summary stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div class="stat-value">{{ data?.todayTotal ?? 0 }}</div>
          <div class="stat-label">Views Today</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="stat-value">{{ data?.weekTotal ?? 0 }}</div>
          <div class="stat-label">This Week</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div class="stat-value">{{ data?.allTimeTotal ?? 0 }}</div>
          <div class="stat-label">All Time</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div class="stat-value">{{ avgPerDay }}</div>
          <div class="stat-label">Avg / Day (14d)</div>
        </div>
      </div>

      <!-- Bar chart: last 14 days -->
      <div class="section-card">
        <h3 class="card-title">Page Views — Last 14 Days</h3>
        <div class="chart-area" v-if="data?.dailyTotals?.length">
          <div class="chart-bars">
            <div
              v-for="day in data.dailyTotals"
              :key="day.date"
              class="bar-col"
              :title="`${formatChartDate(day.date)}: ${day.views} views`"
            >
              <div class="bar-value">{{ day.views > 0 ? day.views : '' }}</div>
              <div
                class="bar"
                :class="{ 'bar-today': day.date === todayStr }"
                :style="{ height: barHeight(day.views) }"
              />
              <div class="bar-label">{{ formatChartLabel(day.date) }}</div>
            </div>
          </div>
          <div v-if="chartMax === 0" class="chart-empty">No views recorded yet. Make sure the tracking is set up.</div>
        </div>
      </div>

      <!-- Top pages -->
      <div class="section-card">
        <h3 class="card-title">Top Pages Today</h3>
        <div v-if="!data?.topPages?.length" class="empty-state">
          <p>No page views recorded today yet.</p>
        </div>
        <div v-else class="top-pages">
          <div v-for="(page, i) in data.topPages" :key="page.path" class="page-row">
            <span class="page-rank">#{{ i + 1 }}</span>
            <span class="page-path">{{ page.path }}</span>
            <div class="page-bar-wrap">
              <div class="page-bar" :style="{ width: pageBarWidth(page.views) }" />
            </div>
            <span class="page-views">{{ page.views }}</span>
          </div>
        </div>
      </div>

      <!-- Resume employer analysis -->
      <div class="section-card" v-if="resumeAnalysis.length">
        <h3 class="card-title">Resume Analysis by Employer Category</h3>
        <p class="card-sub">How your resume reads to potential employers in each industry. Scores are based on your current skills, experience, and profile completeness.</p>
        <div class="ra-grid">
          <div
            v-for="cat in resumeAnalysis"
            :key="cat.id"
            class="ra-card"
            :class="`ra-${cat.grade}`"
          >
            <div class="ra-header">
              <div class="ra-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path :d="cat.icon" />
                </svg>
              </div>
              <div class="ra-title-wrap">
                <span class="ra-label">{{ cat.label }}</span>
                <span class="ra-grade-badge" :class="`badge-${cat.grade}`">{{ cat.grade }}</span>
              </div>
              <div class="ra-score-wrap">
                <span class="ra-score">{{ cat.score }}</span>
                <span class="ra-score-denom">/100</span>
              </div>
            </div>

            <!-- Score bar -->
            <div class="ra-bar-track">
              <div class="ra-bar-fill" :class="`fill-${cat.grade}`" :style="{ width: `${cat.score}%` }" />
            </div>

            <!-- Strengths -->
            <div v-if="cat.strengths.length" class="ra-section">
              <div class="ra-section-label ra-label-good">Strengths</div>
              <ul class="ra-list">
                <li v-for="s in cat.strengths" :key="s" class="ra-item ra-item-good">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ s }}
                </li>
              </ul>
            </div>

            <!-- Gaps -->
            <div v-if="cat.gaps.length" class="ra-section">
              <div class="ra-section-label ra-label-gap">Areas to Improve</div>
              <ul class="ra-list">
                <li v-for="g in cat.gaps" :key="g" class="ra-item ra-item-gap">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  {{ g }}
                </li>
              </ul>
            </div>

            <!-- Improvement actions -->
            <div v-if="cat.suggestions.length" class="ra-actions">
              <NuxtLink
                v-for="s in cat.suggestions"
                :key="s.route"
                :to="s.route"
                class="ra-btn"
              >
                {{ s.label }}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </NuxtLink>
            </div>

            <div v-else class="ra-all-good">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Looking solid for this category
            </div>
          </div>
        </div>
      </div>

      <!-- Blog AI Analysis -->
      <div class="section-card">
        <h3 class="card-title">Blog & Portfolio AI Analysis</h3>
        <p class="card-sub">Use AI to evaluate individual posts, all posts as a group, or your resume and blog together.</p>

        <!-- Holistic / group actions -->
        <div class="ba-top-actions">
          <button class="ba-action-btn" :disabled="!!globalAiLoading" @click="analyzeGroup">
            <span v-if="globalAiLoading === 'group'" class="ai-spin" />
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Analyze All Posts
          </button>
          <button class="ba-action-btn" :disabled="!!globalAiLoading" @click="analyzeHolistic">
            <span v-if="globalAiLoading === 'holistic'" class="ai-spin" />
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Holistic Resume + Blog
          </button>
        </div>

        <!-- Group analysis result -->
        <div v-if="groupAnalysisResult" class="ba-result-card">
          <div class="ba-result-label">All Posts Analysis</div>
          <div class="ba-result-body">{{ groupAnalysisResult }}</div>
          <button class="ba-dismiss" @click="groupAnalysisResult = null">Dismiss</button>
        </div>

        <!-- Holistic result -->
        <div v-if="holisticResult" class="ba-result-card ba-result-holistic">
          <div class="ba-result-label">Resume + Blog — Holistic View</div>
          <div class="ba-result-body">{{ holisticResult }}</div>
          <button class="ba-dismiss" @click="holisticResult = null">Dismiss</button>
        </div>

        <!-- Per-post list -->
        <div v-if="blogPosts.length" class="ba-posts">
          <div class="ba-posts-title">Individual Post Analysis</div>
          <div v-for="post in blogPosts" :key="post.slug" class="ba-post-row">
            <div class="ba-post-info">
              <span class="ba-post-title">{{ post.title }}</span>
              <span class="ba-post-meta">
                <span class="ba-chip" :class="post.status === 'draft' ? 'ba-chip-draft' : 'ba-chip-pub'">{{ post.status ?? 'published' }}</span>
                <span class="ba-date">{{ post.date }}</span>
              </span>
            </div>
            <button
              class="ba-action-btn ba-action-sm"
              :disabled="!!postAiState[post.slug]?.loading"
              @click="analyzePost(post)"
            >
              <span v-if="postAiState[post.slug]?.loading" class="ai-spin" />
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
              Analyze
            </button>
            <!-- Per-post result -->
            <div v-if="postAiState[post.slug]?.result" class="ba-post-result">
              <div class="ba-result-body">{{ postAiState[post.slug]?.result }}</div>
              <button class="ba-dismiss" @click="dismissPostResult(post.slug)">Dismiss</button>
            </div>
            <p v-if="postAiState[post.slug]?.error" class="ba-error">{{ postAiState[post.slug]?.error }}</p>
          </div>
        </div>
        <div v-else-if="!loading" class="ba-empty">No blog posts yet. <NuxtLink to="/admin/blog/new" class="ba-link">Write your first post →</NuxtLink></div>

        <p v-if="globalAiError" class="ba-error">{{ globalAiError }}</p>
      </div>

      <!-- Setup notice if no data -->
      <div v-if="data?.allTimeTotal === 0" class="notice-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <strong>No analytics data yet.</strong> Page views are tracked automatically when visitors load pages. Make sure Firebase is connected, then visit your live site to start collecting data.
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

interface DayData { date: string; views: number }
interface PageData { path: string; views: number }
interface AnalyticsData {
  dailyTotals: DayData[]
  topPages: PageData[]
  allTimeTotal: number
  weekTotal: number
  todayTotal: number
}

interface Skill { name: string; category: string; level?: number }
interface ExperienceItem {
  company: string
  role: string
  startDate: string
  endDate?: string
  type?: string
  highlights: string[]
}
interface Project { title: string; description: string; tags: string[] }
interface SiteData {
  person?: { name?: string; bio?: string; email?: string; location?: string; title?: string }
  social?: Record<string, string>
  skills?: Skill[]
  experience?: ExperienceItem[]
  education?: Array<{ institution: string; degree: string }>
  projects?: Project[]
}

interface CategorySuggestion { label: string; route: string }
interface CategoryAnalysis {
  id: string
  label: string
  icon: string
  score: number
  grade: 'strong' | 'moderate' | 'weak'
  strengths: string[]
  gaps: string[]
  suggestions: CategorySuggestion[]
}

const loading = ref(true)
const data = ref<AnalyticsData | null>(null)
const siteData = ref<SiteData | null>(null)
const todayStr = new Date().toISOString().slice(0, 10)

const chartMax = computed(() =>
  Math.max(1, ...((data.value?.dailyTotals ?? []).map(d => d.views)))
)

const avgPerDay = computed(() => {
  const totals = data.value?.dailyTotals ?? []
  if (!totals.length) return 0
  const sum = totals.reduce((s, d) => s + d.views, 0)
  return Math.round(sum / totals.length)
})

const topMax = computed(() =>
  Math.max(1, ...((data.value?.topPages ?? []).map(p => p.views)))
)

function barHeight(views: number) {
  const pct = (views / chartMax.value) * 100
  return `${Math.max(2, pct)}%`
}

function pageBarWidth(views: number) {
  return `${(views / topMax.value) * 100}%`
}

function formatChartDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatChartLabel(d: string) {
  const dt = new Date(d + 'T12:00:00')
  if (d === todayStr) return 'Today'
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).replace(' ', '\n')
}

// ── Resume analysis ───────────────────────────────────────────────

function matchesKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some(k => lower.includes(k))
}

function countKeywords(texts: string[], keywords: string[]): number {
  return texts.reduce((n, t) => n + (matchesKeywords(t, keywords) ? 1 : 0), 0)
}

const resumeAnalysis = computed((): CategoryAnalysis[] => {
  const sd = siteData.value
  if (!sd) return []

  const skills = sd.skills ?? []
  const experience = sd.experience ?? []
  const projects = sd.projects ?? []
  const social = sd.social ?? {}

  const allHighlights = experience.flatMap(e => e.highlights ?? [])
  const allRoles = experience.map(e => `${e.role} ${e.company}`)
  const hasGithub = !!(social.github)
  const hasLinkedin = !!(social.linkedin)

  // ── Tech / Software ──────────────────────────────────────────────
  const techSkillCategories = new Set(
    skills.filter(s => ['Frontend', 'Backend', 'DevOps'].includes(s.category)).map(s => s.category)
  )
  const techSkillCount = skills.filter(s => ['Frontend', 'Backend', 'DevOps'].includes(s.category)).length
  const techExpCount = countKeywords(allRoles, ['developer', 'engineer', 'software', 'web', 'programmer', 'data', 'dev', 'tech'])
  const techHighlightCount = countKeywords(allHighlights, ['code', 'develop', 'build', 'deploy', 'api', 'database', 'cms', 'site', 'ticket', 'client', 'platform', 'vdi', 'filezilla'])
  const projectCount = projects.length

  let techScore = 0
  techScore += Math.min(techSkillCategories.size * 12, 30)
  techScore += Math.min(techSkillCount * 4, 20)
  techScore += Math.min(techExpCount * 15, 25)
  techScore += Math.min(techHighlightCount * 4, 15)
  techScore += Math.min(projectCount * 5, 15)
  techScore += hasGithub ? 10 : 0
  techScore += hasLinkedin ? 5 : 0
  techScore = Math.min(techScore, 100)

  const techStrengths: string[] = []
  const techGaps: string[] = []
  const techSuggestions: CategorySuggestion[] = []

  if (techSkillCount > 0) techStrengths.push(`${techSkillCount} technical skill${techSkillCount > 1 ? 's' : ''} listed`)
  if (techExpCount > 0) techStrengths.push(`${techExpCount} tech-related role${techExpCount > 1 ? 's' : ''} in work history`)
  if (projectCount > 0) techStrengths.push(`${projectCount} project${projectCount > 1 ? 's' : ''} in portfolio`)

  if (projectCount === 0) { techGaps.push('No portfolio projects listed'); techSuggestions.push({ label: 'Add Projects', route: '/admin/projects' }) }
  if (!hasGithub) { techGaps.push('GitHub profile not linked'); techSuggestions.push({ label: 'Add GitHub', route: '/admin/social' }) }
  if (techHighlightCount < 3) { techGaps.push('Work highlights lack technical specifics'); techSuggestions.push({ label: 'Improve Experience', route: '/admin/experience' }) }
  if (techSkillCategories.size < 2) { techGaps.push('Skill breadth is narrow — consider adding more categories'); techSuggestions.push({ label: 'Add Skills', route: '/admin/skills' }) }

  // ── Manufacturing / Industrial ───────────────────────────────────
  const mfgKeywords = ['machine', 'operator', 'manufactur', 'industrial', 'production', 'equipment', 'safety', 'quality', 'lithograph', 'steel', 'downstack', 'assembly', 'forklift', 'warehouse', 'plant']
  const mfgExpCount = countKeywords(allRoles, mfgKeywords)
  const mfgHighlightCount = countKeywords(allHighlights, mfgKeywords)
  const mfgExps = experience.filter(e => matchesKeywords(`${e.role} ${e.company}`, mfgKeywords))

  let mfgScore = 0
  mfgScore += Math.min(mfgExpCount * 30, 50)
  mfgScore += Math.min(mfgHighlightCount * 10, 30)
  mfgScore += mfgExps.some(e => !e.endDate) ? 15 : 5
  mfgScore = Math.min(mfgScore, 100)

  const mfgStrengths: string[] = []
  const mfgGaps: string[] = []
  const mfgSuggestions: CategorySuggestion[] = []

  if (mfgExpCount > 0) mfgStrengths.push('Direct manufacturing/industrial experience present')
  if (mfgExps.some(e => !e.endDate)) mfgStrengths.push('Currently employed in this sector')
  if (mfgHighlightCount > 0) mfgStrengths.push(`${mfgHighlightCount} highlight${mfgHighlightCount > 1 ? 's' : ''} reference manufacturing skills`)

  if (mfgHighlightCount < 3) { mfgGaps.push('Manufacturing highlights could be more detailed'); mfgSuggestions.push({ label: 'Improve Highlights', route: '/admin/experience' }) }
  if (!experience.some(e => matchesKeywords(e.role + e.company, mfgKeywords) && e.highlights.length >= 3)) {
    mfgGaps.push('Consider quantifying output, throughput, or safety record')
    if (!mfgSuggestions.find(s => s.route === '/admin/experience')) mfgSuggestions.push({ label: 'Improve Experience', route: '/admin/experience' })
  }

  // ── Service / Non-Skill / Hospitality ────────────────────────────
  const svcKeywords = ['restaurant', 'food', 'guest', 'customer', 'service', 'server', 'cashier', 'retail', 'hospitality', 'noodles', 'manager', 'management', 'team', 'store', 'shift']
  const svcExpCount = countKeywords(allRoles, svcKeywords)
  const svcHighlightCount = countKeywords(allHighlights, svcKeywords)

  let svcScore = 0
  svcScore += Math.min(svcExpCount * 25, 45)
  svcScore += Math.min(svcHighlightCount * 8, 30)
  svcScore += experience.some(e => matchesKeywords(e.role, ['manager', 'supervisor', 'lead', 'general manager'])) ? 20 : 0
  svcScore = Math.min(svcScore, 100)

  const svcStrengths: string[] = []
  const svcGaps: string[] = []
  const svcSuggestions: CategorySuggestion[] = []

  if (svcExpCount > 0) svcStrengths.push('Service / hospitality experience in history')
  if (experience.some(e => matchesKeywords(e.role, ['manager', 'general manager', 'supervisor']))) svcStrengths.push('Management role demonstrates leadership in service context')
  if (svcHighlightCount > 0) svcStrengths.push('Highlights mention customer-facing responsibilities')

  if (svcHighlightCount < 2) { svcGaps.push('Customer service highlights are thin'); svcSuggestions.push({ label: 'Improve Highlights', route: '/admin/experience' }) }
  if (!experience.some(e => matchesKeywords(e.role + ' ' + e.highlights.join(' '), ['training', 'onboard', 'schedule']))) {
    svcGaps.push('Staffing or scheduling experience not mentioned')
    if (!svcSuggestions.find(s => s.route === '/admin/experience')) svcSuggestions.push({ label: 'Improve Experience', route: '/admin/experience' })
  }

  // ── Management / Leadership ───────────────────────────────────────
  const mgmtRoleKeywords = ['manager', 'director', 'lead', 'head', 'chief', 'supervisor', 'coordinator', 'vp', 'officer']
  const mgmtHighlightKeywords = ['managed', 'led', 'oversee', 'oversaw', 'supervised', 'coordinated', 'mentored', 'trained', 'hired', 'team', 'budget', 'strategy', 'initiative', 'collaborated']
  const mgmtRoleCount = countKeywords(allRoles, mgmtRoleKeywords)
  const mgmtHighlightCount = countKeywords(allHighlights, mgmtHighlightKeywords)

  let mgmtScore = 0
  mgmtScore += Math.min(mgmtRoleCount * 25, 40)
  mgmtScore += Math.min(mgmtHighlightCount * 7, 40)
  mgmtScore += hasLinkedin ? 10 : 0
  mgmtScore += (sd.person?.bio ?? '').length > 100 ? 10 : 0
  mgmtScore = Math.min(mgmtScore, 100)

  const mgmtStrengths: string[] = []
  const mgmtGaps: string[] = []
  const mgmtSuggestions: CategorySuggestion[] = []

  if (mgmtRoleCount > 0) mgmtStrengths.push(`${mgmtRoleCount} management-titled role${mgmtRoleCount > 1 ? 's' : ''} in history`)
  if (mgmtHighlightCount > 0) mgmtStrengths.push(`${mgmtHighlightCount} highlight${mgmtHighlightCount > 1 ? 's' : ''} demonstrate leadership actions`)

  if (mgmtHighlightCount < 4) { mgmtGaps.push('More leadership outcomes needed (e.g. team size, results)'); mgmtSuggestions.push({ label: 'Improve Highlights', route: '/admin/experience' }) }
  if (!hasLinkedin) { mgmtGaps.push('LinkedIn profile not linked — critical for management roles'); mgmtSuggestions.push({ label: 'Add LinkedIn', route: '/admin/social' }) }
  if ((sd.person?.bio ?? '').length < 100) { mgmtGaps.push('Bio is short — a stronger summary helps management candidates'); mgmtSuggestions.push({ label: 'Update Bio', route: '/admin/profile' }) }

  function toGrade(score: number): 'strong' | 'moderate' | 'weak' {
    if (score >= 65) return 'strong'
    if (score >= 35) return 'moderate'
    return 'weak'
  }

  return [
    {
      id: 'tech',
      label: 'Tech / Software',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      score: techScore,
      grade: toGrade(techScore),
      strengths: techStrengths,
      gaps: techGaps,
      suggestions: techSuggestions,
    },
    {
      id: 'manufacturing',
      label: 'Manufacturing / Industrial',
      icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
      score: mfgScore,
      grade: toGrade(mfgScore),
      strengths: mfgStrengths,
      gaps: mfgGaps,
      suggestions: mfgSuggestions,
    },
    {
      id: 'service',
      label: 'Service / Hospitality',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      score: svcScore,
      grade: toGrade(svcScore),
      strengths: svcStrengths,
      gaps: svcGaps,
      suggestions: svcSuggestions,
    },
    {
      id: 'management',
      label: 'Management / Leadership',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      score: mgmtScore,
      grade: toGrade(mgmtScore),
      strengths: mgmtStrengths,
      gaps: mgmtGaps,
      suggestions: mgmtSuggestions,
    },
  ]
})

// ── Blog AI Analysis ─────────────────────────────────────────────

interface PostMeta {
  slug: string; path: string; title: string; description: string
  date: string; status?: string; category?: string; tags?: string[]
}

interface PostAiState { loading: boolean; result: string | null; error: string | null }

const blogPosts = ref<PostMeta[]>([])
const postAiState = reactive<Record<string, PostAiState>>({})
const globalAiLoading = ref<'group' | 'holistic' | null>(null)
const groupAnalysisResult = ref<string | null>(null)
const holisticResult = ref<string | null>(null)
const globalAiError = ref('')

function getPostState(slug: string): PostAiState {
  if (!postAiState[slug]) postAiState[slug] = { loading: false, result: null, error: null }
  return postAiState[slug]
}

function dismissPostResult(slug: string) {
  if (postAiState[slug]) { postAiState[slug].result = null; postAiState[slug].error = null }
}

async function analyzePost(post: PostMeta) {
  const state = getPostState(post.slug)
  state.loading = true; state.result = null; state.error = null
  try {
    const data = await $fetch<{ result: string }>('/api/admin/ai-assist', {
      method: 'POST',
      body: {
        mode: 'analyze_blog',
        context: {
          title: post.title,
          description: post.description ?? '',
          tags: (post.tags ?? []).join(', '),
          wordCount: '',
          excerpt: post.description ?? '',
        },
      },
    })
    state.result = data.result
  } catch (e: unknown) {
    state.error = (e as { statusMessage?: string })?.statusMessage ?? 'Analysis failed'
  } finally {
    state.loading = false
  }
}

async function analyzeGroup() {
  if (!blogPosts.value.length) return
  globalAiLoading.value = 'group'
  groupAnalysisResult.value = null
  globalAiError.value = ''
  const postsSummary = blogPosts.value
    .map(p => `- "${p.title}" (${p.date}) [${p.status ?? 'published'}]${p.category ? ` — ${p.category}` : ''}`)
    .join('\n')
  try {
    const data = await $fetch<{ result: string }>('/api/admin/ai-assist', {
      method: 'POST',
      body: { mode: 'analyze_blog_group', context: { posts: postsSummary } },
    })
    groupAnalysisResult.value = data.result
  } catch (e: unknown) {
    globalAiError.value = (e as { statusMessage?: string })?.statusMessage ?? 'Group analysis failed'
  } finally {
    globalAiLoading.value = null
  }
}

async function analyzeHolistic() {
  globalAiLoading.value = 'holistic'
  holisticResult.value = null
  globalAiError.value = ''
  const sd = siteData.value
  const blogSummary = blogPosts.value
    .map(p => `- "${p.title}" (${p.date})`)
    .join('\n') || '(no posts)'
  try {
    const data = await $fetch<{ result: string }>('/api/admin/ai-assist', {
      method: 'POST',
      body: {
        mode: 'analyze_resume_holistic',
        context: {
          name: sd?.person?.name ?? '',
          title: sd?.person?.title ?? '',
          bio: sd?.person?.bio ?? '',
          skills: (sd?.skills ?? []).map(s => s.name).join(', '),
          experience: (sd?.experience ?? []).map(e => `${e.role} at ${e.company}`).join('; '),
          projects: (sd?.projects ?? []).map(p => p.title).join(', '),
          blogSummary,
        },
      },
    })
    holisticResult.value = data.result
  } catch (e: unknown) {
    globalAiError.value = (e as { statusMessage?: string })?.statusMessage ?? 'Holistic analysis failed'
  } finally {
    globalAiLoading.value = null
  }
}

onMounted(async () => {
  try {
    const [analyticsResult, siteResult, postsResult] = await Promise.all([
      $fetch<AnalyticsData>('/api/admin/analytics'),
      $fetch<SiteData>('/api/admin/data'),
      $fetch<PostMeta[]>('/api/admin/blog/posts').catch(() => []),
    ])
    data.value = analyticsResult
    siteData.value = siteResult
    blogPosts.value = postsResult
  } catch { /* ignore */ } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-wrap { max-width: 900px; margin: 0 auto; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--sp-8); }
.page-heading { font-size: 1.2rem; font-weight: 600; color: var(--text-1); margin-bottom: var(--sp-2); font-family: var(--font-display); }
.page-sub { font-size: 0.875rem; color: var(--text-3); max-width: none; }
.refresh-info { display: flex; align-items: center; gap: var(--sp-2); font-size: 0.75rem; color: var(--text-3); font-family: var(--font-mono); padding-top: var(--sp-1); }
.refresh-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 5px var(--accent); animation: pulse-dot 2s ease-in-out infinite; }
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.loading-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-4); margin-bottom: var(--sp-6); }
.loading-card { height: 120px; background: var(--bg-elevated); border-radius: var(--r-lg); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-4); margin-bottom: var(--sp-6); }
.stat-card { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-2); }
.stat-icon { width: 32px; height: 32px; background: var(--accent-dim); border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; margin-bottom: var(--sp-1); }
.stat-value { font-size: 1.8rem; font-weight: 700; color: var(--text-1); font-family: var(--font-display); line-height: 1; }
.stat-label { font-size: 0.72rem; color: var(--text-3); font-family: var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase; }

.section-card { background: var(--bg-elevated); border: 1px solid var(--border-sm); border-radius: var(--r-lg); padding: var(--sp-6); margin-bottom: var(--sp-6); }
.card-title { font-size: 0.95rem; font-weight: 600; color: var(--text-1); font-family: var(--font-display); margin-bottom: var(--sp-5); padding-bottom: var(--sp-3); border-bottom: 1px solid var(--border-xs); }

/* Bar chart */
.chart-area { position: relative; }
.chart-bars { display: flex; align-items: flex-end; gap: var(--sp-2); height: 180px; padding-bottom: var(--sp-6); }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: var(--sp-1); height: 100%; }
.bar-value { font-size: 0.6rem; color: var(--text-3); font-family: var(--font-mono); min-height: 14px; }
.bar { width: 100%; background: var(--accent-dim); border: 1px solid rgba(94,234,212,0.2); border-radius: var(--r-sm) var(--r-sm) 0 0; transition: height 0.3s ease; min-height: 2px; cursor: default; }
.bar:hover { background: rgba(94,234,212,0.2); }
.bar-today { background: rgba(94,234,212,0.25); border-color: rgba(94,234,212,0.4); }
.bar-label { font-size: 0.58rem; color: var(--text-3); font-family: var(--font-mono); text-align: center; white-space: pre; line-height: 1.3; }
.chart-empty { position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); font-size: 0.82rem; color: var(--text-3); text-align: center; }

/* Top pages */
.empty-state { padding: var(--sp-8) 0; text-align: center; color: var(--text-3); font-size: 0.875rem; }
.top-pages { display: flex; flex-direction: column; gap: var(--sp-3); }
.page-row { display: flex; align-items: center; gap: var(--sp-3); }
.page-rank { font-size: 0.72rem; color: var(--text-3); font-family: var(--font-mono); width: 24px; flex-shrink: 0; }
.page-path { font-size: 0.82rem; color: var(--text-2); font-family: var(--font-mono); min-width: 140px; flex-shrink: 0; }
.page-bar-wrap { flex: 1; height: 6px; background: var(--bg-surface); border-radius: 99px; overflow: hidden; }
.page-bar { height: 100%; background: var(--accent-dim); border-radius: 99px; transition: width 0.5s ease; }
.page-views { font-size: 0.78rem; color: var(--text-2); font-family: var(--font-mono); width: 40px; text-align: right; flex-shrink: 0; }

/* Notice */
.notice-card { display: flex; gap: var(--sp-4); align-items: flex-start; padding: var(--sp-5); background: rgba(94,234,212,0.04); border: 1px solid rgba(94,234,212,0.15); border-radius: var(--r-lg); font-size: 0.875rem; color: var(--text-2); line-height: 1.6; }
.notice-card svg { color: var(--accent); flex-shrink: 0; margin-top: 2px; }
.notice-card strong { color: var(--text-1); }

/* Resume analysis */
.card-sub { font-size: 0.82rem; color: var(--text-3); margin-top: -12px; margin-bottom: var(--sp-5); line-height: 1.5; }

.ra-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--sp-4); }

.ra-card { background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: var(--r-lg); padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-4); }
.ra-strong { border-color: rgba(52,211,153,0.25); }
.ra-moderate { border-color: rgba(251,191,36,0.2); }
.ra-weak { border-color: rgba(248,113,113,0.2); }

.ra-header { display: flex; align-items: center; gap: var(--sp-3); }
.ra-icon { width: 30px; height: 30px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--accent-dim); color: var(--accent); }
.ra-title-wrap { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ra-label { font-size: 0.88rem; font-weight: 600; color: var(--text-1); font-family: var(--font-display); }

.ra-grade-badge { font-size: 0.62rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 6px; border-radius: 99px; width: fit-content; }
.badge-strong { background: rgba(52,211,153,0.12); color: #34d399; border: 1px solid rgba(52,211,153,0.25); }
.badge-moderate { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
.badge-weak { background: rgba(248,113,113,0.1); color: #f87171; border: 1px solid rgba(248,113,113,0.2); }

.ra-score-wrap { display: flex; align-items: baseline; gap: 2px; flex-shrink: 0; }
.ra-score { font-size: 1.5rem; font-weight: 700; color: var(--text-1); font-family: var(--font-display); line-height: 1; }
.ra-score-denom { font-size: 0.7rem; color: var(--text-3); font-family: var(--font-mono); }

.ra-bar-track { height: 5px; background: var(--bg-elevated); border-radius: 99px; overflow: hidden; }
.ra-bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
.fill-strong { background: #34d399; }
.fill-moderate { background: #fbbf24; }
.fill-weak { background: #f87171; }

.ra-section { display: flex; flex-direction: column; gap: var(--sp-2); }
.ra-section-label { font-size: 0.65rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }
.ra-label-good { color: #34d399; }
.ra-label-gap { color: var(--text-3); }

.ra-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px; }
.ra-item { display: flex; align-items: flex-start; gap: var(--sp-2); font-size: 0.78rem; line-height: 1.45; color: var(--text-2); }
.ra-item svg { flex-shrink: 0; margin-top: 2px; }
.ra-item-good svg { color: #34d399; }
.ra-item-gap svg { color: var(--text-3); }

.ra-actions { display: flex; flex-wrap: wrap; gap: var(--sp-2); padding-top: var(--sp-1); border-top: 1px solid var(--border-xs); }
.ra-btn { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-family: var(--font-mono); color: var(--accent); background: var(--accent-dim); border: 1px solid rgba(94,234,212,0.2); border-radius: var(--r-md); padding: 4px 10px; text-decoration: none; transition: background 0.15s, border-color 0.15s; white-space: nowrap; }
.ra-btn:hover { background: rgba(94,234,212,0.12); border-color: rgba(94,234,212,0.35); }

.ra-all-good { display: flex; align-items: center; gap: var(--sp-2); font-size: 0.75rem; color: #34d399; font-family: var(--font-mono); padding-top: var(--sp-1); border-top: 1px solid var(--border-xs); }

/* Blog AI Analysis */
.ba-top-actions {
  display: flex;
  gap: var(--sp-3);
  flex-wrap: wrap;
  margin-bottom: var(--sp-5);
}

.ba-action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-md);
  font-size: 0.8rem;
  font-family: var(--font-mono);
  color: var(--text-2);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;
}
.ba-action-btn:hover:not(:disabled) { background: var(--accent-dim); border-color: rgba(94,234,212,0.3); color: var(--accent); }
.ba-action-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.ba-action-sm { padding: 4px var(--sp-3); font-size: 0.72rem; }

.ba-result-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-md);
  padding: var(--sp-4);
  margin-bottom: var(--sp-4);
}
.ba-result-holistic { border-color: rgba(94,234,212,0.2); background: rgba(94,234,212,0.03); }
.ba-result-label { font-size: 0.65rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); font-weight: 600; margin-bottom: var(--sp-3); }
.ba-result-body { font-size: 0.83rem; color: var(--text-2); white-space: pre-wrap; line-height: 1.65; }

.ba-posts { margin-top: var(--sp-5); }
.ba-posts-title { font-size: 0.68rem; font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); font-weight: 600; margin-bottom: var(--sp-3); }

.ba-post-row {
  border-top: 1px solid var(--border-xs);
  padding: var(--sp-3) 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-3);
}

.ba-post-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.ba-post-title { font-size: 0.85rem; color: var(--text-1); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ba-post-meta { display: flex; align-items: center; gap: var(--sp-2); }

.ba-chip { font-size: 0.6rem; font-family: var(--font-mono); padding: 2px 6px; border-radius: 99px; letter-spacing: 0.04em; text-transform: uppercase; }
.ba-chip-draft { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
.ba-chip-pub { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
.ba-date { font-size: 0.68rem; color: var(--text-3); font-family: var(--font-mono); }

.ba-post-result { width: 100%; flex-basis: 100%; margin-top: var(--sp-2); background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: var(--r-md); padding: var(--sp-4); }

.ba-dismiss { margin-top: var(--sp-3); font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-3); background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline; }
.ba-dismiss:hover { color: var(--text-2); }

.ba-error { font-size: 0.8rem; color: #f87171; font-family: var(--font-mono); margin-top: var(--sp-2); }
.ba-empty { font-size: 0.85rem; color: var(--text-3); padding: var(--sp-6) 0; text-align: center; font-style: italic; }
.ba-link { color: var(--accent); text-decoration: none; }
.ba-link:hover { text-decoration: underline; }

/* Spinner */
.ai-spin {
  display: inline-block;
  width: 11px;
  height: 11px;
  border: 2px solid rgba(94,234,212,0.25);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: ai-spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes ai-spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .chart-bars { gap: 2px; }
  .bar-label { font-size: 0.5rem; }
  .ra-grid { grid-template-columns: 1fr; }
  .ba-top-actions { flex-direction: column; }
}
</style>
