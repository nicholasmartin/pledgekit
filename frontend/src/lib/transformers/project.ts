import type { Database } from "../database.types"
import type { Project, PledgeOption, ProjectWithCompany } from "@/types/domain/project"

export type DbProject = Database['public']['Tables']['projects']['Row']
export type DbPledgeOption = Database['public']['Tables']['pledge_options']['Row']
export type DbCompany = Database['public']['Tables']['companies']['Row']

export interface ProjectBranding {
  logo_url?: string
  primary_color?: string
  secondary_color?: string
}

export function transformPledgeOption(dbOption: DbPledgeOption): PledgeOption {
  return {
    id: dbOption.id,
    title: dbOption.title,
    amount: dbOption.amount,
    benefits: Array.isArray(dbOption.benefits) ? dbOption.benefits.filter((b): b is string => typeof b === 'string') : []
  }
}

export function transformProject(dbProject: DbProject & { pledge_options: DbPledgeOption[] }): Project {
  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description,
    goal: dbProject.goal,
    amount_pledged: dbProject.amount_pledged ?? 0,
    end_date: dbProject.end_date,
    header_image_url: dbProject.header_image_url,
    status: dbProject.status as Project['status'],
    pledge_options: dbProject.pledge_options.map(transformPledgeOption)
  }
}

export function transformCompany(dbCompany: DbCompany): ProjectWithCompany['company'] {
  return {
    id: dbCompany.id,
    name: dbCompany.name || '',
    slug: dbCompany.slug || ''
  }
}
