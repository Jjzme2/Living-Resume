export default defineNuxtRouteMiddleware(async (to) => {
  const isLoginPage = to.path === '/admin/login'
  const authState = useState<boolean | null>('admin-auth', () => null)

  // If already confirmed authenticated, redirect away from login
  if (authState.value === true) {
    if (isLoginPage) {
      return navigateTo('/admin/dashboard')
    }
    return
  }

  // If already confirmed unauthenticated, redirect to login
  if (authState.value === false) {
    if (!isLoginPage) {
      return navigateTo('/admin/login')
    }
    return
  }

  // Unknown — check with server
  try {
    await $fetch('/api/auth/me')
    authState.value = true
    if (isLoginPage) {
      return navigateTo('/admin/dashboard')
    }
  } catch {
    authState.value = false
    if (!isLoginPage) {
      return navigateTo('/admin/login')
    }
  }
})
