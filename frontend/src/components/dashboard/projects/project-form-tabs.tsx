"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectDetailsForm } from "./project-details-form"
import { PledgeOptionsForm } from "./pledge-options-form"
import { PledgeBenefitsForm } from "./pledge-benefits-form"
import { ProjectCannyPosts } from "./project-canny-posts"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

interface Project {
  id: string
  title: string
  description: string | null
  goal: number
  end_date: string
  status: "draft" | "published" | "completed" | "cancelled"
}

interface ProjectFormTabsProps {
  companyId: string
  project?: Project
}

export function ProjectFormTabs({ companyId, project: initialProject }: ProjectFormTabsProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [activeTab, setActiveTab] = useState("details")
  const [isSaving, setIsSaving] = useState(false)
  const [projectId, setProjectId] = useState<string | undefined>(initialProject?.id)
  const [project, setProject] = useState<Project | undefined>(initialProject)

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const loadProject = async () => {
    if (!projectId) return

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single()

    if (error) {
      console.error("Error loading project:", error)
      return
    }

    if (data) {
      setProject(data)
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    // TODO: Implement save draft functionality
    setIsSaving(false)
  }

  const handlePublish = async () => {
    setIsSaving(true)
    // TODO: Implement publish functionality
    setIsSaving(false)
  }

  const handleProjectSave = (id: string) => {
    setProjectId(id)
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
            project={project}
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
