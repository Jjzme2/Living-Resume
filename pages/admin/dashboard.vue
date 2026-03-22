<template>
  <div class="page-wrap">
    <div class="page-header">
      <div>
        <h2 class="page-heading">Welcome back</h2>
        <p class="page-date">{{ currentDate }}</p>
      </div>
      <a href="/" target="_blank" rel="noopener" class="view-site-btn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        View Site
      </a>
    </div>

    <!-- Stats -->
    <div v-if="!loading" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="stat-value" :class="completenessColor">{{ completeness }}%</div>
        <div class="stat-label">Profile Complete</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
        </div>
        <div class="stat-value">{{ data?.experience?.length ?? 0 }}</div>
        <div class="stat-label">Experience</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
        </div>
        <div class="stat-value">{{ data?.projects?.length ?? 0 }}</div>
        <div class="stat-label">Projects</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div class="stat-value">{{ data?.skills?.length ?? 0 }}</div>
        <div class="stat-label">Skills</div>
      </div>
    </div>
    <div v-if="loading" class="loading-row">
      <div class="loading-card" v-for="i in 4" :key="i" />
    </div>

    <div class="two-col">
      <!-- Content Status -->
      <div class="section-card">
        <h3 class="section-card-title">Content Status</h3>
        <div v-if="loading" class="status-skeleton" v-for="i in 6" :key="i" />
        <div v-else class="status-list">
          <div v-for="item in contentStatus" :key="item.label" class="status-row">
            <div class="status-indicator" :class="item.ok ? 'ok' : 'empty'" />
            <span class="status-label">{{ item.label }}</span>
            <span class="status-meta">{{ item.meta }}</span>
            <NuxtLink :to="item.to" class="status-edit">Edit →</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Integration Status -->
      <div class="section-card">
        <div class="section-card-header">
          <h3 class="section-card-title">Integrations</h3>
          <NuxtLink to="/admin/tools" class="section-card-link">Details →</NuxtLink>
        </div>
        <div v-if="loadingStatus" class="status-skeleton" v-for="i in 4" :key="i" />
        <div v-else class="status-list">
          <div v-for="item in integrationStatus" :key="item.label" class="status-row">
            <div class="status-indicator" :class="item.ok ? 'ok' : 'empty'" />
            <span class="status-label">{{ item.label }}</span>
            <span class="status-meta" :class="item.ok ? 'meta-ok' : 'meta-warn'">
              {{ item.ok ? 'Connected' : 'Not configured' }}
            </span>
          </div>
        </div>

        <!-- Messages summary -->
        <div v-if="!loadingStatus" class="messages-summary">
          <div class="messages-summary-inner" :class="{ 'has-messages': messageCount > 0 }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span v-if="messageCount === 0">No contact messages yet</span>
            <span v-else>{{ messageCount }} message{{ messageCount !== 1 ? 's' : '' }}{{ unreadCount > 0 ? ` · ${unreadCount} unread` : '' }}</span>
            <NuxtLink to="/admin/messages" class="msg-link">View →</NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section-card">
      <h3 class="section-card-title" style="margin-bottom: var(--sp-4)">Quick Actions</h3>
      <div class="quick-actions">
        <NuxtLink v-for="action in quickActions" :key="action.to" :to="action.to" class="quick-action">
          <span v-html="action.icon" class="quick-action-icon" />
          {{ action.label }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

interface SiteData {
  person: Record<string, string>
  social: Record<string, string>
  skills: unknown[]
  experience: unknown[]
  education: unknown[]
  projects: unknown[]
  messageCount: number
  unreadCount: number
}

interface StatusData {
  db: boolean
  email: boolean
  ai: boolean
  github: boolean
}

const loading = ref(true)
const loadingStatus = ref(true)
const data = ref<SiteData | null>(null)
const status = ref<StatusData | null>(null)

const currentDate = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const messageCount = computed(() => data.value?.messageCount ?? 0)
const unreadCount = computed(() => data.value?.unreadCount ?? 0)

const completeness = computed(() => {
  if (!data.value) return 0
  const checks = [
    !!data.value.person?.name,
    !!data.value.person?.title,
    !!data.value.person?.bio,
    !!data.value.person?.email,
    !!data.value.person?.location,
    Object.values(data.value.social ?? {}).some(Boolean),
    (data.value.skills?.length ?? 0) > 0,
    (data.value.experience?.length ?? 0) > 0,
    (data.value.education?.length ?? 0) > 0,
    (data.value.projects?.length ?? 0) > 0,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
})

const completenessColor = computed(() => {
  if (completeness.value >= 80) return 'value-good'
  if (completeness.value >= 40) return 'value-warn'
  return 'value-low'
})

const contentStatus = computed(() => {
  const d = data.value
  return [
    {
      label: 'Profile',
      ok: !!(d?.person?.name && d?.person?.bio),
      meta: d?.person?.name || 'No name set',
      to: '/admin/profile',
    },
    {
      label: 'Social Links',
      ok: Object.values(d?.social ?? {}).some(Boolean),
      meta: `${Object.values(d?.social ?? {}).filter(Boolean).length} linked`,
      to: '/admin/social',
    },
    {
      label: 'Skills',
      ok: (d?.skills?.length ?? 0) > 0,
      meta: `${d?.skills?.length ?? 0} skills`,
      to: '/admin/skills',
    },
    {
      label: 'Experience',
      ok: (d?.experience?.length ?? 0) > 0,
      meta: `${d?.experience?.length ?? 0} entries`,
      to: '/admin/experience',
    },
    {
      label: 'Education',
      ok: (d?.education?.length ?? 0) > 0,
      meta: `${d?.education?.length ?? 0} entries`,
      to: '/admin/education',
    },
    {
      label: 'Projects',
      ok: (d?.projects?.length ?? 0) > 0,
      meta: `${d?.projects?.length ?? 0} projects`,
      to: '/admin/projects',
    },
  ]
})

const integrationStatus = computed(() => [
  { label: 'Firebase (database)', ok: status.value?.db ?? false },
  { label: 'Resend (email)', ok: status.value?.email ?? false },
  { label: 'Anthropic (AI parser)', ok: status.value?.ai ?? false },
  { label: 'GitHub (blog publishing)', ok: status.value?.github ?? false },
])

const quickActions = [
  { to: '/admin/profile', label: 'Edit Profile', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  { to: '/admin/experience', label: 'Experience', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>' },
  { to: '/admin/projects', label: 'Projects', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>' },
  { to: '/admin/skills', label: 'Skills', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
  { to: '/admin/resume', label: 'Parse Resume', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
  { to: '/admin/tools', label: 'Tools', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' },
  { to: '/admin/settings', label: 'Settings', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' },
  { to: '/admin/blog', label: 'Blog', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' },
]

onMounted(async () => {
  const [adminData, statusData] = await Promise.allSettled([
    $fetch<SiteData>('/api/admin/data'),
    $fetch<StatusData>('/api/admin/status'),
  ])

  if (adminData.status === 'fulfilled') data.value = adminData.value
  loading.value = false

  if (statusData.status === 'fulfilled') status.value = statusData.value
  loadingStatus.value = false
})
</script>

<style scoped>
.page-wrap { max-width: 900px; margin: 0 auto; }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--sp-8);
  gap: var(--sp-4);
}

.page-heading { font-size: 1.6rem; font-weight: 700; color: var(--text-1); font-family: var(--font-display); }
.page-date { font-size: 0.82rem; color: var(--text-3); font-family: var(--font-mono); margin-top: var(--sp-1); max-width: none; }

.view-site-btn {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  background: transparent;
  border: 1px solid var(--border-sm);
  border-radius: var(--r-md);
  font-size: 0.8rem;
  color: var(--text-3);
  text-decoration: none;
  font-family: var(--font-mono);
  transition: all var(--t-fast);
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: var(--sp-1);
}
.view-site-btn:hover { border-color: var(--accent); color: var(--accent); }

/* Stats */
.stats-grid, .loading-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-4);
  margin-bottom: var(--sp-6);
}

.stat-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-lg);
  padding: var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.stat-icon {
  width: 32px; height: 32px;
  background: var(--accent-dim);
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--sp-1);
}

.stat-value { font-size: 1.8rem; font-weight: 700; color: var(--text-1); font-family: var(--font-display); line-height: 1; }
.stat-label { font-size: 0.72rem; color: var(--text-3); font-family: var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase; }
.value-good { color: var(--accent); }
.value-warn { color: #f59e0b; }
.value-low { color: #ef4444; }

.loading-card { background: var(--bg-elevated); border: 1px solid var(--border-xs); border-radius: var(--r-lg); height: 120px; animation: pulse 1.5s ease-in-out infinite; }

/* Two-column layout */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-6); margin-bottom: var(--sp-6); }

/* Section cards */
.section-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-lg);
  padding: var(--sp-6);
  margin-bottom: var(--sp-6);
}
.two-col .section-card { margin-bottom: 0; }

.section-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-4); }
.section-card-title { font-size: 0.95rem; font-weight: 600; color: var(--text-1); font-family: var(--font-display); margin-bottom: var(--sp-4); }
.section-card-header .section-card-title { margin-bottom: 0; }
.section-card-link { font-size: 0.8rem; color: var(--accent); text-decoration: none; font-family: var(--font-mono); transition: opacity var(--t-fast); }
.section-card-link:hover { opacity: 0.8; }

