import { readBody } from 'h3'
import { saveAiConfig } from '../../utils/ai-manager'
import type { AiManagerConfig } from '../../utils/ai-manager'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ config: AiManagerConfig }>(event)
  if (!body?.config) throw createError({ statusCode: 400, statusMessage: 'config is required' })
  await saveAiConfig(body.config)
  return { ok: true }
})
