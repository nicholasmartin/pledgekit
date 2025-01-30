import { createRouteHandlerClient, getClientIp, rateLimit } from "@/lib/supabase/server/route-handlers"
import { NextResponse } from "next/server"

/**
 * Rate limit configuration for user operations
 */
const RATE_LIMITS = {
  get: { limit: 30, window: 60 }, // 30 requests per minute
  update: { limit: 10, window: 60 }, // 10 updates per minute
}

/**
 * GET /api/user
 * Fetches the current user's details
 */
export async function GET(request: Request) {
  // Apply rate limiting
  const ip = getClientIp(request)
  const { success, remaining } = await rateLimit(
    ip,
    "user-get",
    RATE_LIMITS.get.limit,
    RATE_LIMITS.get.window
  )

  if (!success) {
    return new Response(
      JSON.stringify({ error: "Too many requests" }),
      { 
        status: 429,
        headers: { "Retry-After": RATE_LIMITS.get.window.toString() }
      }
    )
  }

  const result = await createRouteHandlerClient(request)
  if (result instanceof Response) return result

  const { supabase, session } = result

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching user:", error)
    return new Response(
      JSON.stringify({ error: "Failed to fetch user data" }),
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user
 * Updates the current user's details
 */
export async function PATCH(request: Request) {
  // Apply rate limiting
  const ip = getClientIp(request)
  const { success } = await rateLimit(
    ip,
    "user-update",
    RATE_LIMITS.update.limit,
    RATE_LIMITS.update.window
  )

  if (!success) {
    return new Response(
      JSON.stringify({ error: "Too many update requests" }),
      { 
        status: 429,
        headers: { "Retry-After": RATE_LIMITS.update.window.toString() }
      }
    )
  }

  const result = await createRouteHandlerClient(request)
  if (result instanceof Response) return result

  const { supabase, session } = result

  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("users")
      .update(body)
      .eq("id", session.user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating user:", error)
    return new Response(
      JSON.stringify({ error: "Failed to update user data" }),
      { status: 500 }
    )
  }
}
