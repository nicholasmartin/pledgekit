"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"
import { CompanyHeader } from "@/components/companies/company-header"
import { ProjectCard } from "@/components/companies/project-card"
import { useInView } from "react-intersection-observer"
import { CompanyProjects } from "@/components/companies/company-projects"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

type Company = Database["public"]["Tables"]["companies"]["Row"]
type Project = Database["public"]["Tables"]["projects"]["Row"] & {
  company_slug: string
}

export default function CompanyPage({ 
  params, 
  initialProjects 
}: { 
  params: { slug: string }
  initialProjects: Project[] 
}) {
  const [company, setCompany] = useState<Company | null>(null)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const supabase = createClient()
  const { ref, inView } = useInView()

  // Fetch company data
  useEffect(() => {
    async function fetchCompany() {
      try {
        console.log("Fetching company data for slug:", params.slug)
        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .eq("slug", params.slug)
          .single()

        if (error) {
          throw error
        }

        console.log("Company data received:", data)
        setCompany(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching company:", err)
        setError(err instanceof Error ? err : new Error('Failed to fetch company'))
        setCompany(null)
      }
    }

    fetchCompany()
  }, [params.slug, supabase])

  // Fetch projects with infinite scroll
  const fetchProjects = useCallback(async () => {
    if (!company?.id || !hasMore || loading) {
      console.log("Skipping fetchProjects because:", {
        companyId: company?.id,
        hasMore,
        loading
      })
      return
    }

    try {
      setLoading(true)
      const from = page * 10
      const to = from + 9

      console.log("Fetching projects for company:", company.id, "range:", from, "to", to)
      const { data, error } = await supabase
        .from("projects")
        .select("*, companies!inner(slug)")
        .eq("company_id", company.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(from, to)

      if (error) {
        throw error
      }

      // Transform the data to include company_slug
      const projectsWithSlug = data.map(project => ({
        ...project,
        company_slug: (project.companies as { slug: string }).slug
      }))

      console.log("Projects data received:", projectsWithSlug)
      if (data.length < 10) {
        setHasMore(false)
      }

      setProjects(prev => [...prev, ...projectsWithSlug])
      setPage(prev => prev + 1)
      setError(null)
    } catch (err) {
      console.error("Error fetching projects:", err)
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'))
    } finally {
      setLoading(false)
    }
  }, [company?.id, hasMore, loading, page, supabase])

  // Initial fetch of projects when company is loaded
  useEffect(() => {
    if (company?.id) {
      console.log("Company loaded, triggering initial project fetch")
      fetchProjects()
    }
  }, [company?.id, fetchProjects])

  // Trigger fetch when scrolling to the bottom
  useEffect(() => {
    if (inView) {
      fetchProjects()
    }
  }, [inView, fetchProjects])

  if (!company && !error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-64 bg-muted animate-pulse" />
        <main className="container py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {error ? (
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </div>
      ) : (
        <>
          {company && <CompanyHeader company={{
            name: company.name,
            description: company.description,
            logo_url: null, 
            branding: (company.settings as { branding?: any } | null)?.branding ?? {}
          }} />}
          
          <main className="container py-8">
            <CompanyProjects 
              companyId={company?.id || ""} 
              initialProjects={projects} 
            />
            
            {hasMore && (
              <div
                ref={ref}
                className="mt-8 flex justify-center"
              >
                {loading && (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                )}
              </div>
            )}
            
            {!hasMore && projects.length === 0 && (
              <div className="text-center text-muted-foreground">
                No projects available at this time.
              </div>
            )}
          </main>
        </>
      )}
    </div>
  )
}
