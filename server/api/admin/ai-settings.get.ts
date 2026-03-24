import { getAiConfig, getEnvKeyStatus, PROVIDER_META } from '../../utils/ai-manager'

export default defineEventHandler(async () => {
  const [config, envKeys] = await Promise.all([
    getAiConfig(),
    Promise.resolve(getEnvKeyStatus()),
  ])

  // Strip env-overlaid keys from the response — the UI should only
  // show/edit keys the user explicitly saved, not env var values.
  const safeConfig = {
    ...config,
    providers: config.providers.map((p) => ({
      ...p,
      apiKey: envKeys[p.id] && !p.apiKey ? '' : p.apiKey,
    })),
  }

  return { config: safeConfig, meta: PROVIDER_META, envKeys }
})
