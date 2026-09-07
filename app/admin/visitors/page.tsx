"use client"

import * as React from "react"
import { Plus, UserCheck, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/parkly/page-header"
import { EmptyState } from "@/components/parkly/empty-state"
import { StatusBadge } from "@/components/parkly/status-badge"
import { residentsService, visitorsService } from "@/lib/api/services"
import type { Resident, VisitorAuthorization } from "@/lib/api/types"

interface VisitorForm { visitorName: string; identificationNumber: string; phone: string; plate: string; validFrom: string; validUntil: string; residentId: string }
const emptyForm: VisitorForm = { visitorName: "", identificationNumber: "", phone: "", plate: "", validFrom: new Date().toISOString().slice(0, 10), validUntil: "", residentId: "" }

export default function VisitorsPage() {
  const [authorizations, setAuthorizations] = React.useState<VisitorAuthorization[]>([])
  const [residents, setResidents] = React.useState<Resident[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<VisitorForm>(emptyForm)
  const load = React.useCallback(async () => { setLoading(true); try { const [authorizationList, residentList] = await Promise.all([visitorsService.list(), residentsService.list()]); setAuthorizations(authorizationList); setResidents(residentList.filter((resident) => resident.status === "ACTIVE")) } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudieron cargar los visitantes") } finally { setLoading(false) } }, [])
  React.useEffect(() => { void load() }, [load])
  const setField = (field: keyof VisitorForm, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const residentLabel = (resident: Resident) => resident.user ? `${resident.user.firstName} ${resident.user.lastName}` : resident.userId
  async function submit(event: React.SyntheticEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); try { const body = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== "")); await visitorsService.create(body); toast.success("Visitante autorizado"); setOpen(false); await load() } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo autorizar el visitante") } finally { setSaving(false) } }
  async function cancel(authorization: VisitorAuthorization) {
    if (!window.confirm("¿Cancelar esta autorización?")) {
      return
    }
    try {
      await visitorsService.cancel(authorization.id)
      toast.success("Autorización cancelada")
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cancelar la autorización")
    }
  }
  return <div className="flex flex-col gap-6"><PageHeader title="Visitantes" description="Autoriza y administra el acceso de visitantes al conjunto."><Button onClick={() => { setForm(emptyForm); setOpen(true) }}><Plus data-icon="inline-start" />Autorizar visitante</Button></PageHeader><Card><CardHeader><CardTitle>{loading ? "Cargando..." : `${authorizations.length} autorizaciones`}</CardTitle></CardHeader><CardContent>{!loading && authorizations.length === 0 ? <EmptyState icon={UserCheck} title="Sin autorizaciones" description="Crea la primera autorización de visitante." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-3 py-2 font-medium">Visitante</th><th className="px-3 py-2 font-medium">Placa</th><th className="px-3 py-2 font-medium">Código</th><th className="px-3 py-2 font-medium">Vigencia</th><th className="px-3 py-2 font-medium">Estado</th><th className="px-3 py-2 text-right font-medium">Acciones</th></tr></thead><tbody>{authorizations.map((authorization) => <tr key={authorization.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{authorization.visitor?.fullName ?? authorization.visitorId}</td><td className="px-3 py-3">{authorization.plate ?? "-"}</td><td className="px-3 py-3 font-mono text-xs">{authorization.authorizationCode}</td><td className="px-3 py-3">{new Date(authorization.validFrom).toLocaleDateString("es-CO")} - {new Date(authorization.validUntil).toLocaleDateString("es-CO")}</td><td className="px-3 py-3"><StatusBadge status={authorization.status.toLowerCase()} /></td><td className="px-3 py-3 text-right">{!["CANCELLED", "EXITED", "EXPIRED"].includes(authorization.status) && <Button variant="ghost" size="icon" className="text-destructive" onClick={() => void cancel(authorization)} aria-label="Cancelar autorización"><XCircle /></Button>}</td></tr>)}</tbody></table></div>}</CardContent></Card><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Autorizar visitante</DialogTitle><DialogDescription>Registra la persona y el periodo autorizado.</DialogDescription></DialogHeader><form onSubmit={(event) => void submit(event)} className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2 sm:col-span-2"><Label htmlFor="visitorName">Nombre completo</Label><Input id="visitorName" value={form.visitorName} onChange={(event) => setField("visitorName", event.target.value)} required /></div><div className="grid gap-2"><Label htmlFor="identificationNumber">Identificación</Label><Input id="identificationNumber" value={form.identificationNumber} onChange={(event) => setField("identificationNumber", event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="phone">Teléfono</Label><Input id="phone" value={form.phone} onChange={(event) => setField("phone", event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="plate">Placa</Label><Input id="plate" value={form.plate} onChange={(event) => setField("plate", event.target.value.toUpperCase())} /></div><div className="grid gap-2"><Label htmlFor="residentId">Residente anfitrión</Label><select id="residentId" className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={form.residentId} onChange={(event) => setField("residentId", event.target.value)}><option value="">Mi autorización</option>{residents.map((resident) => <option key={resident.id} value={resident.id}>{residentLabel(resident)}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="validFrom">Válido desde</Label><input id="validFrom" type="date" className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={form.validFrom} onChange={(event) => setField("validFrom", event.target.value)} required /></div><div className="grid gap-2"><Label htmlFor="validUntil">Válido hasta</Label><input id="validUntil" type="date" className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={form.validUntil} onChange={(event) => setField("validUntil", event.target.value)} required /></div><DialogFooter className="sm:col-span-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Autorizar visitante"}</Button></DialogFooter></form></DialogContent></Dialog></div>
}
