import { cn } from "@/lib/utils"
import React from "react"

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  size?: "h1" | "h2" | "h3" | "h4"
}

export function Heading({ children, className, size = "h1", ...props }: HeadingProps) {
  const sizeClasses = {
    h1: "text-3xl",
    h2: "text-2xl",
    h3: "text-xl",
    h4: "text-lg",
  }

  return (
    <h1
      className={cn(
        "font-bold tracking-tight text-gray-900",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </h1>
  )
}
