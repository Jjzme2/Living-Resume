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

const loading = ref(true)
const data = ref<AnalyticsData | null>(null)
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

onMounted(async () => {
  try {
    data.value = await $fetch<AnalyticsData>('/api/admin/analytics')
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

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .chart-bars { gap: 2px; }
  .bar-label { font-size: 0.5rem; }
}
</style>
