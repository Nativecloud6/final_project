"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  ChevronDown,
  Globe,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Network,
  Search,
  Server,
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
import { Badge } from "@/components/ui/badge"

interface UserDashboardLayoutProps {
  children: React.ReactNode
}

export function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [notifications, setNotifications] = useState(2)

  // 處理角色切換
  const switchToAdminMode = () => {
    // 將當前路徑轉換為管理員路徑
    let adminPath = "/dashboard"
    if (pathname.includes("/user-dashboard/")) {
      const subPath = pathname.split("/user-dashboard/")[1]
      if (subPath === "devices") {
        adminPath = "/dashboard/device-management"
      } else if (subPath === "ip-lookup") {
        adminPath = "/dashboard/ip-management"
      } else if (subPath === "services") {
        adminPath = "/dashboard/service-management"
      } else if (subPath === "search") {
        adminPath = "/dashboard/search"
      } else if (subPath === "help") {
        adminPath = "/dashboard/settings" // 管理員沒有幫助頁面，重定向到設置
      }
    }
    router.push(adminPath)
  }

  const navItems = [
    {
      title: "Main Features",
      items: [
        {
          title: "Dashboard",
          icon: LayoutDashboard,
          href: "/user-dashboard",
          isActive: pathname === "/user-dashboard",
        },
        {
          title: "Device Lookup",
          icon: Server,
          href: "/user-dashboard/devices",
          isActive: pathname === "/user-dashboard/devices",
        },
        {
          title: "IP Address Lookup",
          icon: Globe,
          href: "/user-dashboard/ip-lookup",
          isActive: pathname === "/user-dashboard/ip-lookup",
        },
        {
          title: "Service Status",
          icon: Network,
          href: "/user-dashboard/services",
          isActive: pathname === "/user-dashboard/services",
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
      title: "Support",
      items: [
        {
          title: "Help Center",
          icon: HelpCircle,
          href: "/user-dashboard/help",
          isActive: pathname === "/user-dashboard/help",
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
                      <div className="font-medium">Service Maintenance Notice</div>
                      <div className="text-xs text-muted-foreground">30 minutes ago</div>
                    </div>
                    <div className="rounded-md p-2 hover:bg-muted">
                      <div className="font-medium">IP Address Assignment Update</div>
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
                      <AvatarFallback>GU</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      General User
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
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
