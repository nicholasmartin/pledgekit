import { Tables } from '../helpers/database'
import { PublicCompany } from '../domain/company/public'

interface CompanySettings {
  logo_url?: string | null
  branding?: Record<string, any>
}

export function toPublicCompany(dbCompany: Tables<'companies'>): PublicCompany {
  const settings = dbCompany.settings as CompanySettings | null

  return {
    id: dbCompany.id,
    name: dbCompany.name,
    slug: dbCompany.slug,
    description: dbCompany.description,
    logoUrl: settings?.logo_url ?? undefined,
    website: dbCompany.website_url ?? undefined,
  }
}
