"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ListTodo,
  Users,
  Settings,
  LogOut,
  PlusSquare,
  LineChart,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: ListTodo,
  },
  {
    title: "Create Project",
    href: "/dashboard/projects/new",
    icon: PlusSquare,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: LineChart,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast({
        title: "Signed out successfully",
      })
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error signing out",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen flex-col justify-between border-r bg-background px-4 py-6">
      <div>
        <div className="flex h-14 items-center px-2 font-semibold">
          Feature Pledger
        </div>
        <div className="space-y-1 py-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        className="flex w-full items-center gap-3 px-3"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  )
}
