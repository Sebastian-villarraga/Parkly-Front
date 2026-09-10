"use client"

import * as React from "react"
import Link from "next/link"
import { Activity, ArrowUpRight, BarChart3, Car, CheckCircle2, ClipboardList, CreditCard, ShieldCheck, SquareParking, TriangleAlert, Users } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/parkly/page-header"
import { StatCard } from "@/components/parkly/stat-card"
import { StatusBadge } from "@/components/parkly/status-badge"
import { EmptyState } from "@/components/parkly/empty-state"
import { accessControlService, auditService, finesService, paymentsService, parkingSpacesService, reservationsService, settingsService, vehiclesService, visitorsService, residentsService } from "@/lib/api/services"
import type { AccessEvent, AuditLog, Fine, ParkingSpace, Payment, Reservation, RoleDashboardConfig, Vehicle, VisitorAuthorization } from "@/lib/api/types"
import type { Role } from "@/lib/types"

const IMAGE_URL = "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1600&q=85"

interface DashboardData { spaces: ParkingSpace[]; vehicles: Vehicle[]; reservations: Reservation[]; visitors: VisitorAuthorization[]; fines: Fine[]; payments: Payment[]; access: AccessEvent[]; audit: AuditLog[]; residents: number }

const defaults: RoleDashboardConfig = {
  title: "Centro de operaciones",
  description: "Una vista clara del estado de tu conjunto residencial.",
  imageUrl: IMAGE_URL,
  showMetrics: true,
  showActivity: true,
  showQuickLinks: true,
}

const linksByRole: Record<Role, { label: string; href: string; icon: typeof Users }[]> = {
  admin: [{ label: "Residentes", href: "/admin/residents", icon: Users }, { label: "Parqueaderos", href: "/admin/parking", icon: SquareParking }, { label: "Reportes", href: "/admin/reports", icon: BarChart3 }, { label: "Auditoría", href: "/admin/audit", icon: Activity }],
  security: [{ label: "Validar vehículo", href: "/security/validate", icon: Car }, { label: "Visitantes", href: "/security/visitors", icon: ShieldCheck }, { label: "Ingresos y salidas", href: "/security/access", icon: Activity }],
  resident: [{ label: "Mis vehículos", href: "/resident/vehicles", icon: Car }, { label: "Reservas", href: "/resident/reservations", icon: SquareParking }, { label: "Visitantes", href: "/resident/visitors", icon: Users }, { label: "Pagos", href: "/resident/payments", icon: CreditCard }],
  super_admin: [],
}

