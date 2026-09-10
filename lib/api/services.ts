import { api, clearTokens, storeTokens } from "./client"
import type { AuthResponse, User, SecurityUser, Complex, Plan, Subscription, Apartment, Resident, Vehicle, ParkingSpace, ParkingAssignment, ParkingDraw, Reservation, VisitorAuthorization, AccessEvent, Fine, Charge, Payment, AuditLog, RoleDashboardConfig } from "./types"

export const authService = {
  login: async (email: string, password: string) => {
    const result = await api.post<AuthResponse>("/auth/login", { email, password })
    storeTokens(result.accessToken, result.refreshToken)
    return result
  },
  me: () => api.get<User>("/auth/me"),
  logout: async () => {
    const refreshToken = typeof window === "undefined" ? null : localStorage.getItem("parkly.refreshToken")
    try { if (refreshToken) await api.post<void>("/auth/logout", { refreshToken }) } finally { clearTokens() }
  },
  forgotPassword: (email: string) => api.post<{ message: string }>("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) => api.post<void>("/auth/reset-password", { token, password }),
}

const crud = <T>(path: string) => ({
  list: () => api.get<T[]>(`/${path}`),
  get: (id: string) => api.get<T>(`/${path}/${id}`),
  create: (body: unknown) => api.post<T>(`/${path}`, body),
  update: (id: string, body: unknown) => api.patch<T>(`/${path}/${id}`, body),
})

export const complexesService = { ...crud<Complex>("complexes"), updateStatus: (id: string, status: Complex["status"]) => api.patch<Complex>(`/complexes/${id}/status`, { status }), createAdmin: (id: string, body: unknown) => api.post<User>(`/complexes/${id}/admin`, body) }
export const plansService = crud<Plan>("plans")
export const subscriptionsService = crud<Subscription>("subscriptions")
export const apartmentsService = crud<Apartment>("apartments")
export const residentsService = { ...crud<Resident>("residents"), me: () => api.get<Resident>("/residents/me"), remove: (id: string) => api.delete<Resident>(`/residents/${id}`) }
export const vehiclesService = { ...crud<Vehicle>("vehicles"), remove: (id: string) => api.delete<Vehicle>(`/vehicles/${id}`) }
export const parkingSpacesService = crud<ParkingSpace>("parking-spaces")
export const assignmentsService = { ...crud<ParkingAssignment>("parking-assignments"), cancel: (id: string) => api.patch<ParkingAssignment>(`/parking-assignments/${id}/cancel`, {}) }
export const drawsService = { ...crud<ParkingDraw>("parking-draws"), execute: (id: string) => api.post<ParkingDraw>(`/parking-draws/${id}/execute`) }
export const reservationsService = { ...crud<Reservation>("reservations"), cancel: (id: string) => api.patch<Reservation>(`/reservations/${id}/cancel`, {}) }
export const visitorsService = { list: () => api.get<VisitorAuthorization[]>("/visitors/authorizations"), getByCode: (code: string) => api.get<VisitorAuthorization>(`/visitors/authorizations/code/${encodeURIComponent(code)}`), create: (body: unknown) => api.post<VisitorAuthorization>("/visitors/authorizations", body), cancel: (id: string) => api.patch<VisitorAuthorization>(`/visitors/authorizations/${id}/cancel`, {}) }
export const accessControlService = { events: () => api.get<AccessEvent[]>("/access-control/events"), createEvent: (body: unknown) => api.post<AccessEvent>("/access-control/events", body), createIncident: (body: unknown) => api.post<unknown>("/access-control/incidents", body) }
export const finesService = crud<Fine>("fines")
export const chargesService = crud<Charge>("charges")
export const paymentsService = { ...crud<Payment>("payments"), confirm: (id: string) => api.post<Payment>(`/payments/${id}/confirm`) }
export const auditService = { list: () => api.get<AuditLog[]>("/audit"), platform: () => api.get<AuditLog[]>("/audit/platform"), logs: () => api.get<AuditLog[]>("/audit/logs") }
export const securityUsersService = { list: () => api.get<SecurityUser[]>("/users/security"), create: (body: unknown) => api.post<SecurityUser>("/users/security", body) }
export const settingsService = { getDashboard: () => api.get<RoleDashboardConfig>("/settings/dashboard"), updateDashboard: (body: RoleDashboardConfig) => api.patch<RoleDashboardConfig>("/settings/dashboard", body) }
export const reportsService = { parkingOccupancy: () => api.get<unknown>("/reports/parking-occupancy"), access: () => api.get<unknown>("/reports/access"), fines: () => api.get<unknown>("/reports/fines"), payments: () => api.get<unknown>("/reports/payments"), reservations: () => api.get<unknown>("/reports/reservations"), assignments: () => api.get<unknown>("/reports/assignments") }