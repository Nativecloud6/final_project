"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  Globe,
  LayoutDashboard,
  LogOut,
  Network,
  Search,
  Server,
  Settings,
  UserCog,
  ServerCrash,
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
import { Badge } from "@/components/ui/badge"
import { NotificationDropdown } from "@/components/notification-dropdown"

interface UserDashboardLayoutProps {
  children: React.ReactNode
}

export function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  const switchToAdminMode = () => {
    // 將當前路徑轉換為管理員路徑
    let adminPath = "/dashboard"
    if (pathname.includes("/user-dashboard/")) {
      const subPath = pathname.split("/user-dashboard/")[1]
      if (subPath === "device-management") {
        adminPath = "/dashboard/device-management"
      } else if (subPath === "ip-management") {
        adminPath = "/dashboard/ip-management"
      } else if (subPath === "service-management") {
        adminPath = "/dashboard/service-management"
      } else if (subPath === "rack-management") {
        adminPath = "/dashboard/rack-management"
      } else if (subPath === "search") {
        adminPath = "/dashboard/search"
      } else if (subPath === "account-settings") {
        adminPath = "/dashboard/account-settings"
      }
    }
    router.push(adminPath)
  }

  // 更新導航項目，添加機櫃管理、設備管理和IP管理
  const navItems = [
    {
      title: "Dashboard",
      items: [
        {
          title: "Overview",
          icon: LayoutDashboard,
          href: "/user-dashboard",
          isActive: pathname === "/user-dashboard",
        },
        {
          title: "Search",
          icon: Search,
          href: "/user-dashboard/search",
          isActive: pathname === "/user-dashboard/search",
        },
      ],
    },
    {
      title: "Infrastructure",
      items: [
        {
          title: "Rack Management",
          icon: ServerCrash,
          href: "/user-dashboard/rack-management",
          isActive: pathname === "/user-dashboard/rack-management",
        },
        {
          title: "Device Management",
          icon: Server,
          href: "/user-dashboard/device-management",
          isActive: pathname === "/user-dashboard/device-management",
        },
        {
          title: "IP Management",
          icon: Globe,
          href: "/user-dashboard/ip-management",
          isActive: pathname === "/user-dashboard/ip-management",
        },
        {
          title: "Service Management",
          icon: Network,
          href: "/user-dashboard/service-management",
          isActive: pathname === "/user-dashboard/service-management",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          title: "Account Settings",
          icon: Settings,
          href: "/user-dashboard/account-settings",
          isActive: pathname === "/user-dashboard/account-settings",
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
            <div className="font-semibold">Data Center Management System - User Mode</div>
            <Badge variant="outline" className="ml-2 bg-blue-900/20 text-blue-300 border-blue-800">
              General User
            </Badge>
            <div className="ml-auto flex items-center gap-4">
              <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>GU</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      General User
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/user-dashboard/account-settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={switchToAdminMode}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Switch to Admin Mode
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
