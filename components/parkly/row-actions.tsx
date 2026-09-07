"use client"

import type { LucideIcon } from "lucide-react"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface RowAction {
  label: string
  icon?: LucideIcon
  onClick?: () => void
  variant?: "default" | "destructive"
  separatorBefore?: boolean
}

export function RowActions({ actions }: { actions: RowAction[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-8" aria-label="Acciones">
            <MoreHorizontal />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          {actions.map((action, i) => (
            <div key={i}>
              {action.separatorBefore && <DropdownMenuSeparator />}
              <DropdownMenuItem variant={action.variant} onClick={action.onClick}>
                {action.icon && <action.icon />}
                {action.label}
              </DropdownMenuItem>
            </div>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
