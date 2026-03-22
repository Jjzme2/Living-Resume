import Anthropic from '@anthropic-ai/sdk'
import { readBody } from 'h3'
import { getSiteData } from '../utils/kv'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

type SiteData = Awaited<ReturnType<typeof getSiteData>>

function buildSystemPrompt(data: SiteData): string {
  const p = data.person
  const lines: string[] = []

  const name = p.name || 'this person'

  lines.push(
    `You are a knowledgeable assistant for ${name}'s personal portfolio website.`,
    `Your role is to answer visitors' questions about ${name} in a genuine, conversational way — like a well-prepared reference who knows them professionally and personally.`,
    `Speak about them in third person. Keep answers concise (2–4 sentences) unless depth is clearly warranted.`,
    '',
  )

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

  lines.push('## Guidelines')
  lines.push('- Be warm, specific, and honest. Avoid corporate-speak and filler phrases.')
  lines.push('- If something is not in the data above, say so naturally without making anything up.')
  lines.push(`- If asked how to reach ${name}, tell them to use the contact section on this page.`)
  lines.push('- This is a portfolio site meant to give a feel for who this person is — treat every question as a genuine interview question worth a thoughtful answer.')
  lines.push('- Never roleplay as the person directly (no "I am Jj"). You are an assistant who knows them well.')

  return lines.join('\n')
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ messages?: ChatMessage[] }>(event)

  if (!Array.isArray(body?.messages) || body.messages.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Messages are required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw createError({ statusCode: 422, statusMessage: 'Chat is not available right now' })
  }

  // Cap history to last 20 turns to control context size
  const messages = body.messages.slice(-20).map((m) => ({
    role: m.role,
    content: String(m.content).slice(0, 2000), // cap individual message length
  }))

  const siteData = await getSiteData()
  const systemPrompt = buildSystemPrompt(siteData)
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

    return { content: content.text }
  } catch (err) {
    console.error('[chat] Error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Unable to generate a response. Please try again.' })
  }
})
