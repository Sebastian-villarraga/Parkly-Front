export type BackendRole = "SUPERADMIN" | "ADMIN" | "SECURITY" | "RESIDENT"
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"
export type ComplexStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE"
export type VehicleType = "CAR" | "MOTORCYCLE" | "BICYCLE" | "OTHER"
export type ParkingSpaceType = "FIXED" | "COMMUNAL" | "DRAW" | "VISITOR" | "TEMPORARY" | "SPECIAL"
export type ParkingSpaceStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "ASSIGNED" | "MAINTENANCE"
export type AssignmentType = "FIXED" | "DRAW" | "TEMPORARY" | "SPECIAL"
export type AssignmentStatus = "ACTIVE" | "EXPIRED" | "CANCELLED"
export type ReservationStatus = "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED"
export type VisitorAuthorizationStatus = "AUTHORIZED" | "INSIDE" | "EXITED" | "EXPIRED" | "CANCELLED"
export type AccessEventType = "VEHICLE_ENTRY" | "VEHICLE_EXIT" | "VISITOR_ENTRY" | "VISITOR_EXIT"
export type FineStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"
export type ChargeStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"
export type PaymentStatus = "PENDING" | "CONFIRMED" | "FAILED" | "REFUNDED"
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELLED" | "SUSPENDED" | "EXPIRED"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: BackendRole
  complexId: string | null
  status: UserStatus
  lastLoginAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Complex { id: string; name: string; address: string; city: string; phone: string | null; email: string | null; numberOfApartments: number; status: ComplexStatus; createdAt: string; updatedAt: string }
export interface Apartment { id: string; complexId: string; tower: string | null; number: string; floor: string | null; status: "ACTIVE" | "INACTIVE"; createdAt: string; updatedAt: string }
export interface Resident { id: string; userId: string; complexId: string; apartmentId: string; identificationType: string; identificationNumber: string; emergencyContact: string | null; status: "ACTIVE" | "INACTIVE"; createdAt: string; updatedAt: string; user?: User; apartment?: Apartment }
export interface Vehicle { id: string; complexId: string; residentId: string; plate: string; type: VehicleType; brand: string | null; model: string | null; color: string | null; status: "ACTIVE" | "INACTIVE"; createdAt: string; updatedAt: string; resident?: Resident }
export interface ParkingSpace { id: string; complexId: string; number: string; type: ParkingSpaceType; status: ParkingSpaceStatus; location: string | null; notes: string | null; createdAt: string; updatedAt: string }
export interface ParkingAssignment { id: string; complexId: string; parkingSpaceId: string; apartmentId: string | null; residentId: string | null; vehicleId: string | null; type: AssignmentType; startDate: string; endDate: string | null; status: AssignmentStatus; createdById: string; createdAt: string; updatedAt: string }
export interface ParkingDraw { id: string; complexId: string; name: string; scheduledAt: string | null; validFrom: string; validUntil: string; status: "DRAFT" | "SCHEDULED" | "RUNNING" | "COMPLETED" | "CANCELLED"; executedAt: string | null; executedById: string | null; createdAt: string; updatedAt: string; participants?: unknown[]; results?: unknown[] }
export interface Reservation { id: string; complexId: string; parkingSpaceId: string; residentId: string; startDateTime: string; endDateTime: string; status: ReservationStatus; createdAt: string; updatedAt: string }
export interface VisitorAuthorization { id: string; complexId: string; visitorId: string; residentId: string; apartmentId: string; plate: string | null; validFrom: string; validUntil: string; status: VisitorAuthorizationStatus; authorizationCode: string; createdAt: string; updatedAt: string; visitor?: { id: string; fullName: string; identificationNumber: string | null; phone: string | null } }
export interface AccessEvent { id: string; complexId: string; vehicleId: string | null; visitorAuthorizationId: string | null; type: AccessEventType; registeredById: string; timestamp: string; notes: string | null }
export interface Fine { id: string; complexId: string; residentId: string; apartmentId: string; reason: string; amount: string | number; issuedAt: string; dueDate: string; status: FineStatus; createdById: string; createdAt: string; updatedAt: string; resident?: Resident; apartment?: Apartment }
export interface Charge { id: string; complexId: string; residentId: string; concept: string; amount: string | number; dueDate: string; status: ChargeStatus; createdAt: string; updatedAt: string; resident?: Resident; payments?: Payment[] }
export interface Payment { id: string; chargeId: string; residentId: string; amount: string | number; paymentDate: string; method: string; status: PaymentStatus; reference: string | null; createdAt: string; updatedAt: string; charge?: Charge; resident?: Resident }
export interface Plan { id: string; name: string; monthlyPrice: string | number; maxApartments: number; maxParkingSpaces: number; maxSecurityUsers: number; features: Record<string, boolean | string | number>; active: boolean; createdAt: string; updatedAt: string }
export interface Subscription { id: string; complexId: string; planId: string; status: SubscriptionStatus; startDate: string; endDate: string | null; minimumCommitmentMonths: number; nextBillingDate: string; createdAt: string; updatedAt: string }
export interface Notification { id: string; userId: string; complexId: string | null; title: string; message: string; type: "PARKING" | "VISITOR" | "PAYMENT" | "FINE" | "DRAW" | "SYSTEM"; read: boolean; createdAt: string }
export interface AuditLog { id: string; complexId: string | null; userId: string | null; action: string; entity: string; entityId: string | null; oldValue: unknown; newValue: unknown; ipAddress: string | null; userAgent: string | null; createdAt: string }
export interface AuthResponse { accessToken: string; refreshToken: string; user: User; role: BackendRole; complexId: string | null }