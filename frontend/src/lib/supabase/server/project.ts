import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/generated/database'
import { SupabaseError } from '../utils/errors'

/**
 * Fetch a single project by ID
 */
export async function getProject(projectId: string) {
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

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        companies (
          id,
          name,
          slug,
          description,
          website_url,
          email,
          created_at,
          onboarding_completed,
          settings
        )
      `)
      .eq('id', projectId)
      .single()

    if (error) {
      throw error
    }

    return project
  } catch (error) {
    throw new SupabaseError({
      message: 'Failed to fetch project',
      code: 'FETCH_PROJECT_ERROR',
      cause: error
    })
  }
}