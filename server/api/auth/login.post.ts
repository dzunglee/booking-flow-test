import bcrypt from 'bcryptjs'
import { SessionKV } from '~/server/utils/kv'
import { UserStorage } from '~/server/utils/user-storage'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    })
  }

  const user = await UserStorage.getUser(email)

  if (!user) {
    return {
      data: {
        success: false,
        error: 'Invalid credentials',
      },
    }
  }

  const isValidPassword = bcrypt.compareSync(password, user.password)

  if (!isValidPassword) {
    return {
      data: {
        success: false,
        error: 'Invalid credentials',
      },
    }
  }

  const token = btoa(`${user.id}-${Date.now()}`)
  const sessionData = {
    userId: user.id,
    email: user.email,
    name: user.name,
    createdAt: new Date().toISOString(),
  }

  await SessionKV.set(token, sessionData)

  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return {
    data: {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token: token,
    },
  }
})
