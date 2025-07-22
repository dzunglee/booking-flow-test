import { getKV } from './kv'

export interface User {
  id: string
  email: string
  name: string
  password: string
  createdAt: string
}

const UserKV = getKV()

export const UserStorage = {
  async saveUser(user: User): Promise<void> {
    const key = `user:${user.email.toLowerCase()}`
    await UserKV.set(key, user, { ex: 86400 * 30 }) // 30 days TTL
  },

  async getUser(email: string): Promise<any | null> {
    const key = `user:${email.toLowerCase()}`
    return await UserKV.get(key)
  },

  async userExists(email: string): Promise<boolean> {
    const key = `user:${email.toLowerCase()}`
    return (await UserKV.exists(key)) === 1
  },

  async deleteUser(email: string): Promise<void> {
    const key = `user:${email.toLowerCase()}`
    await UserKV.del(key)
  },

  generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).slice(2)}`
  },
}
