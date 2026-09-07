import { AppShell } from "@/components/parkly/app-shell"
import { RoleGuard } from "@/components/parkly/role-guard"
import { PLATFORM_AUDIT } from "@/lib/mock-data"
import type { NotificationItem } from "@/lib/types"

const notifications: NotificationItem[] = PLATFORM_AUDIT.map((e) => ({
  id: e.id,
  complexId: e.complexId,
  title: e.action,
  description: e.description,
  type: "assignment",
  createdAt: e.timestamp,
  read: false,
}))

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="super_admin">
      <AppShell role="super_admin" notifications={notifications}>
        {children}
      </AppShell>
    </RoleGuard>
  )
}
