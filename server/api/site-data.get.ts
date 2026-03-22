import { getSiteData } from '../utils/kv'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const data = await getSiteData()
  return data
})
