"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/hooks"
import { useToast } from "@/components/ui/use-toast"

interface Project {
  id: string
  title: string
  description: string | null
  status: "draft" | "published" | "completed" | "cancelled"
}

interface SelectProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectSelect: (projectId: string) => Promise<void>
}

export function SelectProjectDialog({
  open,
  onOpenChange,
  onProjectSelect,
}: SelectProjectDialogProps) {
  const router = useRouter()
  const supabase = useSupabase()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Load projects when dialog opens
  useEffect(() => {
    if (open) {
      loadProjects()
    }
  }, [open])

  const loadProjects = async () => {
    console.log('Loading projects...')
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, description, status")
        .eq("status", "draft")
        .order("created_at", { ascending: false })

      console.log('Projects query result:', { data, error })

      if (error) throw error

      setProjects(data || [])
    } catch (error) {
      console.error("Error loading projects:", error)
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      })
    } finally {
      console.log('Setting loading to false')
      setIsLoading(false)
    }
  }

  // Reset state when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchQuery("")
      setSelectedProjectId("")
    }
    onOpenChange(open)
  }

  const handleSubmit = async () => {
    if (!selectedProjectId) return

    setIsSubmitting(true)
    try {
      console.log('Submitting project selection:', selectedProjectId)
      await onProjectSelect(selectedProjectId)
      onOpenChange(false)
    } catch (error) {
      console.error("Error selecting project:", error instanceof Error ? error.message : error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add posts to project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No projects match your search" : "No draft projects found"}
            </div>
          ) : (
            <RadioGroup
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              className="space-y-2"
            >
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent"
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <RadioGroupItem value={project.id} id={project.id} className="mt-1" />
                  <Label htmlFor={project.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{project.title}</div>
                    {project.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedProjectId || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
