/**
 * R2 Blog Storage
 *
 * Blog posts are stored in Cloudflare R2 as markdown files:
 *   {prefix}/{category}/{slug}.md  →  /blog/{category}/{slug}
 *
 * A JSON index file ({prefix}/_index.json) is kept in sync so that
 * listing posts is a single R2 GET rather than fetching every file.
 *
 * Bucket + prefix are derived from the R2_BUCKET_NAME env var:
 *   "mybucket"          → bucket="mybucket", prefix="blog"
 *   "mybucket/uploads"  → bucket="mybucket", prefix="uploads"
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'

// ── Client factory ────────────────────────────────────────────────

function getClient(): S3Client {
  const rc = useRuntimeConfig()
  if (!rc.r2AccountId) throw new Error('R2 not configured: missing r2AccountId')
  return new S3Client({
    region: 'auto',
    endpoint: `https://${rc.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: rc.r2AccessKeyId as string,
      secretAccessKey: rc.r2SecretAccessKey as string,
    },
  })
}

function getBucketAndPrefix(): { bucket: string; prefix: string } {
  const raw = (useRuntimeConfig().r2BucketName as string) || ''
  const slash = raw.indexOf('/')
  if (slash === -1) return { bucket: raw || 'blog', prefix: 'blog' }
  return { bucket: raw.slice(0, slash), prefix: raw.slice(slash + 1) }
}

// ── Types ─────────────────────────────────────────────────────────

export interface PostMeta {
  slug: string        // "tech/my-post"
  path: string        // "/blog/tech/my-post"
  key: string         // "uploads/tech/my-post.md"
  title: string
  description: string
  date: string
  status?: string
  category?: string
  author?: string
  lastUpdated?: string
  tags?: string[]
  image?: string
  canonical?: string
}

export interface BlogPost extends PostMeta {
  body: string        // raw markdown body (no frontmatter)
}

// ── Frontmatter parser ────────────────────────────────────────────

function parseFrontmatter(raw: string): { meta: Omit<PostMeta, 'slug' | 'path' | 'key'>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { meta: { title: '', description: '', date: '' }, body: raw.trim() }

  const fm: Record<string, unknown> = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const val = line.slice(colon + 1).trim()

    if (key === 'tags') {
      fm[key] = val
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((t) => t.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    } else {
      fm[key] = val.replace(/^["']|["']$/g, '')
    }
  }

  return {
    meta: fm as unknown as Omit<PostMeta, 'slug' | 'path' | 'key'>,
    body: match[2].trim(),
  }
}

export function buildMarkdown(meta: Omit<PostMeta, 'slug' | 'path' | 'key'>, body: string): string {
  const lines = ['---']
  lines.push(`title: "${meta.title}"`)
  lines.push(`description: "${meta.description}"`)
  lines.push(`date: "${meta.date}"`)
  if (meta.status && meta.status !== 'published') lines.push(`status: "${meta.status}"`)
  if (meta.category) lines.push(`category: "${meta.category}"`)
  if (meta.author) lines.push(`author: "${meta.author}"`)
  if (meta.lastUpdated) lines.push(`lastUpdated: "${meta.lastUpdated}"`)
  if (meta.tags?.length) lines.push(`tags: [${meta.tags.map((t) => `"${t}"`).join(', ')}]`)
  if (meta.image) lines.push(`image: "${meta.image}"`)
  if (meta.canonical) lines.push(`canonical: "${meta.canonical}"`)
  lines.push('---', '', body)
  return lines.join('\n')
}

// ── Index helpers ─────────────────────────────────────────────────

async function readIndex(client: S3Client, bucket: string, prefix: string): Promise<PostMeta[]> {
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: `${prefix}/_index.json` }))
    const text = await res.Body?.transformToString('utf-8')
    return text ? (JSON.parse(text) as PostMeta[]) : []
  } catch {
    return []
  }
}

async function writeIndex(client: S3Client, bucket: string, prefix: string, index: PostMeta[]): Promise<void> {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: `${prefix}/_index.json`,
    Body: JSON.stringify(index, null, 2),
    ContentType: 'application/json',
  }))
}

// ── Public API ────────────────────────────────────────────────────

/** List all posts. Pass `includeDrafts: true` for the admin view. */
export async function r2ListPosts(includeDrafts = false): Promise<PostMeta[]> {
  const client = getClient()
  const { bucket, prefix } = getBucketAndPrefix()
  const index = await readIndex(client, bucket, prefix)
  return includeDrafts
    ? index.sort((a, b) => (b.date > a.date ? 1 : -1))
    : index.filter((p) => p.status !== 'draft').sort((a, b) => (b.date > a.date ? 1 : -1))
}

/** Fetch a single post (metadata + body) by slug, e.g. "tech/my-post". */
export async function r2GetPost(slug: string): Promise<BlogPost | null> {
  const client = getClient()
  const { bucket, prefix } = getBucketAndPrefix()
  const key = `${prefix}/${slug}.md`

  try {
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    const raw = await res.Body?.transformToString('utf-8')
    if (!raw) return null

    const { meta, body } = parseFrontmatter(raw)
    return { ...meta, slug, path: `/blog/${slug}`, key, body }
  } catch {
    return null
  }
}

/**
 * Save (create or update) a post. Automatically updates the index.
 * @param slug  e.g. "tech/my-post"
 * @param meta  frontmatter fields
 * @param body  markdown body text (no frontmatter)
 */
export async function r2SavePost(
  slug: string,
  meta: Omit<PostMeta, 'slug' | 'path' | 'key'>,
  body: string,
): Promise<PostMeta> {
  const client = getClient()
  const { bucket, prefix } = getBucketAndPrefix()
  const key = `${prefix}/${slug}.md`

  // Write the markdown file
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buildMarkdown(meta, body),
    ContentType: 'text/markdown; charset=utf-8',
  }))

  // Update index
  const index = await readIndex(client, bucket, prefix)
  const entry: PostMeta = { ...meta, slug, path: `/blog/${slug}`, key }
  const existing = index.findIndex((p) => p.slug === slug)
  if (existing >= 0) index[existing] = entry
  else index.push(entry)
  await writeIndex(client, bucket, prefix, index)

  return entry
}

/** Delete a post and remove it from the index. */
export async function r2DeletePost(slug: string): Promise<void> {
  const client = getClient()
  const { bucket, prefix } = getBucketAndPrefix()
  const key = `${prefix}/${slug}.md`

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))

  const index = await readIndex(client, bucket, prefix)
  const updated = index.filter((p) => p.slug !== slug)
  await writeIndex(client, bucket, prefix, updated)
}

/**
 * Rebuild the index by scanning all .md files in the bucket.
 * Useful for recovery if the index gets out of sync.
 */
export async function r2RebuildIndex(): Promise<PostMeta[]> {
  const client = getClient()
  const { bucket, prefix } = getBucketAndPrefix()

  const list = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `${prefix}/` }))
  const posts: PostMeta[] = []

  for (const obj of list.Contents ?? []) {
    if (!obj.Key?.endsWith('.md') || obj.Key.includes('/_')) continue
    try {
      const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: obj.Key }))
      const raw = await res.Body?.transformToString('utf-8')
      if (!raw) continue
      const { meta } = parseFrontmatter(raw)
      const slug = obj.Key.slice(prefix.length + 1).replace(/\.md$/, '')
      posts.push({ ...meta, slug, path: `/blog/${slug}`, key: obj.Key })
    } catch {
      // skip
    }
  }

  await writeIndex(client, bucket, prefix, posts)
  return posts
}
