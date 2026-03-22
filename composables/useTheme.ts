export interface ThemeOption {
  id: string
  label: string
  desc: string
  accent: string   // preview swatch color
  bg: string       // preview bg color
}

export const THEMES: ThemeOption[] = [
  { id: 'midnight', label: 'Midnight',  desc: 'Deep cosmos. Bioluminescent teal in the void.',            accent: '#5eead4', bg: '#030610' },
  { id: 'glass',    label: 'Glass',     desc: 'Pure glassmorphism. Iridescent frost over living nebula.',  accent: '#a5f3fc', bg: '#02030c' },
  { id: 'aero',     label: 'Aero',      desc: 'Liquid glass. Blur so deep the world dissolves.',           accent: '#7dd3fc', bg: '#020810' },
  { id: 'noir',     label: 'Noir',      desc: 'Cinematic. Amber smoldering in obsidian black.',            accent: '#fbbf24', bg: '#000000' },
  { id: 'slate',    label: 'Slate',     desc: 'Crystal depths. Sapphire-indigo to fuchsia spectrum.',      accent: '#a5b4fc', bg: '#06091a' },
  { id: 'dawn',     label: 'Dawn',      desc: 'Warm sunrise. First light on parchment — amber and rose.',  accent: '#e8651a', bg: '#fef8f0' },
  { id: 'dreamer',  label: 'Dreamer',   desc: 'Cosmic nebula. Woke inside the Crab Nebula. Alive.',        accent: '#e0aaff', bg: '#03010e' },
  { id: 'yinyang',  label: 'Yin Yang',  desc: 'Light above, void below. Balance in every surface.',        accent: '#ffffff', bg: '#000000' },
]

const CACHE_KEY = 'lr-public-themes'

function _saveCache(v: { primary: string; alt: string }) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(v)) } catch { /* ignore */ }
}

function _readCached(): { primary: string; alt: string } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const v = JSON.parse(raw)
    if (v?.primary && v?.alt) return v
  } catch { /* ignore */ }
  return null
}

export function useTheme() {
  const currentTheme  = useState<string>('theme', () => 'midnight')
  const publicThemes  = useState<{ primary: string; alt: string }>('public-themes', () => ({ primary: 'midnight', alt: 'midnight' }))
  const themesLoaded  = useState<boolean>('themes-loaded', () => false)

  const hasAltTheme = computed(() => publicThemes.value.primary !== publicThemes.value.alt)

  function applyTheme(theme: string) {
    currentTheme.value = theme
    if (process.client) {
      document.documentElement.setAttribute('data-theme', theme === 'midnight' ? '' : theme)
    }
  }

  async function loadPublicTheme() {
    // Skip re-fetch if themes were already loaded this session
    // (e.g., admin saved new themes, or a previous layout already fetched them)
    if (themesLoaded.value) {
      // Re-apply in case the DOM attribute was lost during a layout swap
      applyTheme(currentTheme.value)
      return
    }

    // Apply localStorage-cached themes immediately so there's no flash on hard reload
    if (process.client) {
      const cached = _readCached()
      if (cached) {
        publicThemes.value = cached
        const pref = localStorage.getItem('lr-theme-pref')
        applyTheme(pref === 'alt' && cached.alt !== cached.primary ? cached.alt : cached.primary)
      }
    }

    try {
      const data = await $fetch<{ theme: string; themeAlt?: string; fromKV?: boolean }>('/api/theme')
      themesLoaded.value = true

      if (process.client) {
        const cached = _readCached()
        // Only let the server override localStorage if it has a real KV-stored value.
        // When Firebase is down, fromKV=false and server returns the config default —
        // in that case keep the cached admin choice instead of reverting.
        if (data.fromKV || !cached) {
          const primary = data.theme ?? 'midnight'
          const alt     = data.themeAlt ?? primary
          publicThemes.value = { primary, alt }
          _saveCache({ primary, alt })
          const pref = localStorage.getItem('lr-theme-pref')
          applyTheme(pref === 'alt' && alt !== primary ? alt : primary)
        }
        // else: cached value was already applied above — nothing more to do
      } else {
        const primary = data.theme ?? 'midnight'
        const alt     = data.themeAlt ?? primary
        publicThemes.value = { primary, alt }
        applyTheme(primary)
      }
    } catch {
      themesLoaded.value = true   // don't retry on error
      applyTheme(currentTheme.value || 'midnight')
    }
  }

  function togglePublicTheme() {
    if (!hasAltTheme.value) return
    const { primary, alt } = publicThemes.value
    const next = currentTheme.value === alt ? primary : alt
    applyTheme(next)
    if (process.client) {
      localStorage.setItem('lr-theme-pref', next === alt ? 'alt' : 'primary')
    }
  }

  async function setPublicThemes(theme: string, themeAlt: string) {
    await $fetch('/api/admin/theme', { method: 'POST', body: { theme, themeAlt } })
    publicThemes.value = { primary: theme, alt: themeAlt }
    themesLoaded.value = true   // mark loaded so home page won't overwrite on next nav
    if (process.client) _saveCache({ primary: theme, alt: themeAlt })
    applyTheme(theme)
  }

  /** Backwards-compatible single-theme setter. */
  async function setPublicTheme(theme: string) {
    await setPublicThemes(theme, publicThemes.value.alt)
  }

  return {
    currentTheme,
    publicThemes,
    hasAltTheme,
    themesLoaded,
    applyTheme,
    loadPublicTheme,
    setPublicTheme,
    setPublicThemes,
    togglePublicTheme,
    THEMES,
  }
}
