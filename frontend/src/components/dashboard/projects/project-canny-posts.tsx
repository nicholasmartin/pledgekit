"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CannyPost {
  id: string
  title: string
  status: string
  score: number
  comment_count: number
  author_name: string
  created_at: string
}

interface ProjectCannyPostsProps {
  projectId: string
}

export function ProjectCannyPosts({ projectId }: ProjectCannyPostsProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [posts, setPosts] = useState<CannyPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [projectId])

  const loadPosts = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("canny_posts")
        .select("*")
        .eq("project_id", projectId)

      if (error) throw error

      setPosts(data || [])
    } catch (error) {
      console.error("Error loading posts:", error)
      toast({
        title: "Error",
        description: "Failed to load Canny posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFromProject = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("canny_posts")
        .update({ project_id: null })
        .eq("id", postId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Post removed from project",
      })
      
      // Refresh posts
      loadPosts()
    } catch (error) {
      console.error("Error removing post:", error)
      toast({
        title: "Error",
        description: "Failed to remove post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status.toLowerCase()) {
      case "open":
        return "default"
      case "under review":
        return "secondary"
      case "planned":
        return "secondary"
      case "in progress":
        return "secondary"
      case "complete":
        return "default"
      case "closed":
        return "destructive"
      default:
        return "default"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Associated Canny Posts</h2>
        <Button onClick={() => router.push("/dashboard/company/feature-requests")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Posts
        </Button>
      </div>

      <Card>
        {posts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No posts are associated with this project.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(post.status)}>{post.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{post.score}</TableCell>
                  <TableCell className="text-right">{post.comment_count}</TableCell>
                  <TableCell>{post.author_name}</TableCell>
                  <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromProject(post.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
