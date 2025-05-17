"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  Globe,
  Grid3x3,
  LayoutDashboard,
  LogOut,
  Network,
  Search,
  Server,
  Settings,
  UserCog,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DCMLogo } from "@/components/dcm-logo"
import { NotificationDropdown } from "@/components/notification-dropdown"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  // 處理角色切換
  const switchToUserMode = () => {
    // 將當前路徑轉換為用戶路徑
    let userPath = "/user-dashboard"
    if (pathname.includes("/dashboard/")) {
      const subPath = pathname.split("/dashboard/")[1]
      if (subPath === "rack-management") {
        userPath = "/user-dashboard/devices" // 一般用戶沒有機架管理，重定向到設備
      } else if (subPath === "device-management") {
        userPath = "/user-dashboard/devices"
      } else if (subPath === "ip-management") {
        userPath = "/user-dashboard/ip-lookup"
      } else if (subPath === "service-management") {
        userPath = "/user-dashboard/services"
      } else if (subPath === "search") {
        userPath = "/user-dashboard/search"
      } else if (subPath === "account-settings") {
        userPath = "/user-dashboard/account-settings"
      }
    }
    router.push(userPath)
  }

  const navItems = [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
          isActive: pathname === "/dashboard",
        },
        {
          title: "Rack Management",
          icon: Grid3x3,
          href: "/dashboard/rack-management",
          isActive: pathname === "/dashboard/rack-management",
        },
        {
          title: "Device Management",
          icon: Server,
          href: "/dashboard/device-management",
          isActive: pathname === "/dashboard/device-management",
        },
        {
          title: "IP Management",
          icon: Globe,
          href: "/dashboard/ip-management",
          isActive: pathname === "/dashboard/ip-management",
        },
        {
          title: "Service Management",
          icon: Network,
          href: "/dashboard/service-management",
          isActive: pathname === "/dashboard/service-management",
        },
        {
          title: "Search",
          icon: Search,
          href: "/dashboard/search",
          isActive: pathname === "/dashboard/search",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          title: "Account Settings",
          icon: Settings,
          href: "/dashboard/account-settings",
          isActive: pathname === "/dashboard/account-settings",
        },
      ],
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="border-r" variant="sidebar" collapsible="icon">
          <SidebarHeader className="border-b">
            <div className="flex h-14 items-center px-4 justify-center group-data-[collapsible=icon]:justify-center">
              <div className="group-data-[collapsible=icon]:hidden">
                <DCMLogo showText={true} />
              </div>
              <div className="hidden group-data-[collapsible=icon]:block">
                <DCMLogo showText={false} size="sm" />
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="bg-sidebar text-sidebar-foreground">
            {navItems.map((section) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel className="text-gray-400">{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.isActive}
                          className="hover:bg-[#374a5e] data-[active=true]:bg-[#374a5e]"
                        >
                          <Link href={item.href}>
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-1 flex-col w-full overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 w-full">
            <SidebarTrigger />
            <div className="font-semibold">Data Center Management System</div>
            <div className="ml-auto flex items-center gap-4">
              <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      Admin User
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account-settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={switchToUserMode}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Switch to User Mode
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto content-area p-4 lg:p-6 pb-8 w-full max-w-none">
            <div className="w-full max-w-none">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
