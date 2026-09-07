import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Tone = "primary" | "success" | "warning" | "info" | "danger" | "neutral"

const ICON_TONE: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/20 text-warning-foreground dark:text-warning",
  info: "bg-info/12 text-info",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
  trend,
  className,
}: {
  label: string
  value: string | number
  icon?: LucideIcon
  tone?: Tone
  hint?: string
  trend?: { value: string; positive?: boolean }
  className?: string
}) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </span>
          {(hint || trend) && (
            <div className="mt-0.5 flex items-center gap-2 text-xs">
              {trend && (
                <span className={cn(trend.positive ? "text-success" : "text-destructive")}>
                  {trend.value}
                </span>
              )}
              {hint && <span className="text-muted-foreground">{hint}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", ICON_TONE[tone])}>
            <Icon className="size-[18px]" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
