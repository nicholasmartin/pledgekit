/**
 * Pledge Type Transformers
 * 
 * This file contains functions to transform between database and domain types
 * for pledge-related entities.
 */

import { Tables } from '../helpers/database'
import { Pledge, PledgeOption, PledgeWithDetails } from '../domain/pledge/types'
import { pledgeSchema, pledgeOptionSchema } from '../domain/pledge/schema'

export function toPledgeOption(dbOption: Tables<'pledge_options'>): PledgeOption {
  return pledgeOptionSchema.parse({
    id: dbOption.id,
    title: dbOption.title,
    amount: dbOption.amount,
    description: dbOption.description,
    benefits: dbOption.benefits ? JSON.parse(JSON.stringify(dbOption.benefits)) : null,
    projectId: dbOption.project_id
  })
}

export function toDbPledgeOption(
  option: PledgeOption
): Omit<Tables<'pledge_options'>, 'id' | 'created_at'> {
  return {
    title: option.title,
    amount: option.amount,
    description: option.description,
    benefits: option.benefits,
    project_id: option.projectId
  }
}

export function toPledge(dbPledge: Tables<'pledges'>): Pledge {
  return pledgeSchema.parse({
    id: dbPledge.id,
    amount: dbPledge.amount,
    status: dbPledge.status,
    projectId: dbPledge.project_id,
    pledgeOptionId: dbPledge.pledge_option_id,
    userId: dbPledge.user_id,
    paymentIntentId: dbPledge.payment_intent_id,
    paymentMethodId: dbPledge.payment_method_id,
    createdAt: dbPledge.created_at,
    updatedAt: dbPledge.updated_at
  })
}

export function toDbPledge(
  pledge: Pledge
): Omit<Tables<'pledges'>, 'id' | 'created_at' | 'updated_at'> {
  return {
    amount: pledge.amount,
    status: pledge.status,
    project_id: pledge.projectId,
    pledge_option_id: pledge.pledgeOptionId,
    user_id: pledge.userId,
    payment_intent_id: pledge.paymentIntentId,
    payment_method_id: pledge.paymentMethodId
  }
}

export function toPledgeWithDetails(
  dbPledge: Tables<'pledges'> & {
    projects?: Tables<'projects'>,
    pledge_options?: Tables<'pledge_options'>
  }
): PledgeWithDetails {
  const pledge = toPledge(dbPledge)
  
  if (!dbPledge.projects || !dbPledge.pledge_options) {
    throw new Error('Project and pledge option data is required for PledgeWithDetails')
  }

  return {
    ...pledge,
    project: {
      id: dbPledge.projects.id,
      title: dbPledge.projects.title
    },
    pledgeOption: {
      id: dbPledge.pledge_options.id,
      title: dbPledge.pledge_options.title,
      benefits: dbPledge.pledge_options.benefits 
        ? JSON.parse(JSON.stringify(dbPledge.pledge_options.benefits))
        : []
    }
  }
}
