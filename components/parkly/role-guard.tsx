"use client"

// Client-side role gate for the MVP. Real backend authorization (middleware +
// server checks) can replace this without touching page components.

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { roleHome } from "@/lib/auth-context"
import type { Role } from "@/lib/types"
import { ParklyMark } from "@/components/parkly/logo"

export function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter()
  const { session, ready } = useAuth()

  React.useEffect(() => {
    if (!ready) return
    if (!session) {
      router.replace("/login")
    } else if (session.role !== role) {
      router.replace(roleHome(session.role))
    }
  }, [ready, session, role, router])

  if (!ready || !session || session.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <ParklyMark className="size-10 animate-pulse" />
      </div>
    )
  }

  return <>{children}</>
}
