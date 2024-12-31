"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
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
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          PledgeKit
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 space-y-4 p-4">
        <nav className="flex flex-col gap-1">
          {navigation.mainItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t p-4">
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
