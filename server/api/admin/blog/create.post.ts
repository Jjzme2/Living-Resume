import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const { filePath, content } = await readBody<{ filePath: string; content: string }>(event)

  if (!filePath || !content) {
    throw createError({ statusCode: 400, message: 'filePath and content are required.' })
  }

  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'

  if (!token || !repo) {
    throw createError({ statusCode: 503, message: 'GitHub integration is not configured. Set GITHUB_TOKEN and GITHUB_REPO env vars.' })
  }

  // Base64-encode the file content (GitHub API requirement)
  const encoded = Buffer.from(content, 'utf-8').toString('base64')

  // Check if file already exists (to get its SHA for update)
  let sha: string | undefined
  try {
    const existing = await $fetch<{ sha: string }>(
      `https://api.github.com/repos/${repo}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )
    sha = existing.sha
  } catch {
    // File doesn't exist — creating it fresh (sha stays undefined)
  }

  const body: Record<string, unknown> = {
    message: `blog: add ${filePath}`,
    content: encoded,
    branch,
  }
  if (sha) body.sha = sha // required when updating an existing file

  await $fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body,
  })

  return { ok: true, filePath }
})
