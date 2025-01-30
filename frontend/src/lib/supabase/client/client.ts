import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/generated/database'
import { SupabaseError } from '../utils/errors'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * Create a cached version of the Supabase browser client.
 * IMPORTANT: This should only be used in Client Components.
 */
export const createClient = () => {
  if (client) return client

  try {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    return client
  } catch (error) {
    throw new SupabaseError(
      {
        message: 'Failed to initialize Supabase client',
        code: 'CLIENT_INIT_ERROR',
        cause: error
      }
    )
  }
}
