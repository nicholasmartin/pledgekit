import Link from "next/link"
import { UserNav } from "./user-nav"

export function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 border-b bg-background z-10">
      <div className="content-container flex h-16 items-center justify-between">
        <div className="ml-64">
          <Link href="/dashboard" className="font-semibold">
            PledgeKit
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>
  )
}
