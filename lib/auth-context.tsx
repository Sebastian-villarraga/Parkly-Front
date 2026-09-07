"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { Role } from "./types"
import type { BackendRole, User } from "./api/types"
import { authService } from "./api/services"
import { clearTokens, getAccessToken } from "./api/client"

export interface Session {
  role: Role
  name: string
  email: string
  complexId: string | null
  complexName: string | null
  user: User
}

const ROLE_HOME: Record<Role, string> = { super_admin: "/super-admin", admin: "/admin", security: "/security", resident: "/resident" }
const ROLE_MAP: Record<BackendRole, Role> = { SUPERADMIN: "super_admin", ADMIN: "admin", SECURITY: "security", RESIDENT: "resident" }

export function roleHome(role: Role) { return ROLE_HOME[role] }

function toSession(user: User): Session {
  return { role: ROLE_MAP[user.role], name: `${user.firstName} ${user.lastName}`, email: user.email, complexId: user.complexId, complexName: null, user }
}

interface AuthContextValue {
  session: Session | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  ready: boolean
  loading: boolean
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter()
  const [session, setSession] = React.useState<Session | null>(null)
  const [ready, setReady] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    let active = true
    const restore = async () => {
      if (!getAccessToken()) {
        if (active) setReady(true)
        return
      }
      try { const user = await authService.me(); if (active) setSession(toSession(user)) } catch { clearTokens() } finally { if (active) setReady(true) }
    }
    void restore()
    const onExpired = () => { setSession(null); router.replace("/login") }
    window.addEventListener("parkly:session-expired", onExpired)
    return () => { active = false; window.removeEventListener("parkly:session-expired", onExpired) }
  }, [router])

  const login = React.useCallback(async (email: string, password: string) => {
    setLoading(true)
    try { const result = await authService.login(email, password); setSession(toSession(result.user)); router.push(ROLE_HOME[ROLE_MAP[result.user.role]]) } finally { setLoading(false) }
  }, [router])

  const logout = React.useCallback(async () => { setSession(null); await authService.logout(); router.push("/login") }, [router])
  const value = React.useMemo(() => ({ session, login, logout, ready, loading }), [session, login, logout, ready, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
