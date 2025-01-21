import { Heading } from "@/components/ui/heading"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({
  heading,
  text,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center">
      <div className="grid gap-1">
        <Heading size="h1">{heading}</Heading>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      {children && <div className="ml-auto">{children}</div>}
    </div>
  )
}
