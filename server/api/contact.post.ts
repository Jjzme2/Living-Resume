import { readBody } from 'h3'
import { kvGet, kvSet } from '../utils/kv'
import { Resend } from 'resend'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  date: string
  read: boolean
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name?: string
    email?: string
    subject?: string
    message?: string
    honeypot?: string
  }>(event)

  // Honeypot — silent success for bots
  if (body?.honeypot) {
    return { ok: true }
  }

  // Validate required fields
  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }
  if (!body?.email?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }
  if (!body?.message?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Message is required' })
  }

  // Build message object
  const id = Date.now().toString(36)
  const msg: ContactMessage = {
    id,
    name: body.name.trim(),
    email: body.email.trim(),
    subject: body.subject?.trim() || undefined,
    message: body.message.trim(),
    date: new Date().toISOString(),
    read: false,
  }

  // Store in KV
  await kvSet(`msg:${id}`, msg)

  // Update index (prepend newest)
  const index = (await kvGet<string[]>('msg:index')) ?? []
  index.unshift(id)
  await kvSet('msg:index', index)

  // Send email via Resend
  try {
    const apiKey = process.env.RESEND_API_KEY
    const toEmail = process.env.CONTACT_TO_EMAIL

    if (apiKey && toEmail) {
      const resend = new Resend(apiKey)
      await resend.emails.send({
        from: 'noreply@jjzettler.com',
        to: toEmail,
        subject: `New message from ${msg.name}`,
        html: `
          <h2>New Contact Message</h2>
          <table cellpadding="8" style="border-collapse:collapse; font-family:sans-serif;">
            <tr><td><strong>Name:</strong></td><td>${msg.name}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${msg.email}</td></tr>
            ${msg.subject ? `<tr><td><strong>Subject:</strong></td><td>${msg.subject}</td></tr>` : ''}
            <tr><td><strong>Date:</strong></td><td>${new Date(msg.date).toLocaleString()}</td></tr>
          </table>
          <hr />
          <h3>Message:</h3>
          <p style="white-space:pre-wrap; font-family:sans-serif;">${msg.message}</p>
        `,
      })
    }
  } catch (emailErr) {
    // Email failure does not block the response — message is stored in KV
    console.error('[contact] Email send failed:', emailErr)
  }

  return { ok: true }
})
