export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No authentication token found',
    })
  }

  const session = await getSessionFromToken(token)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token',
    })
  }

  return {
    data: {
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
      },
    },
  }
})
