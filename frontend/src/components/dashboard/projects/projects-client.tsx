"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

type Project = Database["public"]["Tables"]["projects"]["Row"] & {
  pledge_options: Array<Database["public"]["Tables"]["pledge_options"]["Row"]>
}

interface ProjectsClientProps {
  projects: Project[]
  limit?: number
}

export function ProjectsClient({ projects, limit }: ProjectsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return

    try {
      setIsDeleting(true)
      setError(null)

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", deleteProjectId)

      if (error) {
        throw error
      }

      setDeleteProjectId(null)
      router.refresh()
    } catch (err) {
      console.error("Error deleting project:", err)
      setError(err instanceof Error ? err : new Error("Failed to delete project"))
    } finally {
      setIsDeleting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getProgressPercentage = (pledged: number | null, goal: number) => {
    if (!pledged) return 0
    return Math.min(Math.round((pledged / goal) * 100), 100)
  }

  const displayedProjects = limit ? projects.slice(0, limit) : projects

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">
                <Link href={`/dashboard/company/projects/${project.id}`} className="hover:underline">
                  {project.title}
                </Link>
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/company/projects/${project.id}/edit`} className="flex cursor-pointer items-center">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center text-destructive focus:text-destructive"
                    onClick={() => setDeleteProjectId(project.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <CardDescription className="line-clamp-2">
                  {project.description || "No description provided"}
                </CardDescription>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {formatCurrency(project.amount_pledged || 0)} of {formatCurrency(project.goal)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${getProgressPercentage(project.amount_pledged, project.goal)}%` }}
                    />
                  </div>
                </div>
                {project.pledge_options.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Pledge Options</span>
                    <div className="grid grid-cols-2 gap-2">
                      {project.pledge_options.map((option) => (
                        <div
                          key={option.id}
                          className="rounded-lg border bg-card p-2 text-card-foreground hover:bg-accent transition-colors"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">{option.title}</span>
                              <span className="text-sm font-medium text-primary whitespace-nowrap">
                                {formatCurrency(option.amount)}
                              </span>
                            </div>
                            {option.benefits && (
                              <div className="text-xs text-muted-foreground truncate">
                                {Array.isArray(option.benefits) ? option.benefits.length : 0} benefits
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className={`capitalize ${
                    project.status === 'published' ? 'text-green-600' :
                    project.status === 'completed' ? 'text-blue-600' :
                    project.status === 'cancelled' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {project.status}
                  </span>
                  <span className="text-muted-foreground">
                    Ends {new Date(project.end_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteProjectId} onOpenChange={() => !isDeleting && setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
