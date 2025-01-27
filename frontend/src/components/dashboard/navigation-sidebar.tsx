"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LogOut } from "lucide-react"
import { useSupabase } from "@/lib/supabase/hooks"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { NavigationConfig, NavItem } from "@/config/navigation"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface NavigationSidebarProps {
  navigation: NavigationConfig
}

export function NavigationSidebar({ navigation }: NavigationSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useSupabase()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.refresh()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const NavLink = ({ item }: { item: NavItem }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
            pathname === item.href ? "bg-accent" : "transparent"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      </TooltipTrigger>
      {item.description && (
        <TooltipContent>
          <p>{item.description}</p>
        </TooltipContent>
      )}
    </Tooltip>
  )

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="flex flex-col gap-1">
          {navigation.mainItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      </div>
      {/* Bottom Navigation - Fixed */}
      <div className="border-t p-4 bg-background">
        <nav className="flex flex-col gap-1">
          {navigation.bottomItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </Button>
        </nav>
      </div>
    </div>
  )
}
