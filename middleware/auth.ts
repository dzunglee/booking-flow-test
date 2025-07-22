export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return

  try {
    const { data } = await $fetch('/api/auth/me', {
      credentials: 'include',
    })

    if (!data?.user) {
      throw new Error('Not authenticated')
    }
  } catch (error) {
    return navigateTo('/auth/login')
  }
})
