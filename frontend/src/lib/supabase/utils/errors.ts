/**
 * Custom error class for Supabase-related errors.
 * Provides structured error information for better error handling and debugging.
 */
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}
