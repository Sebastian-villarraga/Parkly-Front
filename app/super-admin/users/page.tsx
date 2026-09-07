"use client"

import { Eye, Pencil, Plus, ShieldOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/parkly/page-header"
import { DataTable, type Column, type TableFilter } from "@/components/parkly/data-table"
import { StatusBadge } from "@/components/parkly/status-badge"
import { RowActions } from "@/components/parkly/row-actions"
import { PLATFORM_USERS } from "@/lib/mock-data"
import { ROLE_LABEL } from "@/lib/nav-config"
import { formatDate } from "@/lib/format"
import type { PlatformUser } from "@/lib/types"

const initials = (n: string) => n.split(" ").slice(0, 2).map((x) => x[0]).join("").toUpperCase()

export default function PlatformUsersPage() {
  const columns: Column<PlatformUser>[] = [
    {
      key: "name",
      header: "Usuario",
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials(u.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{u.name}</span>
            <span className="text-xs text-muted-foreground">{u.email}</span>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Rol", render: (u) => <Badge variant="secondary">{ROLE_LABEL[u.role]}</Badge> },
    { key: "complexName", header: "Conjunto", render: (u) => u.complexName ?? <span className="text-muted-foreground">Plataforma</span> },
    { key: "lastActive", header: "Última actividad", render: (u) => formatDate(u.lastActive) },
    { key: "status", header: "Estado", render: (u) => <StatusBadge status={u.status} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (u) => (
        <RowActions
          actions={[
            { label: "Ver perfil", icon: Eye, onClick: () => toast.info(u.name) },
            { label: "Editar", icon: Pencil, onClick: () => toast.info(`Editando ${u.name}`) },
            { label: "Desactivar", icon: ShieldOff, variant: "destructive", onClick: () => toast.warning(`${u.name} desactivado`), separatorBefore: true },
          ]}
        />
      ),
    },
  ]

  const filters: TableFilter<PlatformUser>[] = [
    {
      id: "role",
      placeholder: "Rol",
      getValue: (u) => u.role,
      options: [
        { label: "Super Administrador", value: "super_admin" },
        { label: "Administrador", value: "admin" },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Usuarios de la plataforma" description="Super administradores y administradores de conjuntos.">
        <Button onClick={() => toast.info("Invitar usuario")}>
          <Plus data-icon="inline-start" />
          Invitar usuario
        </Button>
      </PageHeader>
      <DataTable
        data={PLATFORM_USERS}
        columns={columns}
        filters={filters}
        searchAccessor={(u) => `${u.name} ${u.email} ${u.complexName ?? ""}`}
        searchPlaceholder="Buscar usuario..."
      />
    </div>
  )
}
