/**
 * Project Domain Types
 * 
 * This file contains the domain types for project-related entities.
 * These types represent our business domain model for projects.
 */

import { z } from 'zod'
import { projectSchema } from './schema'

export type Project = z.infer<typeof projectSchema>

export type ProjectWithPledges = Project & {
  pledgeOptions: {
    id: string
    title: string
    amount: number
    benefits: string[]
  }[]
}

export type ProjectWithCompany = {
  id: string
  title: string
  description: string | null
  goal: number
  amount_pledged: number | null
  end_date: string
  header_image_url: string | null
  company_id: string
  status: "draft" | "published" | "completed" | "cancelled"
  visibility: "public" | "private"
  created_at: string | null
  updated_at: string | null
  company: {
    id: string
    name: string
    slug: string
  }
}
