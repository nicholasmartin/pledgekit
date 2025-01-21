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
        <div className="fixed left-0" style={{ top: 'var(--top-nav-height)', height: 'calc(100vh - var(--top-nav-height))' }}>
          <NavigationWrapper />
        </div>
        <div className="flex-1 ml-64" style={{ marginTop: 'var(--top-nav-height)' }}>
          <main className="h-[calc(100vh-var(--top-nav-height))] overflow-y-auto flex justify-center">
            <div className="content-container py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
