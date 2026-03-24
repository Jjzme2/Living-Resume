type AssistMode =
  | 'improve_bio'
  | 'improve_tagline'
  | 'generate_highlights'
  | 'improve_highlight'

export function useAiAssist() {
  const loading = ref(false)
  const result = ref<string | null>(null)
  const error = ref<string | null>(null)

  async function assist(mode: AssistMode, context: Record<string, string>) {
    loading.value = true
    result.value = null
    error.value = null
    try {
      const data = await $fetch<{ result: string }>('/api/admin/ai-assist', {
        method: 'POST',
        body: { mode, context },
      })
      result.value = data.result
    } catch (e: unknown) {
      const msg = (e as { statusMessage?: string })?.statusMessage
      error.value = msg || 'AI assist failed. Please try again.'
    } finally {
      loading.value = false
    }
  }

  function dismiss() {
    result.value = null
    error.value = null
  }

  return { loading, result, error, assist, dismiss }
}
