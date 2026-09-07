import { AppShell } from "@/components/parkly/app-shell"
import { RoleGuard } from "@/components/parkly/role-guard"

export default function ResidentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleGuard role="resident">
      <AppShell role="resident">
        {children}
      </AppShell>
    </RoleGuard>
  )
}
