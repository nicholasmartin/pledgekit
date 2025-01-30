import { createServer } from "@/lib/supabase/server/server"
import { SupabaseClient } from "@supabase/supabase-js"
import { headers } from "next/headers"

export type RouteHandlerResult = {
  supabase: SupabaseClient
  session: NonNullable<Awaited<ReturnType<SupabaseClient["auth"]["getSession"]>>["data"]["session"]>
}

/**
 * Creates a Supabase client for route handlers with session validation
 * 
 * @param request - The incoming request object
 * @returns Either a Response for auth errors or a RouteHandlerResult with client and session
 */
export async function createRouteHandlerClient(
  request: Request
): Promise<Response | RouteHandlerResult> {
  try {
    const supabase = createServer()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Auth error:", error.message)
      return new Response(
        JSON.stringify({ error: "Authentication error" }),
        { status: 401 }
      )
    }

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      )
    }

    return { supabase, session }
  } catch (error) {
    console.error("Server error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    )
  }
}

/**
 * Rate limiting implementation
 * 
 * @param identifier - Unique identifier (e.g., IP address)
 * @param operation - Operation being rate limited
 * @param limit - Number of allowed requests
 * @param window - Time window in seconds
 */
export async function rateLimit(
  identifier: string,
  operation: string,
  limit: number,
  windowInSeconds: number
): Promise<{ success: boolean; remaining: number }> {
  // In a real implementation, this would use Redis or a similar store
  // For now, we'll implement a basic in-memory rate limiter
  const key = `${identifier}:${operation}`
  const now = Date.now()
  
  // TODO: Implement proper rate limiting with Redis
  // For now, always return success
  return { success: true, remaining: limit }
}

/**
 * Helper to get client IP from request
 * 
 * @param request - The incoming request object
 * @returns The client IP address
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  
  const headersList = headers()
  const realIp = headersList.get("x-real-ip")
  if (realIp) {
    return realIp
  }
  
  return "127.0.0.1"
}
