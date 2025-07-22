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
