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
  icon?: LucideIcon
  description?: string
  disabled?: boolean
}

export interface NavigationConfig {
  mainItems: NavItem[]
  bottomItems: NavItem[]
}

export const publicNavigation = {
  mainItems: [
    {
      title: "How it Works",
      href: "/how-it-works",
    },
    {
      title: "Explore",
      href: "/explore",
    }
  ]
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
      href: "#",
      icon: LineChart,
      description: "View detailed analytics and insights",
      disabled: true
    },
    {
      title: "Users",
      href: "#",
      icon: Users,
      description: "Manage user access and roles",
      disabled: true
    },
    {
      title: "Feature Requests",
      href: "/dashboard/company/feature-requests",
      icon: Heart,
      description: "View and manage feature requests from Canny",
    },
    {
      title: "Settings",
      href: "/dashboard/company/settings",
      icon: Settings,
      description: "Configure your company settings and integrations",
    },
  ],
  bottomItems: [], // Removed duplicate Settings from bottom navigation
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
