"use client"

import * as React from "react"
import { ClipboardCheck, Search } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/parkly/page-header"
import { EmptyState } from "@/components/parkly/empty-state"
import { auditService } from "@/lib/api/services"
import type { AuditLog } from "@/lib/api/types"

function jsonValue(value: unknown) {
  if (value === null || value === undefined) {
    return "-"
  }
  if (typeof value === "string") {
    return value
  }
  return JSON.stringify(value) ?? "-"
}

export default function AdminAuditPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>([])
  const [query, setQuery] = React.useState("")
  const [action, setAction] = React.useState("all")
  const [entity, setEntity] = React.useState("all")
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => { auditService.list().then(setLogs).catch((error: Error) => toast.error(error.message)).finally(() => setLoading(false)) }, [])
  const actions = [...new Set(logs.map((log) => log.action))].sort((a, b) => a.localeCompare(b))
  const entities = [...new Set(logs.map((log) => log.entity))].sort((a, b) => a.localeCompare(b))
  const filtered = logs.filter((log) => {
    const date = new Date(log.createdAt)
    const matchesText = `${log.action} ${log.entity} ${log.entityId ?? ""} ${log.userId ?? ""}`.toLowerCase().includes(query.toLowerCase())
    const matchesAction = action === "all" || log.action === action
    const matchesEntity = entity === "all" || log.entity === entity
    const matchesFrom = !from || date >= new Date(`${from}T00:00:00`)
    const matchesTo = !to || date <= new Date(`${to}T23:59:59`)
    return matchesText && matchesAction && matchesEntity && matchesFrom && matchesTo
  })
  function clearFilters() { setQuery(""); setAction("all"); setEntity("all"); setFrom(""); setTo("") }
  return <div className="flex flex-col gap-6"><PageHeader title="Auditoría del conjunto" description="Consulta quién realizó cambios y qué entidades fueron afectadas." /><Card><CardHeader><div className="flex flex-col gap-3"><div className="flex items-center justify-between gap-3"><CardTitle>{loading ? "Cargando..." : `${filtered.length} eventos`}</CardTitle><Button variant="ghost" size="sm" onClick={clearFilters}>Limpiar filtros</Button></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"><div className="relative"><Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" /><Input className="pl-8" placeholder="Buscar..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><select className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={action} onChange={(event) => setAction(event.target.value)}><option value="all">Todas las acciones</option>{actions.map((item) => <option key={item} value={item}>{item}</option>)}</select><select className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={entity} onChange={(event) => setEntity(event.target.value)}><option value="all">Todas las entidades</option>{entities.map((item) => <option key={item} value={item}>{item}</option>)}</select><Input type="date" aria-label="Desde" value={from} onChange={(event) => setFrom(event.target.value)} /><Input type="date" aria-label="Hasta" value={to} onChange={(event) => setTo(event.target.value)} /></div></div></CardHeader><CardContent>{!loading && filtered.length === 0 ? <EmptyState icon={ClipboardCheck} title="Sin eventos de auditoría" description="Prueba con otros filtros o espera a que se registren nuevas operaciones." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-3 py-2 font-medium">Fecha</th><th className="px-3 py-2 font-medium">Acción</th><th className="px-3 py-2 font-medium">Entidad</th><th className="px-3 py-2 font-medium">ID</th><th className="px-3 py-2 font-medium">Cambios</th></tr></thead><tbody>{filtered.map((log) => <tr key={log.id} className="border-b last:border-0"><td className="whitespace-nowrap px-3 py-3">{new Date(log.createdAt).toLocaleString("es-CO")}</td><td className="px-3 py-3"><Badge variant="secondary">{log.action}</Badge></td><td className="px-3 py-3 font-medium">{log.entity}</td><td className="max-w-40 truncate px-3 py-3 font-mono text-xs">{log.entityId ?? "-"}</td><td className="max-w-64 truncate px-3 py-3 text-xs text-muted-foreground" title={`${jsonValue(log.newValue)}`}>{jsonValue(log.newValue)}</td></tr>)}</tbody></table></div>}</CardContent></Card></div>
}
