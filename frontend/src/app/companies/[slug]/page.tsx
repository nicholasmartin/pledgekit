"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/generated/database"
import { CompanyHeader } from "@/components/companies/company-header"
import { ProjectList } from "@/components/public/projects/project-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useInView } from "react-intersection-observer"
import { toPublicCompany } from "@/types/transformers/company"
import { PublicProject } from "@/types/domain/project/public"

type Company = Database["public"]["Tables"]["companies"]["Row"]
type Project = Database["public"]["Tables"]["projects"]["Row"] & {
  companies?: Database["public"]["Tables"]["companies"]["Row"]
}

export default function CompanyPage({ 
  params, 
  initialProjects 
}: { 
  params: { slug: string }
  initialProjects?: PublicProject[] 
}) {
  const [company, setCompany] = useState<Company | null>(null)
  const [projects, setProjects] = useState<PublicProject[]>(initialProjects || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
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
      const from = projects.length
      const to = from + 9

      console.log("Fetching projects for company:", company.id, "range:", from, "to", to)
      const { data, error } = await supabase
        .from("projects")
        .select("*, companies(slug)")
        .eq("company_id", company.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(from, to)

      if (error) {
        throw error
      }

      const publicProjects = data
        .filter(project => project.status === "published")
        .map(project => ({
          id: project.id,
          title: project.title,
          description: project.description || "",
          goal: project.goal,
          amount_pledged: project.amount_pledged || 0,
          end_date: project.end_date,
          header_image_url: project.header_image_url || "",
          company_id: project.company_id,
          company_slug: project.companies?.slug || "",
          status: project.status as "published"
        }))

      console.log("Projects data received:", publicProjects)
      if (data.length < 10) {
        setHasMore(false)
      }

      setProjects(prev => [...prev, ...publicProjects])
      setError(null)
    } catch (err) {
      console.error("Error fetching projects:", err)
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'))
    } finally {
      setLoading(false)
    }
  }, [company?.id, hasMore, loading, projects.length, supabase])

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
        company && (
          <>
            <CompanyHeader 
              company={{
                name: company.name,
                description: company.description,
                logo_url: (company.settings as any)?.logo_url ?? null,
                branding: (company.settings as any)?.branding ?? {}
              }}
            />
            <main className="mx-auto max-w-7xl">
              <ProjectList 
                companyId={company.id} 
                companySlug={company.slug}
                projects={projects}
                isLoading={loading}
                loadMoreRef={ref}
              />
            </main>
          </>
        )
      )}
    </div>
  )
}
