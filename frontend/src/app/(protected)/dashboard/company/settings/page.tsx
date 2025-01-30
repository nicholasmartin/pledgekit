import { createServer } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/dashboard/company/settings-form"
import { getUser } from "@/lib/supabase/server/auth"

export default async function SettingsPage() {
  const supabase = createServer()
  const user = await getUser(supabase)
  
  // We know user exists because we're in a protected route
  if (!user) throw new Error("User not found in protected route")
  
  // Get the company_id for the current user from company_members table
  const { data: companyMember, error: memberError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single()

  if (memberError) {
    if (memberError.code !== 'PGRST116') {
      console.error('Error fetching company member:', memberError)
    }
    return (
      <div className="p-4 text-red-600">
        You must be part of a company to view settings.
      </div>
    )
  }

  if (!companyMember?.company_id) {
    return (
      <div className="p-4 text-red-600">
        No company found. Please contact support if this is unexpected.
      </div>
    )
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Company Settings & Integrations</h2>
      </div>
      
      <SettingsForm 
        companyId={companyMember.company_id} 
        initialSettings={settings || {}} 
      />
    </div>
  )
}
