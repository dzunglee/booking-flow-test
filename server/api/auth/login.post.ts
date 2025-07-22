export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    })
  }

  const users = (await useStorage('data').getItem('users')) || []

  const user = users.find((u: any) => u.email === email)

  if (!user) {
    return {
      data: {
        success: false,
        error: 'Invalid credentials',
      },
    }
  }

  if (user.password !== password) {
    return {
      data: {
        success: false,
        error: 'Invalid credentials',
      },
    }
  }

  const token = btoa(`${user.id}-${Date.now()}`)

  await useStorage('sessions').setItem(token, {
    userId: user.id,
    email: user.email,
    name: user.name,
    createdAt: new Date().toISOString(),
  })

  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return {
    data: {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    },
  }
})
