export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { user, token } = body

  if (!user || !token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User and token are required',
    })
  }

  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return {
    success: true,
    user,
  }
})
