"use client"

import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/parkly/page-header"
import { DataTable, type Column, type TableFilter } from "@/components/parkly/data-table"
import { StatusBadge } from "@/components/parkly/status-badge"
import { PLATFORM_AUDIT } from "@/lib/mock-data"
import { formatDateTime } from "@/lib/format"
import { ROLE_LABEL } from "@/lib/nav-config"
import type { AuditEvent } from "@/lib/types"

export default function SuperAdminAuditPage() {
  const columns: Column<AuditEvent>[] = [
    { key: "user", header: "Usuario", render: (e) => <span className="font-medium">{e.user}</span> },
    { key: "role", header: "Rol", render: (e) => <Badge variant="secondary">{ROLE_LABEL[e.role]}</Badge> },
    { key: "action", header: "Acción" },
    { key: "module", header: "Módulo", render: (e) => <span className="text-muted-foreground">{e.module}</span> },
    { key: "description", header: "Descripción", render: (e) => <span className="text-muted-foreground">{e.description}</span> },
    { key: "timestamp", header: "Fecha", render: (e) => formatDateTime(e.timestamp) },
    { key: "status", header: "Estado", render: (e) => <StatusBadge status={e.status} /> },
  ]

  const filters: TableFilter<AuditEvent>[] = [
    {
      id: "module",
      placeholder: "Módulo",
      getValue: (e) => e.module,
      options: [...new Set(PLATFORM_AUDIT.map((e) => e.module))].map((m) => ({ label: m, value: m })),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Actividad / Auditoría" description="Eventos a nivel de plataforma." />
      <DataTable
        data={PLATFORM_AUDIT}
        columns={columns}
        filters={filters}
        searchAccessor={(e) => `${e.user} ${e.action} ${e.description}`}
        searchPlaceholder="Buscar evento..."
        pageSize={15}
      />
    </div>
  )
}
