"use client"

import { Building2, Eye, Pencil, PlayCircle, PauseCircle, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/parkly/page-header"
import { DataTable, type Column, type TableFilter } from "@/components/parkly/data-table"
import { StatusBadge } from "@/components/parkly/status-badge"
import { RowActions } from "@/components/parkly/row-actions"
import { COMPLEXES, PLANS } from "@/lib/mock-data"
import { formatNumber } from "@/lib/format"
import type { Complex } from "@/lib/types"

const planName = (id: string) => PLANS.find((p) => p.id === id)?.name ?? id

export default function ComplexesPage() {
  const columns: Column<Complex>[] = [
    {
      key: "name",
      header: "Conjunto",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{c.name}</span>
            <span className="text-xs text-muted-foreground">{c.address}</span>
          </div>
        </div>
      ),
    },
    { key: "city", header: "Ciudad" },
    { key: "apartments", header: "Aptos", align: "right", render: (c) => formatNumber(c.apartments) },
    { key: "parkingSpaces", header: "Parqueaderos", align: "right", render: (c) => formatNumber(c.parkingSpaces) },
    { key: "activeResidents", header: "Residentes", align: "right", render: (c) => formatNumber(c.activeResidents) },
    { key: "plan", header: "Plan", render: (c) => <span className="text-sm">{planName(c.plan)}</span> },
    { key: "subscriptionStatus", header: "Suscripción", render: (c) => <StatusBadge status={c.subscriptionStatus} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <RowActions
          actions={[
            { label: "Ver detalle", icon: Eye, onClick: () => toast.info(`Abriendo ${c.name}`) },
            { label: "Editar", icon: Pencil, onClick: () => toast.info(`Editando ${c.name}`) },
            c.status === "suspended"
              ? { label: "Activar", icon: PlayCircle, onClick: () => toast.success(`${c.name} activado`), separatorBefore: true }
              : { label: "Suspender", icon: PauseCircle, variant: "destructive", onClick: () => toast.warning(`${c.name} suspendido`), separatorBefore: true },
          ]}
        />
      ),
    },
  ]

  const filters: TableFilter<Complex>[] = [
    {
      id: "status",
      placeholder: "Suscripción",
      getValue: (c) => c.subscriptionStatus,
      options: [
        { label: "Activo", value: "active" },
        { label: "Prueba", value: "trial" },
        { label: "Suspendido", value: "suspended" },
      ],
    },
    {
      id: "plan",
      placeholder: "Plan",
      getValue: (c) => c.plan,
      options: PLANS.map((p) => ({ label: p.name, value: p.id })),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Conjuntos residenciales"
        description="Administra todos los conjuntos que usan Parkly."
      >
        <Button onClick={() => toast.info("Formulario de nuevo conjunto")}>
          <Plus data-icon="inline-start" />
          Nuevo conjunto
        </Button>
      </PageHeader>
      <DataTable
        data={COMPLEXES}
        columns={columns}
        filters={filters}
        searchAccessor={(c) => `${c.name} ${c.city}`}
        searchPlaceholder="Buscar conjunto..."
      />
    </div>
  )
}
