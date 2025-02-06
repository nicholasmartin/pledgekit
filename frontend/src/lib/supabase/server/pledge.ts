import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/generated/database'
import { SupabaseError } from '../utils/errors'

/**
 * Fetch pledge options for a specific project
 */
export async function getPledgeOptions(projectId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: pledgeOptions, error } = await supabase
      .from('pledge_options')
      .select('*')
      .eq('project_id', projectId)
      .order('amount', { ascending: true })

    if (error) {
      throw error
    }

    return pledgeOptions
  } catch (error) {
    throw new SupabaseError({
      message: 'Failed to fetch pledge options',
      code: 'FETCH_PLEDGE_OPTIONS_ERROR',
      cause: error
    })
  }
}