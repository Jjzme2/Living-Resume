import Anthropic from '@anthropic-ai/sdk'
import { readBody, getRequestIP } from 'h3'
import { getSiteData, kvGet, kvSet } from '../utils/kv'
import { checkRateLimit } from '../utils/rateLimit'
import type { InterviewPersona } from './admin/interview-persona.get'
import { DEFAULT_PERSONA } from './admin/interview-persona.get'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

type SiteData = Awaited<ReturnType<typeof getSiteData>>

function buildSystemPrompt(data: SiteData, persona: InterviewPersona): string {
  const p = data.person
  const lines: string[] = []

  const name = p.name || 'this person'

  lines.push(
    `You are a knowledgeable assistant for ${name}'s personal portfolio website.`,
    `Your role is to answer visitors' questions about ${name} in a genuine, conversational way — like a well-prepared reference who knows them professionally and personally.`,
    `Speak about them in third person. Keep answers concise (2–4 sentences) unless depth is clearly warranted.`,
    '',
  )

  // Tone instruction from persona config
  if (persona.tone === 'professional') {
    lines.push('Tone: Maintain a polished, professional tone throughout.')
  } else if (persona.tone === 'casual') {
    lines.push('Tone: Be conversational and informal — approachable, like chatting with a peer.')
  } else {
    lines.push('Tone: Be warm, genuine, and personable while remaining professional.')
  }
  lines.push('')

  lines.push('## Identity')
  if (p.fullName) lines.push(`Full name: ${p.fullName}`)
  if (p.name) lines.push(`Goes by: ${p.name}`)
  if (p.title) lines.push(`Title: ${p.title}`)
  if (p.tagline) lines.push(`Tagline: "${p.tagline}"`)
  if (p.location) lines.push(`Location: ${p.location}`)
  lines.push('')

  if (p.bio) {
    lines.push('## Bio')
    lines.push(p.bio)
    lines.push('')
  }

  if (data.experience.length > 0) {
    lines.push('## Work Experience')
    for (const exp of data.experience) {
      const end = exp.endDate ?? 'Present'
      const location = exp.location ? `, ${exp.location}` : ''
      const type = exp.type ? ` (${exp.type})` : ''
      lines.push(`**${exp.role}** at ${exp.company} — ${exp.startDate} to ${end}${location}${type}`)
      for (const h of exp.highlights) lines.push(`  • ${h}`)
    }
    lines.push('')
  }

  if (data.education.length > 0) {
    lines.push('## Education')
    for (const ed of data.education) {
      const field = ed.field ? ` in ${ed.field}` : ''
      const year = ed.graduationYear ? ` (${ed.graduationYear})` : ''
      const honors = ed.honors ? `, ${ed.honors}` : ''
      lines.push(`${ed.degree}${field} — ${ed.institution}${year}${honors}`)
    }
    lines.push('')
  }

  if (data.skills.length > 0) {
    lines.push('## Skills')
    const byCategory: Record<string, string[]> = {}
    for (const s of data.skills) {
      if (!byCategory[s.category]) byCategory[s.category] = []
      byCategory[s.category].push(s.name)
    }
    for (const [cat, names] of Object.entries(byCategory)) {
      lines.push(`${cat}: ${names.join(', ')}`)
    }
    lines.push('')
  }

  if (data.projects.length > 0) {
    lines.push('## Projects')
    for (const proj of data.projects) {
      const tags = proj.tags.length ? ` [${proj.tags.join(', ')}]` : ''
      const featured = proj.featured ? ' ⭐' : ''
      lines.push(`**${proj.title}**${featured}: ${proj.description}${tags}`)
    }
    lines.push('')
  }

  if (data.business.name) {
    lines.push('## Business')
    lines.push(`${data.business.name}${data.business.tagline ? ` — ${data.business.tagline}` : ''}`)
    if (data.business.description) lines.push(data.business.description)
    lines.push('')
  }

  // Inject admin-configured FAQ pairs
  if (persona.faqs.length > 0) {
    lines.push('## Prepared Answers')
    lines.push('When these topics arise, use these specific answers as your primary reference:')
    for (const faq of persona.faqs) {
      lines.push(`Q: ${faq.q}`)
      lines.push(`A: ${faq.a}`)
    }
    lines.push('')
  }

  // Inject any additional custom instructions
  if (persona.customInstructions.trim()) {
    lines.push('## Additional Instructions')
    lines.push(persona.customInstructions.trim())
    lines.push('')
  }

  lines.push('## Guidelines')
  lines.push('- Be specific and honest. Avoid corporate-speak and filler phrases.')
  lines.push('- If something is not in the data above, say so naturally without making anything up.')
  lines.push(`- If asked how to reach ${name}, tell them to use the contact section on this page.`)
  lines.push('- Treat every question as a genuine interview question worth a thoughtful answer.')
  lines.push('- Never roleplay as the person directly. You are an assistant who knows them well.')

  return lines.join('\n')
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ messages?: ChatMessage[] }>(event)

  if (!Array.isArray(body?.messages) || body.messages.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Messages are required' })
  }

  // Rate limit: 20 requests per IP per minute
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const rl = await checkRateLimit(`chat:${ip}`, 20, 60 * 1000)
  if (!rl.allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please slow down.' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw createError({ statusCode: 422, statusMessage: 'Chat is not available right now' })
  }

  // Cap history to last 20 turns to control context size
  const messages = body.messages.slice(-20).map((m) => ({
    role: m.role,
    content: String(m.content).slice(0, 2000),
  }))

  const [siteData, persona] = await Promise.all([
    getSiteData(),
    kvGet<InterviewPersona>('site:interview-persona').then((p) => p ?? { ...DEFAULT_PERSONA }),
  ])

  const systemPrompt = buildSystemPrompt(siteData, persona)
  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages,
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    // Log token usage asynchronously (don't block the response)
    const { input_tokens, output_tokens } = response.usage
    const today = new Date().toISOString().slice(0, 10)
    Promise.all([
      kvGet<{ input_tokens: number; output_tokens: number; calls: number }>('chat:usage:total').then((prev) =>
        kvSet('chat:usage:total', {
          input_tokens:  (prev?.input_tokens  ?? 0) + input_tokens,
          output_tokens: (prev?.output_tokens ?? 0) + output_tokens,
          calls:         (prev?.calls         ?? 0) + 1,
        }),
      ),
      kvGet<{ input_tokens: number; output_tokens: number; calls: number }>(`chat:usage:daily:${today}`).then((prev) =>
        kvSet(`chat:usage:daily:${today}`, {
          input_tokens:  (prev?.input_tokens  ?? 0) + input_tokens,
          output_tokens: (prev?.output_tokens ?? 0) + output_tokens,
          calls:         (prev?.calls         ?? 0) + 1,
        }),
      ),
    ]).catch((err) => console.error('[chat] Usage logging error:', err))

    return { content: content.text }
  } catch (err) {
    console.error('[chat] Error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Unable to generate a response. Please try again.' })
  }
})
