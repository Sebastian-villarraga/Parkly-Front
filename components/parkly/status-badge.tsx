import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Tone = "success" | "warning" | "info" | "danger" | "primary" | "neutral"

const TONE_CLASS: Record<Tone, string> = {
  success: "bg-success/15 text-success",
  info: "bg-info/15 text-info",
  danger: "bg-destructive/12 text-destructive",
  primary: "bg-primary/12 text-primary",
  neutral: "bg-muted text-muted-foreground",
  warning: "bg-warning/20 text-warning-foreground dark:text-warning",
}

// Central mapping of every domain status string -> Spanish label + tone.
const STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  // generic
  active: { label: "Activo", tone: "success" },
  inactive: { label: "Inactivo", tone: "neutral" },
  // subscriptions / complex
  trial: { label: "Prueba", tone: "info" },
  suspended: { label: "Suspendido", tone: "danger" },
  cancelled: { label: "Cancelado", tone: "neutral" },
  occupied: { label: "Ocupado", tone: "danger" },
  vacant: { label: "Vacante", tone: "neutral" },
  // parking status
  available: { label: "Disponible", tone: "success" },
  reserved: { label: "Reservado", tone: "warning" },
  assigned: { label: "Asignado", tone: "info" },
  maintenance: { label: "Mantenimiento", tone: "neutral" },
  // draw
  draft: { label: "Borrador", tone: "neutral" },
  scheduled: { label: "Programado", tone: "info" },
  completed: { label: "Completado", tone: "success" },
  // reservations
  upcoming: { label: "Próxima", tone: "info" },
  // visitors
  authorized: { label: "Autorizado", tone: "info" },
  inside: { label: "Adentro", tone: "success" },
  exited: { label: "Salió", tone: "neutral" },
  expired: { label: "Expirado", tone: "warning" },
  // fines / payments
  pending: { label: "Pendiente", tone: "warning" },
  paid: { label: "Pagado", tone: "success" },
  overdue: { label: "Vencido", tone: "danger" },
  // audit
  success: { label: "Éxito", tone: "success" },
  info: { label: "Info", tone: "info" },
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string
  label?: string
  className?: string
}) {
  const entry = STATUS_MAP[status] ?? { label: label ?? status, tone: "neutral" as Tone }
  return (
    <Badge className={cn("gap-1.5", TONE_CLASS[entry.tone], className)}>
      <span
        className={cn("size-1.5 rounded-full bg-current", entry.tone === "neutral" && "opacity-60")}
      />
      {label ?? entry.label}
    </Badge>
  )
}
