import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/generated/database'
import { SupabaseError } from '../utils/errors'
import type { GetServerSidePropsContext } from 'next'

/**
 * Create a Supabase server client compatible with pages directory.
 * This version uses direct cookie access from req/res for pages compatibility.
 */
export const createPagesServer = (context: GetServerSidePropsContext) => {
  try {
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => {
            return context.req.cookies[name]
          },
          set: (name: string, value: string, options: any) => {
            context.res.setHeader(
              'Set-Cookie',
              `${name}=${value}; Path=/; ${
                options.httpOnly ? 'HttpOnly;' : ''
              } ${options.secure ? 'Secure;' : ''} ${
                options.sameSite ? `SameSite=${options.sameSite};` : ''
              } ${
                options.maxAge ? `Max-Age=${options.maxAge};` : ''
              }`
            )
          },
          remove: (name: string, options: any) => {
            context.res.setHeader(
              'Set-Cookie',
              `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ${
                options.httpOnly ? 'HttpOnly;' : ''
              } ${options.secure ? 'Secure;' : ''} ${
                options.sameSite ? `SameSite=${options.sameSite};` : ''
              }`
            )
          }
        }
      }
    )
  } catch (error) {
    throw new SupabaseError({
      message: 'Failed to initialize Supabase pages server client',
      code: 'PAGES_SERVER_INIT_ERROR',
      cause: error
    })
  }
}