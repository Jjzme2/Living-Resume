import { readBody } from 'h3'
import { aiGenerate } from '../../utils/ai-manager'

type AssistMode =
  | 'improve_bio'
  | 'improve_tagline'
  | 'generate_highlights'
  | 'improve_highlight'
  | 'polish_blog'
  | 'review_blog'
  | 'analyze_blog'
  | 'analyze_blog_group'
  | 'analyze_resume_holistic'

interface AssistRequest {
  mode: AssistMode
  context: Record<string, string>
}

function buildPrompt(mode: AssistMode, ctx: Record<string, string>): string {
  const name = ctx.name || 'the candidate'
  const title = ctx.title || ''

  if (mode === 'improve_bio') {
    return `You are a professional resume writer helping ${name} craft a strong portfolio bio.

Current bio: ${ctx.current || '(empty — write from scratch)'}
Title: ${title}
Experience summary: ${ctx.experienceSummary || 'not provided'}
Key skills: ${ctx.skills || 'not provided'}

Write a compelling 2–4 sentence professional bio in first person. Focus on their strengths and unique value. Be specific, not generic. Do not use hollow phrases like "passionate", "results-driven", or "dynamic". Return only the bio text with no quotes or extra commentary.`
  }

  if (mode === 'improve_tagline') {
    return `You are a professional resume writer helping ${name} craft a sharp one-line tagline for their portfolio.

Current tagline: ${ctx.current || '(empty — write from scratch)'}
Title: ${title}
Bio: ${ctx.bio || 'not provided'}

Write a single punchy tagline (max 12 words) that captures their professional identity. It should feel confident and specific, not generic. Return only the tagline text with no quotes or extra commentary.`
  }

  if (mode === 'generate_highlights') {
    return `You are a professional resume writer. Generate strong bullet-point highlights for a work experience entry.

Role: ${ctx.role || 'unknown role'}
Company: ${ctx.company || 'unknown company'}
Dates: ${ctx.startDate || ''}${ctx.endDate ? ` – ${ctx.endDate}` : ' – Present'}
Existing highlights (to improve or expand on): ${ctx.existing || '(none yet)'}

Write 3–5 concise, impactful bullet points describing responsibilities and accomplishments. Use strong action verbs. Be specific to the role. Each bullet on its own line, no dashes or bullet symbols. Return only the bullet lines.`
  }

  if (mode === 'improve_highlight') {
    return `You are a professional resume writer. Improve this work experience bullet point.

Original: ${ctx.current || '(empty)'}
Role: ${ctx.role || ''}
Company: ${ctx.company || ''}

Rewrite it with a strong action verb, specific details, and a measurable outcome where possible. Keep it to one sentence. Return only the improved bullet text with no quotes or extra commentary.`
  }

  if (mode === 'polish_blog') {
    return `You are a professional editor. Polish the following blog post so it is grammatically correct, clearly written, and stays tightly focused on its main point. Preserve the author's voice and all factual content — fix wording and flow, do not change the topic or add new ideas.

Title: ${ctx.title || '(untitled)'}
Description: ${ctx.description || ''}

Content:
${ctx.content || '(empty)'}

Return only the polished markdown content (no frontmatter, no commentary). Preserve all markdown formatting (headings, lists, code blocks, etc.).`
  }

  if (mode === 'review_blog') {
    return `You are a professional editor reviewing a blog post. Give constructive, specific feedback covering:
1. Grammar and spelling issues (list any found, or say "none found")
2. Clarity — places where the writing is unclear or verbose
3. Focus — does the post stay on-point? Where does it drift?
4. Suggestions to strengthen the opening and closing

Title: ${ctx.title || '(untitled)'}
Description: ${ctx.description || ''}

Content:
${ctx.content || '(empty)'}

Format your response as plain text with clear section headers. Be direct and specific — point to exact phrases or sections. Keep the review under 400 words.`
  }

  if (mode === 'analyze_blog') {
    return `You are evaluating a single blog post for quality and effectiveness. Score and comment on these dimensions (each 0–10):

1. Grammar & Mechanics — spelling, grammar, punctuation
2. Clarity — is it easy to understand?
3. Focus — does it stay on the main point?
4. SEO Potential — does the title/description/content use meaningful keywords?
5. Reader Value — will it be useful or interesting to the intended audience?

Post title: ${ctx.title || '(untitled)'}
Description: ${ctx.description || '(none)'}
Word count: ${ctx.wordCount || 'unknown'}
Tags: ${ctx.tags || 'none'}
Excerpt (first 600 chars): ${ctx.excerpt || '(none)'}

Respond with each dimension as "Name: X/10 — one-sentence comment", then a 1–2 sentence overall summary. Keep it under 250 words total.`
  }

  if (mode === 'analyze_blog_group') {
    return `You are evaluating a set of blog posts as a collection. Assess:
1. Consistency of tone and voice across posts
2. Topic coverage — are posts well-distributed or clustered on one subject?
3. Posting frequency / recency signal (from dates)
4. Overall brand impression for a professional portfolio

Posts:
${ctx.posts || '(none)'}

Give 3–5 specific observations and 2–3 actionable suggestions. Keep it under 350 words.`
  }

  if (mode === 'analyze_resume_holistic') {
    return `You are evaluating a professional portfolio as a whole — resume + blog — for cohesion and impact.

Resume summary:
- Name: ${ctx.name || 'unknown'}
- Title: ${ctx.title || 'unknown'}
- Bio: ${ctx.bio || '(none)'}
- Skills: ${ctx.skills || '(none)'}
- Experience: ${ctx.experience || '(none)'}
- Projects: ${ctx.projects || '(none)'}

Blog summary (titles + dates):
${ctx.blogSummary || '(no posts)'}

Evaluate:
1. Does the blog content reinforce the resume's claimed expertise?
2. Are there gaps between what the resume claims and what the blog shows?
3. What is the strongest overall impression?
4. Top 3 things to improve for a stronger, more cohesive portfolio.

Keep it under 400 words. Be specific, not generic.`
  }

  throw new Error(`Unknown assist mode: ${mode}`)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AssistRequest>(event)

  if (!body?.mode || !body?.context) {
    throw createError({ statusCode: 400, statusMessage: 'mode and context are required' })
  }

  let prompt: string
  try {
    prompt = buildPrompt(body.mode, body.context)
  } catch {
    throw createError({ statusCode: 400, statusMessage: `Unknown assist mode: ${body.mode}` })
  }

  try {
    const result = await aiGenerate(prompt)
    return { result }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'AI request failed'
    console.error('[ai-assist]', msg)
    throw createError({ statusCode: 500, statusMessage: msg })
  }
})
