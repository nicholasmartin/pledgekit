import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  separated?: boolean
}

export function PageHeader({
  className,
  children,
  separated,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between space-y-0 pb-4",
        separated && "pb-4 mb-4 border-b",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface PageHeaderHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: "default" | "sm"
}

export function PageHeaderHeading({
  className,
  size = "default",
  ...props
}: PageHeaderHeadingProps) {
  return (
    <h1
      className={cn(
        "font-semibold tracking-tight",
        size === "default" && "text-3xl md:text-4xl",
        size === "sm" && "text-2xl md:text-3xl",
        className
      )}
      {...props}
    />
  )
}

interface PageHeaderDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "default" | "sm"
}

export function PageHeaderDescription({
  className,
  size = "default",
  ...props
}: PageHeaderDescriptionProps) {
  return (
    <p
      className={cn(
        "text-muted-foreground",
        size === "default" && "text-lg",
        size === "sm" && "text-base",
        className
      )}
      {...props}
    />
  )
}
