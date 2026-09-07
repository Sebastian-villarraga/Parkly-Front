"use client"

import * as React from "react"
import { Pencil, Plus, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/parkly/page-header"
import { EmptyState } from "@/components/parkly/empty-state"
import { StatusBadge } from "@/components/parkly/status-badge"
import { finesService, residentsService } from "@/lib/api/services"
import { formatCOP } from "@/lib/format"
import type { Fine, FineStatus, Resident } from "@/lib/api/types"

interface FineForm { residentId: string; reason: string; amount: string; dueDate: string }
const emptyForm: FineForm = { residentId: "", reason: "", amount: "", dueDate: "" }

export default function FinesPage() {
  const [fines, setFines] = React.useState<Fine[]>([])
  const [residents, setResidents] = React.useState<Resident[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Fine | null>(null)
  const [form, setForm] = React.useState<FineForm>(emptyForm)
  const load = React.useCallback(async () => { setLoading(true); try { const [fineList, residentList] = await Promise.all([finesService.list(), residentsService.list()]); setFines(fineList); setResidents(residentList.filter((resident) => resident.status === "ACTIVE")) } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudieron cargar las multas") } finally { setLoading(false) } }, [])
  React.useEffect(() => { void load() }, [load])
  const setField = (field: keyof FineForm, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const residentName = (fine: Fine) => fine.resident?.user ? `${fine.resident.user.firstName} ${fine.resident.user.lastName}` : fine.residentId
  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true) }
  const openEdit = (fine: Fine) => { setEditing(fine); setForm({ residentId: fine.residentId, reason: fine.reason, amount: String(fine.amount), dueDate: fine.dueDate.slice(0, 10) }); setOpen(true) }
  async function submit(event: React.SyntheticEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); try { if (editing) { await finesService.update(editing.id, { reason: form.reason, amount: Number(form.amount), dueDate: form.dueDate }); toast.success("Multa actualizada") } else { await finesService.create({ residentId: form.residentId, reason: form.reason, amount: Number(form.amount), dueDate: form.dueDate }); toast.success("Multa creada") }; setOpen(false); await load() } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar la multa") } finally { setSaving(false) } }
  async function updateStatus(fine: Fine, status: FineStatus) { try { await finesService.update(fine.id, { status }); toast.success("Estado actualizado"); await load() } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo actualizar la multa") } }
  let submitLabel = "Crear multa"
  if (editing) submitLabel = "Guardar cambios"
  if (saving) submitLabel = "Guardando..."
  return <div className="flex flex-col gap-6"><PageHeader title="Multas" description="Crea y administra las multas de los residentes."><Button onClick={openCreate}><Plus data-icon="inline-start" />Nueva multa</Button></PageHeader><Card><CardHeader><CardTitle>{loading ? "Cargando..." : `${fines.length} multas`}</CardTitle></CardHeader><CardContent>{!loading && fines.length === 0 ? <EmptyState icon={TriangleAlert} title="Sin multas" description="No hay multas registradas en el conjunto." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-3 py-2 font-medium">Residente</th><th className="px-3 py-2 font-medium">Motivo</th><th className="px-3 py-2 font-medium">Valor</th><th className="px-3 py-2 font-medium">Vencimiento</th><th className="px-3 py-2 font-medium">Estado</th><th className="px-3 py-2 text-right font-medium">Acciones</th></tr></thead><tbody>{fines.map((fine) => <tr key={fine.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{residentName(fine)}</td><td className="px-3 py-3">{fine.reason}</td><td className="px-3 py-3">{formatCOP(Number(fine.amount))}</td><td className="px-3 py-3">{new Date(fine.dueDate).toLocaleDateString("es-CO")}</td><td className="px-3 py-3"><StatusBadge status={fine.status.toLowerCase()} /></td><td className="px-3 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(fine)} aria-label="Editar multa"><Pencil /></Button>{fine.status === "PENDING" && <Button variant="outline" size="sm" onClick={() => void updateStatus(fine, "PAID")}>Marcar pagada</Button>}</div></td></tr>)}</tbody></table></div>}</CardContent></Card><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editing ? "Editar multa" : "Nueva multa"}</DialogTitle><DialogDescription>Registra el motivo, valor y fecha de vencimiento.</DialogDescription></DialogHeader><form onSubmit={(event) => void submit(event)} className="grid gap-4"><div className="grid gap-2"><Label htmlFor="residentId">Residente</Label><select id="residentId" className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={form.residentId} onChange={(event) => setField("residentId", event.target.value)} required disabled={Boolean(editing)}><option value="">Selecciona un residente</option>{residents.map((resident) => <option key={resident.id} value={resident.id}>{resident.user ? `${resident.user.firstName} ${resident.user.lastName}` : resident.userId}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="reason">Motivo</Label><Input id="reason" value={form.reason} onChange={(event) => setField("reason", event.target.value)} required /></div><div className="grid gap-2"><Label htmlFor="amount">Valor</Label><Input id="amount" type="number" min="1" value={form.amount} onChange={(event) => setField("amount", event.target.value)} required /></div><div className="grid gap-2"><Label htmlFor="dueDate">Fecha de vencimiento</Label><input id="dueDate" type="date" className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={form.dueDate} onChange={(event) => setField("dueDate", event.target.value)} required /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{submitLabel}</Button></DialogFooter></form></DialogContent></Dialog></div>
}
