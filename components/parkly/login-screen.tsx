"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Building2, Car, ShieldCheck, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { ParklyLogo, ParklyMark } from "@/components/parkly/logo"
import { useAuth, DEMO_ACCOUNTS, roleHome } from "@/lib/auth-context"
import type { Role } from "@/lib/types"
import { cn } from "@/lib/utils"

const ROLE_ICON: Record<Role, typeof User> = {
  super_admin: Building2,
  admin: Users,
  security: ShieldCheck,
  resident: User,
}

const HIGHLIGHTS = [
  "Gestión visual de parqueaderos en tiempo real",
  "Control de acceso para porteros y visitantes",
  "Sorteos, reservas y asignaciones automatizadas",
  "Multi-conjunto, multi-torre y roles por usuario",
]

export function LoginScreen() {
  const { session, login, ready } = useAuth()
  const router = useRouter()
  const [selected, setSelected] = React.useState<Role>("admin")

  React.useEffect(() => {
    if (ready && session) router.replace(roleHome(session.role))
  }, [ready, session, router])

  const account = DEMO_ACCOUNTS.find((a) => a.role === selected)!

  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-2.5">
          <ParklyMark className="size-9 bg-primary-foreground text-primary" />
          <span className="text-xl font-semibold tracking-tight">Parkly</span>
        </div>

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight">
              Gestión inteligente de parqueaderos
            </h1>
            <p className="max-w-md text-pretty text-primary-foreground/80">
              La plataforma para administrar parqueaderos, residentes, vehículos y control de
              acceso de conjuntos residenciales desde un solo lugar.
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary-foreground/15">
                  <Car className="size-3" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/60">
          © 2026 Parkly · Plataforma SaaS para conjuntos residenciales
        </p>
      </aside>

      {/* Auth panel */}
      <main className="flex flex-1 items-center justify-center p-5 sm:p-8">
        <div className="flex w-full max-w-md flex-col gap-6">
          <div className="flex flex-col items-center gap-2 lg:hidden">
            <ParklyLogo size="lg" />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground">
              Ingresa a tu panel de Parkly para gestionar tu conjunto.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              login(selected)
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input id="email" type="email" value={account.email} readOnly autoComplete="email" />
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <button type="button" className="text-xs text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <Input id="password" type="password" defaultValue="parkly-demo" autoComplete="current-password" />
              </Field>
              <div className="flex items-center gap-2">
                <Checkbox id="remember" defaultChecked />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                  Recordarme en este dispositivo
                </Label>
              </div>
              <Button type="submit" className="w-full">
                Ingresar como {account.label}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </FieldGroup>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">Cuentas de demostración</span>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {DEMO_ACCOUNTS.map((a) => {
              const Icon = ROLE_ICON[a.role]
              const active = selected === a.role
              return (
                <button
                  key={a.role}
                  type="button"
                  onClick={() => setSelected(a.role)}
                  onDoubleClick={() => login(a.role)}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40 hover:bg-accent/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm font-medium leading-tight">{a.label}</span>
                  <span className="text-xs leading-snug text-muted-foreground">{a.name}</span>
                </button>
              )
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Selecciona un rol y presiona ingresar. El selector de roles es solo para la demo del MVP.
          </p>
        </div>
      </main>
    </div>
  )
}
