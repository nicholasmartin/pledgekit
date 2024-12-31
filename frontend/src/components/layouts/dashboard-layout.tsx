import { NavigationWrapper } from "@/components/dashboard/navigation-wrapper"
import { TooltipProvider } from "@/components/ui/tooltip"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <NavigationWrapper />
        <div className="flex-1">
          <main className="container py-6">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
