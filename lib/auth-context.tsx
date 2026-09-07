"use client"

// MVP demo authentication. This is intentionally client-side and role-based so it
// can be swapped for real role-based auth (Supabase / Better Auth) without changing
// the consuming components: they only read `session` from this context.

import * as React from "react"
import { useRouter } from "next/navigation"
import type { Role } from "./types"
import { DEFAULT_COMPLEX_ID, getComplex, getDataset } from "./mock-data"

export interface Session {
  role: Role
  name: string
  email: string
  complexId: string | null
  complexName: string | null
  residentId?: string
}

export interface DemoAccount {
  role: Role
  label: string
  name: string
  email: string
  description: string
}

const nogales = getComplex(DEFAULT_COMPLEX_ID)
const demoResident = getDataset(DEFAULT_COMPLEX_ID).residents.find((r) => r.status === "active")!

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "super_admin",
    label: "Super Administrador",
    name: "Ana María Vélez",
    email: "ana.velez@parkly.co",
    description: "Administra toda la plataforma Parkly, conjuntos y suscripciones.",
  },
  {
    role: "admin",
    label: "Administrador del Conjunto",
    name: nogales.contactName,
    email: nogales.contactEmail,
    description: "Gestiona residentes, parqueaderos y operación de Los Nogales.",
  },
  {
    role: "security",
    label: "Personal de Seguridad",
    name: "Carlos Mendoza",
    email: "seguridad@losnogales.co",
    description: "Control de acceso, validación de vehículos y visitantes.",
  },
  {
    role: "resident",
    label: "Residente",
    name: demoResident.name,
    email: demoResident.email,
    description: "Portal del residente: vehículos, parqueadero, reservas y pagos.",
  },
]

const ROLE_HOME: Record<Role, string> = {
  super_admin: "/super-admin",
  admin: "/admin",
  security: "/security",
  resident: "/resident",
}

export function roleHome(role: Role) {
  return ROLE_HOME[role]
}

function sessionForRole(role: Role): Session {
  const account = DEMO_ACCOUNTS.find((a) => a.role === role)!
  if (role === "super_admin") {
    return { role, name: account.name, email: account.email, complexId: null, complexName: null }
  }
  return {
    role,
    name: account.name,
    email: account.email,
    complexId: DEFAULT_COMPLEX_ID,
    complexName: nogales.name,
    residentId: role === "resident" ? demoResident.id : undefined,
  }
}

interface AuthContextValue {
  session: Session | null
  login: (role: Role) => void
  logout: () => void
  ready: boolean
}

const AuthContext = React.createContext<AuthContextValue | null>(null)
const STORAGE_KEY = "parkly.session"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = React.useState<Session | null>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSession(JSON.parse(raw))
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  const login = React.useCallback(
    (role: Role) => {
      const next = sessionForRole(role)
      setSession(next)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      router.push(ROLE_HOME[role])
    },
    [router],
  )

  const logout = React.useCallback(() => {
    setSession(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ session, login, logout, ready }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
