import { AppShell } from "@/components/parkly/app-shell"
import { RoleGuard } from "@/components/parkly/role-guard"

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleGuard role="admin">
      <AppShell role="admin">
        {children}
      </AppShell>
    </RoleGuard>
  )
}
