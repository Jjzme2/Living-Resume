import { Resend } from 'resend'
import { kvGet } from '../../utils/kv'

export default defineEventHandler(async (event) => {
  // Protect with CRON_SECRET via Authorization header (Vercel injects this automatically).
  // Never pass secrets as URL query params — they end up in logs and source control.
  const authHeader = getHeader(event, 'authorization')
  const expected = process.env.CRON_SECRET
  if (!expected || authHeader !== `Bearer ${expected}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.CONTACT_TO_EMAIL
  if (!apiKey || !toEmail) {
    return { ok: false, reason: 'Email not configured' }
  }

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  // Fetch analytics for yesterday and last 7 days
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }

  const [
    yesterdayViews,
    todayViews,
    allTimeTotal,
    msgIndex,
    yesterdayIndex,
  ] = await Promise.all([
    kvGet<number>(`analytics:daily:${yesterday}`),
    kvGet<number>(`analytics:daily:${today}`),
    kvGet<number>('analytics:total'),
    kvGet<string[]>('msg:index'),
    kvGet<string[]>(`analytics:index:${yesterday}`),
  ])

  // Week total
  const weekTotals = await Promise.all(days.map(d => kvGet<number>(`analytics:daily:${d}`)))
  const weekTotal = weekTotals.reduce((s, v) => s + (v ?? 0), 0)

  // Top pages yesterday
  const yesterdayPaths = yesterdayIndex ?? []
  const yesterdayPageViews = await Promise.all(
    yesterdayPaths.map(async (path) => {
      const views = (await kvGet<number>(`analytics:page:${yesterday}:${path}`)) ?? 0
      return { path, views }
    })
  )
  const topPages = yesterdayPageViews.sort((a, b) => b.views - a.views).slice(0, 5)

  // Messages
  const totalMessages = msgIndex?.length ?? 0
  const unreadMessages = await (async () => {
    if (!msgIndex?.length) return 0
    const msgs = await Promise.all(
      msgIndex.slice(0, 20).map(id => kvGet<{ read: boolean }>(`msg:${id}`))
    )
    return msgs.filter(m => m && !m.read).length
  })()

  const dateLabel = new Date(yesterday + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const topPagesHtml = topPages.length
    ? topPages.map(p => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #1e293b; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #94a3b8;">${p.path}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #1e293b; text-align: right; font-weight: 600; color: #5eead4; font-size: 13px;">${p.views}</td>
        </tr>`).join('')
    : '<tr><td colspan="2" style="padding: 16px 12px; color: #475569; text-align: center; font-size: 13px;">No page views recorded yesterday</td></tr>'

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#04060f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:580px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="margin-bottom:32px;">
      <div style="display:inline-block;background:rgba(94,234,212,0.1);border:1px solid rgba(94,234,212,0.2);border-radius:6px;padding:4px 12px;margin-bottom:16px;">
        <span style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5eead4;">Daily Digest</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#f1f5f9;line-height:1.2;">Portfolio Report</h1>
      <p style="margin:0;font-size:14px;color:#64748b;">${dateLabel}</p>
    </div>

    <!-- Key stats -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:28px;">
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:700;color:#f1f5f9;line-height:1;">${yesterdayViews ?? 0}</div>
        <div style="font-size:11px;color:#64748b;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-top:6px;">Yesterday</div>
      </div>
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:700;color:#5eead4;line-height:1;">${weekTotal}</div>
        <div style="font-size:11px;color:#64748b;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-top:6px;">This Week</div>
      </div>
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:700;color:#f1f5f9;line-height:1;">${allTimeTotal ?? 0}</div>
        <div style="font-size:11px;color:#64748b;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-top:6px;">All Time</div>
      </div>
    </div>

    <!-- Top pages -->
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;margin-bottom:20px;overflow:hidden;">
      <div style="padding:14px 16px;border-bottom:1px solid #1e293b;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:13px;font-weight:600;color:#f1f5f9;">Top Pages Yesterday</span>
        <span style="font-size:11px;color:#475569;font-family:'JetBrains Mono',monospace;">views</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>${topPagesHtml}</tbody>
      </table>
    </div>

    <!-- Messages -->
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:16px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="font-size:13px;font-weight:600;color:#f1f5f9;margin-bottom:4px;">Contact Messages</div>
        <div style="font-size:12px;color:#64748b;">${totalMessages} total · ${unreadMessages} unread</div>
      </div>
      <div style="font-size:24px;font-weight:700;color:${unreadMessages > 0 ? '#5eead4' : '#475569'};">${unreadMessages}</div>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1e293b;padding-top:20px;text-align:center;">
      <p style="font-size:11px;color:#334155;font-family:'JetBrains Mono',monospace;margin:0;">
        jjzettler.com · Daily digest · Sent at 11:00 PM
      </p>
    </div>

  </div>
</body>
</html>`

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: 'digest@jjzettler.com',
    to: toEmail,
    subject: `Portfolio Digest — ${yesterdayViews ?? 0} views yesterday`,
    html,
  })

  return { ok: true, sent: toEmail }
})
