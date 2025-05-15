"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  ChevronDown,
  Globe,
  Grid3x3,
  LayoutDashboard,
  LogOut,
  Network,
  Search,
  Server,
  Settings,
  User,
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

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [notifications, setNotifications] = useState(3)

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
      } else if (subPath === "settings") {
        userPath = "/user-dashboard/help" // 一般用戶沒有設置，重定向到幫助
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
      title: "Settings",
      items: [
        {
          title: "System Settings",
          icon: Settings,
          href: "/dashboard/settings",
          isActive: pathname === "/dashboard/settings",
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                        {notifications}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-4 py-2 text-sm font-medium">Notifications</div>
                  <DropdownMenuSeparator />
                  <div className="p-2 text-sm">
                    <div className="mb-2 rounded-md p-2 hover:bg-muted">
                      <div className="font-medium">Server alert</div>
                      <div className="text-xs text-muted-foreground">10 minutes ago</div>
                    </div>
                    <div className="mb-2 rounded-md p-2 hover:bg-muted">
                      <div className="font-medium">Rack space low</div>
                      <div className="text-xs text-muted-foreground">2 hours ago</div>
                    </div>
                    <div className="rounded-md p-2 hover:bg-muted">
                      <div className="font-medium">IP pool depleted</div>
                      <div className="text-xs text-muted-foreground">Yesterday</div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
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
