import { kvGet } from '../../utils/kv'

export interface InterviewPersona {
  tone: 'professional' | 'warm' | 'casual'
  customInstructions: string
  faqs: Array<{ q: string; a: string }>
}

export const DEFAULT_PERSONA: InterviewPersona = {
  tone: 'warm',
  customInstructions: '',
  faqs: [],
}

export default defineEventHandler(async () => {
  const stored = await kvGet<InterviewPersona>('site:interview-persona')
  return stored ?? { ...DEFAULT_PERSONA }
})
