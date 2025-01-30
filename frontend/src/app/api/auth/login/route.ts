import { createServer } from "@/lib/supabase/server"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1"
    
    // Rate limit: 5 login attempts per hour
    const rateLimitResult = await rateLimit(ip, "auth-login", 5, "1h")
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Too many login attempts. Please try again later.",
          reset: rateLimitResult.reset
        }),
        { 
          status: 429,
          headers: { "Content-Type": "application/json" }
        }
      )
    }

    // Parse request body
    const { email, password } = await request.json()

    // Create server client
    const supabase = createServer()

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      )
    }

    // Return user data and session
    return new Response(
      JSON.stringify({ 
        user: data.user,
        session: data.session
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    )
  } catch (error) {
    console.error("Login error:", error)
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred" 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}
