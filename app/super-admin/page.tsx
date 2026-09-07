"use client"

import * as React from "react"
import { Building2, CheckCircle2, Clock, PauseCircle, ScrollText } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/parkly/empty-state"
import { PageHeader } from "@/components/parkly/page-header"
import { StatCard } from "@/components/parkly/stat-card"
import { StatusBadge } from "@/components/parkly/status-badge"
import { auditService, complexesService, plansService } from "@/lib/api/services"
import type { AuditLog, Complex, Plan } from "@/lib/api/types"
import { formatCOP, formatNumber } from "@/lib/format"

export default function SuperAdminDashboard() {
  const [complexes, setComplexes] = React.useState<Complex[]>([])
  const [plans, setPlans] = React.useState<Plan[]>([])
  const [audit, setAudit] = React.useState<AuditLog[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([complexesService.list(), plansService.list(), auditService.platform()])
      .then(([complexList, planList, auditList]) => {
        setComplexes(complexList)
        setPlans(planList)
        setAudit(auditList)
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false))
  }, [])

  const activeComplexes = complexes.filter((complex) => complex.status === "ACTIVE").length
  const suspendedComplexes = complexes.filter((complex) => complex.status === "SUSPENDED").length
  const totalApartments = complexes.reduce((total, complex) => total + complex.numberOfApartments, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Panel de la plataforma"
        description="Resumen general de Parkly y todos los conjuntos residenciales."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Conjuntos totales" value={loading ? "-" : complexes.length} icon={Building2} tone="primary" />
        <StatCard label="Activos" value={loading ? "-" : activeComplexes} icon={CheckCircle2} tone="success" />
        <StatCard label="Apartamentos" value={loading ? "-" : formatNumber(totalApartments)} icon={Clock} tone="info" />
        <StatCard label="Suspendidos" value={loading ? "-" : suspendedComplexes} icon={PauseCircle} tone="danger" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conjuntos registrados</CardTitle>
            <CardDescription>Datos actuales de la plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {!loading && complexes.length === 0 && (
              <EmptyState
                icon={Building2}
                title="No hay conjuntos registrados"
                description="Crea el primer conjunto desde el módulo de complejos."
              />
            )}
            {complexes.map((complex) => (
              <div key={complex.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/40">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-[18px]" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{complex.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {complex.city} · {complex.numberOfApartments} apartamentos
                  </span>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={complex.status.toLowerCase()} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>Auditoría global.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {audit.length === 0 && !loading && <EmptyState icon={ScrollText} title="Sin actividad reciente" />}
            {audit.slice(0, 6).map((event) => (
              <div key={event.id} className="flex gap-3">
                <ScrollText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{event.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.entity} · {new Date(event.createdAt).toLocaleString("es-CO")}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planes activos</CardTitle>
          <CardDescription>Oferta comercial configurada en Parkly.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {plans.length === 0 && !loading && <EmptyState icon={Building2} title="Sin planes configurados" />}
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-center justify-between border-b py-2 last:border-0">
              <span className="font-medium">{plan.name}</span>
              <span className="text-sm text-muted-foreground">{formatCOP(Number(plan.monthlyPrice))}/mes</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
