/**
 * Project Type Transformers
 * 
 * This file contains functions to transform between database and domain types
 * for project-related entities.
 */

import { Tables } from '../helpers/database'
import { PublicProject, publicProjectSchema } from '../domain/project/public'
import { DashboardProject, dashboardProjectSchema } from '../domain/project/dashboard'
import { ProjectWithCompany, ProjectWithPledges } from '../domain/project/types'

export function toPublicProject(
  dbProject: Tables<'projects'> & {
    companies?: Tables<'companies'>
  }
): PublicProject | null {
  if (dbProject.status !== 'published') {
    return null
  }

  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description || '',
    goal: dbProject.goal,
    amount_pledged: dbProject.amount_pledged || 0,
    end_date: dbProject.end_date,
    header_image_url: dbProject.header_image_url || '',
    company_id: dbProject.company_id,
    company_slug: dbProject.companies?.slug || '',
    status: "published" as const,
  }
}

export function toDashboardProject(dbProject: Tables<'projects'>): DashboardProject {
  return dashboardProjectSchema.parse({
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description,
    goal: dbProject.goal,
    amount_pledged: dbProject.amount_pledged,
    end_date: dbProject.end_date,
    header_image_url: dbProject.header_image_url,
    company_id: dbProject.company_id,
    status: dbProject.status,
    visibility: dbProject.visibility,
    created_at: dbProject.created_at,
    updated_at: dbProject.updated_at
  })
}

export function toProjectWithCompany(
  dbProject: Tables<'projects'> & {
    companies?: Tables<'companies'>
  }
): ProjectWithCompany | null {
  if (!dbProject.companies) {
    return null
  }

  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description,
    goal: dbProject.goal,
    amount_pledged: dbProject.amount_pledged,
    end_date: new Date(dbProject.end_date).toISOString(),
    header_image_url: dbProject.header_image_url,
    company_id: dbProject.company_id,
    status: dbProject.status,
    visibility: dbProject.visibility as 'public' | 'private',
    created_at: dbProject.created_at,
    updated_at: dbProject.updated_at,
    company: {
      id: dbProject.companies.id,
      name: dbProject.companies.name,
      slug: dbProject.companies.slug
    }
  }
}

export function toDbProject(
  project: Partial<DashboardProject>
): Omit<Tables<'projects'>, 'id' | 'created_at' | 'updated_at'> {
  return {
    title: project.title!,
    description: project.description || '',
    goal: project.goal!,
    amount_pledged: project.amount_pledged || 0,
    end_date: project.end_date!,
    header_image_url: project.header_image_url || '',
    company_id: project.company_id!,
    status: project.status!,
    visibility: project.visibility!
  }
}

export function toPledgeOption(dbPledgeOption: Tables<'pledge_options'>): {
  amount: number
  benefits: string[]
  created_at: string | null
  description: string | null
  id: string
  project_id: string | null
  title: string
} {
  return {
    id: dbPledgeOption.id,
    title: dbPledgeOption.title,
    description: dbPledgeOption.description,
    amount: dbPledgeOption.amount,
    benefits: Array.isArray(dbPledgeOption.benefits) ? dbPledgeOption.benefits.filter((b): b is string => typeof b === 'string') : [],
    project_id: dbPledgeOption.project_id,
    created_at: dbPledgeOption.created_at
  }
}

export function toProjectWithPledges(
  dbProject: Tables<'projects'> & {
    pledge_options: Tables<'pledge_options'>[]
  }
): ProjectWithPledges {
  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description,
    goal: dbProject.goal,
    amountPledged: dbProject.amount_pledged || 0,
    endDate: new Date(dbProject.end_date),
    headerImageUrl: dbProject.header_image_url || '',
    companyId: dbProject.company_id,
    status: dbProject.status,
    visibility: dbProject.visibility,
    pledgeOptions: dbProject.pledge_options.map(po => ({
      id: po.id,
      title: po.title,
      amount: po.amount,
      benefits: Array.isArray(po.benefits) ? po.benefits.filter((b): b is string => typeof b === 'string') : []
    }))
  }
}
