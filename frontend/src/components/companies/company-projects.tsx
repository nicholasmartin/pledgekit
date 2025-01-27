/**
 * CompanyProjects Component
 * 
 * This component handles the display and infinite loading of published projects for a specific company.
 * It is used in the public-facing view to show a company's active projects to potential backers.
 * 
 * Key Features:
 * - Displays a grid of published projects with infinite scroll functionality
 * - Shows loading skeletons during initial load and subsequent fetches
 * - Handles error states with retry functionality
 * - Implements type safety checks for project data
 * - Only shows projects with "published" status
 * 
 * Note: This component is specifically for public viewing of published projects.
 * It filters projects by company_id and published status, making it suitable
 * for the public-facing parts of the application.
 */

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import { useSupabase } from "@/lib/supabase/hooks"
import { ProjectCard } from "./project-card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Database } from "@/types/generated/database"
import { PublicProject } from "@/types/domain/project/public"
import { toPublicProject } from "@/types/transformers/project"

interface CompanyProjectsProps {
  companyId: string
  initialProjects?: PublicProject[]
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
  const [projects, setProjects] = useState<PublicProject[]>(initialProjects)
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

      const validProjects = (data || [])
        .map(toPublicProject)
        .filter((project): project is PublicProject => project !== null)

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
            project={project}
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
