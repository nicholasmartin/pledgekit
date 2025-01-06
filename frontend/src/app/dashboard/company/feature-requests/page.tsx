"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface CannyPost {
  id: string
  title: string
  details: string
  status: string
  score: number
  commentCount: number
  created: string
  author: {
    name: string
  }
}

export default function FeatureRequestsPage() {
  const [posts, setPosts] = useState<CannyPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCannyPosts = async () => {
    try {
      const response = await fetch("/api/canny/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.posts
    } catch (error) {
      console.error("Error fetching Canny posts:", error)
      throw error
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

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch posts from our API route
        const posts = await fetchCannyPosts()
        setPosts(posts)
      } catch (error) {
        console.error("Error loading posts:", error)
        setError(error instanceof Error ? error.message : "An error occurred")
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load feature requests",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [toast])

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Feature Requests</h1>
        <Card className="p-6">
          <p className="text-destructive">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feature Requests</h1>
        <p className="text-muted-foreground">
          View and manage feature requests from your customers
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Votes</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
              ))
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(post.status)}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.score}</TableCell>
                  <TableCell>{post.commentCount}</TableCell>
                  <TableCell>{post.author?.name || "Anonymous"}</TableCell>
                  <TableCell>
                    {new Date(post.created).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
