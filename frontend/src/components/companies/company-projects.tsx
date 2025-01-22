"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import { useSupabase } from "@/lib/supabase/hooks"
import { ProjectCard } from "./project-card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export interface Project {
  id: string
  title: string
  description: string | null
  goal: number
  amount_pledged: number | null
  end_date: string
  header_image_url: string | null
  company_id: string
  company_slug: string
  created_at: string | null
  updated_at: string | null
  status: string | null
  visibility: string | null
}

interface CompanyProjectsProps {
  companyId: string
  initialProjects?: Project[]
}

const ITEMS_PER_PAGE = 9
const PROJECT_CARD_SKELETON_COUNT = 3

function ProjectCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-48 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  )
}

export function CompanyProjects({ companyId, initialProjects = [] }: CompanyProjectsProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const currentPage = useRef(1)
  const supabase = useSupabase()
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const from = currentPage.current * ITEMS_PER_PAGE
      const to = from + (ITEMS_PER_PAGE - 1)

      const { data, error } = await supabase
        .from("projects")
        .select()
        .eq("company_id", companyId)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(from, to)

      if (error) {
        throw new Error(error.message)
      }

      // Type guard to ensure we only add valid Project objects
      const validProjects = (data || []).filter((item): item is Project => {
        const isValid = 
          typeof item === 'object' && 
          item !== null && 
          'id' in item &&
          'title' in item &&
          'description' in item &&
          'goal' in item &&
          'amount_pledged' in item &&
          'end_date' in item &&
          'company_id' in item &&
          'company_slug' in item &&
          'created_at' in item &&
          'updated_at' in item &&
          'status' in item &&
          'visibility' in item
        
        if (!isValid) {
          console.error('Invalid project data:', item)
        }
        return isValid
      })

      setProjects(prev => [...prev, ...validProjects])
      setHasMore(validProjects.length === ITEMS_PER_PAGE)
      currentPage.current += 1
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }, [companyId, supabase])

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      fetchProjects()
    }
  }, [inView, isLoading, hasMore, fetchProjects])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => {
              setError(null)
              fetchProjects()
            }}
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const hasProjects = projects.length > 0
  const showLoadingState = isLoading && !hasProjects

  return (
    <div className="space-y-8">
      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Existing Projects */}
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={{
              ...project,
              amount_pledged: project.amount_pledged ?? 0
            }}
            companySlug={project.company_slug}
          />
        ))}
        
        {/* Loading Skeletons */}
        {showLoadingState && 
          Array.from({ length: PROJECT_CARD_SKELETON_COUNT }).map((_, i) => (
            <ProjectCardSkeleton key={`skeleton-${i}`} />
          ))
        }
      </div>

      {/* Loading More Indicator */}
      {isLoading && hasProjects && (
        <div className="flex justify-center">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`bottom-skeleton-${i}`} className="h-2 w-12" />
            ))}
          </div>
        </div>
      )}

      {/* No Projects State */}
      {!isLoading && !hasProjects && (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <p className="text-lg font-medium text-muted-foreground">
            No projects found
          </p>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      <div ref={ref} className="h-px w-full" />
    </div>
  )
}
