"use client"

import * as React from "react"
import { Inbox } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/parkly/page-header"
import { EmptyState } from "@/components/parkly/empty-state"
import { apartmentsService, assignmentsService, chargesService, finesService, parkingSpacesService, residentsService, vehiclesService, reservationsService, visitorsService, accessControlService, drawsService, paymentsService } from "@/lib/api/services"

const endpoints = {
  apartments: apartmentsService.list,
  residents: residentsService.list,
  vehicles: vehiclesService.list,
  parking: parkingSpacesService.list,
  assignments: assignmentsService.list,
  draws: drawsService.list,
  reservations: reservationsService.list,
  visitors: visitorsService.list,
  fines: finesService.list,
  charges: chargesService.list,
  payments: paymentsService.list,
  access: accessControlService.events,
}

const labels: Record<string, string> = { apartments: "Apartamentos", residents: "Residentes", vehicles: "Vehículos", parking: "Parqueaderos", assignments: "Asignaciones", draws: "Sorteos", reservations: "Reservas", visitors: "Visitantes", fines: "Multas", charges: "Cobros", payments: "Pagos", access: "Ingresos y salidas" }

function displayValue(value: unknown): string {
  if (value === null || value === undefined) return "-"
  if (typeof value === "object") return JSON.stringify(value) ?? "-"
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return `${value}`
  return "-"
}

export function ResourcePage({ resource }: { readonly resource: string }) {
  const [rows, setRows] = React.useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = React.useState(true)
  const title = labels[resource] ?? "Módulo"

  React.useEffect(() => {
    const loader = endpoints[resource as keyof typeof endpoints]
    if (!loader) { setLoading(false); return }
    loader().then((data) => setRows(data as unknown as Record<string, unknown>[])).catch((error: Error) => toast.error(error.message)).finally(() => setLoading(false))
  }, [resource])

  const columns = rows.length ? Object.keys(rows[0]).filter((key) => !["id", "updatedAt", "createdAt"].includes(key)).slice(0, 5) : []
  return <div className="flex flex-col gap-6"><PageHeader title={title} description={`Consulta la información actual de ${title.toLowerCase()} en Parkly.`} /><Card><CardHeader><CardTitle>{loading ? "Cargando..." : `${rows.length} registros`}</CardTitle></CardHeader><CardContent>{!loading && rows.length === 0 ? <EmptyState icon={Inbox} title="Sin registros" description="No hay información disponible para este conjunto." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground">{columns.map((column) => <th key={column} className="px-3 py-2 font-medium">{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={typeof row.id === "string" ? row.id : `row-${index}`} className="border-b last:border-0">{columns.map((column) => <td key={column} className="px-3 py-2">{displayValue(row[column])}</td>)}</tr>)}</tbody></table></div>}</CardContent></Card></div>
}
