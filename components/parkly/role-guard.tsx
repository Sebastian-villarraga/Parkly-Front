"use client"

// Client-side role gate for the MVP. Real backend authorization (middleware +
// server checks) can replace this without touching page components.

import * as React from "react"
import { useRouter } from "next/navigation"
import { roleHome, useAuth } from "@/lib/auth-context"
import type { Role } from "@/lib/types"
import { ParklyMark } from "@/components/parkly/logo"

export function RoleGuard({ role, children }: Readonly<{ role: Role; children: React.ReactNode }>) {
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

  if (ready && session && session.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <div className="flex max-w-sm flex-col gap-2">
          <ParklyMark className="mx-auto size-10" />
          <h1 className="text-lg font-semibold">Acceso denegado</h1>
          <p className="text-sm text-muted-foreground">Tu cuenta no tiene permisos para consultar esta sección.</p>
        </div>
      </div>
    )
  }

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <ParklyMark className="size-10 animate-pulse" />
      </div>
    )
  }

  return <>{children}</>
}
