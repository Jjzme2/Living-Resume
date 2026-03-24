import { readBody } from 'h3'
import { fetchModels } from '@ilytat/ai-manager'
import type { ProviderId } from '@ilytat/ai-manager'
import { getAiConfig } from '../../utils/ai-manager'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ providerId: ProviderId }>(event)
  if (!body?.providerId) throw createError({ statusCode: 400, statusMessage: 'providerId is required' })

  const config = await getAiConfig()
  const provider = config.providers.find((p) => p.id === body.providerId)
  if (!provider) throw createError({ statusCode: 404, statusMessage: 'Provider not found in config' })

  try {
    const models = await fetchModels(body.providerId, provider)
    return { models }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    throw createError({ statusCode: 422, statusMessage: `Could not fetch models: ${msg}` })
  }
})
