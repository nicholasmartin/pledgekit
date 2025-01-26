import { cache } from 'react'
import { SupabaseError } from '../utils/errors'
import { createServer } from './server'

/**
 * Get company data with proper typing and error handling.
 * Throws if company is not found or on error.
 */
export const getCompany = cache(async (slug: string) => {
  try {
    const supabase = createServer()
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      throw new SupabaseError(
        'Error fetching company',
        'COMPANY_FETCH_ERROR',
        error
      )
    }

    if (!data) {
      throw new SupabaseError(
        'Company not found',
        'COMPANY_NOT_FOUND_ERROR'
      )
    }

    return data
  } catch (error) {
    throw new SupabaseError(
      'Failed to get company',
      'GET_COMPANY_ERROR',
      error
    )
  }
})

/**
 * Get published projects for a company with proper typing.
 * Handles pagination and data transformation.
 */
export const getCompanyProjects = cache(async (companyId: string, page: number = 0) => {
  try {
    const supabase = createServer()
    const from = page * 10
    const to = from + 9

    const { data, error } = await supabase
      .from('projects')
      .select('*, companies!inner(slug)')
      .eq('company_id', companyId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw new SupabaseError(
        'Error fetching company projects',
        'COMPANY_PROJECTS_ERROR',
        error
      )
    }

    return data.map(project => ({
      ...project,
      company_slug: (project.companies as { slug: string }).slug
    }))
  } catch (error) {
    throw new SupabaseError(
      'Failed to get company projects',
      'GET_COMPANY_PROJECTS_ERROR',
      error
    )
  }
})
