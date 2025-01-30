/**
 * Public Layout
 * 
 * This layout wraps all public routes that don't require authentication.
 * It provides a consistent structure with navigation and footer while using
 * minimal providers to keep the bundle size small for public pages.
 * 
 * Key features:
 * - Uses BaseProviders instead of full auth providers
 * - Includes MainNav for consistent navigation
 * - Adds Footer component
 * - Maintains proper spacing with min-height
 * 
 * Route group: (public)
 * Applied to: Landing page, login, register, public content
 */

import { BaseProviders } from "@/components/providers/base-providers"
import { MainNav } from "@/components/navigation/main-nav"
import { Footer } from "@/components/navigation/footer"

/**
 * Public layout that provides the base structure for unauthenticated routes.
 * Uses BaseProviders instead of full Providers to avoid unnecessary auth checks.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BaseProviders>
      <div className="relative min-h-screen">
        {/* MainNav handles its own auth state gracefully */}
        <MainNav />
        
        {/* Main content with padding for footer */}
        <main className="pb-16">
          {children}
        </main>
        
        {/* Footer absolutely positioned at bottom */}
        <Footer className="absolute bottom-0 w-full" />
      </div>
    </BaseProviders>
  )
}
