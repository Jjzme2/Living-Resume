import { readBody } from 'h3'
import { testProvider } from '../../utils/ai-manager'
import type { ProviderId } from '../../utils/ai-manager'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ providerId: ProviderId }>(event)
  if (!body?.providerId) throw createError({ statusCode: 400, statusMessage: 'providerId is required' })
  return testProvider(body.providerId)
})
