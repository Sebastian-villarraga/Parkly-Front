"use client"

import { Eye, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/parkly/page-header"
import { DataTable, type Column, type TableFilter } from "@/components/parkly/data-table"
import { StatusBadge } from "@/components/parkly/status-badge"
import { StatCard } from "@/components/parkly/stat-card"
import { RowActions } from "@/components/parkly/row-actions"
import { PLANS, SUBSCRIPTIONS, PLATFORM_STATS } from "@/lib/mock-data"
import { formatCOP, formatDate } from "@/lib/format"
import { DollarSign, CheckCircle2, Clock } from "lucide-react"
import type { Subscription } from "@/lib/types"

const planName = (id: string) => PLANS.find((p) => p.id === id)?.name ?? id

export default function SubscriptionsPage() {
  const columns: Column<Subscription>[] = [
    { key: "complexName", header: "Conjunto", render: (s) => <span className="font-medium">{s.complexName}</span> },
    { key: "plan", header: "Plan", render: (s) => planName(s.plan) },
    { key: "monthlyPrice", header: "Precio mensual", align: "right", render: (s) => <span className="tabular-nums">{formatCOP(s.monthlyPrice)}</span> },
    { key: "startDate", header: "Inicio", render: (s) => formatDate(s.startDate) },
    { key: "minimumCommitmentMonths", header: "Permanencia", align: "right", render: (s) => `${s.minimumCommitmentMonths} meses` },
    { key: "nextBillingDate", header: "Próximo cobro", render: (s) => (s.nextBillingDate === "—" ? "—" : formatDate(s.nextBillingDate)) },
    { key: "status", header: "Estado", render: (s) => <StatusBadge status={s.status} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (s) => (
        <RowActions
          actions={[
            { label: "Ver detalle", icon: Eye, onClick: () => toast.info(`Suscripción de ${s.complexName}`) },
            { label: "Renovar", icon: RefreshCw, onClick: () => toast.success(`Suscripción de ${s.complexName} renovada`) },
          ]}
        />
      ),
    },
  ]

  const filters: TableFilter<Subscription>[] = [
    {
      id: "status",
      placeholder: "Estado",
      getValue: (s) => s.status,
      options: [
        { label: "Activo", value: "active" },
        { label: "Prueba", value: "trial" },
        { label: "Suspendido", value: "suspended" },
      ],
    },
  ]

  const active = SUBSCRIPTIONS.filter((s) => s.status === "active")
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Suscripciones" description="Estado de facturación de cada conjunto." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="MRR activo" value={formatCOP(PLATFORM_STATS.mrr)} icon={DollarSign} tone="success" />
        <StatCard label="Suscripciones activas" value={active.length} icon={CheckCircle2} tone="primary" />
        <StatCard label="En periodo de prueba" value={PLATFORM_STATS.trialComplexes} icon={Clock} tone="info" />
      </div>
      <DataTable
        data={SUBSCRIPTIONS}
        columns={columns}
        filters={filters}
        searchAccessor={(s) => s.complexName}
        searchPlaceholder="Buscar conjunto..."
      />
    </div>
  )
}
