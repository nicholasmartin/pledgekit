import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/generated/database'

// Set warning expiration to 2 weeks from now
const warningExpiration = new Date()
warningExpiration.setDate(warningExpiration.getDate() + 14)

// Filter out the specific warning
const originalWarn = console.warn
console.warn = (...args) => {
  // Check if this is the getSession warning
  if (typeof args[0] === 'string' && args[0].includes('Using the user object as returned from supabase.auth.getSession()')) {
    // Only show warning if we're past the expiration
    if (new Date() > warningExpiration) {
      originalWarn.apply(console, args)
    }
    return
  }
  // Show all other warnings
  originalWarn.apply(console, args)
}

export function createClient() {
  try {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          detectSessionInUrl: true,
          flowType: 'pkce'
        }
      }
    )
  } catch (error) {
    throw new SupabaseError(
      'Failed to initialize Supabase client',
      'INIT_ERROR',
      error
    )
  }
}

export class SupabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}
