export async function getSessionFromToken(token: string) {
  if (!token) return null

  try {
    // Use SessionKV helper which handles both production (Vercel KV) and development (filesystem)
    return await SessionKV.get(token)
  } catch (error) {
    console.error('Error getting session from token:', error)
    return null
  }
}
