"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ProjectDetailsForm } from "./project-details-form"
import { PledgeOptionsForm } from "./pledge-options-form"
import { PledgeBenefitsForm } from "./pledge-benefits-form"
import { ProjectCannyPosts } from "./project-canny-posts"
import type { Database } from "@/lib/database.types"

type Project = Database["public"]["Tables"]["projects"]["Row"]
type ProjectStatus = "draft" | "published" | "completed" | "cancelled"

// TODO: This type assertion is temporary and should be fixed as part of the type refactoring
// See docs/todo-types.md "Quick Fixes to Revisit" section
const transformProject = (project: Project | undefined) => {
  if (!project) return undefined;
  return {
    ...project,
    status: (project.status || "draft") as ProjectStatus
  }
}

interface ProjectFormTabsProps {
  companyId: string
  project?: Project
}

export function ProjectFormTabs({ companyId, project: initialProject }: ProjectFormTabsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("details")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [projectId, setProjectId] = useState<string | undefined>(initialProject?.id)
  const [project, setProject] = useState<Project | undefined>(initialProject)

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const loadProject = async () => {
    if (!projectId) return

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setProject(data)
        setError(null)
      }
    } catch (err) {
      console.error("Error loading project:", err)
      setError(err instanceof Error ? err : new Error('Failed to load project'))
    }
  }

  const handleSaveDraft = async () => {
    if (!projectId) return

    setIsSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("projects")
        .update({ status: "draft", updated_at: new Date().toISOString() })
        .eq("id", projectId)

      if (error) throw error

      router.refresh()
    } catch (err) {
      console.error("Error saving draft:", err)
      setError(err instanceof Error ? err : new Error('Failed to save draft'))
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!projectId) return

    setIsSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("projects")
        .update({ 
          status: "published", 
          updated_at: new Date().toISOString(),
          visibility: "public"
        })
        .eq("id", projectId)

      if (error) throw error

      router.refresh()
      router.push(`/projects/${projectId}`)
    } catch (err) {
      console.error("Error publishing project:", err)
      setError(err instanceof Error ? err : new Error('Failed to publish project'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleProjectSave = (id: string) => {
    setProjectId(id)
    setError(null)
    loadProject() // Load the project data immediately after save
    setActiveTab("options")
  }

  const handleTabChange = (tab: string) => {
    if (tab === "details" && projectId) {
      loadProject() // Reload project data when switching back to details tab
    }
    setActiveTab(tab)
  }

  const isTabDisabled = (tab: string) => {
    if (tab === "details") return false
    return !projectId
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          {error.message}
        </div>
      )}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Project Details</TabsTrigger>
          <TabsTrigger value="options" disabled={isTabDisabled("options")}>
            Pledge Options
          </TabsTrigger>
          <TabsTrigger value="benefits" disabled={isTabDisabled("benefits")}>
            Pledge Benefits
          </TabsTrigger>
          <TabsTrigger value="canny-posts" disabled={isTabDisabled("canny-posts")}>
            Canny Posts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <ProjectDetailsForm
            companyId={companyId}
            project={transformProject(project)}
            onSave={handleProjectSave}
          />
        </TabsContent>
        <TabsContent value="options" className="space-y-4">
          {projectId && (
            <PledgeOptionsForm
              projectId={projectId}
              onSave={() => setActiveTab("benefits")}
            />
          )}
        </TabsContent>
        <TabsContent value="benefits" className="space-y-4">
          {projectId && <PledgeBenefitsForm projectId={projectId} />}
        </TabsContent>
        <TabsContent value="canny-posts" className="space-y-4">
          {projectId && <ProjectCannyPosts projectId={projectId} />}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
          Save Draft
        </Button>
        <Button onClick={handlePublish} disabled={isSaving}>
          Publish
        </Button>
      </div>
    </div>
  )
}
