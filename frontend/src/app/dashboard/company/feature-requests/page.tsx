"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
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
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Check, Settings, RefreshCw, Loader2, Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import useSWR from "swr"
import { formatDistanceToNow } from "date-fns"
import { SelectProjectDialog } from "@/components/dashboard/projects/select-project-dialog"

interface CannyPost {
  id: string
  canny_post_id: string
  title: string
  details: string
  status: string
  score: number
  commentCount: number
  created: string
  board: {
    id: string
  }
  author: {
    name: string
  }
  project: {
    id: string
    title: string
  } | null
}

interface CannyBoard {
  id: string;
  name: string;
  postCount: number;
}

type SortField = "score" | "commentCount" | "created"
type SortDirection = "asc" | "desc"

const CANNY_STATUSES = [
  { value: "open", label: "Open" },
  { value: "under review", label: "Under Review" },
  { value: "planned", label: "Planned" },
  { value: "in progress", label: "In Progress" },
  { value: "complete", label: "Complete" },
  { value: "closed", label: "Closed" },
] as const

const fetcher = (url: string, options?: RequestInit) => 
  fetch(url, options).then(res => res.json())

export default function FeatureRequestsPage() {
  const [selectedBoards, setSelectedBoards] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>("score")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [allPosts, setAllPosts] = useState<CannyPost[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const { toast } = useToast()

  // Use SWR for boards
  const { data: boardsData, error: boardsError, mutate: mutateBoards } = useSWR(
    "/api/canny/boards",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  const boards = boardsData?.boards || []
  const totalPostCount = useMemo(() => boards.reduce((total: number, board: CannyBoard) => total + board.postCount, 0), [boards])

  // Update lastSyncedAt when boardsData changes
  useEffect(() => {
    if (boardsData?.lastSyncedAt) {
      setLastSyncedAt(boardsData.lastSyncedAt)
    }
  }, [boardsData?.lastSyncedAt])

  // Initialize all filters when data is loaded
  useEffect(() => {
    if (boards.length > 0) {
      setSelectedBoards(boards.map((board: CannyBoard) => board.id))
    }
  }, [boards])

  useEffect(() => {
    setSelectedStatuses(CANNY_STATUSES.map(status => status.value))
  }, [])

  // Use SWR for posts
  const { data: postsData, error: postsError, mutate: mutatePosts } = useSWR(
    ["/api/canny/posts", sortField, sortDirection],
    ([url]) => fetcher(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sortBy: sortField,
        sortDirection,
      }),
    }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
      // Keep the previous data while revalidating
      keepPreviousData: true,
      // Revalidate in the background
      revalidateOnMount: true,
      // Don't revalidate on window focus
      focusThrottleInterval: 0
    }
  )

  // Update allPosts when postsData changes
  useEffect(() => {
    if (postsData?.posts) {
      setAllPosts(postsData.posts)
    }
  }, [postsData])

  const isLoading = !postsData && !postsError

  // Apply board filtering
  const boardFilteredPosts = useMemo(() => {
    return selectedBoards.length > 0
      ? allPosts.filter(post => post.board && selectedBoards.includes(post.board.id))
      : allPosts;
  }, [allPosts, selectedBoards]);

  // Calculate status counts based on board-filtered posts
  const statusCounts = useMemo(() => {
    return CANNY_STATUSES.reduce((acc, status) => {
      acc[status.value] = boardFilteredPosts.filter(
        post => post.status.toLowerCase() === status.value.toLowerCase()
      ).length;
      return acc;
    }, {} as Record<string, number>);
  }, [boardFilteredPosts]);

  // Simple lookup for status counts
  const getPostCountForStatus = (status: string) => statusCounts[status] || 0;

  // Calculate board post counts from all posts
  const boardCounts = useMemo(() => {
    return boards.reduce((acc: Record<string, number>, board: CannyBoard) => {
      acc[board.id] = allPosts.filter(post => post.board && post.board.id === board.id).length;
      return acc;
    }, {} as Record<string, number>);
  }, [allPosts, boards]);

  // Simple lookup for board counts
  const getPostCountForBoard = (boardId: string) => boardCounts[boardId] || 0;

  // Filter and sort posts for display
  const filteredAndSortedPosts = useMemo(() => {
    // Start with all posts
    let result = [...allPosts]

    // Apply board filter
    if (selectedBoards.length > 0) {
      result = result.filter(post => post.board && selectedBoards.includes(post.board.id))
    }

    // Apply status filter
    if (selectedStatuses.length > 0) {
      result = result.filter(post => selectedStatuses.includes(post.status.toLowerCase()))
    }

    // Apply sorting
    result.sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1
      
      switch (sortField) {
        case "score":
          return (a.score - b.score) * modifier
        case "commentCount":
          return (a.commentCount - b.commentCount) * modifier
        case "created":
          return (new Date(a.created).getTime() - new Date(b.created).getTime()) * modifier
        default:
          return 0
      }
    })

    return result
  }, [allPosts, selectedBoards, selectedStatuses, sortField, sortDirection])

  const syncPosts = async () => {
    if (isSyncing) return // Prevent multiple syncs
    
    setIsSyncing(true)
    try {
      const response = await fetch("/api/canny/sync", {
        method: "POST"
      })
      
      if (!response.ok) {
        throw new Error("Failed to sync posts")
      }

      // Update lastSyncedAt immediately
      const now = new Date().toISOString()
      setLastSyncedAt(now)

      // Mutate both posts and boards data
      await Promise.all([
        mutatePosts(),
        mutateBoards()
      ])

      toast({
        title: "Success",
        description: "Posts synced successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sync posts",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Show error toasts
  useEffect(() => {
    if (boardsError) {
      toast({
        title: "Error",
        description: "Failed to load boards. Please try again.",
        variant: "destructive",
      })
    }
  }, [boardsError, toast])

  useEffect(() => {
    if (postsError) {
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      })
    }
  }, [postsError, toast])

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

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r min-h-screen p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Boards</h3>
            <div className="space-y-2">
              {boards.map((board: CannyBoard) => (
                <div key={board.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      role="checkbox"
                      aria-checked={selectedBoards.includes(board.id)}
                      tabIndex={0}
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border border-primary/20 transition-colors hover:border-primary/30",
                        selectedBoards.includes(board.id)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50"
                      )}
                      onClick={() => {
                        setSelectedBoards((prev) => {
                          const isSelected = prev.includes(board.id)
                          if (isSelected) {
                            return prev.filter((s) => s !== board.id)
                          }
                          return [...prev, board.id]
                        })
                      }}
                    >
                      {selectedBoards.includes(board.id) && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                    <span className="ml-2 text-sm">{board.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{getPostCountForBoard(board.id)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Status</h3>
            <div className="space-y-2">
              {CANNY_STATUSES.map((status) => (
                <div key={status.value} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border border-primary/20 transition-colors hover:border-primary/30",
                        selectedStatuses.includes(status.value)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50"
                      )}
                      onClick={() => {
                        setSelectedStatuses((prev) => {
                          const isSelected = prev.includes(status.value)
                          if (isSelected) {
                            return prev.filter((s) => s !== status.value)
                          }
                          return [...prev, status.value]
                        })
                      }}
                    >
                      {selectedStatuses.includes(status.value) && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                    <span className="ml-2 text-sm">{status.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{getPostCountForStatus(status.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={syncPosts} 
              className="flex items-center gap-2"
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isSyncing ? "Syncing..." : "Sync Posts"}
            </Button>
            {lastSyncedAt && (
              <span className="text-sm text-muted-foreground">
                Last synced {formatDistanceToNow(new Date(lastSyncedAt))} ago
              </span>
            )}
          </div>

          {selectedPosts.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setIsProjectDialogOpen(true)}>
                Add to Project
              </Button>
              <Button onClick={() => {/* TODO: Create new project */}}>
                Create New Project
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="commentCount">Comments</SelectItem>
                <SelectItem value="created">Date Created</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card>
          {isLoading ? (
            <div className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ) : postsError ? (
            <div className="p-4 text-red-500">{postsError.message}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <div
                        role="checkbox"
                        aria-checked={selectedPosts.length === filteredAndSortedPosts.filter(p => !p.project).length}
                        tabIndex={0}
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border border-primary/20 transition-colors hover:border-primary/30",
                          selectedPosts.length === filteredAndSortedPosts.filter(p => !p.project).length
                            ? "bg-primary text-primary-foreground"
                            : selectedPosts.length > 0
                            ? "bg-primary/50 text-primary-foreground"
                            : "opacity-50"
                        )}
                        onClick={() => {
                          if (selectedPosts.length === filteredAndSortedPosts.filter(p => !p.project).length) {
                            setSelectedPosts([])
                          } else {
                            setSelectedPosts(filteredAndSortedPosts.filter(p => !p.project).map(post => post.canny_post_id))
                          }
                        }}
                      >
                        {selectedPosts.length > 0 && <Check className="h-3 w-3" />}
                      </div>
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Comments</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]">Project</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div
                          role="checkbox"
                          aria-checked={selectedPosts.includes(post.canny_post_id)}
                          aria-disabled={!!post.project}
                          tabIndex={post.project ? -1 : 0}
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                            post.project
                              ? "border-muted cursor-not-allowed opacity-30"
                              : "border-primary/20 hover:border-primary/30 cursor-pointer",
                            selectedPosts.includes(post.canny_post_id)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50"
                          )}
                          onClick={() => {
                            if (post.project) return;
                            setSelectedPosts((prev) => {
                              const isSelected = prev.includes(post.canny_post_id)
                              if (isSelected) {
                                return prev.filter((id) => id !== post.canny_post_id)
                              }
                              return [...prev, post.canny_post_id]
                            })
                          }}
                        >
                          {selectedPosts.includes(post.canny_post_id) && <Check className="h-3 w-3" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(post.status)}>{post.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{post.score}</TableCell>
                      <TableCell className="text-right">{post.commentCount}</TableCell>
                      <TableCell>{post.author.name}</TableCell>
                      <TableCell>{new Date(post.created).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {post.project && (
                          <div 
                            className="flex items-center justify-center cursor-help text-muted-foreground hover:text-foreground transition-colors"
                            title={`Added to project: ${post.project.title}`}
                          >
                            <Folder className="h-4 w-4" />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {filteredAndSortedPosts.length} posts
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      <SelectProjectDialog
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
        onProjectSelect={async (projectId) => {
          try {
            console.log('Attempting to update posts:', { projectId, selectedPosts })

            // Get the selected project details for optimistic update
            const { data: projectData } = await supabase
              .from("projects")
              .select("id, title")
              .eq("id", projectId)
              .single()

            if (!projectData) {
              throw new Error('Project not found')
            }

            // Optimistically update the local data
            const updatedPosts = allPosts.map(post => {
              if (selectedPosts.includes(post.canny_post_id)) {
                return {
                  ...post,
                  project: projectData
                }
              }
              return post
            })
            setAllPosts(updatedPosts)

            // Make the actual update
            const { data, error } = await supabase
              .from("canny_posts")
              .update({ project_id: projectId })
              .in("canny_post_id", selectedPosts)

            console.log('Update result:', { data, error })

            if (error) throw error

            // Clear selected posts
            setSelectedPosts([])
            
            // Show success message
            toast({
              title: "Success",
              description: "Posts added to project successfully",
            })

            // Revalidate the posts data in the background
            mutatePosts()
          } catch (error) {
            console.error("Error updating posts:", error instanceof Error ? error.message : error)
            
            // Revert the optimistic update on error
            mutatePosts()
            
            throw error // This will be caught by the dialog component
          }
        }}
      />
    </div>
  )
}
