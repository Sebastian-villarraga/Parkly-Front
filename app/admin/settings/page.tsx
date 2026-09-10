"use client"

import * as React from "react"
import { Bell, Check, Settings2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/parkly/page-header"
import type { RoleDashboardConfig } from "@/lib/api/types"
import { settingsService } from "@/lib/api/services"

const STORAGE_KEY = "parkly.admin.preferences"
interface Preferences { emailNotifications: boolean; compactTables: boolean; defaultPageSize: string }
const defaults: Preferences = { emailNotifications: true, compactTables: false, defaultPageSize: "10" }
const defaultDashboard: RoleDashboardConfig = { title: "Centro de operaciones", description: "Una vista clara del estado de tu conjunto residencial.", imageUrl: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1600&q=85", showMetrics: true, showActivity: true, showQuickLinks: true }

export default function AdminSettingsPage() {
  const [preferences, setPreferences] = React.useState<Preferences>(defaults)
  const [dashboard, setDashboard] = React.useState<RoleDashboardConfig>(defaultDashboard)
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setPreferences({ ...defaults, ...JSON.parse(stored) })
      void settingsService.getDashboard().then(setDashboard).catch(() => setDashboard(defaultDashboard))
    } catch { /* ignore malformed local preferences */ }
  }, [])
  function update(field: keyof Preferences, value: boolean | string) { setPreferences((current) => ({ ...current, [field]: value })) }
  function updateDashboard(field: keyof RoleDashboardConfig, value: boolean | string) { setDashboard((current) => ({ ...current, [field]: value })) }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); toast.success("Preferencias guardadas en este dispositivo") }
  async function saveDashboard() { try { const saved = await settingsService.updateDashboard(dashboard); setDashboard(saved); toast.success("Dashboard guardado para el conjunto") } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar el dashboard") } }
  return <div className="flex flex-col gap-6"><PageHeader title="Configuración del panel" description="Personaliza tu experiencia como administrador del conjunto." /><Card><CardHeader><CardTitle className="flex items-center gap-2"><Settings2 className="size-5 text-primary" />Dashboard compartido</CardTitle><CardDescription>Estos cambios se reflejan en los dashboards de administración, seguridad y residentes en este navegador.</CardDescription></CardHeader><CardContent className="flex flex-col gap-5"><div className="grid gap-2"><Label htmlFor="dashboardTitle">Título principal</Label><Input id="dashboardTitle" value={dashboard.title} onChange={(event) => updateDashboard("title", event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="dashboardDescription">Descripción</Label><Input id="dashboardDescription" value={dashboard.description} onChange={(event) => updateDashboard("description", event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="dashboardImage">URL de imagen de portada</Label><Input id="dashboardImage" type="url" value={dashboard.imageUrl} onChange={(event) => updateDashboard("imageUrl", event.target.value)} /></div><div className="flex items-center justify-between gap-4 border-b pb-4"><div><Label htmlFor="showMetrics" className="text-sm font-medium">Mostrar métricas</Label><p className="text-sm text-muted-foreground">Indicadores de espacios, vehículos, reservas y alertas.</p></div><Switch id="showMetrics" checked={dashboard.showMetrics} onCheckedChange={(checked) => updateDashboard("showMetrics", checked)} /></div><div className="flex items-center justify-between gap-4 border-b pb-4"><div><Label htmlFor="showActivity" className="text-sm font-medium">Mostrar actividad reciente</Label><p className="text-sm text-muted-foreground">Eventos de auditoría y control de acceso.</p></div><Switch id="showActivity" checked={dashboard.showActivity} onCheckedChange={(checked) => updateDashboard("showActivity", checked)} /></div><div className="flex items-center justify-between gap-4"><div><Label htmlFor="showQuickLinks" className="text-sm font-medium">Mostrar accesos rápidos</Label><p className="text-sm text-muted-foreground">Enlaces a las tareas más utilizadas.</p></div><Switch id="showQuickLinks" checked={dashboard.showQuickLinks} onCheckedChange={(checked) => updateDashboard("showQuickLinks", checked)} /></div><Button className="w-fit" onClick={saveDashboard}><Check data-icon="inline-start" />Guardar dashboard</Button></CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="size-5 text-primary" />Preferencias de administración</CardTitle><CardDescription>Estas preferencias se guardan únicamente en este navegador.</CardDescription></CardHeader><CardContent className="flex flex-col gap-5"><div className="flex items-center justify-between gap-4 border-b pb-4"><div><Label htmlFor="emailNotifications" className="text-sm font-medium">Notificaciones del panel</Label><p className="text-sm text-muted-foreground">Mantener activados los avisos visuales de operaciones.</p></div><Switch id="emailNotifications" checked={preferences.emailNotifications} onCheckedChange={(checked) => update("emailNotifications", checked)} /></div><div className="flex items-center justify-between gap-4 border-b pb-4"><div><Label htmlFor="compactTables" className="text-sm font-medium">Tablas compactas</Label><p className="text-sm text-muted-foreground">Usar una densidad menor para consultar más registros.</p></div><Switch id="compactTables" checked={preferences.compactTables} onCheckedChange={(checked) => update("compactTables", checked)} /></div><div className="grid max-w-xs gap-2"><Label htmlFor="defaultPageSize">Registros por página</Label><Input id="defaultPageSize" type="number" min="5" max="50" value={preferences.defaultPageSize} onChange={(event) => update("defaultPageSize", event.target.value)} /></div><Button className="w-fit" onClick={save}><Check data-icon="inline-start" />Guardar preferencias</Button></CardContent></Card></div>
}
