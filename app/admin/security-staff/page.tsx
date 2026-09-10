"use client"

import * as React from "react"
import { Plus, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/parkly/page-header"
import { EmptyState } from "@/components/parkly/empty-state"
import { StatusBadge } from "@/components/parkly/status-badge"
import { securityUsersService } from "@/lib/api/services"
import type { SecurityUser } from "@/lib/api/types"

interface StaffForm { firstName: string; lastName: string; email: string; password: string; phone: string }
const emptyForm: StaffForm = { firstName: "", lastName: "", email: "", password: "", phone: "" }

export default function SecurityStaffPage() {
  const [staff, setStaff] = React.useState<SecurityUser[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<StaffForm>(emptyForm)
  const load = React.useCallback(async () => { setLoading(true); try { setStaff(await securityUsersService.list()) } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo cargar el personal de seguridad") } finally { setLoading(false) } }, [])
  React.useEffect(() => { void load() }, [load])
  const setField = (field: keyof StaffForm, value: string) => setForm((current) => ({ ...current, [field]: value }))
  async function submit(event: React.SyntheticEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); try { await securityUsersService.create(form); toast.success("Personal de seguridad creado"); setOpen(false); setForm(emptyForm); await load() } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo crear el usuario") } finally { setSaving(false) } }
  return <div className="flex flex-col gap-6"><PageHeader title="Personal de seguridad" description="Administra las cuentas que operan el control de acceso de tu conjunto."><Button onClick={() => setOpen(true)}><Plus data-icon="inline-start" />Nuevo usuario</Button></PageHeader><Card><CardHeader><CardTitle>{loading ? "Cargando..." : `${staff.length} usuarios de seguridad`}</CardTitle></CardHeader><CardContent>{!loading && staff.length === 0 ? <EmptyState icon={ShieldCheck} title="Sin personal registrado" description="Crea la primera cuenta para el equipo de seguridad." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-3 py-2 font-medium">Nombre</th><th className="px-3 py-2 font-medium">Correo</th><th className="px-3 py-2 font-medium">Teléfono</th><th className="px-3 py-2 font-medium">Creado</th><th className="px-3 py-2 font-medium">Estado</th></tr></thead><tbody>{staff.map((user) => <tr key={user.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{user.firstName} {user.lastName}</td><td className="px-3 py-3">{user.email}</td><td className="px-3 py-3">{user.phone ?? "-"}</td><td className="px-3 py-3">{new Date(user.createdAt).toLocaleDateString("es-CO")}</td><td className="px-3 py-3"><StatusBadge status={user.status.toLowerCase()} /></td></tr>)}</tbody></table></div>}</CardContent></Card><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Nuevo usuario de seguridad</DialogTitle><DialogDescription>La cuenta podrá validar visitantes y registrar eventos de acceso.</DialogDescription></DialogHeader><form onSubmit={(event) => void submit(event)} className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="firstName">Nombre</Label><Input id="firstName" value={form.firstName} onChange={(event) => setField("firstName", event.target.value)} required /></div><div className="grid gap-2"><Label htmlFor="lastName">Apellido</Label><Input id="lastName" value={form.lastName} onChange={(event) => setField("lastName", event.target.value)} required /></div><div className="grid gap-2 sm:col-span-2"><Label htmlFor="email">Correo electrónico</Label><Input id="email" type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} required /></div><div className="grid gap-2 sm:col-span-2"><Label htmlFor="password">Contraseña temporal</Label><Input id="password" type="password" minLength={8} value={form.password} onChange={(event) => setField("password", event.target.value)} required /></div><div className="grid gap-2 sm:col-span-2"><Label htmlFor="phone">Teléfono</Label><Input id="phone" value={form.phone} onChange={(event) => setField("phone", event.target.value)} /></div><DialogFooter className="sm:col-span-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Creando..." : "Crear usuario"}</Button></DialogFooter></form></DialogContent></Dialog></div>
}