export function RoleDashboard({ role }: { readonly role: Role }) {
  const [data, setData] = React.useState<DashboardData>({ spaces: [], vehicles: [], reservations: [], visitors: [], fines: [], payments: [], access: [], audit: [], residents: 0 })
  const [config, setConfig] = React.useState<RoleDashboardConfig>(defaults)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    void settingsService.getDashboard().then(setConfig).catch(() => setConfig(defaults))
    const load = async () => {
      try {
        if (role === "admin") {
          const [spaces, fines, payments, reservations, access, audit, residents] = await Promise.all([parkingSpacesService.list(), finesService.list(), paymentsService.list(), reservationsService.list(), accessControlService.events(), auditService.list(), residentsService.list()])
          setData({ spaces, vehicles: [], reservations, visitors: [], fines, payments, access, audit, residents: residents.length })
        } else if (role === "security") {
          const [spaces, access, visitors, vehicles, residents] = await Promise.all([parkingSpacesService.list(), accessControlService.events(), visitorsService.list(), vehiclesService.list(), residentsService.list()])
          setData({ spaces, vehicles, reservations: [], visitors, fines: [], payments: [], access, audit: [], residents: residents.length })
        } else {
          const [spaces, vehicles, reservations, visitors, fines, payments] = await Promise.all([parkingSpacesService.list(), vehiclesService.list(), reservationsService.list(), visitorsService.list(), finesService.list(), paymentsService.list()])
          setData({ spaces, vehicles, reservations, visitors, fines, payments, access: [], audit: [], residents: 1 })
        }
      } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo cargar el dashboard") } finally { setLoading(false) }
    }
    void load()
  }, [role])

  const available = data.spaces.filter((space) => space.status === "AVAILABLE").length
  const activeReservations = data.reservations.filter((reservation) => ["PENDING", "CONFIRMED", "ACTIVE"].includes(reservation.status)).length
  const pendingPayments = data.payments.filter((payment) => payment.status === "PENDING").length
  const openFines = data.fines.filter((fine) => ["PENDING", "OVERDUE"].includes(fine.status)).length
  const roleLabel = role === "security" ? "Control operativo" : role === "resident" ? "Mi comunidad" : "Gestión residencial"
  const alertCount = role === "security" ? data.visitors.filter((visitor) => visitor.status === "AUTHORIZED").length : role === "resident" ? pendingPayments + openFines : openFines
  const latestActivity = [...data.audit, ...data.access.map((event): AuditLog => ({ id: event.id, complexId: event.complexId, userId: event.registeredById, action: event.type, entity: "AccessEvent", entityId: event.id, oldValue: null, newValue: event.notes, ipAddress: null, userAgent: null, createdAt: event.timestamp }))].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  const links = linksByRole[role]

  return <div className="flex flex-col gap-6">
    <section className="relative min-h-64 overflow-hidden rounded-2xl bg-slate-900 text-white">
      <img src={config.imageUrl || IMAGE_URL} alt="Parqueadero residencial" className="absolute inset-0 size-full object-cover opacity-55" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/55 to-transparent" />
      <div className="relative flex min-h-64 max-w-2xl flex-col justify-end gap-3 p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Parkly · {roleLabel}</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{config.title}</h1><p className="max-w-xl text-sm text-white/80 sm:text-base">{config.description}</p></div>
    </section>
    <PageHeader title="Resumen de hoy" description="Información actualizada desde la operación de tu conjunto." />
    {config.showMetrics && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Espacios disponibles" value={loading ? "-" : available} icon={SquareParking} tone="success" /><StatCard label={role === "resident" ? "Mis vehículos" : "Vehículos registrados"} value={loading ? "-" : data.vehicles.length} icon={Car} tone="primary" /><StatCard label="Reservas activas" value={loading ? "-" : activeReservations} icon={ClipboardList} tone="info" /><StatCard label={role === "resident" ? "Pendientes" : "Alertas financieras"} value={loading ? "-" : alertCount} icon={TriangleAlert} tone="warning" /></div>}
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      {config.showActivity && <Card><CardHeader><CardTitle>Actividad reciente</CardTitle><CardDescription>Eventos relevantes del conjunto.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{latestActivity.length === 0 && !loading ? <EmptyState icon={Activity} title="Sin actividad reciente" /> : latestActivity.map((event) => <div key={event.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"><span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Activity className="size-3.5" /></span><div className="min-w-0"><p className="truncate text-sm font-medium">{event.action}</p><p className="text-xs text-muted-foreground">{event.entity} · {new Date(event.createdAt).toLocaleString("es-CO")}</p></div></div>)}</CardContent></Card>}
      <Card><CardHeader><CardTitle>Estado operativo</CardTitle><CardDescription>Indicadores rápidos de tu día.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Espacios ocupados</span><StatusBadge status={data.spaces.some((space) => space.status === "OCCUPIED") ? "occupied" : "available"} label={`${data.spaces.filter((space) => space.status === "OCCUPIED").length} espacios`} /></div><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Visitantes autorizados</span><StatusBadge status={data.visitors.length ? "authorized" : "inactive"} label={`${data.visitors.filter((visitor) => visitor.status === "AUTHORIZED").length} activos`} /></div><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Residentes gestionados</span><span className="text-sm font-semibold">{loading ? "-" : data.residents}</span></div><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Sistema</span><span className="flex items-center gap-1.5 text-sm text-success"><CheckCircle2 className="size-4" />Operativo</span></div></CardContent></Card>
    </div>
    {config.showQuickLinks && <Card><CardHeader><CardTitle>Accesos rápidos</CardTitle><CardDescription>Continúa con las tareas más frecuentes.</CardDescription></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{links.map((link) => <Link key={link.href} href={link.href} className="group flex items-center gap-3 rounded-xl border p-3 transition-colors hover:border-primary/50 hover:bg-primary/5"><span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><link.icon className="size-4" /></span><span className="flex-1 text-sm font-medium">{link.label}</span><ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>)}</CardContent></Card>}
  </div>
}
