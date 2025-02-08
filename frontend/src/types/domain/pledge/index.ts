import type { Database } from "@/types/generated/database"

export type UserProjectPledge = {
  id: string
  user_id: string
  project_id: string
  pledge_option_id: string
  amount: number
  status: Database['public']['Enums']['pledge_status']
  payment_intent_id: string | null
  payment_method_id: string | null
  created_at: string
  updated_at: string
  pledge_option_title: string
  pledge_option_amount: number
}