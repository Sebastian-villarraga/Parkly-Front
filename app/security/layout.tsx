import { AppShell } from "@/components/parkly/app-shell"
import { RoleGuard } from "@/components/parkly/role-guard"

export default function SecurityLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleGuard role="security">
      <AppShell role="security">
        {children}
      </AppShell>
    </RoleGuard>
  )
}
