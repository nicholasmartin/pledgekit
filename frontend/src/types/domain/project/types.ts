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

export type ProjectWithCompany = Project & {
  company: {
    id: string
    name: string
    slug: string
  }
}
