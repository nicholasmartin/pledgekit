/**
 * Pledge Domain Types
 * 
 * This file contains the domain types for pledge-related entities.
 * These types represent our business domain model for pledges and pledge options.
 */

import { z } from 'zod'
import { pledgeSchema, pledgeOptionSchema } from './schema'

export type Pledge = z.infer<typeof pledgeSchema>
export type PledgeOption = z.infer<typeof pledgeOptionSchema>

export type PledgeWithDetails = Pledge & {
  project: {
    id: string
    title: string
  }
  pledgeOption: {
    id: string
    title: string
    benefits: string[]
  }
}
