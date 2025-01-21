"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Globe, Copy, Twitter, Linkedin, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PublicPageCardProps {
  companySlug: string
}

export function PublicPageCard({ companySlug }: PublicPageCardProps) {
  const { toast } = useToast()
  const [publicUrl, setPublicUrl] = useState<string>('')

  useEffect(() => {
    // Use environment variable if set, otherwise use window.location.origin
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    setPublicUrl(`${baseUrl}/companies/${companySlug}`)
  }, [companySlug])

  if (!publicUrl) return null

  return (
    <Card>
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Public Projects Page
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Share your public projects page with your community
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(publicUrl, '_blank')}
            >
              Preview Page
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <code className="flex-1 p-3 bg-muted rounded-md text-sm">
            {publicUrl}
          </code>
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.open(publicUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(publicUrl)
              toast({
                title: "URL Copied",
                description: "The public URL has been copied to your clipboard",
              })
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.open(
                `https://twitter.com/intent/tweet?text=Check out our projects on PledgeKit&url=${encodeURIComponent(publicUrl)}`,
                '_blank'
              )
            }}
          >
            <Twitter className="h-4 w-4 mr-2" />
            Share on Twitter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.open(
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`,
                '_blank'
              )
            }}
          >
            <Linkedin className="h-4 w-4 mr-2" />
            Share on LinkedIn
          </Button>
        </div>
      </div>
    </Card>
  )
}
