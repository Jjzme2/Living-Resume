/** Public endpoint — returns the current public theme for SSR. */
import { kvGet } from '../utils/kv'
import { siteSettings } from '~/config/site'

export default defineEventHandler(async () => {
  const stored = await kvGet<{ theme?: string }>('site:settings')
  return { theme: stored?.theme ?? siteSettings.theme ?? 'midnight' }
})
