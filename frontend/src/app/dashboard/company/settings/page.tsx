import { createServer, getUser } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/dashboard/company/settings-form"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function SettingsPage() {
  // Call cookies() before any Supabase calls
  cookies()
  
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }

  const supabase = createServer()
  
  // Get the company membership and settings
  const { data: companyMember, error: memberError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single()
  
  if (memberError) {
    if (memberError.code !== 'PGRST116') {
      console.error('Error fetching company member:', memberError)
    }
    return <div>You must be part of a company to access settings.</div>
  }

  if (!companyMember?.company_id) {
    return <div>No company found. Please contact support if this is unexpected.</div>
  }

  const { data: settings, error: settingsError } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", companyMember.company_id)
    .single()
  
  if (settingsError && settingsError.code !== 'PGRST116') {
    console.error('Error fetching company settings:', settingsError)
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
          companyId={companyMember.company_id} 
          initialSettings={settings || {}} 
        />
      </div>
    </div>
  )
}
