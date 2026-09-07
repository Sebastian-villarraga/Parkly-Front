"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { relativeTime } from "@/lib/format"
import type { NotificationItem } from "@/lib/types"
import { cn } from "@/lib/utils"

export function NotificationsMenu({ items }: { items: NotificationItem[] }) {
  const [notifications, setNotifications] = React.useState(items)
  const unread = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
            <Bell />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                {unread}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-sm font-semibold">Notificaciones</span>
          {unread > 0 && (
            <button
              className="text-xs text-primary hover:underline"
              onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
        <ScrollArea className="h-80">
          <div className="flex flex-col">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() =>
                  setNotifications((prev) =>
                    prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                  )
                }
                className="flex gap-3 border-t border-border px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
              >
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    n.read ? "bg-transparent" : "bg-primary",
                  )}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium leading-tight text-foreground">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.description}</span>
                  <span className="text-[11px] text-muted-foreground/70">{relativeTime(n.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
