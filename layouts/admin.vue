<template>
  <div class="admin-shell">
    <!-- Sidebar overlay for mobile -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />

    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 12h6M9 15h4" />
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-admin">Admin</span>
          <span class="brand-site">{{ siteName }}</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink to="/admin/dashboard" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </NuxtLink>
        <NuxtLink to="/admin/profile" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Profile
        </NuxtLink>
        <NuxtLink to="/admin/social" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Social Links
        </NuxtLink>
        <NuxtLink to="/admin/skills" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Skills
        </NuxtLink>
        <NuxtLink to="/admin/experience" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          Experience
        </NuxtLink>
        <NuxtLink to="/admin/education" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          Education
        </NuxtLink>
        <NuxtLink to="/admin/projects" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          Projects
        </NuxtLink>
        <NuxtLink to="/admin/blog" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Blog
        </NuxtLink>
        <NuxtLink to="/admin/messages" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Messages
          <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
        </NuxtLink>
        <NuxtLink to="/admin/analytics" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Analytics
        </NuxtLink>
        <NuxtLink to="/admin/settings" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </NuxtLink>
        <NuxtLink to="/admin/interview" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/></svg>
          AI Persona
        </NuxtLink>
        <NuxtLink to="/admin/resume" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Resume Parser
        </NuxtLink>
        <NuxtLink to="/admin/tools" class="nav-item" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          Tools
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-divider" />
        <a href="/" target="_blank" rel="noopener" class="nav-item nav-item-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          View Site
        </a>
        <button class="nav-item nav-item-danger" @click="logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="admin-main">
      <!-- Header -->
      <header class="admin-header">
        <button class="hamburger" @click="sidebarOpen = !sidebarOpen" aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <h1 class="header-title">{{ pageTitle }}</h1>
        <div class="header-user">
          <div class="user-dot" />
          <span>Admin</span>
        </div>
      </header>

      <!-- Content -->
      <main class="admin-content">
        <slot />
      </main>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type">
        <svg v-if="toast.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const authState = useState<boolean | null>('admin-auth')
const unreadCount = useState<number>('msg-unread', () => 0)

const toastState = useState<{ message: string; type: 'success' | 'error' } | null>('admin-toast', () => null)
const toast = computed(() => toastState.value)

const sidebarOpen = ref(false)

const siteName = computed(() => 'Portfolio')

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/profile': 'Profile',
  '/admin/social': 'Social Links',
  '/admin/skills': 'Skills',
  '/admin/experience': 'Experience',
  '/admin/education': 'Education',
  '/admin/projects': 'Projects',
  '/admin/messages': 'Messages',
  '/admin/settings': 'Settings',
  '/admin/interview': 'AI Interview Persona',
  '/admin/resume': 'Resume Parser',
  '/admin/tools': 'Tools',
  '/admin/blog': 'Blog',
  '/admin/blog/new': 'New Post',
  '/admin/analytics': 'Analytics',
}

const pageTitle = computed(() => pageTitles[route.path] ?? 'Admin')

// Auto-dismiss toast
watch(toastState, (val) => {
  if (val) {
    setTimeout(() => {
      toastState.value = null
    }, 3000)
  }
})

async function logout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
  } catch { /* ignore */ }
  authState.value = false
  router.push('/admin/login')
}

// Fetch unread count on mount
onMounted(async () => {
  try {
    const messages = await $fetch<Array<{ read: boolean }>>('/api/admin/messages')
    unreadCount.value = messages.filter((m) => !m.read).length
  } catch { /* ignore */ }
})
</script>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg-base);
}

/* Sidebar */
.admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: var(--bg-elevated);
  border-right: 1px solid var(--border-sm);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow-y: auto;
  transition: transform var(--t-base);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-6) var(--sp-4);
  border-bottom: 1px solid var(--border-xs);
}

.brand-logo {
  width: 36px;
  height: 36px;
  background: var(--accent-dim);
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
}

.brand-admin {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-1);
  font-family: var(--font-display);
  line-height: 1.2;
}

.brand-site {
  font-size: 0.7rem;
  color: var(--text-3);
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  flex: 1;
  padding: var(--sp-4) var(--sp-3);
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--r-md);
  font-size: 0.875rem;
  color: var(--text-2);
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all var(--t-fast);
  font-family: inherit;
  position: relative;
}

.nav-item:hover {
  background: var(--bg-surface);
  color: var(--text-1);
}

.nav-item.router-link-active {
  background: var(--accent-dim);
  color: var(--accent);
}

.nav-item.router-link-active svg {
  stroke: var(--accent);
}

.nav-item-muted {
  color: var(--text-3);
}

.nav-item-danger {
  color: rgba(239, 68, 68, 0.7);
}

.nav-item-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.badge {
  margin-left: auto;
  background: var(--accent);
  color: var(--bg-base);
  font-size: 0.65rem;
  font-weight: 700;
  font-family: var(--font-mono);
  padding: 1px 6px;
  border-radius: 999px;
  min-width: 18px;
  text-align: center;
}

.sidebar-footer {
  padding: var(--sp-3);
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.sidebar-divider {
  height: 1px;
  background: var(--border-xs);
  margin-bottom: var(--sp-2);
}

/* Main area */
.admin-main {
  margin-left: 240px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-header {
  position: sticky;
  top: 0;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-xs);
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: 0 var(--sp-8);
  height: 56px;
  z-index: 50;
}

.hamburger {
  display: none;
  background: none;
  border: none;
  color: var(--text-2);
  cursor: pointer;
  padding: var(--sp-2);
  border-radius: var(--r-md);
  transition: background var(--t-fast);
}

.hamburger:hover {
  background: var(--bg-surface);
  color: var(--text-1);
}

.header-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-1);
  flex: 1;
  font-family: var(--font-display);
}

.header-user {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.8rem;
  font-family: var(--font-mono);
  color: var(--text-3);
}

.user-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent);
}

.admin-content {
  flex: 1;
  padding: var(--sp-8);
}

/* Toast */
.toast {
  position: fixed;
  bottom: var(--sp-6);
  right: var(--sp-6);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-6);
  border-radius: var(--r-md);
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 9999;
  box-shadow: var(--shadow-float);
}

.toast.success {
  background: rgba(94, 234, 212, 0.15);
  border: 1px solid rgba(94, 234, 212, 0.3);
  color: var(--accent);
}

.toast.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.toast-enter-active,
.toast-leave-active {
  transition: all var(--t-base);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* Sidebar overlay for mobile */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 99;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }

  .admin-sidebar.sidebar-open {
    transform: translateX(0);
  }

  .admin-main {
    margin-left: 0;
  }

  .hamburger {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
  }

  .admin-header {
    padding: 0 var(--sp-4);
  }

  .admin-content {
    padding: var(--sp-4);
  }
}
</style>
