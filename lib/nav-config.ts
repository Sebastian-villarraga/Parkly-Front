import type { LucideIcon } from "lucide-react"
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Building2,
  Car,
  CalendarClock,
  ClipboardList,
  CreditCard,
  Dices,
  Home,
  LayoutDashboard,
  Package,
  ScanLine,
  ScrollText,
  Settings,
  ShieldCheck,
  SquareParking,
  TriangleAlert,
  User,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react"
import type { Role } from "./types"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}
export interface NavGroup {
  label?: string
  items: NavItem[]
}

export const NAV_BY_ROLE: Record<Role, NavGroup[]> = {
  super_admin: [
    {
      items: [
        { title: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
        { title: "Conjuntos residenciales", href: "/super-admin/complexes", icon: Building2 },
      ],
    },
    {
      label: "Comercial",
      items: [
        { title: "Suscripciones", href: "/super-admin/subscriptions", icon: CreditCard },
        { title: "Planes", href: "/super-admin/plans", icon: Package },
      ],
    },
    {
      label: "Plataforma",
      items: [
        { title: "Usuarios", href: "/super-admin/users", icon: Users },
        { title: "Actividad / Auditoría", href: "/super-admin/audit", icon: ScrollText },
        { title: "Configuración", href: "/super-admin/settings", icon: Settings },
      ],
    },
  ],
  admin: [
    {
      items: [{ title: "Dashboard", href: "/admin", icon: LayoutDashboard }],
    },
    {
      label: "Comunidad",
      items: [
        { title: "Residentes", href: "/admin/residents", icon: Users },
        { title: "Apartamentos", href: "/admin/apartments", icon: Building2 },
        { title: "Vehículos", href: "/admin/vehicles", icon: Car },
      ],
    },
    {
      label: "Parqueaderos",
      items: [
        { title: "Parqueaderos", href: "/admin/parking", icon: SquareParking },
        { title: "Asignaciones", href: "/admin/assignments", icon: ClipboardList },
        { title: "Sorteos", href: "/admin/draws", icon: Dices },
        { title: "Reservas", href: "/admin/reservations", icon: CalendarClock },
        { title: "Visitantes", href: "/admin/visitors", icon: UserCheck },
      ],
    },
    {
      label: "Finanzas",
      items: [
        { title: "Multas", href: "/admin/fines", icon: TriangleAlert },
        { title: "Pagos", href: "/admin/payments", icon: Wallet },
        { title: "Reportes", href: "/admin/reports", icon: BarChart3 },
      ],
    },
    {
      label: "Administración",
      items: [
        { title: "Personal de seguridad", href: "/admin/security-staff", icon: ShieldCheck },
        { title: "Auditoría", href: "/admin/audit", icon: ScrollText },
        { title: "Configuración", href: "/admin/settings", icon: Settings },
      ],
    },
  ],
  security: [
    {
      items: [
        { title: "Inicio", href: "/security", icon: LayoutDashboard },
        { title: "Validar vehículo", href: "/security/validate", icon: ScanLine },
        { title: "Visitantes", href: "/security/visitors", icon: UserCheck },
        { title: "Ingresos y salidas", href: "/security/access", icon: ArrowLeftRight },
      ],
    },
  ],
  resident: [
    {
      items: [
        { title: "Inicio", href: "/resident", icon: Home },
        { title: "Mis vehículos", href: "/resident/vehicles", icon: Car },
        { title: "Mi parqueadero", href: "/resident/parking", icon: SquareParking },
        { title: "Reservas", href: "/resident/reservations", icon: CalendarClock },
        { title: "Visitantes", href: "/resident/visitors", icon: UserCheck },
        { title: "Sorteos", href: "/resident/draws", icon: Dices },
        { title: "Multas", href: "/resident/fines", icon: TriangleAlert },
        { title: "Pagos", href: "/resident/payments", icon: Wallet },
        { title: "Notificaciones", href: "/resident/notifications", icon: Bell },
        { title: "Perfil", href: "/resident/profile", icon: User },
      ],
    },
  ],
}

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Administrador",
  admin: "Administrador",
  security: "Seguridad",
  resident: "Residente",
}
