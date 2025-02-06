import { CompanyPageClient } from "@/components/companies/company-page-client"

export default function CompanyPage({ 
  params 
}: { 
  params: { slug: string }
}) {
  return <CompanyPageClient slug={params.slug} />
}