/* Status list */
.status-list { display: flex; flex-direction: column; gap: var(--sp-1); }

.status-skeleton {
  height: 36px;
  background: var(--bg-surface);
  border-radius: var(--r-md);
  margin-bottom: var(--sp-1);
  animation: pulse 1.5s ease-in-out infinite;
}

.status-row {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--r-md);
  transition: background var(--t-fast);
}
.status-row:hover { background: var(--bg-surface); }

.status-indicator {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-indicator.ok { background: var(--accent); box-shadow: 0 0 5px var(--accent); }
.status-indicator.empty { background: var(--border-sm); }

.status-label { font-size: 0.875rem; color: var(--text-2); flex: 1; }
.status-meta { font-size: 0.75rem; color: var(--text-3); font-family: var(--font-mono); }
.meta-ok { color: var(--accent); }
.meta-warn { color: var(--text-3); }
.status-edit { font-size: 0.75rem; color: var(--accent); text-decoration: none; font-family: var(--font-mono); opacity: 0; transition: opacity var(--t-fast); }
.status-row:hover .status-edit { opacity: 1; }

/* Messages summary */
.messages-summary { margin-top: var(--sp-4); padding-top: var(--sp-4); border-top: 1px solid var(--border-xs); }
.messages-summary-inner {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.8rem;
  color: var(--text-3);
  padding: var(--sp-2) var(--sp-3);
  background: var(--bg-surface);
  border-radius: var(--r-md);
}
.messages-summary-inner.has-messages { color: var(--text-2); }
.msg-link { margin-left: auto; color: var(--accent); text-decoration: none; font-family: var(--font-mono); font-size: 0.75rem; }
.msg-link:hover { opacity: 0.8; }

/* Quick Actions */
.quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-3); }
.quick-action {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-xs);
  border-radius: var(--r-md);
  font-size: 0.82rem;
  color: var(--text-2);
  text-decoration: none;
  transition: all var(--t-fast);
}
.quick-action:hover { background: var(--accent-dim); border-color: rgba(94,234,212,0.2); color: var(--accent); }
.quick-action-icon { display: flex; align-items: center; color: var(--accent); flex-shrink: 0; }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

@media (max-width: 768px) {
  .stats-grid, .loading-row { grid-template-columns: repeat(2, 1fr); }
  .two-col { grid-template-columns: 1fr; }
  .quick-actions { grid-template-columns: repeat(2, 1fr); }
}
</style>
