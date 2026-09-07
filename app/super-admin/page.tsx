import {
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  PauseCircle,
  SquareParking,
  TrendingUp,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PageHeader } from "@/components/parkly/page-header"
import { StatCard } from "@/components/parkly/stat-card"
import { StatusBadge } from "@/components/parkly/status-badge"
import { GrowthChart, PlanDistributionChart } from "@/components/parkly/charts/super-admin-charts"
import { COMPLEXES, PLANS, PLATFORM_AUDIT, PLATFORM_STATS } from "@/lib/mock-data"
import { formatCOP, formatNumber, relativeTime } from "@/lib/format"

const PLAN_COLORS: Record<string, string> = {
  basic: "var(--chart-4)",
  professional: "var(--chart-1)",
  enterprise: "var(--chart-5)",
}

export default function SuperAdminDashboard() {
  const planData = PLANS.map((p) => ({
    plan: p.id,
    label: p.name,
    value: COMPLEXES.filter((c) => c.plan === p.id).length,
    color: PLAN_COLORS[p.id],
  }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Panel de la plataforma"
        description="Resumen general de Parkly y todos los conjuntos residenciales."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Conjuntos totales" value={PLATFORM_STATS.totalComplexes} icon={Building2} tone="primary" />
        <StatCard label="Activos" value={PLATFORM_STATS.activeComplexes} icon={CheckCircle2} tone="success" />
        <StatCard label="En prueba" value={PLATFORM_STATS.trialComplexes} icon={Clock} tone="info" />
        <StatCard label="Suspendidos" value={PLATFORM_STATS.suspendedComplexes} icon={PauseCircle} tone="danger" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="MRR (estimado)"
          value={formatCOP(PLATFORM_STATS.mrr)}
          icon={DollarSign}
          tone="success"
          trend={{ value: "+12.4%", positive: true }}
          hint="vs. mes anterior"
        />
        <StatCard label="Residentes totales" value={formatNumber(PLATFORM_STATS.totalResidents)} icon={Users} tone="primary" />
        <StatCard label="Parqueaderos" value={formatNumber(PLATFORM_STATS.totalParking)} icon={SquareParking} tone="info" />
        <StatCard label="Crecimiento" value="+150%" icon={TrendingUp} tone="success" hint="últimos 6 meses" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Crecimiento de la plataforma</CardTitle>
            <CardDescription>Residentes gestionados en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <GrowthChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribución por plan</CardTitle>
            <CardDescription>Conjuntos por tipo de suscripción</CardDescription>
          </CardHeader>
          <CardContent>
            <PlanDistributionChart data={planData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Conjuntos recientes</CardTitle>
            <CardDescription>Últimos conjuntos registrados en Parkly</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {COMPLEXES.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/40"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-[18px]" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.city} · {c.apartments} apartamentos · {c.parkingSpaces} parqueaderos
                  </span>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={c.subscriptionStatus} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad de la plataforma</CardTitle>
            <CardDescription>Eventos recientes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {PLATFORM_AUDIT.slice(0, 6).map((e) => (
              <div key={e.id} className="flex gap-3">
                <span
                  className="mt-1.5 size-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      e.status === "success"
                        ? "var(--success)"
                        : e.status === "warning"
                          ? "var(--warning)"
                          : "var(--info)",
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">{e.action}</span>
                  <span className="text-xs text-muted-foreground">{e.description}</span>
                  <span className="text-[11px] text-muted-foreground/70">{relativeTime(e.timestamp)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
