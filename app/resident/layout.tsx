import { AppShell } from "@/components/parkly/app-shell"
import { RoleGuard } from "@/components/parkly/role-guard"
import { DEFAULT_COMPLEX_ID, getDataset } from "@/lib/mock-data"

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const { notifications } = getDataset(DEFAULT_COMPLEX_ID)
  return (
    <RoleGuard role="resident">
      <AppShell role="resident" notifications={notifications}>
        {children}
      </AppShell>
    </RoleGuard>
  )
}
