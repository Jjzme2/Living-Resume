export interface ThemeOption {
  id: string
  label: string
  desc: string
  accent: string   // preview swatch color
  bg: string       // preview bg color
}

export const THEMES: ThemeOption[] = [
  { id: 'midnight', label: 'Midnight',  desc: 'Deep blue-black, teal accent. The default.',         accent: '#5eead4', bg: '#04060f' },
  { id: 'glass',    label: 'Glass',     desc: 'Frosted dark surfaces over a void.',                  accent: '#5eead4', bg: '#010408' },
  { id: 'aero',     label: 'Aero',      desc: 'Windows Aero-inspired blue glass with gloss.',        accent: '#38bdf8', bg: '#03080f' },
  { id: 'noir',     label: 'Noir',      desc: 'Pure black with amber-gold high drama.',              accent: '#fbbf24', bg: '#000000' },
  { id: 'slate',    label: 'Slate',     desc: 'Blue-gray depths, indigo-violet accent.',             accent: '#818cf8', bg: '#080c18' },
  { id: 'dawn',     label: 'Dawn',      desc: 'Crisp light mode, airy off-white with sky blue.',    accent: '#0ea5e9', bg: '#f1f5fb' },
  { id: 'dreamer',  label: 'Dreamer',   desc: 'Ethereal violet haze — where the dream began.',      accent: '#d8b4fe', bg: '#060311' },
  { id: 'yinyang',  label: 'Yin Yang',  desc: 'Pure duality. Ink black, white accent. No color.',  accent: '#ffffff', bg: '#000000' },
]

export function useTheme() {
  const currentTheme = useState<string>('theme', () => 'midnight')

  function applyTheme(theme: string) {
    currentTheme.value = theme
    if (process.client) {
      document.documentElement.setAttribute('data-theme', theme === 'midnight' ? '' : theme)
    }
  }

  async function loadPublicTheme() {
    try {
      const { theme } = await $fetch<{ theme: string }>('/api/theme')
      applyTheme(theme)
    } catch {
      applyTheme('midnight')
    }
  }

  async function setPublicTheme(theme: string) {
    await $fetch('/api/admin/theme', { method: 'POST', body: { theme } })
    applyTheme(theme)
  }

  return { currentTheme, applyTheme, loadPublicTheme, setPublicTheme, THEMES }
}
