/**
 * Domain types for Projects, representing the core business entities
 * independent of database implementation details.
 */

export type ProjectStatus = "draft" | "published" | "completed" | "cancelled"

export interface PledgeOption {
  id: string
  title: string
  amount: number
  benefits: string[]
}

export interface Project {
  id: string
  title: string
  description: string | null
  goal: number
  amount_pledged: number
  end_date: string
  header_image_url: string | null
  status: ProjectStatus
  pledge_options: PledgeOption[]
}

export interface ProjectWithCompany extends Project {
  company: {
    id: string
    name: string
    slug: string
  }
}
