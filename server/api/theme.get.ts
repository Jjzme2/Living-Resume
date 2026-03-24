/** Public endpoint — returns the current public theme(s) for SSR. */
import { kvGet } from '../utils/kv'
import { siteSettings } from '~/config/site'

export default defineEventHandler(async () => {
  const stored  = await kvGet<{ theme?: string; themeAlt?: string }>('site:settings')
  const fromKV  = !!stored?.theme   // false when Firebase is down or nothing was ever saved
  const primary = stored?.theme    ?? siteSettings.theme ?? 'midnight'
  const alt     = stored?.themeAlt ?? primary
  return { theme: primary, themeAlt: alt, fromKV }
})
