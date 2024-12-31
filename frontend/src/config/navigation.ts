import {
  LayoutDashboard,
  ListTodo,
  Users,
  Settings,
  LineChart,
  Wallet,
  UserCircle,
  Heart,
} from "lucide-react"
import { LucideIcon } from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export interface NavigationConfig {
  mainItems: NavItem[]
  bottomItems: NavItem[]
}

export const companyNavigation: NavigationConfig = {
  mainItems: [
    {
      title: "Dashboard",
      href: "/dashboard/company",
      icon: LayoutDashboard,
      description: "Get an overview of your projects and performance",
    },
    {
      title: "Projects",
      href: "/dashboard/company/projects",
      icon: ListTodo,
      description: "Manage your project campaigns",
    },
    {
      title: "Analytics",
      href: "/dashboard/company/analytics",
      icon: LineChart,
      description: "View detailed analytics and insights",
    },
    {
      title: "Users",
      href: "/dashboard/company/users",
      icon: Users,
      description: "Manage user access and roles",
    },
  ],
  bottomItems: [
    {
      title: "Settings",
      href: "/dashboard/company/settings",
      icon: Settings,
      description: "Manage your company settings",
    },
  ],
}

export const userNavigation: NavigationConfig = {
  mainItems: [
    {
      title: "Dashboard",
      href: "/dashboard/user",
      icon: LayoutDashboard,
      description: "View your pledges and activity",
    },
    {
      title: "My Pledges",
      href: "/dashboard/user/pledges",
      icon: Wallet,
      description: "Manage your active pledges",
    },
    {
      title: "Watchlist",
      href: "/dashboard/user/watchlist",
      icon: Heart,
      description: "View your saved projects",
    },
  ],
  bottomItems: [
    {
      title: "Profile",
      href: "/dashboard/user/profile",
      icon: UserCircle,
      description: "Manage your profile settings",
    },
  ],
}
