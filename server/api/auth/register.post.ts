export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { name, email, password } = body

  if (!name || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, email and password are required',
    })
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email format',
    })
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 6 characters long',
    })
  }

  const users = (await useStorage('data').getItem('users')) || []

  if (users.find((u: any) => u.email === email)) {
    return {
      data: {
        success: false,
        error: 'Email already exists',
      },
    }
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)

  await useStorage('data').setItem('users', users)

  const token = btoa(`${newUser.id}-${Date.now()}`)

  await useStorage('sessions').setItem(token, {
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
    createdAt: new Date().toISOString(),
  })

  return {
    data: {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      token,
    },
  }
})
