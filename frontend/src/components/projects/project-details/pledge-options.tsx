'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/types/generated/database"
import type { PublicProject } from "@/types/domain/project/public"

type PledgeOption = Database['public']['Tables']['pledge_options']['Row']

interface PledgeOptionsProps {
  options: PledgeOption[]
  projectId: string
  project: PublicProject
  disabled?: boolean
}

export function PledgeOptions({
  options,
  projectId,
  project,
  disabled
}: PledgeOptionsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const isExpired = new Date(project.end_date) < new Date()

  useEffect(() => {
    // Check redirect status
    const query = new URLSearchParams(window.location.search)
    if (query.get('success')) {
      toast({
        title: "Payment successful!",
        description: "Thank you for your pledge.",
      })
    }
    if (query.get('canceled')) {
      toast({
        title: "Payment canceled",
        description: "Your pledge was not completed. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const handlePledge = async (pledgeOptionId: string) => {
    try {
      setIsLoading(pledgeOptionId)
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pledgeOptionId,
          projectId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  if (project.status !== 'published') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Project Not Available</h2>
        <p className="text-muted-foreground">
          This project is currently {project.status} and not accepting pledges.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Support this Project</h2>
      <div className="grid gap-4">
        {options.map((option) => (
          <Card key={option.id} className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{option.title}</h3>
                  {option.description && (
                    <p className="text-muted-foreground mt-1">{option.description}</p>
                  )}
                </div>
                <div className="text-xl font-bold">${option.amount}</div>
              </div>
              {option.benefits && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Benefits</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {(option.benefits as string[]).map((benefit, index) => (
                      <li key={index} className="text-sm">{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Button 
                onClick={() => handlePledge(option.id)}
                className="w-full"
                disabled={disabled || isExpired || isLoading === option.id}
              >
                {isExpired ? 'Project Ended' : 
                 isLoading === option.id ? 'Loading...' : 
                 `Pledge $${option.amount}`}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}