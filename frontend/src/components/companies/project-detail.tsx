"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import ChevronLeft from "@/components/icons/chevron-left"

interface Project {
  id: string
  title: string
  description: string | null
  goal: number
  amount_pledged: number
  end_date: string
  header_image_url: string | null
  status: 'draft' | 'published' | 'completed' | 'cancelled'
  pledge_options: Array<{
    id: string
    title: string
    amount: number
    benefits: string[]
  }>
}

interface Company {
  id: string
  name: string
  slug: string
}

interface Props {
  project: Project
  company: Company
}

export function ProjectDetail({ project, company }: Props) {
  const [newComment, setNewComment] = useState("")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getProgressPercentage = (pledged: number, goal: number) => {
    return Math.min(Math.round((pledged / goal) * 100), 100)
  }

  // Mock comments data for UI
  const mockComments = [
    {
      id: 1,
      user: {
        name: "Alice Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      },
      content: "This feature would be amazing! I've been waiting for something like this.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isPledger: true,
    },
    {
      id: 2,
      user: {
        name: "Bob Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      },
      content: "Looking forward to seeing this implemented. The benefits look great!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isPledger: false,
    },
  ]

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="space-y-8">
        {/* Back Link */}
        <Link
          href={`/companies/${company.slug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{project.title}</h1>
          <p className="text-lg text-muted-foreground">by {company.name}</p>
        </div>

        {/* Project Image */}
        {project.header_image_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={project.header_image_url}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Description and Comments */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">About this project</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {project.description || "No description provided"}
              </p>
            </Card>

            {/* Comments Section */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Comments</h2>
              
              {/* New Comment Form */}
              <div className="space-y-4 mb-8">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button>Post Comment</Button>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {mockComments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={comment.user.avatar} />
                      <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{comment.user.name}</span>
                        {comment.isPledger && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Pledger
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Pledge Options Sidebar */}
          <div className="space-y-4">
            {/* Progress Card */}
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{formatCurrency(project.amount_pledged)}</span>
                  <span>of {formatCurrency(project.goal)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${getProgressPercentage(project.amount_pledged, project.goal)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{getProgressPercentage(project.amount_pledged, project.goal)}% funded</span>
                  <span>Ends {new Date(project.end_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </Card>

            {/* Pledge Options */}
            {project.pledge_options.map((option) => (
              <Card key={option.id} className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{option.title}</h3>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(option.amount)}</p>
                </div>
                {option.benefits && option.benefits.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Includes:</h4>
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                      {option.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button className="w-full">Back this project</Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
