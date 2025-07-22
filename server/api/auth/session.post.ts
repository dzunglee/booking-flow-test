export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { user, token } = body

  if (!user || !token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User and token are required',
    })
  }

  await useStorage('sessions').setItem(token, {
    userId: user.id,
    email: user.email,
    name: user.name,
    createdAt: new Date().toISOString(),
  })

  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })

  return {
    success: true,
    user,
  }
})
