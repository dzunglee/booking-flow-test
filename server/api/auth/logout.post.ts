export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')

  if (token) {
    await SessionKV.delete(token)
  }

  setCookie(event, 'auth-token', '', {
    maxAge: -1,
  })

  return {
    success: true,
    message: 'Logged out successfully',
  }
})
