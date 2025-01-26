import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import type { Database } from '@/types/generated/database'
import { SupabaseError } from '../utils/errors'

/**
 * Create a cached version of the Supabase server client.
 * IMPORTANT: This should only be used in Server Components.
 * Always call cookies() before any Supabase calls.
 */
export const createServer = cache(() => {
  try {
    const cookieStore = cookies()
    
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: any) => {
            cookieStore.set({ name, value, ...options })
          },
          remove: (name: string, options: any) => {
            cookieStore.delete({ name, ...options })
          }
        },
      }
    )
  } catch (error) {
    throw new SupabaseError(
      'Failed to initialize Supabase server client',
      'SERVER_INIT_ERROR',
      error
    )
  }
})
