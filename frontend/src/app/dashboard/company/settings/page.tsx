"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { EyeIcon, EyeOffIcon } from "lucide-react"

export default function SettingsPage() {
  const [cannyApiKey, setCannyApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const getCompanyId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: companyMember } = await supabase
          .from("company_members")
          .select("company_id")
          .eq("user_id", user.id)
          .single()
        
        if (companyMember) {
          setCompanyId(companyMember.company_id)
          
          // Fetch existing settings
          const { data: settings } = await supabase
            .from("company_settings")
            .select("canny_api_key")
            .eq("company_id", companyMember.company_id)
            .single()
          
          if (settings?.canny_api_key) {
            setCannyApiKey(settings.canny_api_key)
          }
        }
      }
    }

    getCompanyId()
  }, [supabase])

  const saveCannyApiKey = async () => {
    if (!companyId) {
      toast({
        title: "Error",
        description: "Company ID not found. Please try refreshing the page.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from("company_settings")
        .upsert({ 
          company_id: companyId,
          canny_api_key: cannyApiKey,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Canny API key has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving Canny API key:", error)
      toast({
        title: "Error",
        description: "Failed to save Canny API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your company settings and integrations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Canny Integration</CardTitle>
          <CardDescription>
            Connect your Canny account to enable feature request management. You can find your API key in your Canny company settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your Canny API key"
                  value={cannyApiKey}
                  onChange={(e) => setCannyApiKey(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowApiKey(!showApiKey)}
                type="button"
              >
                {showApiKey ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button 
              onClick={saveCannyApiKey} 
              disabled={!cannyApiKey || isLoading || !companyId}
            >
              {isLoading ? "Saving..." : "Save API Key"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
