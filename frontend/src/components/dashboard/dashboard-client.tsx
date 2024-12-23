"use client"

interface DashboardClientProps {
  children: React.ReactNode
}

export function DashboardClient({ children }: DashboardClientProps) {
  return <>{children}</>
}