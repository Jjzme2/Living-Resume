<template>
  <div class="login-shell">
    <div class="login-glow" aria-hidden="true" />

    <div class="login-box">
      <div class="login-brand">
        <div class="login-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 12h6M9 15h4" />
          </svg>
        </div>
        <div>
          <p class="login-title">Admin Panel</p>
          <p class="login-sub">Portfolio Manager</p>
        </div>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="field-group">
          <label class="field-label" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="field-input"
            placeholder="Enter admin password"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="error" class="login-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          <span v-if="loading" class="btn-spinner" />
          <span>{{ loading ? 'Signing in…' : 'Sign In' }}</span>
        </button>
      </form>

      <div class="login-back">
        <NuxtLink to="/" class="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to site
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'admin' })

const router = useRouter()
const authState = useState<boolean | null>('admin-auth')

const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { password: password.value },
    })
    authState.value = true
    router.push('/admin/dashboard')
  } catch (err: unknown) {
    const e = err as { statusCode?: number }
    if (e?.statusCode === 401) {
      error.value = 'Incorrect password. Please try again.'
    } else {
      error.value = 'An error occurred. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-shell {
  min-height: 100vh;
  background: var(--bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
  width: 600px;
  height: 600px;
  background: radial-gradient(ellipse at center, rgba(94, 234, 212, 0.07) 0%, transparent 70%);
  pointer-events: none;
}

.login-box {
  width: 100%;
  max-width: 380px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-lg);
  padding: var(--sp-8);
  position: relative;
  z-index: 1;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  margin-bottom: var(--sp-8);
  padding-bottom: var(--sp-6);
  border-bottom: 1px solid var(--border-xs);
}

.login-logo {
  width: 52px;
  height: 52px;
  background: var(--accent-dim);
  border-radius: var(--r-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.login-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-1);
  font-family: var(--font-display);
  line-height: 1.3;
  max-width: none;
}

.login-sub {
  font-size: 0.75rem;
  color: var(--text-3);
  font-family: var(--font-mono);
  max-width: none;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.field-label {
  display: block;
  font-size: 0.78rem;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
}

.field-input {
  width: 100%;
  padding: var(--sp-3) var(--sp-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-md);
  color: var(--text-1);
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: border-color var(--t-fast);
}

.field-input:focus {
  border-color: var(--accent);
}

.field-input::placeholder {
  color: var(--text-3);
}

.login-error {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.82rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: var(--r-md);
  padding: var(--sp-3) var(--sp-4);
}

.login-btn {
  width: 100%;
  justify-content: center;
  gap: var(--sp-2);
  margin-top: var(--sp-2);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-back {
  margin-top: var(--sp-6);
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.8rem;
  color: var(--text-3);
  text-decoration: none;
  transition: color var(--t-fast);
}

.back-link:hover {
  color: var(--text-2);
}
</style>
