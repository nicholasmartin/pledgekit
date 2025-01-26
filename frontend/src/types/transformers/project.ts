/**
 * Project Type Transformers
 * 
 * This file contains functions to transform between database and domain types
 * for project-related entities.
 */

import { Tables } from '../helpers/database'
import { Project, ProjectWithPledges, ProjectWithCompany } from '../domain/project/types'
import { projectSchema } from '../domain/project/schema'

export function toProject(dbProject: Tables<'projects'>): Project {
  return projectSchema.parse({
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description,
    goal: dbProject.goal,
    amountPledged: dbProject.amount_pledged,
    status: dbProject.status,
    endDate: dbProject.end_date,
    headerImageUrl: dbProject.header_image_url,
    visibility: dbProject.visibility,
    companyId: dbProject.company_id
  })
}

export function toDbProject(
  project: Project
): Omit<Tables<'projects'>, 'id' | 'created_at' | 'updated_at'> {
  return {
    title: project.title,
    description: project.description,
    goal: project.goal,
    amount_pledged: project.amountPledged,
    status: project.status,
    end_date: project.endDate.toISOString(),
    header_image_url: project.headerImageUrl,
    visibility: project.visibility,
    company_id: project.companyId
  }
}

export function toProjectWithPledges(
  dbProject: Tables<'projects'> & {
    pledge_options?: Tables<'pledge_options'>[]
  }
): ProjectWithPledges {
  const project = toProject(dbProject)
  return {
    ...project,
    pledgeOptions: dbProject.pledge_options?.map(option => ({
      id: option.id,
      title: option.title,
      amount: option.amount,
      benefits: option.benefits || []
    })) || []
  }
}

export function toProjectWithCompany(
  dbProject: Tables<'projects'> & {
    companies?: Tables<'companies'>
  }
): ProjectWithCompany {
  const project = toProject(dbProject)
  if (!dbProject.companies) {
    throw new Error('Company data is required for ProjectWithCompany')
  }
  return {
    ...project,
    company: {
      id: dbProject.companies.id,
      name: dbProject.companies.name,
      slug: dbProject.companies.slug
    }
  }
}
