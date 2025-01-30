import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

/**
 * Rate limit function using Redis
 * @param identifier - Unique identifier for the rate limit (e.g., IP address)
 * @param key - Key to identify the rate limit type (e.g., 'auth-login')
 * @param limit - Maximum number of requests allowed
 * @param window - Time window for rate limit (e.g., '1h', '15m')
 */
export async function rateLimit(
  identifier: string,
  key: string,
  limit: number,
  window: string
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowMs = parseWindow(window)
  const redisKey = `ratelimit:${key}:${identifier}`

  const pipeline = redis.pipeline()
  pipeline.zremrangebyscore(redisKey, 0, now - windowMs) // Remove old entries
  pipeline.zcard(redisKey) // Get number of requests in current window
  pipeline.zadd(redisKey, { score: now, member: now.toString() }) // Add current request
  pipeline.expire(redisKey, Math.floor(windowMs / 1000)) // Set expiry

  const [, current] = await pipeline.exec()
  const totalRequests = (current as number) + 1

  return {
    success: totalRequests <= limit,
    remaining: Math.max(0, limit - totalRequests),
    reset: now + windowMs,
  }
}

/**
 * Parse time window string to milliseconds
 * @param window - Time window string (e.g., '1h', '15m')
 */
function parseWindow(window: string): number {
  const value = parseInt(window)
  const unit = window.slice(-1)
  
  switch (unit) {
    case 'h':
      return value * 60 * 60 * 1000
    case 'm':
      return value * 60 * 1000
    case 's':
      return value * 1000
    default:
      throw new Error('Invalid time window format. Use h, m, or s as units.')
  }
}
