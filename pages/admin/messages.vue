<template>
  <div class="page-wrap">
    <div class="page-header-row">
      <div>
        <h2 class="page-heading">Messages</h2>
        <p class="page-sub">Contact form submissions.</p>
      </div>
      <div class="filter-tabs">
        <button class="tab" :class="{ 'tab-active': filter === 'all' }" @click="filter = 'all'">All</button>
        <button class="tab" :class="{ 'tab-active': filter === 'unread' }" @click="filter = 'unread'">
          Unread
          <span v-if="unreadCount > 0" class="tab-badge">{{ unreadCount }}</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-block" />

    <div v-else-if="filteredMessages.length === 0" class="empty-state">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <p v-if="filter === 'unread'">No unread messages.</p>
      <template v-else>
        <p>No messages yet.</p>
        <p class="empty-hint">Messages arrive here when someone submits your contact form. They're stored in <strong>Firebase Firestore</strong> — make sure <code>FIREBASE_PROJECT_ID</code>, <code>FIREBASE_CLIENT_EMAIL</code>, and <code>FIREBASE_PRIVATE_KEY</code> are set in your environment variables.</p>
        <NuxtLink to="/admin/tools" class="empty-link">Check integration status →</NuxtLink>
      </template>
    </div>

    <div v-else class="message-list">
      <div
        v-for="msg in filteredMessages"
        :key="msg.id"
        class="message-item"
        :class="{ 'message-unread': !msg.read, 'message-expanded': expandedId === msg.id }"
      >
        <div class="message-header" @click="toggleExpand(msg.id)">
          <div class="message-dot-col">
            <div class="dot" :class="{ 'dot-unread': !msg.read }" />
          </div>
          <div class="message-meta">
            <span class="msg-name">{{ msg.name }}</span>
            <span class="msg-email">{{ msg.email }}</span>
          </div>
          <div class="message-subject-col">
            {{ msg.subject || msg.message.slice(0, 60) }}
          </div>
          <div class="message-date-col">
            {{ formatDate(msg.date) }}
          </div>
          <div class="message-chevron">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline :points="expandedId === msg.id ? '18 15 12 9 6 15' : '6 9 12 15 18 9'" />
            </svg>
          </div>
        </div>

        <!-- Expanded body -->
        <div v-if="expandedId === msg.id" class="message-body">
          <div v-if="msg.subject" class="msg-subject-full">{{ msg.subject }}</div>
          <div class="msg-text">{{ msg.message }}</div>
          <div class="msg-actions">
            <button v-if="!msg.read" class="btn btn-ghost btn-sm" :disabled="markingId === msg.id" @click="markRead(msg)">
              <span v-if="markingId === msg.id" class="btn-spinner" />
              Mark as Read
            </button>
            <span v-else class="read-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Read
            </span>
            <a :href="`mailto:${msg.email}${msg.subject ? `?subject=Re: ${encodeURIComponent(msg.subject)}` : ''}`" class="btn btn-ghost btn-sm">
              Reply via Email
            </a>
            <button
              class="btn-danger-sm"
              :class="{ 'btn-confirm': confirmDeleteId === msg.id }"
              @click="handleDelete(msg)"
            >
              {{ confirmDeleteId === msg.id ? 'Confirm Delete?' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const toast = useState<{ message: string; type: 'success' | 'error' } | null>('admin-toast')
const unreadCount = useState<number>('msg-unread', () => 0)

interface Message {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  date: string
  read: boolean
}

const loading = ref(true)
const messages = ref<Message[]>([])
const filter = ref<'all' | 'unread'>('all')
const expandedId = ref<string | null>(null)
const markingId = ref<string | null>(null)
const confirmDeleteId = ref<string | null>(null)
let confirmTimer: ReturnType<typeof setTimeout> | null = null

const filteredMessages = computed(() =>
  filter.value === 'unread' ? messages.value.filter((m) => !m.read) : messages.value
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

async function markRead(msg: Message) {
  markingId.value = msg.id
  try {
    await $fetch(`/api/admin/messages/${msg.id}`, { method: 'PATCH' })
    msg.read = true
    unreadCount.value = messages.value.filter((m) => !m.read).length
    toast.value = { message: 'Message marked as read', type: 'success' }
  } catch {
    toast.value = { message: 'Failed to update message', type: 'error' }
  } finally {
    markingId.value = null
  }
}

function handleDelete(msg: Message) {
  if (confirmDeleteId.value === msg.id) {
    doDelete(msg)
  } else {
    confirmDeleteId.value = msg.id
    if (confirmTimer) clearTimeout(confirmTimer)
    confirmTimer = setTimeout(() => { confirmDeleteId.value = null }, 2000)
  }
}

async function doDelete(msg: Message) {
  try {
    await $fetch(`/api/admin/messages/${msg.id}`, { method: 'DELETE' })
    messages.value = messages.value.filter((m) => m.id !== msg.id)
    unreadCount.value = messages.value.filter((m) => !m.read).length
    if (expandedId.value === msg.id) expandedId.value = null
    confirmDeleteId.value = null
    toast.value = { message: 'Message deleted', type: 'success' }
  } catch {
    toast.value = { message: 'Failed to delete message', type: 'error' }
  }
}

onMounted(async () => {
  try {
    const data = await $fetch<Message[]>('/api/admin/messages')
    messages.value = data
    unreadCount.value = data.filter((m) => !m.read).length
  } catch {
    toast.value = { message: 'Failed to load messages', type: 'error' }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-wrap { max-width: 800px; margin: 0 auto; }
.page-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-6); gap: var(--sp-4); flex-wrap: wrap; }
.page-heading { font-size: 1.2rem; font-weight: 600; color: var(--text-1); font-family: var(--font-display); }
.page-sub { font-size: 0.875rem; color: var(--text-3); margin-top: var(--sp-1); max-width: none; }
.filter-tabs { display: flex; gap: var(--sp-2); }
.tab { padding: var(--sp-2) var(--sp-4); border-radius: var(--r-md); border: 1px solid var(--border-sm); background: transparent; color: var(--text-3); font-size: 0.82rem; cursor: pointer; font-family: inherit; transition: all var(--t-fast); display: flex; align-items: center; gap: var(--sp-2); }
.tab:hover { background: var(--bg-surface); color: var(--text-2); }
.tab-active { background: var(--accent-dim); border-color: rgba(94,234,212,0.3); color: var(--accent); }
.tab-badge { background: var(--accent); color: var(--bg-base); font-size: 0.65rem; font-weight: 700; padding: 1px 6px; border-radius: 999px; min-width: 18px; text-align: center; }
.loading-block { height: 300px; background: var(--bg-elevated); border-radius: var(--r-lg); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--sp-3); padding: var(--sp-12) var(--sp-6); color: var(--text-3); text-align: center; }
.empty-state p { font-size: 0.875rem; max-width: none; }
.empty-hint { font-size: 0.8rem; color: var(--text-3); line-height: 1.6; max-width: 400px; }
.empty-hint strong { color: var(--text-2); font-weight: 500; }
.empty-hint code { font-family: var(--font-mono); font-size: 0.75rem; background: var(--bg-surface); border: 1px solid var(--border-xs); border-radius: 3px; padding: 1px 5px; color: var(--text-2); }
.empty-link { font-size: 0.8rem; color: var(--accent); text-decoration: none; font-family: var(--font-mono); }
.empty-link:hover { opacity: 0.8; }
.message-list { display: flex; flex-direction: column; gap: var(--sp-2); }
.message-item { background: var(--bg-elevated); border: 1px solid var(--border-xs); border-radius: var(--r-lg); overflow: hidden; transition: border-color var(--t-fast); }
.message-unread { border-color: rgba(94,234,212,0.15); }
.message-header { display: flex; align-items: center; gap: var(--sp-4); padding: var(--sp-4) var(--sp-5); cursor: pointer; transition: background var(--t-fast); }
.message-header:hover { background: var(--bg-surface); }
.message-dot-col { flex-shrink: 0; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: var(--border-sm); }
.dot-unread { background: var(--accent); box-shadow: 0 0 6px var(--accent); }
.message-meta { display: flex; flex-direction: column; gap: 2px; min-width: 140px; flex-shrink: 0; }
.msg-name { font-size: 0.875rem; font-weight: 600; color: var(--text-1); }
.msg-email { font-size: 0.75rem; color: var(--text-3); font-family: var(--font-mono); }
.message-subject-col { flex: 1; font-size: 0.875rem; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.message-date-col { font-size: 0.75rem; color: var(--text-3); font-family: var(--font-mono); flex-shrink: 0; }
.message-chevron { color: var(--text-3); flex-shrink: 0; }
.message-body { padding: var(--sp-5); border-top: 1px solid var(--border-xs); }
.msg-subject-full { font-size: 0.95rem; font-weight: 600; color: var(--text-1); margin-bottom: var(--sp-3); }
.msg-text { font-size: 0.9rem; color: var(--text-2); line-height: 1.7; white-space: pre-wrap; margin-bottom: var(--sp-4); max-width: none; }
.msg-actions { display: flex; gap: var(--sp-3); align-items: center; flex-wrap: wrap; }
.btn-sm { font-size: 0.8rem; padding: var(--sp-2) var(--sp-3); }
.read-badge { display: flex; align-items: center; gap: var(--sp-1); font-size: 0.78rem; color: var(--accent); font-family: var(--font-mono); }
.btn-danger-sm { padding: 6px 12px; background: rgba(239,68,68,0.12); color: rgba(239,68,68,0.8); border: 1px solid rgba(239,68,68,0.25); border-radius: var(--r-md); font-size: 0.8rem; cursor: pointer; transition: all var(--t-fast); font-family: inherit; }
.btn-danger-sm:hover { background: rgba(239,68,68,0.2); color: #ef4444; }
.btn-confirm { background: rgba(239,68,68,0.25); color: #ef4444; border-color: rgba(239,68,68,0.5); }
.btn-spinner { width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
