"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
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

interface Project {
  id: string
  title: string
  description: string | null
  goal: number
  amount_pledged: number
  end_date: string
  status: 'draft' | 'published' | 'completed' | 'cancelled'
  pledge_options: Array<{
    id: string
    title: string
    amount: number
    benefits: string[]
  }>
}

interface ProjectsClientProps {
  projects: Project[]
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return

    await supabase
      .from("projects")
      .delete()
      .eq("id", deleteProjectId)

    setDeleteProjectId(null)
    router.refresh()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getProgressPercentage = (pledged: number, goal: number) => {
    return Math.min(Math.round((pledged / goal) * 100), 100)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">
              <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
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
                  <Link href={`/dashboard/projects/${project.id}/edit`} className="flex cursor-pointer items-center">
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
                    {formatCurrency(project.amount_pledged)} of {formatCurrency(project.goal)}
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
                  <div className="space-y-2">
                    {project.pledge_options.map((option) => (
                      <div key={option.id} className="rounded-lg border p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{option.title}</span>
                          <span className="text-sm font-medium text-primary">
                            {formatCurrency(option.amount)}
                          </span>
                        </div>
                        {option.benefits && option.benefits.length > 0 && (
                          <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                            {option.benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        )}
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
                  Ends {new Date(project.end_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
