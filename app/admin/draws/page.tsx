"use client"

import * as React from "react"
import { Dices, Play, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/parkly/page-header"
import { EmptyState } from "@/components/parkly/empty-state"
import { StatusBadge } from "@/components/parkly/status-badge"
import { drawsService, parkingSpacesService, residentsService } from "@/lib/api/services"
import type { ParkingDraw, ParkingSpace, Resident } from "@/lib/api/types"

interface DrawForm { name: string; scheduledAt: string; validFrom: string; validUntil: string; parkingSpaceIds: string[]; residentIds: string[] }
const emptyForm: DrawForm = { name: "", scheduledAt: "", validFrom: new Date().toISOString().slice(0, 10), validUntil: "", parkingSpaceIds: [], residentIds: [] }

export default function DrawsPage() {
  const [draws, setDraws] = React.useState<ParkingDraw[]>([])
  const [spaces, setSpaces] = React.useState<ParkingSpace[]>([])
  const [residents, setResidents] = React.useState<Resident[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<DrawForm>(emptyForm)
  const load = React.useCallback(async () => { setLoading(true); try { const [drawList, spaceList, residentList] = await Promise.all([drawsService.list(), parkingSpacesService.list(), residentsService.list()]); setDraws(drawList); setSpaces(spaceList.filter((space) => space.status === "AVAILABLE")); setResidents(residentList.filter((resident) => resident.status === "ACTIVE")) } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudieron cargar los sorteos") } finally { setLoading(false) } }, [])
  React.useEffect(() => { void load() }, [load])
  const setField = (field: keyof DrawForm, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const setMultiple = (field: "parkingSpaceIds" | "residentIds", event: React.ChangeEvent<HTMLSelectElement>) => setForm((current) => ({ ...current, [field]: Array.from(event.target.selectedOptions, (option) => option.value) }))
  async function submit(event: React.SyntheticEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); try { await drawsService.create(Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ""))); toast.success("Sorteo creado"); setOpen(false); await load() } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo crear el sorteo") } finally { setSaving(false) } }
  async function execute(draw: ParkingDraw) { if (!window.confirm(`¿Ejecutar el sorteo ${draw.name}?`)) return; try { await drawsService.execute(draw.id); toast.success("Sorteo ejecutado"); await load() } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo ejecutar el sorteo") } }
  const residentLabel = (resident: Resident) => resident.user ? `${resident.user.firstName} ${resident.user.lastName}` : resident.userId
  return <div className="flex flex-col gap-6"><PageHeader title="Sorteos" description="Configura y ejecuta sorteos de parqueaderos."><Button onClick={() => { setForm(emptyForm); setOpen(true) }}><Plus data-icon="inline-start" />Nuevo sorteo</Button></PageHeader><Card><CardHeader><CardTitle>{loading ? "Cargando..." : `${draws.length} sorteos`}</CardTitle></CardHeader><CardContent>{!loading && draws.length === 0 ? <EmptyState icon={Dices} title="Sin sorteos" description="Crea el primer sorteo del conjunto." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-3 py-2 font-medium">Nombre</th><th className="px-3 py-2 font-medium">Vigencia</th><th className="px-3 py-2 font-medium">Estado</th><th className="px-3 py-2 text-right font-medium">Acciones</th></tr></thead><tbody>{draws.map((draw) => <tr key={draw.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{draw.name}</td><td className="px-3 py-3">{new Date(draw.validFrom).toLocaleDateString("es-CO")} - {new Date(draw.validUntil).toLocaleDateString("es-CO")}</td><td className="px-3 py-3"><StatusBadge status={draw.status.toLowerCase()} /></td><td className="px-3 py-3 text-right">{["DRAFT", "SCHEDULED"].includes(draw.status) && <Button variant="ghost" size="icon" onClick={() => void execute(draw)} aria-label={`Ejecutar ${draw.name}`}><Play /></Button>}</td></tr>)}</tbody></table></div>}</CardContent></Card><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Nuevo sorteo</DialogTitle><DialogDescription>Selecciona los espacios y residentes que participarán.</DialogDescription></DialogHeader><form onSubmit={(event) => void submit(event)} className="grid gap-4"><div className="grid gap-2"><Label htmlFor="name">Nombre</Label><Input id="name" value={form.name} onChange={(event) => setField("name", event.target.value)} required /></div><div className="grid gap-2"><Label htmlFor="validFrom">Válido desde</Label><input id="validFrom" type="date" className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={form.validFrom} onChange={(event) => setField("validFrom", event.target.value)} required /></div><div className="grid gap-2"><Label htmlFor="validUntil">Válido hasta</Label><input id="validUntil" type="date" className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={form.validUntil} onChange={(event) => setField("validUntil", event.target.value)} required /></div><div className="grid gap-2"><Label htmlFor="parkingSpaceIds">Parqueaderos disponibles</Label><select id="parkingSpaceIds" multiple className="min-h-24 rounded-lg border border-input bg-background px-2.5 py-1 text-sm" value={form.parkingSpaceIds} onChange={(event) => setMultiple("parkingSpaceIds", event)} required>{spaces.map((space) => <option key={space.id} value={space.id}>{space.number}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="residentIds">Residentes participantes</Label><select id="residentIds" multiple className="min-h-24 rounded-lg border border-input bg-background px-2.5 py-1 text-sm" value={form.residentIds} onChange={(event) => setMultiple("residentIds", event)} required>{residents.map((resident) => <option key={resident.id} value={resident.id}>{residentLabel(resident)}</option>)}</select></div><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Crear sorteo"}</Button></DialogFooter></form></DialogContent></Dialog></div>
}
