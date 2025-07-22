import { Redis } from '@upstash/redis'

export function getKV() {
  if (process.env.NODE_ENV === 'production' || process.env.KV_REST_API_URL) {
    return Redis.fromEnv()
  }

  return {
    async get(key: string) {
      return await useStorage('sessions').getItem(key)
    },

    async set(key: string, value: any, options?: { ex?: number }) {
      await useStorage('sessions').setItem(key, value)
      if (options?.ex) {
        console.log(`TTL of ${options.ex}s would be set for key: ${key}`)
      }
      return 'OK'
    },

    async del(key: string) {
      await useStorage('sessions').removeItem(key)
      return 1
    },

    async exists(key: string) {
      const item = await useStorage('sessions').getItem(key)
      return item !== null ? 1 : 0
    },

    async keys(pattern?: string) {
      const allKeys = await useStorage('sessions').getKeys()
      if (pattern) {
        const regex = new RegExp(pattern.replace('*', '.*'))
        return allKeys.filter((key) => regex.test(key))
      }
      return allKeys
    },
  }
}

/**
 * Session management utilities
 */
export const SessionKV = {
  async set(token: string, sessionData: any, ttlSeconds: number = 3600 * 24) {
    const kv = getKV()
    return await kv.set(`session:${token}`, sessionData, { ex: ttlSeconds })
  },

  async get(token: string) {
    const kv = getKV()
    return await kv.get(`session:${token}`)
  },

  async delete(token: string) {
    const kv = getKV()
    return await kv.del(`session:${token}`)
  },

  async exists(token: string) {
    const kv = getKV()
    return await kv.exists(`session:${token}`)
  },

  async getAllSessions() {
    const kv = getKV()
    return await kv.keys('session:*')
  },
}
