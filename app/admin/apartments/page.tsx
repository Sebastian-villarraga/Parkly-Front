"use client"

import * as React from "react"
import { Building2, Pencil, Plus, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/parkly/page-header"
import { EmptyState } from "@/components/parkly/empty-state"
import { StatusBadge } from "@/components/parkly/status-badge"
import { apartmentsService } from "@/lib/api/services"
import type { Apartment } from "@/lib/api/types"

interface ApartmentForm {
  tower: string
  number: string
  floor: string
}

const emptyForm: ApartmentForm = { tower: "", number: "", floor: "" }

export default function ApartmentsPage() {
  const [apartments, setApartments] = React.useState<Apartment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Apartment | null>(null)
  const [form, setForm] = React.useState<ApartmentForm>(emptyForm)

  const loadApartments = React.useCallback(async () => {
    setLoading(true)
    try {
      setApartments(await apartmentsService.list())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar los apartamentos")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { void loadApartments() }, [loadApartments])

  function updateField(field: keyof ApartmentForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(apartment: Apartment) {
    setEditing(apartment)
    setForm({ tower: apartment.tower ?? "", number: apartment.number, floor: apartment.floor ?? "" })
    setDialogOpen(true)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      const body = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ""))
      if (editing) {
        await apartmentsService.update(editing.id, body)
        toast.success("Apartamento actualizado")
      } else {
        await apartmentsService.create(body)
        toast.success("Apartamento creado")
      }
      setDialogOpen(false)
      await loadApartments()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el apartamento")
    } finally {
      setSaving(false)
    }
  }

  async function deactivate(apartment: Apartment) {
    if (!window.confirm(`¿Desactivar el apartamento ${apartment.number}?`)) return
    try {
      await apartmentsService.update(apartment.id, { status: "INACTIVE" })
      toast.success("Apartamento desactivado")
      await loadApartments()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo desactivar el apartamento")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Apartamentos" description="Crea, edita y administra los apartamentos de tu conjunto.">
        <Button onClick={openCreate}><Plus data-icon="inline-start" />Nuevo apartamento</Button>
      </PageHeader>
      <Card>
        <CardHeader><CardTitle>{loading ? "Cargando..." : `${apartments.length} apartamentos`}</CardTitle></CardHeader>
        <CardContent>
          {!loading && apartments.length === 0 ? <EmptyState icon={Building2} title="Sin apartamentos" description="Crea el primer apartamento del conjunto." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-3 py-2 font-medium">Torre</th><th className="px-3 py-2 font-medium">Apartamento</th><th className="px-3 py-2 font-medium">Piso</th><th className="px-3 py-2 font-medium">Estado</th><th className="px-3 py-2 text-right font-medium">Acciones</th></tr></thead><tbody>{apartments.map((apartment) => <tr key={apartment.id} className="border-b last:border-0"><td className="px-3 py-3">{apartment.tower ?? "-"}</td><td className="px-3 py-3 font-medium">{apartment.number}</td><td className="px-3 py-3">{apartment.floor ?? "-"}</td><td className="px-3 py-3"><StatusBadge status={apartment.status.toLowerCase()} /></td><td className="px-3 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(apartment)} aria-label={`Editar apartamento ${apartment.number}`}><Pencil /></Button>{apartment.status === "ACTIVE" && <Button variant="ghost" size="icon" className="text-destructive" onClick={() => void deactivate(apartment)} aria-label={`Desactivar apartamento ${apartment.number}`}><XCircle /></Button>}</div></td></tr>)}</tbody></table></div>}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Editar apartamento" : "Nuevo apartamento"}</DialogTitle><DialogDescription>{editing ? "Actualiza la información del apartamento." : "Registra un apartamento para el conjunto."}</DialogDescription></DialogHeader>
          <form onSubmit={(event) => void submit(event)} className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2"><Label htmlFor="tower">Torre</Label><Input id="tower" value={form.tower} onChange={(event) => updateField("tower", event.target.value)} placeholder="Torre 1" /></div>
            <div className="grid gap-2"><Label htmlFor="number">Número</Label><Input id="number" value={form.number} onChange={(event) => updateField("number", event.target.value)} required /></div>
            <div className="grid gap-2"><Label htmlFor="floor">Piso</Label><Input id="floor" value={form.floor} onChange={(event) => updateField("floor", event.target.value)} /></div>
            <DialogFooter className="sm:col-span-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear apartamento"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
