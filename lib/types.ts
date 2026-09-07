// Parkly domain model.
// Every complex-scoped entity carries a `complexId` (tenantId) so the data layer
// is ready for a real multi-tenant PostgreSQL/Supabase backend with RLS later.

export type Role = "super_admin" | "admin" | "security" | "resident"

export type SubscriptionStatus = "active" | "trial" | "suspended" | "cancelled"
export type PlanId = "basic" | "professional" | "enterprise"

export interface Plan {
  id: PlanId
  name: string
  monthlyPrice: number
  apartmentLimit: number
  parkingLimit: number
  features: string[]
  highlighted?: boolean
}

export interface Complex {
  id: string
  name: string
  city: string
  address: string
  contactName: string
  contactEmail: string
  contactPhone: string
  apartments: number
  parkingSpaces: number
  activeResidents: number
  plan: PlanId
  subscriptionStatus: SubscriptionStatus
  status: "active" | "suspended"
  createdAt: string
  monthlyRevenue: number
}

export interface Subscription {
  id: string
  complexId: string
  complexName: string
  plan: PlanId
  monthlyPrice: number
  startDate: string
  minimumCommitmentMonths: number
  nextBillingDate: string
  status: SubscriptionStatus
}

export interface PlatformUser {
  id: string
  name: string
  email: string
  role: Role
  complexId: string | null
  complexName: string | null
  status: "active" | "inactive"
  lastActive: string
}

export type VehicleType = "car" | "motorcycle" | "bicycle" | "other"
export interface Vehicle {
  id: string
  complexId: string
  plate: string
  type: VehicleType
  brand: string
  model: string
  color: string
  residentId: string
  residentName: string
  apartmentId: string
  apartmentLabel: string
  status: "active" | "inactive"
  insideComplex: boolean
}

export interface Apartment {
  id: string
  complexId: string
  number: string
  tower: string
  residentIds: string[]
  vehicleCount: number
  parkingCount: number
  status: "occupied" | "vacant"
}

export interface Resident {
  id: string
  complexId: string
  apartmentId: string
  apartmentLabel: string
  name: string
  email: string
  phone: string
  vehicleCount: number
  parkingLabel: string | null
  status: "active" | "inactive"
  joinedAt: string
}

export type ParkingType =
  | "fixed"
  | "communal"
  | "draw"
  | "visitor"
  | "temporary"
  | "special"

export type ParkingStatus =
  | "available"
  | "occupied"
  | "reserved"
  | "assigned"
  | "maintenance"

export interface ParkingSpace {
  id: string
  complexId: string
  number: string
  tower: string
  type: ParkingType
  status: ParkingStatus
  apartmentLabel: string | null
  residentName: string | null
  vehiclePlate: string | null
  assignedAt: string | null
  assignmentMethod: string | null
}

export type AssignmentType = "fixed" | "draw" | "reservation" | "temporary" | "special"
export interface Assignment {
  id: string
  complexId: string
  apartmentLabel: string
  residentName: string
  parkingNumber: string
  type: AssignmentType
  startDate: string
  endDate: string | null
  status: "active" | "expired" | "pending"
}

export interface ParkingDraw {
  id: string
  complexId: string
  name: string
  participatingApartments: number
  availableSpaces: number
  drawDate: string
  validFrom: string
  validTo: string
  status: "draft" | "scheduled" | "completed"
  results?: { apartmentLabel: string; parkingNumber: string }[]
}

export type ReservationStatus = "upcoming" | "active" | "completed" | "cancelled"
export interface Reservation {
  id: string
  complexId: string
  parkingNumber: string
  residentName: string
  apartmentLabel: string
  date: string
  startTime: string
  endTime: string
  status: ReservationStatus
}

export type VisitorStatus = "authorized" | "inside" | "exited" | "expired" | "cancelled"
export interface Visitor {
  id: string
  complexId: string
  name: string
  identification: string
  plate: string
  residentName: string
  apartmentLabel: string
  date: string
  entryTime: string
  expectedExitTime: string
  status: VisitorStatus
  code: string
}

export type FineStatus = "pending" | "paid" | "overdue" | "cancelled"
export interface Fine {
  id: string
  complexId: string
  residentName: string
  apartmentLabel: string
  reason: string
  amount: number
  date: string
  dueDate: string
  status: FineStatus
}

export type PaymentStatus = "pending" | "paid" | "overdue"
export interface Payment {
  id: string
  complexId: string
  concept: string
  residentName: string
  apartmentLabel: string
  amount: number
  dueDate: string
  status: PaymentStatus
  paidDate: string | null
  receipt: string | null
}

export interface NotificationItem {
  id: string
  complexId: string
  title: string
  description: string
  type: "draw" | "assignment" | "visitor" | "fine" | "payment" | "reservation"
  createdAt: string
  read: boolean
}

export interface AuditEvent {
  id: string
  complexId: string | null
  user: string
  role: Role
  action: string
  module: string
  timestamp: string
  description: string
  status: "success" | "warning" | "info"
}

export interface SecurityStaff {
  id: string
  complexId: string
  name: string
  identification: string
  phone: string
  shift: "morning" | "afternoon" | "night"
  status: "active" | "inactive"
}

export interface AccessLog {
  id: string
  complexId: string
  plate: string
  driver: string
  apartmentLabel: string
  kind: "resident" | "visitor"
  direction: "entry" | "exit"
  timestamp: string
  guard: string
}
