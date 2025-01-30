import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient, Session } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AuthError } from '../utils/errors'

export interface MiddlewareReturn {
  res: NextResponse
  supabase: SupabaseClient | null
  session: Session | null
}

/**
 * Creates a middleware handler for Supabase authentication.
 * Handles session refresh and cookie management using Supabase's recommended pattern.
 * Returns null for supabase client and session if initialization fails.
 */
export function createMiddleware() {
  return async function middleware(req: NextRequest): Promise<MiddlewareReturn> {
    const res = NextResponse.next()

    try {
      // Create Supabase client with cookie management
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name) => req.cookies.get(name)?.value,
            set: (name, value, options) => {
              res.cookies.set({
                name,
                value,
                ...options,
              })
            },
            remove: (name, options) => {
              res.cookies.delete({
                name,
                ...options,
              })
            }
          }
        }
      )

      // Try to refresh the session if it exists
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw new AuthError({
          message: 'Error refreshing session',
          code: 'AUTH_SESSION_ERROR',
          cause: error
        })
      }

      return { res, supabase, session: session || null }
    } catch (error) {
      console.error('Middleware - Error:', error)
      return { res, supabase: null, session: null }
    }
  }
}
