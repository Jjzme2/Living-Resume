# Security Action Items

Things that require manual action in Vercel / external services.
Check these off as you complete them.

---

## 🔴 Critical — Do These Now

### 1. Rotate CRON_SECRET
The old cron secret was exposed in `vercel.json` (commit `e7e82f1`) and is now burned.

**Steps:**
1. Generate a new secret: `npm run generate:32-char-string`
2. Go to **Vercel → Project → Settings → Environment Variables**
3. Update `CRON_SECRET` with the new value
4. Redeploy

> The endpoint now validates via `Authorization: Bearer` header (not a URL param),
> so no code changes are needed — just the new env var value.

---

### 2. Verify NUXT_JWT_SECRET is set in Vercel
The hardcoded fallback secret was removed. If this env var is missing in production,
the admin login will return a 500 error.

**Steps:**
1. Go to **Vercel → Project → Settings → Environment Variables**
2. Confirm `NUXT_JWT_SECRET` is set to a strong random value
3. If missing: `npm run generate:32-char-string` → paste the result as the value

---

## 🟡 Medium — Worth Addressing Soon

### 3. Add login rate limiting
The `/api/auth/login` endpoint has no brute-force protection. An attacker who can
reach it could try passwords in bulk.

**Options:**
- Add a Vercel Edge Middleware that rate-limits `/api/auth/login` by IP
- Or add a KV-backed attempt counter (lock out after N failures per IP per window)

---

### 4. Add rate limiting to the public chat endpoint
`/api/chat` is public and calls the Anthropic API on every request. A script could
abuse it to run up API costs.

**Options:**
- Vercel Edge Middleware rate-limiting `/api/chat` by IP
- Or add a short-lived session token (issued on page load, validated on chat requests)

---

## 🔵 Info — Low Priority / By Design

### 5. Sliding JWT has no absolute expiration
The admin cookie auto-renews every time you use the admin panel. A stolen/leaked
session cookie stays valid indefinitely until you rotate `NUXT_JWT_SECRET`.

**If a device is ever lost or compromised:** rotate `NUXT_JWT_SECRET` in Vercel
env vars and redeploy — this immediately invalidates all active sessions.

---

*Last updated: 2026-03-22*
