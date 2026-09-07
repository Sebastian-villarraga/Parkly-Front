"use client"

import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/parkly/page-header"

function ToggleRow({ title, description, defaultChecked }: { title: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}

export default function SuperAdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Configuración de la plataforma" description="Ajustes globales de Parkly." />
      <Tabs defaultValue="general" className="gap-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Información de la plataforma</CardTitle>
              <CardDescription>Datos generales visibles para los conjuntos.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="brand">Nombre de la plataforma</FieldLabel>
                  <Input id="brand" defaultValue="Parkly" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="support">Correo de soporte</FieldLabel>
                  <Input id="support" type="email" defaultValue="soporte@parkly.co" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="currency">Moneda predeterminada</FieldLabel>
                  <Input id="currency" defaultValue="COP — Peso colombiano" />
                  <FieldDescription>Se usa para todos los conjuntos por defecto.</FieldDescription>
                </Field>
                <Button className="w-fit" onClick={() => toast.success("Cambios guardados")}>
                  Guardar cambios
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Facturación</CardTitle>
              <CardDescription>Preferencias globales de cobro (simulado en el MVP).</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              <ToggleRow title="Cobro automático mensual" description="Genera cargos automáticamente cada mes." defaultChecked />
              <ToggleRow title="Periodo de prueba de 30 días" description="Nuevos conjuntos inician en prueba." defaultChecked />
              <ToggleRow title="Alertas de mora" description="Notificar cuando un conjunto entra en mora." defaultChecked />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad y acceso</CardTitle>
              <CardDescription>Políticas de acceso a la plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              <ToggleRow title="Autenticación de dos factores" description="Requerir 2FA para super administradores." defaultChecked />
              <ToggleRow title="Registro de auditoría" description="Guardar todos los eventos de la plataforma." defaultChecked />
              <ToggleRow title="Cierre de sesión automático" description="Cerrar sesión tras 30 minutos de inactividad." />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Separator />
      <p className="text-xs text-muted-foreground">
        Estos ajustes son de nivel plataforma y no son visibles para los administradores de conjunto.
      </p>
    </div>
  )
}
