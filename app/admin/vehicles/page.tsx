"use client"

import * as React from "react"
import { Car, Pencil, Plus, UserX } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/parkly/page-header"
import { EmptyState } from "@/components/parkly/empty-state"
import { StatusBadge } from "@/components/parkly/status-badge"
import { residentsService, vehiclesService } from "@/lib/api/services"
import type { Resident, Vehicle, VehicleType } from "@/lib/api/types"

interface VehicleForm { residentId: string; plate: string; type: VehicleType; brand: string; model: string; color: string }
const emptyForm: VehicleForm = { residentId: "", plate: "", type: "CAR", brand: "", model: "", color: "" }
const typeLabels: Record<VehicleType, string> = { CAR: "Carro", MOTORCYCLE: "Motocicleta", BICYCLE: "Bicicleta", OTHER: "Otro" }

function ownerName(vehicle: Vehicle) { return vehicle.resident ? `${vehicle.resident.user?.firstName ?? ""} ${vehicle.resident.user?.lastName ?? ""}`.trim() || vehicle.residentId : vehicle.residentId }

export default function VehiclesPage() {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [residents, setResidents] = React.useState<Resident[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Vehicle | null>(null)
  const [form, setForm] = React.useState<VehicleForm>(emptyForm)

  const load = React.useCallback(async () => {
    setLoading(true)
    try { const [vehicleList, residentList] = await Promise.all([vehiclesService.list(), residentsService.list()]); setVehicles(vehicleList); setResidents(residentList.filter((resident) => resident.status === "ACTIVE")) }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudieron cargar los vehículos") }
    finally { setLoading(false) }
  }, [])
  React.useEffect(() => { void load() }, [load])
  const setField = (field: keyof VehicleForm, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true) }
  const openEdit = (vehicle: Vehicle) => { setEditing(vehicle); setForm({ residentId: vehicle.residentId, plate: vehicle.plate, type: vehicle.type, brand: vehicle.brand ?? "", model: vehicle.model ?? "", color: vehicle.color ?? "" }); setOpen(true) }

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true)
    try { const body = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== "")); if (editing) { await vehiclesService.update(editing.id, body); toast.success("Vehículo actualizado") } else { await vehiclesService.create(body); toast.success("Vehículo creado") }; setOpen(false); await load() }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar el vehículo") }
    finally { setSaving(false) }
  }
  async function deactivate(vehicle: Vehicle) {
    if (!window.confirm(`¿Desactivar el vehículo ${vehicle.plate}?`)) return
    try {
      await vehiclesService.remove(vehicle.id)
      toast.success("Vehículo desactivado")
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo desactivar el vehículo")
    }
  }

  let submitLabel = editing ? "Guardar cambios" : "Crear vehículo"
  if (saving) submitLabel = "Guardando..."
  return <div className="flex flex-col gap-6"><PageHeader title="Vehículos" description="Administra los vehículos registrados en tu conjunto."><Button onClick={openCreate}><Plus data-icon="inline-start" />Nuevo vehículo</Button></PageHeader><Card><CardHeader><CardTitle>{loading ? "Cargando..." : `${vehicles.length} vehículos`}</CardTitle></CardHeader><CardContent>{!loading && vehicles.length === 0 ? <EmptyState icon={Car} title="Sin vehículos" description="Registra el primer vehículo del conjunto." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-3 py-2 font-medium">Placa</th><th className="px-3 py-2 font-medium">Tipo</th><th className="px-3 py-2 font-medium">Propietario</th><th className="px-3 py-2 font-medium">Vehículo</th><th className="px-3 py-2 font-medium">Estado</th><th className="px-3 py-2 text-right font-medium">Acciones</th></tr></thead><tbody>{vehicles.map((vehicle) => <tr key={vehicle.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{vehicle.plate}</td><td className="px-3 py-3">{typeLabels[vehicle.type]}</td><td className="px-3 py-3">{ownerName(vehicle)}</td><td className="px-3 py-3">{[vehicle.brand, vehicle.model, vehicle.color].filter(Boolean).join(" · ") || "-"}</td><td className="px-3 py-3"><StatusBadge status={vehicle.status.toLowerCase()} /></td><td className="px-3 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(vehicle)} aria-label={`Editar ${vehicle.plate}`}><Pencil /></Button>{vehicle.status === "ACTIVE" && <Button variant="ghost" size="icon" className="text-destructive" onClick={() => void deactivate(vehicle)} aria-label={`Desactivar ${vehicle.plate}`}><UserX /></Button>}</div></td></tr>)}</tbody></table></div>}</CardContent></Card><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Editar vehículo" : "Nuevo vehículo"}</DialogTitle><DialogDescription>Registra los datos del vehículo y su propietario.</DialogDescription></DialogHeader><form onSubmit={(event) => void submit(event)} className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2 sm:col-span-2"><Label htmlFor="residentId">Propietario</Label><select id="residentId" className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={form.residentId} onChange={(event) => setField("residentId", event.target.value)} required><option value="">Selecciona un residente</option>{residents.map((resident) => <option key={resident.id} value={resident.id}>{resident.user ? `${resident.user.firstName} ${resident.user.lastName}` : resident.userId}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="plate">Placa</Label><Input id="plate" value={form.plate} onChange={(event) => setField("plate", event.target.value.toUpperCase())} required /></div><div className="grid gap-2"><Label htmlFor="type">Tipo</Label><select id="type" className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={form.type} onChange={(event) => setField("type", event.target.value)}><option value="CAR">Carro</option><option value="MOTORCYCLE">Motocicleta</option><option value="BICYCLE">Bicicleta</option><option value="OTHER">Otro</option></select></div><div className="grid gap-2"><Label htmlFor="brand">Marca</Label><Input id="brand" value={form.brand} onChange={(event) => setField("brand", event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="model">Modelo</Label><Input id="model" value={form.model} onChange={(event) => setField("model", event.target.value)} /></div><div className="grid gap-2 sm:col-span-2"><Label htmlFor="color">Color</Label><Input id="color" value={form.color} onChange={(event) => setField("color", event.target.value)} /></div><DialogFooter className="sm:col-span-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{submitLabel}</Button></DialogFooter></form></DialogContent></Dialog></div>
}
