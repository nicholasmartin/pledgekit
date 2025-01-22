import { createServerSupabase } from "@/lib/server-supabase"
import { SettingsForm } from "@/components/dashboard/company/settings-form"

export default async function SettingsPage() {
  const supabase = createServerSupabase()
  
  // Get the current user and company settings server-side
  const { data: { user } } = await supabase.auth.getUser()
  
  let initialSettings = {}
  let companyId: string | undefined
  if (user) {
    const { data: companyMember } = await supabase
      .from("company_members")
      .select("company_id")
      .eq("user_id", user.id)
      .single()
    
    if (companyMember?.company_id) {
      companyId = companyMember.company_id
      const { data: settings } = await supabase
        .from("company_settings")
        .select("*")
        .eq("company_id", companyMember.company_id)
        .single()
      
      if (settings) {
        initialSettings = settings
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Company Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your company settings and preferences
        </p>
      </div>
      <div className="divide-y divide-border rounded-md border">
        <SettingsForm 
          companyId={companyId!} 
          initialSettings={initialSettings} 
        />
      </div>
    </div>
  )
}
