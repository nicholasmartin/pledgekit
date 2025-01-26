import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/generated/database'

export function createClient() {
  try {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
