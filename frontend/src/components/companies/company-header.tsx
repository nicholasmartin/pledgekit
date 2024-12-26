interface CompanyHeaderProps {
  company: {
    name: string
    description: string | null
    logo_url: string | null
    branding: any
  }
}

export function CompanyHeader({ company }: CompanyHeaderProps) {
  const headerStyle = {
    backgroundColor: company.branding?.primary_color || "#f8f9fa",
    color: company.branding?.text_color || "#000000",
  }

  return (
    <div
      className="w-full border-b bg-background/95 py-8 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={headerStyle}
    >
      <div className="container">
        <div className="flex items-center gap-4">
          {company.logo_url && (
            <img
              src={company.logo_url}
              alt={`${company.name} logo`}
              className="h-16 w-16 rounded-lg object-contain"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            {company.description && (
              <p className="mt-2 max-w-2xl text-muted-foreground">
                {company.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
