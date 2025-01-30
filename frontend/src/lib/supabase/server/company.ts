import { cache } from 'react'
import { DatabaseError } from '../utils/errors'
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
      throw new DatabaseError({
        message: 'Error fetching company',
        code: 'DB_QUERY_ERROR',
        cause: error
      })
    }

    if (!data) {
      throw new DatabaseError({
        message: 'Company not found',
        code: 'DB_QUERY_ERROR'
      })
    }

    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError({
      message: 'Failed to get company',
      code: 'DB_QUERY_ERROR',
      cause: error
    })
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
      throw new DatabaseError({
        message: 'Error fetching company projects',
        code: 'DB_QUERY_ERROR',
        cause: error
      })
    }

    return data.map(project => ({
      ...project,
      company_slug: (project.companies as { slug: string }).slug
    }))
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError({
      message: 'Failed to get company projects',
      code: 'DB_QUERY_ERROR',
      cause: error
    })
  }
})
