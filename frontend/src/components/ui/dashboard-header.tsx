import { cn } from "@/lib/utils"
import { Heading } from "@/components/ui/heading"

interface DashboardHeaderProps {
  /** Main heading text for the dashboard page */
  heading: string
  /** Optional subtext to display below the heading */
  text?: string
  /** Optional children to render on the right side of the header */
  children?: React.ReactNode
  /** Optional className for custom styling */
  className?: string
}

/**
 * DashboardHeader component
 * 
 * Used to display consistent page headers within dashboard pages.
 * Includes support for a main heading, optional subtext, and optional
 * right-aligned content (e.g., action buttons).
 * 
 * @example
 * ```tsx
 * <DashboardHeader
 *   heading="Projects"
 *   text="Manage your project campaigns"
 * >
 *   <Button>New Project</Button>
 * </DashboardHeader>
 * ```
 */
export function DashboardHeader({
  heading,
  text,
  children,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="grid gap-1">
        <Heading size="h1">{heading}</Heading>
        {text && (
          <p className="text-muted-foreground">{text}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
