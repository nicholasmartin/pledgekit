import Link from "next/link"
import { UserNav } from "./user-nav"

export function Header() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/dashboard" className="font-semibold">
          PledgeKit
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>
  )
}
