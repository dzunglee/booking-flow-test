export default defineEventHandler(async (event) => {
  const { token } = await readBody(event)

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token required',
    })
  }

  const session = await SessionKV.get(token)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired session',
    })
  }

  return {
    success: true,
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
    },
  }
})
