"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { CompanyHeader } from "@/components/companies/company-header"
import { ProjectCard } from "@/components/companies/project-card"
import { useInView } from "react-intersection-observer"
import { CompanyProjects } from "@/components/companies/company-projects"

interface Company {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  branding: any
}

interface Project {
  id: string
  title: string
  description: string
  goal: number
  amount_pledged: number
  end_date: string
  header_image_url: string | null
  company_slug: string
}

export default function CompanyPage({ params, initialProjects }: { params: { slug: string }, initialProjects: Project[] }) {
  const [company, setCompany] = useState<Company | null>(null)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const supabase = createClientComponentClient()
  const { ref, inView } = useInView()

  // Fetch company data
  useEffect(() => {
    async function fetchCompany() {
      console.log("Fetching company data for slug:", params.slug)
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", params.slug)
        .single()

      if (error) {
        console.error("Error fetching company:", error)
        return
      }

      console.log("Company data received:", data)
      setCompany(data)
    }

    fetchCompany()
  }, [params.slug, supabase])

  // Fetch projects with infinite scroll
  const fetchProjects = async () => {
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
        console.error("Error fetching projects:", error)
        return
      }

      // Transform the data to include company_slug
      const projectsWithSlug = data.map(project => ({
        ...project,
        company_slug: project.companies.slug
      }))

      console.log("Projects data received:", projectsWithSlug)
      if (data.length < 10) {
        setHasMore(false)
      }

      setProjects(prev => [...prev, ...projectsWithSlug])
      setPage(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch of projects when company is loaded
  useEffect(() => {
    if (company?.id) {
      console.log("Company loaded, triggering initial project fetch")
      fetchProjects()
    }
  }, [company])

  // Trigger fetch when scrolling to the bottom
  useEffect(() => {
    if (inView) {
      fetchProjects()
    }
  }, [inView])

  if (!company) {
    return <div className="container py-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <CompanyHeader company={company} />
      
      <main className="container py-8">
        <CompanyProjects 
          companyId={company.id} 
          initialProjects={projects} 
        />
        
        {hasMore && (
          <div
            ref={ref}
            className="mt-8 flex justify-center"
          >
            {loading && <div>Loading more projects...</div>}
          </div>
        )}
        
        {!hasMore && projects.length === 0 && (
          <div className="text-center text-muted-foreground">
            No projects available at this time.
          </div>
        )}
      </main>
    </div>
  )
}
