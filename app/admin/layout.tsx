import { AppShell } from "@/components/parkly/app-shell"
import { RoleGuard } from "@/components/parkly/role-guard"
import { DEFAULT_COMPLEX_ID, getDataset } from "@/lib/mock-data"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { notifications } = getDataset(DEFAULT_COMPLEX_ID)
  return (
    <RoleGuard role="admin">
      <AppShell role="admin" notifications={notifications}>
        {children}
      </AppShell>
    </RoleGuard>
  )
}
