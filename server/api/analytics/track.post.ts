import { readBody } from 'h3'
import { kvGet, kvSet } from '../../utils/kv'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ path?: string; referrer?: string }>(event)
  if (!body?.path || typeof body.path !== 'string') return { ok: true }

  const path = body.path.slice(0, 200) // sanitize length
  const today = new Date().toISOString().slice(0, 10)

  // Increment total daily views
  const dailyKey = `analytics:daily:${today}`
  const daily = (await kvGet<number>(dailyKey)) ?? 0
  await kvSet(dailyKey, daily + 1)

  // Increment per-page views
  const pageKey = `analytics:page:${today}:${path}`
  const pageViews = (await kvGet<number>(pageKey)) ?? 0
  await kvSet(pageKey, pageViews + 1)

  // Track all-time total
  const totalKey = 'analytics:total'
  const total = (await kvGet<number>(totalKey)) ?? 0
  await kvSet(totalKey, total + 1)

  // Track seen paths for this day (for top-pages query)
  const indexKey = `analytics:index:${today}`
  const index = (await kvGet<string[]>(indexKey)) ?? []
  if (!index.includes(path)) {
    index.push(path)
    await kvSet(indexKey, index)
  }

  return { ok: true }
})
