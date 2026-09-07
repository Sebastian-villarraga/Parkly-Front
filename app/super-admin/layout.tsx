import { AppShell } from "@/components/parkly/app-shell"
import { RoleGuard } from "@/components/parkly/role-guard"

export default function SuperAdminLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <RoleGuard role="super_admin">
      <AppShell role="super_admin">
        {children}
      </AppShell>
    </RoleGuard>
  )
}
