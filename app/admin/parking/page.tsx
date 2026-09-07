"use client"

import * as React from "react"
import { Pencil, Plus, SquareParking, Wrench } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/parkly/page-header"
import { EmptyState } from "@/components/parkly/empty-state"
import { StatusBadge } from "@/components/parkly/status-badge"
import { parkingSpacesService } from "@/lib/api/services"
import type { ParkingSpace, ParkingSpaceType } from "@/lib/api/types"

interface SpaceForm { number: string; type: ParkingSpaceType; location: string; notes: string }
const emptyForm: SpaceForm = { number: "", type: "FIXED", location: "", notes: "" }
const typeLabels: Record<ParkingSpaceType, string> = { FIXED: "Fijo", COMMUNAL: "Comunal", DRAW: "Sorteo", VISITOR: "Visitantes", TEMPORARY: "Temporal", SPECIAL: "Especial" }

export default function ParkingPage() {
  const [spaces, setSpaces] = React.useState<ParkingSpace[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ParkingSpace | null>(null)
  const [form, setForm] = React.useState<SpaceForm>(emptyForm)
  const load = React.useCallback(async () => { setLoading(true); try { setSpaces(await parkingSpacesService.list()) } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudieron cargar los parqueaderos") } finally { setLoading(false) } }, [])
  React.useEffect(() => { void load() }, [load])
  const setField = (field: keyof SpaceForm, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true) }
  const openEdit = (space: ParkingSpace) => { setEditing(space); setForm({ number: space.number, type: space.type, location: space.location ?? "", notes: space.notes ?? "" }); setOpen(true) }
  async function submit(event: React.SyntheticEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); try { const body = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== "")); if (editing) { await parkingSpacesService.update(editing.id, body); toast.success("Parqueadero actualizado") } else { await parkingSpacesService.create(body); toast.success("Parqueadero creado") }; setOpen(false); await load() } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar el parqueadero") } finally { setSaving(false) } }
  async function maintenance(space: ParkingSpace) {
    if (!window.confirm(`¿Poner ${space.number} en mantenimiento?`)) return
    try { await parkingSpacesService.update(space.id, { status: "MAINTENANCE" }); toast.success("Parqueadero actualizado"); await load() } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo actualizar el parqueadero") }
  }
  let submitLabel = editing ? "Guardar cambios" : "Crear parqueadero"
  if (saving) submitLabel = "Guardando..."
  return <div className="flex flex-col gap-6"><PageHeader title="Parqueaderos" description="Administra los espacios de parqueo del conjunto."><Button onClick={openCreate}><Plus data-icon="inline-start" />Nuevo parqueadero</Button></PageHeader><Card><CardHeader><CardTitle>{loading ? "Cargando..." : `${spaces.length} parqueaderos`}</CardTitle></CardHeader><CardContent>{!loading && spaces.length === 0 ? <EmptyState icon={SquareParking} title="Sin parqueaderos" description="Registra el primer espacio de parqueo." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-3 py-2 font-medium">Número</th><th className="px-3 py-2 font-medium">Tipo</th><th className="px-3 py-2 font-medium">Ubicación</th><th className="px-3 py-2 font-medium">Estado</th><th className="px-3 py-2 text-right font-medium">Acciones</th></tr></thead><tbody>{spaces.map((space) => <tr key={space.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{space.number}</td><td className="px-3 py-3">{typeLabels[space.type]}</td><td className="px-3 py-3">{space.location ?? "-"}</td><td className="px-3 py-3"><StatusBadge status={space.status.toLowerCase()} /></td><td className="px-3 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(space)} aria-label={`Editar ${space.number}`}><Pencil /></Button>{space.status !== "MAINTENANCE" && <Button variant="ghost" size="icon" className="text-destructive" onClick={() => void maintenance(space)} aria-label={`Poner ${space.number} en mantenimiento`}><Wrench /></Button>}</div></td></tr>)}</tbody></table></div>}</CardContent></Card><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editing ? "Editar parqueadero" : "Nuevo parqueadero"}</DialogTitle><DialogDescription>Configura el espacio y su tipo de uso.</DialogDescription></DialogHeader><form onSubmit={(event) => void submit(event)} className="grid gap-4"><div className="grid gap-2"><Label htmlFor="number">Número</Label><Input id="number" value={form.number} onChange={(event) => setField("number", event.target.value)} required /></div><div className="grid gap-2"><Label htmlFor="type">Tipo</Label><select id="type" className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={form.type} onChange={(event) => setField("type", event.target.value)}><option value="FIXED">Fijo</option><option value="COMMUNAL">Comunal</option><option value="DRAW">Sorteo</option><option value="VISITOR">Visitantes</option><option value="TEMPORARY">Temporal</option><option value="SPECIAL">Especial</option></select></div><div className="grid gap-2"><Label htmlFor="location">Ubicación</Label><Input id="location" value={form.location} onChange={(event) => setField("location", event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="notes">Notas</Label><Input id="notes" value={form.notes} onChange={(event) => setField("notes", event.target.value)} /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{submitLabel}</Button></DialogFooter></form></DialogContent></Dialog></div>
}
