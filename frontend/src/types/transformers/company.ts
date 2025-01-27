import { Tables } from '../helpers/database'

interface CompanySettings {
  logo_url?: string | null
  branding?: Record<string, any>
}

export function toPublicCompany(dbCompany: Tables<'companies'>): {
  name: string
  description: string | null
  logo_url: string | null
  branding: any
} {
  const settings = dbCompany.settings as CompanySettings | null

  return {
    name: dbCompany.name,
    description: dbCompany.description,
    logo_url: settings?.logo_url ?? null,
    branding: settings?.branding ?? {}
  }
}
