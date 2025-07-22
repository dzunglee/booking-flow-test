import bcrypt from 'bcryptjs'
import { SessionKV } from '~/server/utils/kv'
import { UserStorage } from '~/server/utils/user-storage'

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

  if (await UserStorage.userExists(email)) {
    return {
      data: {
        success: false,
        error: 'Email already exists',
      },
    }
  }

  const hashedPassword = bcrypt.hashSync(password, 10)

  const newUser = {
    id: UserStorage.generateId(),
    name: name.trim(),
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  }

  await UserStorage.saveUser(newUser)

  const token = btoa(`${newUser.id}-${Date.now()}`)
  const sessionData = {
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
    createdAt: new Date().toISOString(),
  }

  await SessionKV.set(token, sessionData)

  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  })

  return {
    data: {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      token: token,
    },
  }
})
