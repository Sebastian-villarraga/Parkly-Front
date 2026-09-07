"use client"

import * as React from "react"
import { Pencil, Plus, UserRound, UserX } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/parkly/page-header"
import { EmptyState } from "@/components/parkly/empty-state"
import { StatusBadge } from "@/components/parkly/status-badge"
import { apartmentsService, residentsService } from "@/lib/api/services"
import type { Apartment, Resident } from "@/lib/api/types"

interface ResidentForm {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  apartmentId: string
  identificationType: string
  identificationNumber: string
  emergencyContact: string
}

const emptyForm: ResidentForm = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  apartmentId: "",
  identificationType: "CC",
  identificationNumber: "",
  emergencyContact: "",
}

function residentName(resident: Resident) {
  if (!resident.user) return resident.userId
  return `${resident.user.firstName} ${resident.user.lastName}`
}

export default function ResidentsPage() {
  const [residents, setResidents] = React.useState<Resident[]>([])
  const [apartments, setApartments] = React.useState<Apartment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Resident | null>(null)
  const [form, setForm] = React.useState<ResidentForm>(emptyForm)

  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [residentList, apartmentList] = await Promise.all([residentsService.list(), apartmentsService.list()])
      setResidents(residentList)
      setApartments(apartmentList.filter((apartment) => apartment.status === "ACTIVE"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar los residentes")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { void loadData() }, [loadData])

  function updateField(field: keyof ResidentForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(resident: Resident) {
    setEditing(resident)
    setForm({
      email: resident.user?.email ?? "",
      password: "",
      firstName: resident.user?.firstName ?? "",
      lastName: resident.user?.lastName ?? "",
      phone: resident.user?.phone ?? "",
      apartmentId: resident.apartmentId,
      identificationType: resident.identificationType,
      identificationNumber: resident.identificationNumber,
      emergencyContact: resident.emergencyContact ?? "",
    })
    setDialogOpen(true)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      const body = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ""))
      if (editing) {
        delete body.password
        await residentsService.update(editing.id, body)
        toast.success("Residente actualizado")
      } else {
        await residentsService.create(body)
        toast.success("Residente creado")
      }
      setDialogOpen(false)
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el residente")
    } finally {
      setSaving(false)
    }
  }

  async function deactivate(resident: Resident) {
    if (!window.confirm(`¿Desactivar a ${residentName(resident)}?`)) return
    try {
      await residentsService.remove(resident.id)
      toast.success("Residente desactivado")
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo desactivar el residente")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Residentes" description="Crea, edita y administra los residentes de tu conjunto.">
        <Button onClick={openCreate}><Plus data-icon="inline-start" />Nuevo residente</Button>
      </PageHeader>
      <Card>
        <CardHeader><CardTitle>{loading ? "Cargando..." : `${residents.length} residentes`}</CardTitle></CardHeader>
        <CardContent>
          {!loading && residents.length === 0 ? <EmptyState icon={UserRound} title="Sin residentes" description="Crea el primer residente del conjunto." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-3 py-2 font-medium">Residente</th><th className="px-3 py-2 font-medium">Identificación</th><th className="px-3 py-2 font-medium">Apartamento</th><th className="px-3 py-2 font-medium">Estado</th><th className="px-3 py-2 text-right font-medium">Acciones</th></tr></thead><tbody>{residents.map((resident) => <tr key={resident.id} className="border-b last:border-0"><td className="px-3 py-3"><div className="font-medium">{residentName(resident)}</div><div className="text-xs text-muted-foreground">{resident.user?.email ?? "-"}</div></td><td className="px-3 py-3">{resident.identificationType} {resident.identificationNumber}</td><td className="px-3 py-3">{resident.apartment ? `${resident.apartment.tower ?? ""} ${resident.apartment.number}` : resident.apartmentId}</td><td className="px-3 py-3"><StatusBadge status={resident.status.toLowerCase()} /></td><td className="px-3 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(resident)} aria-label={`Editar ${residentName(resident)}`}><Pencil /></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={() => void deactivate(resident)} aria-label={`Desactivar ${residentName(resident)}`}><UserX /></Button></div></td></tr>)}</tbody></table></div>}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar residente" : "Nuevo residente"}</DialogTitle><DialogDescription>{editing ? "Actualiza la información del residente." : "Registra un residente y asígnalo a un apartamento."}</DialogDescription></DialogHeader>
          <form onSubmit={(event) => void submit(event)} className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2"><Label htmlFor="firstName">Nombre</Label><Input id="firstName" value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} required /></div>
            <div className="grid gap-2"><Label htmlFor="lastName">Apellido</Label><Input id="lastName" value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} required /></div>
            <div className="grid gap-2 sm:col-span-2"><Label htmlFor="email">Correo electrónico</Label><Input id="email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required /></div>
            {!editing && <div className="grid gap-2 sm:col-span-2"><Label htmlFor="password">Contraseña temporal</Label><Input id="password" type="password" minLength={8} value={form.password} onChange={(event) => updateField("password", event.target.value)} required /></div>}
            <div className="grid gap-2"><Label htmlFor="identificationType">Tipo de identificación</Label><Input id="identificationType" value={form.identificationType} onChange={(event) => updateField("identificationType", event.target.value)} required /></div>
            <div className="grid gap-2"><Label htmlFor="identificationNumber">Número de identificación</Label><Input id="identificationNumber" value={form.identificationNumber} onChange={(event) => updateField("identificationNumber", event.target.value)} required /></div>
            <div className="grid gap-2 sm:col-span-2"><Label htmlFor="apartmentId">Apartamento</Label><select id="apartmentId" className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={form.apartmentId} onChange={(event) => updateField("apartmentId", event.target.value)} required><option value="">Selecciona un apartamento</option>{apartments.map((apartment) => <option key={apartment.id} value={apartment.id}>{apartment.tower ? `${apartment.tower} - ` : ""}{apartment.number}</option>)}</select></div>
            <div className="grid gap-2"><Label htmlFor="phone">Teléfono</Label><Input id="phone" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="emergencyContact">Contacto de emergencia</Label><Input id="emergencyContact" value={form.emergencyContact} onChange={(event) => updateField("emergencyContact", event.target.value)} /></div>
            <DialogFooter className="sm:col-span-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear residente"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
