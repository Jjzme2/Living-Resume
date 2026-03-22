import { readBody } from 'h3'
import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ text?: string }>(event)

  if (!body?.text?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Resume text is required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw createError({ statusCode: 422, statusMessage: 'ANTHROPIC_API_KEY not configured' })
  }

  const client = new Anthropic({ apiKey })

  const prompt = `You are a resume parser. Extract structured data from the following resume text and return ONLY valid JSON — no markdown, no code blocks, no commentary.

The JSON must match this exact schema:
{
  "person": {
    "name": "First Last",
    "fullName": "Full Legal Name",
    "initials": "FL",
    "title": "Job Title",
    "tagline": "Short personal tagline or empty string",
    "location": "City, State or empty string",
    "email": "email@example.com or empty string",
    "phone": "+1 (555) 000-0000 or empty string",
    "bio": "2-4 sentence personal statement or empty string",
    "avatarUrl": "",
    "resumePdfUrl": ""
  },
  "skills": [
    {
      "name": "Skill Name",
      "category": "Frontend | Backend | DevOps | Tools | Soft Skills",
      "level": 75
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "startDate": "Jan 2022",
      "endDate": "Dec 2023",
      "location": "City, State or Remote",
      "type": "full-time | part-time | contract | freelance",
      "highlights": ["Achievement or responsibility 1", "Achievement or responsibility 2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "graduationYear": "2021",
      "honors": "Cum Laude or omit if none"
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "What it does and why it matters",
      "tags": ["Tag1", "Tag2"],
      "url": "https://example.com or omit",
      "repo": "https://github.com/user/repo or omit",
      "featured": false
    }
  ]
}

Rules:
- For current jobs, omit the "endDate" field entirely
- skill level is an integer 1-100 (estimate based on context)
- skill category must be one of: Frontend, Backend, DevOps, Tools, Soft Skills
- experience type must be one of: full-time, part-time, contract, freelance
- dates must be in "MMM YYYY" format (e.g. "Jan 2022")
- If a field cannot be determined, use an empty string
- Return ONLY the raw JSON object, nothing else

Resume text:
${body.text}`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Strip any accidental markdown code fences
    let jsonText = content.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }

    const parsed = JSON.parse(jsonText)
    return parsed
  } catch (err) {
    console.error('[parse-resume] Error:', err)
    throw createError({
      statusCode: 422,
      statusMessage: 'Failed to parse resume. Please try again or check the input text.',
    })
  }
})
