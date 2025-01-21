import { NavigationWrapper } from "@/components/dashboard/navigation-wrapper"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Header } from "@/components/dashboard/header"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <TooltipProvider>
      <div className="grid min-h-screen grid-cols-[auto_1fr]">
        <NavigationWrapper />
        <div className="flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="container py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
