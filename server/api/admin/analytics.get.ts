import { kvGet } from '../../utils/kv'

export default defineEventHandler(async () => {
  const today = new Date().toISOString().slice(0, 10)

  // Build last 14 days
  const days: string[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }

  // Fetch daily totals
  const dailyTotals = await Promise.all(
    days.map(async (day) => {
      const count = (await kvGet<number>(`analytics:daily:${day}`)) ?? 0
      return { date: day, views: count }
    })
  )

  // Today's top pages
  const todayIndex = (await kvGet<string[]>(`analytics:index:${today}`)) ?? []
  const pageViewsToday = await Promise.all(
    todayIndex.map(async (path) => {
      const views = (await kvGet<number>(`analytics:page:${today}:${path}`)) ?? 0
      return { path, views }
    })
  )
  const topPages = pageViewsToday.sort((a, b) => b.views - a.views).slice(0, 8)

  // All-time total
  const allTimeTotal = (await kvGet<number>('analytics:total')) ?? 0

  // Total views this week
  const weekDays = days.slice(-7)
  const weekTotal = dailyTotals.slice(-7).reduce((sum, d) => sum + d.views, 0)

  return {
    dailyTotals,
    topPages,
    allTimeTotal,
    weekTotal,
    todayTotal: dailyTotals[dailyTotals.length - 1]?.views ?? 0,
  }
})
