"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronsUpDown, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { ParklyLogo } from "@/components/parkly/logo"
import { ThemeToggle } from "@/components/parkly/theme-toggle"
import { NotificationsMenu } from "@/components/parkly/notifications-menu"
import { useAuth } from "@/lib/auth-context"
import { NAV_BY_ROLE, ROLE_LABEL } from "@/lib/nav-config"
import type { NotificationItem, Role } from "@/lib/types"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function isActive(pathname: string, href: string) {
  if (pathname === href) return true
  const segments = href.split("/").filter(Boolean)
  if (segments.length > 1) return pathname.startsWith(href + "/")
  return false
}

export function AppShell({
  role,
  notifications = [],
  children,
}: {
  role: Role
  notifications?: NotificationItem[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { session, logout } = useAuth()
  const groups = NAV_BY_ROLE[role]

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex h-10 items-center px-1 group-data-[collapsible=icon]:justify-center">
            <ParklyLogo size="sm" className="group-data-[collapsible=icon]:hidden" />
            <ParklyLogo size="sm" showText={false} className="hidden group-data-[collapsible=icon]:flex" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          {groups.map((group, i) => (
            <SidebarGroup key={i}>
              {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive(pathname, item.href)}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          {session && (
            <div className="flex items-center gap-2 px-1 py-1 group-data-[collapsible=icon]:justify-center">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                  {initials(session.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium">{session.name}</span>
                <span className="truncate text-xs text-muted-foreground">{ROLE_LABEL[role]}</span>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur sm:px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-5" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium leading-tight">
              {session?.complexName ?? "Plataforma Parkly"}
            </span>
            <span className="truncate text-xs text-muted-foreground leading-tight">
              {ROLE_LABEL[role]}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-0.5">
            <NotificationsMenu items={notifications} />
            <ThemeToggle />
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition-colors hover:bg-accent">
                      <Avatar className="size-7 rounded-md">
                        <AvatarFallback className="rounded-md bg-primary/10 text-xs font-semibold text-primary">
                          {initials(session.name)}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronsUpDown className="hidden size-3.5 text-muted-foreground sm:block" />
                    </button>
                  }
                />
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{session.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">{session.email}</span>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem variant="destructive" onClick={logout}>
                      <LogOut />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        <main className={cn("flex-1 p-4 sm:p-6", role === "resident" && "pb-24 md:pb-6")}>
          {children}
        </main>
        {role === "resident" && <ResidentBottomNav pathname={pathname} />}
      </SidebarInset>
    </SidebarProvider>
  )
}

function ResidentBottomNav({ pathname }: { pathname: string }) {
  const items = NAV_BY_ROLE.resident[0].items.slice(0, 5)
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-background/95 py-1.5 backdrop-blur md:hidden">
      {items.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-md py-1 text-[11px]",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-5" />
            <span className="truncate">{item.title.replace("Mis ", "").replace("Mi ", "")}</span>
          </Link>
        )
      })}
    </nav>
  )
}
