import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({
  className,
  size = "md",
  ...props
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  return (
    <div
      className={cn("animate-spin", sizeClasses[size], className)}
      {...props}
    >
      <div className="w-full h-full rounded-full border-2 border-current border-t-transparent" />
    </div>
  )
}
