import type {
  AccessLog,
  Apartment,
  Assignment,
  AuditEvent,
  Complex,
  Fine,
  NotificationItem,
  ParkingDraw,
  ParkingSpace,
  ParkingStatus,
  ParkingType,
  Payment,
  Plan,
  PlatformUser,
  Reservation,
  Resident,
  SecurityStaff,
  Subscription,
  Vehicle,
  VehicleType,
} from "./types"

// Deterministic PRNG so mock data is identical on server and client (no hydration drift).
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260907)
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
const chance = (p: number) => rand() < p

export const DEFAULT_COMPLEX_ID = "cx-nogales"

const FIRST_NAMES = [
  "Andrés", "Camila", "Santiago", "Valentina", "Mateo", "Isabella", "Sebastián",
  "Sofía", "Nicolás", "Mariana", "Juan", "Daniela", "Carlos", "Laura", "David",
  "Paula", "Felipe", "Andrea", "Diego", "Catalina", "Julián", "Natalia", "Miguel",
  "Gabriela", "Ricardo", "Luisa", "Fernando", "Ángela", "Óscar", "Carolina",
]
const LAST_NAMES = [
  "Rodríguez", "Gómez", "González", "Ramírez", "Torres", "Martínez", "López",
  "Herrera", "Vargas", "Castro", "Jiménez", "Moreno", "Rojas", "Muñoz", "Ospina",
  "Cárdenas", "Quintero", "Restrepo", "Arango", "Salazar", "Peña", "Guerrero",
]
const CAR_BRANDS = ["Renault", "Chevrolet", "Mazda", "Toyota", "Kia", "Nissan", "Volkswagen", "Ford"]
const CAR_MODELS = ["Logan", "Sail", "CX-30", "Corolla", "Sportage", "Versa", "Gol", "Ecosport"]
const MOTO_BRANDS = ["Yamaha", "Bajaj", "AKT", "Honda", "Suzuki"]
const MOTO_MODELS = ["FZ", "Pulsar", "NKD", "CB160", "Gixxer"]
const BIKE_BRANDS = ["GW", "Trek", "Specialized", "Óptimus"]
const COLORS = ["Blanco", "Gris", "Negro", "Rojo", "Azul", "Plata", "Verde"]
const TOWERS = ["Torre 1", "Torre 2", "Torre 3", "Torre 4"]

function letters(n: number) {
  let s = ""
  for (let i = 0; i < n; i++) s += String.fromCharCode(65 + Math.floor(rand() * 26))
  return s
}
function plate(type: VehicleType) {
  if (type === "motorcycle") return `${letters(3)}${int(10, 99)}${letters(1)}`
  if (type === "bicycle") return `BIC-${int(100, 999)}`
  return `${letters(3)}${int(100, 999)}`
}
function fullName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)} ${pick(LAST_NAMES)}`
}
function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 86400000).toISOString()
}
function isoDaysAhead(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString()
}

// ---------------------------------------------------------------------------
// Platform-level data
// ---------------------------------------------------------------------------

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Básico",
    monthlyPrice: 350000,
    apartmentLimit: 80,
    parkingLimit: 100,
    features: ["Gestión de parqueaderos", "Residentes y vehículos", "Control de visitantes", "Soporte por correo"],
  },
  {
    id: "professional",
    name: "Profesional",
    monthlyPrice: 750000,
    apartmentLimit: 200,
    parkingLimit: 250,
    features: [
      "Todo lo del plan Básico",
      "Sorteos de parqueadero",
      "Reservas y asignaciones",
      "Multas y pagos",
      "Reportes avanzados",
      "Soporte prioritario",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Empresarial",
    monthlyPrice: 1250000,
    apartmentLimit: 600,
    parkingLimit: 800,
    features: [
      "Todo lo del plan Profesional",
      "Múltiples torres y sedes",
      "Auditoría completa",
      "Integraciones y API",
      "Gerente de cuenta dedicado",
    ],
  },
]

export const COMPLEXES: Complex[] = [
  {
    id: DEFAULT_COMPLEX_ID,
    name: "Conjunto Residencial Los Nogales",
    city: "Bogotá",
    address: "Calle 127 # 45-30",
    contactName: "Martha Lucía Peña",
    contactEmail: "admin@losnogales.co",
    contactPhone: "+57 310 456 7890",
    apartments: 150,
    parkingSpaces: 180,
    activeResidents: 180,
    plan: "professional",
    subscriptionStatus: "active",
    status: "active",
    createdAt: "2024-03-12",
    monthlyRevenue: 750000,
  },
  {
    id: "cx-portal",
    name: "Portal de la Sabana",
    city: "Chía",
    address: "Autopista Norte km 21",
    contactName: "Jorge Enrique Díaz",
    contactEmail: "admin@portalsabana.co",
    contactPhone: "+57 315 222 1188",
    apartments: 96,
    parkingSpaces: 110,
    activeResidents: 112,
    plan: "professional",
    subscriptionStatus: "active",
    status: "active",
    createdAt: "2024-06-01",
    monthlyRevenue: 750000,
  },
  {
    id: "cx-mirador",
    name: "Mirador de la Colina",
    city: "Medellín",
    address: "Carrera 43A # 5-15",
    contactName: "Sandra Milena Ruiz",
    contactEmail: "admin@miradorcolina.co",
    contactPhone: "+57 300 987 6543",
    apartments: 220,
    parkingSpaces: 260,
    activeResidents: 245,
    plan: "enterprise",
    subscriptionStatus: "active",
    status: "active",
    createdAt: "2023-11-20",
    monthlyRevenue: 1250000,
  },
  {
    id: "cx-brisas",
    name: "Brisas del Río",
    city: "Barranquilla",
    address: "Calle 84 # 51-40",
    contactName: "Álvaro Gutiérrez",
    contactEmail: "admin@brisasrio.co",
    contactPhone: "+57 320 111 2233",
    apartments: 64,
    parkingSpaces: 70,
    activeResidents: 58,
    plan: "basic",
    subscriptionStatus: "trial",
    status: "active",
    createdAt: "2026-08-15",
    monthlyRevenue: 0,
  },
  {
    id: "cx-cedro",
    name: "Cedro Real",
    city: "Cali",
    address: "Avenida 6N # 28-10",
    contactName: "Liliana Ochoa",
    contactEmail: "admin@cedroreal.co",
    contactPhone: "+57 318 444 5566",
    apartments: 120,
    parkingSpaces: 130,
    activeResidents: 90,
    plan: "professional",
    subscriptionStatus: "suspended",
    status: "suspended",
    createdAt: "2024-01-08",
    monthlyRevenue: 0,
  },
]

export const SUBSCRIPTIONS: Subscription[] = COMPLEXES.map((c, i) => ({
  id: `sub-${i + 1}`,
  complexId: c.id,
  complexName: c.name,
  plan: c.plan,
  monthlyPrice: PLANS.find((p) => p.id === c.plan)!.monthlyPrice,
  startDate: c.createdAt,
  minimumCommitmentMonths: 12,
  nextBillingDate: c.subscriptionStatus === "active" ? isoDaysAhead(int(3, 28)).slice(0, 10) : "—",
  status: c.subscriptionStatus,
}))

export const PLATFORM_USERS: PlatformUser[] = [
  {
    id: "u-super",
    name: "Ana María Vélez",
    email: "ana.velez@parkly.co",
    role: "super_admin",
    complexId: null,
    complexName: null,
    status: "active",
    lastActive: isoDaysAgo(0),
  },
  ...COMPLEXES.map((c, i) => ({
    id: `u-admin-${i + 1}`,
    name: c.contactName,
    email: c.contactEmail,
    role: "admin" as const,
    complexId: c.id,
    complexName: c.name,
    status: (c.status === "suspended" ? "inactive" : "active") as "active" | "inactive",
    lastActive: isoDaysAgo(int(0, 9)),
  })),
]

// ---------------------------------------------------------------------------
// Per-complex data generation (rich data for the default complex)
// ---------------------------------------------------------------------------

interface ComplexDataset {
  apartments: Apartment[]
  residents: Resident[]
  vehicles: Vehicle[]
  parking: ParkingSpace[]
  assignments: Assignment[]
  draws: ParkingDraw[]
  reservations: Reservation[]
  visitors: Visitor[]
  fines: Fine[]
  payments: Payment[]
  notifications: NotificationItem[]
  audit: AuditEvent[]
  security: SecurityStaff[]
  access: AccessLog[]
}

function buildDataset(complexId: string, aptCount: number, parkingCount: number): ComplexDataset {
  const apartments: Apartment[] = []
  for (let i = 0; i < aptCount; i++) {
    const tower = TOWERS[i % TOWERS.length]
    const floor = int(1, 15)
    const unit = (i % 3) + 1
    apartments.push({
      id: `${complexId}-apt-${i + 1}`,
      complexId,
      number: `${floor}0${unit}`,
      tower,
      residentIds: [],
      vehicleCount: 0,
      parkingCount: 0,
      status: chance(0.9) ? "occupied" : "vacant",
    })
  }

  const residents: Resident[] = []
  const occupied = apartments.filter((a) => a.status === "occupied")
  const residentTarget = Math.round(aptCount * 1.2)
  for (let i = 0; i < residentTarget; i++) {
    const apt = occupied[i % occupied.length]
    const name = fullName()
    const id = `${complexId}-res-${i + 1}`
    apt.residentIds.push(id)
    residents.push({
      id,
      complexId,
      apartmentId: apt.id,
      apartmentLabel: `${apt.tower} · ${apt.number}`,
      name,
      email: `${name.split(" ")[0].toLowerCase()}.${name.split(" ")[1].toLowerCase()}@correo.co`,
      phone: `+57 3${int(10, 29)} ${int(100, 999)} ${int(1000, 9999)}`,
      vehicleCount: 0,
      parkingLabel: null,
      status: chance(0.94) ? "active" : "inactive",
      joinedAt: isoDaysAgo(int(30, 700)).slice(0, 10),
    })
  }

  const vehicles: Vehicle[] = []
  const vehicleTarget = Math.round(aptCount * 1.33)
  for (let i = 0; i < vehicleTarget; i++) {
    const res = residents[i % residents.length]
    const roll = rand()
    const type: VehicleType = roll < 0.68 ? "car" : roll < 0.9 ? "motorcycle" : roll < 0.97 ? "bicycle" : "other"
    const brand = type === "car" ? pick(CAR_BRANDS) : type === "motorcycle" ? pick(MOTO_BRANDS) : pick(BIKE_BRANDS)
    const model = type === "car" ? pick(CAR_MODELS) : type === "motorcycle" ? pick(MOTO_MODELS) : "—"
    res.vehicleCount++
    const apt = apartments.find((a) => a.id === res.apartmentId)!
    apt.vehicleCount++
    vehicles.push({
      id: `${complexId}-veh-${i + 1}`,
      complexId,
      plate: plate(type),
      type,
      brand,
      model,
      color: pick(COLORS),
      residentId: res.id,
      residentName: res.name,
      apartmentId: res.apartmentId,
      apartmentLabel: res.apartmentLabel,
      status: chance(0.93) ? "active" : "inactive",
      insideComplex: chance(0.62),
    })
  }

  const typeWeights: [ParkingType, number][] = [
    ["fixed", 0.55],
    ["communal", 0.15],
    ["draw", 0.12],
    ["visitor", 0.08],
    ["temporary", 0.06],
    ["special", 0.04],
  ]
  function parkingType(): ParkingType {
    const r = rand()
    let acc = 0
    for (const [t, w] of typeWeights) {
      acc += w
      if (r < acc) return t
    }
    return "fixed"
  }
  const parking: ParkingSpace[] = []
  const assignments: Assignment[] = []
  for (let i = 0; i < parkingCount; i++) {
    const type = parkingType()
    const tower = TOWERS[i % TOWERS.length]
    const number = `P-${String(i + 1).padStart(3, "0")}`
    let status: ParkingStatus = "available"
    let apt: Apartment | null = null
    let res: Resident | null = null
    let vehiclePlate: string | null = null
    let assignedAt: string | null = null
    let method: string | null = null

    if (type === "visitor") {
      status = chance(0.35) ? "occupied" : "available"
      if (status === "occupied") vehiclePlate = plate("car")
    } else if (type === "fixed") {
      apt = pick(occupied)
      res = residents.find((r) => r.apartmentId === apt!.id) ?? null
      status = chance(0.7) ? "occupied" : "assigned"
      method = "Asignación fija"
      assignedAt = isoDaysAgo(int(30, 500)).slice(0, 10)
      apt.parkingCount++
      if (res) {
        res.parkingLabel = number
        const veh = vehicles.find((v) => v.residentId === res!.id)
        vehiclePlate = veh?.plate ?? null
      }
      assignments.push({
        id: `${complexId}-asg-${assignments.length + 1}`,
        complexId,
        apartmentLabel: `${apt.tower} · ${apt.number}`,
        residentName: res?.name ?? "—",
        parkingNumber: number,
        type: "fixed",
        startDate: assignedAt,
        endDate: null,
        status: "active",
      })
    } else if (type === "draw") {
      if (chance(0.6)) {
        apt = pick(occupied)
        res = residents.find((r) => r.apartmentId === apt!.id) ?? null
        status = "assigned"
        method = "Sorteo 2026-2"
        assignedAt = isoDaysAgo(int(5, 60)).slice(0, 10)
        assignments.push({
          id: `${complexId}-asg-${assignments.length + 1}`,
          complexId,
          apartmentLabel: `${apt.tower} · ${apt.number}`,
          residentName: res?.name ?? "—",
          parkingNumber: number,
          type: "draw",
          startDate: assignedAt,
          endDate: isoDaysAhead(180).slice(0, 10),
          status: "active",
        })
      }
    } else if (type === "communal" || type === "temporary") {
      const roll = rand()
      status = roll < 0.4 ? "occupied" : roll < 0.55 ? "reserved" : "available"
    } else if (type === "special") {
      status = chance(0.5) ? "assigned" : "available"
      if (status === "assigned") method = "Asignación especial"
    }
    if (chance(0.03)) status = "maintenance"

    parking.push({
      id: `${complexId}-prk-${i + 1}`,
      complexId,
      number,
      tower,
      type,
      status,
      apartmentLabel: apt ? `${apt.tower} · ${apt.number}` : null,
      residentName: res?.name ?? null,
      vehiclePlate,
      assignedAt,
      assignmentMethod: method,
    })
  }

  const draws: ParkingDraw[] = [
    {
      id: `${complexId}-draw-2`,
      complexId,
      name: "Sorteo de Parqueaderos — 2026 Semestre 2",
      participatingApartments: 134,
      availableSpaces: 110,
      drawDate: "2026-09-15",
      validFrom: "2026-09-16",
      validTo: "2027-03-15",
      status: "scheduled",
    },
    {
      id: `${complexId}-draw-1`,
      complexId,
      name: "Sorteo de Parqueaderos — 2026 Semestre 1",
      participatingApartments: 128,
      availableSpaces: 108,
      drawDate: "2026-03-15",
      validFrom: "2026-03-16",
      validTo: "2026-09-15",
      status: "completed",
      results: Array.from({ length: 12 }).map((_, i) => ({
        apartmentLabel: `${pick(TOWERS)} · ${int(1, 15)}0${(i % 3) + 1}`,
        parkingNumber: `P-${String(int(1, parkingCount)).padStart(3, "0")}`,
      })),
    },
  ]

  const resStatuses: Reservation["status"][] = ["upcoming", "active", "completed", "cancelled"]
  const communalSpaces = parking.filter((p) => p.type === "communal" || p.type === "temporary")
  const reservations: Reservation[] = Array.from({ length: 24 }).map((_, i) => {
    const res = pick(residents)
    const space = communalSpaces.length ? pick(communalSpaces) : pick(parking)
    const status = resStatuses[i % resStatuses.length]
    const day = status === "upcoming" ? int(1, 10) : status === "completed" ? -int(1, 20) : 0
    const start = int(6, 18)
    return {
      id: `${complexId}-rsv-${i + 1}`,
      complexId,
      parkingNumber: space.number,
      residentName: res.name,
      apartmentLabel: res.apartmentLabel,
      date: (day >= 0 ? isoDaysAhead(day) : isoDaysAgo(-day)).slice(0, 10),
      startTime: `${String(start).padStart(2, "0")}:00`,
      endTime: `${String(start + int(1, 4)).padStart(2, "0")}:00`,
      status,
    }
  })

  const visStatuses: Visitor["status"][] = ["authorized", "inside", "exited", "expired", "cancelled"]
  const visitors: Visitor[] = Array.from({ length: 28 }).map((_, i) => {
    const res = pick(residents)
    const status = visStatuses[i % visStatuses.length]
    const start = int(7, 20)
    return {
      id: `${complexId}-vis-${i + 1}`,
      complexId,
      name: fullName(),
      identification: `${int(10, 99)}.${int(100, 999)}.${int(100, 999)}`,
      plate: plate("car"),
      residentName: res.name,
      apartmentLabel: res.apartmentLabel,
      date: (status === "authorized" ? isoDaysAhead(int(0, 3)) : isoDaysAgo(int(0, 5))).slice(0, 10),
      entryTime: `${String(start).padStart(2, "0")}:${pick(["00", "15", "30", "45"])}`,
      expectedExitTime: `${String(Math.min(start + int(1, 5), 23)).padStart(2, "0")}:00`,
      status,
      code: `PK-${letters(2)}${int(1000, 9999)}`,
    }
  })

  const FINE_REASONS = [
    "Parqueo en zona no autorizada",
    "Vehículo sin registro vigente",
    "Uso indebido de parqueadero de visitantes",
    "Exceso de velocidad en zona común",
    "Obstrucción de vía de acceso",
    "Parqueo en espacio de discapacitados",
  ]
  const fineStatuses: Fine["status"][] = ["pending", "paid", "overdue", "cancelled"]
  const fines: Fine[] = Array.from({ length: 22 }).map((_, i) => {
    const res = pick(residents)
    return {
      id: `${complexId}-fine-${i + 1}`,
      complexId,
      residentName: res.name,
      apartmentLabel: res.apartmentLabel,
      reason: pick(FINE_REASONS),
      amount: pick([85000, 120000, 150000, 220000, 300000]),
      date: isoDaysAgo(int(1, 60)).slice(0, 10),
      dueDate: isoDaysAhead(int(-10, 20)).slice(0, 10),
      status: fineStatuses[i % fineStatuses.length],
    }
  })

  const payStatuses: Payment["status"][] = ["paid", "pending", "overdue"]
  const payments: Payment[] = Array.from({ length: 30 }).map((_, i) => {
    const res = pick(residents)
    const status = payStatuses[i % payStatuses.length]
    return {
      id: `${complexId}-pay-${i + 1}`,
      complexId,
      concept: pick(["Administración mensual", "Cuota parqueadero", "Multa de tránsito interno", "Reserva zona común"]),
      residentName: res.name,
      apartmentLabel: res.apartmentLabel,
      amount: pick([150000, 250000, 320000, 450000, 1250000]),
      dueDate: isoDaysAhead(int(-15, 15)).slice(0, 10),
      status,
      paidDate: status === "paid" ? isoDaysAgo(int(1, 20)).slice(0, 10) : null,
      receipt: status === "paid" ? `REC-${int(10000, 99999)}` : null,
    }
  })

  const notifications: NotificationItem[] = [
    { type: "draw", title: "Sorteo de parqueaderos programado", description: "El sorteo 2026-2 se realizará el 15 de septiembre." },
    { type: "assignment", title: "Cambio de asignación de parqueadero", description: "Se actualizó la asignación del parqueadero P-045." },
    { type: "visitor", title: "Visitante autorizado", description: "Se autorizó el ingreso de un visitante para hoy." },
    { type: "fine", title: "Nueva multa registrada", description: "Se registró una multa por parqueo indebido." },
    { type: "payment", title: "Recordatorio de pago", description: "La administración mensual vence pronto." },
    { type: "reservation", title: "Reserva confirmada", description: "Tu reserva de parqueadero fue confirmada." },
  ].map((n, i) => ({
    id: `${complexId}-not-${i + 1}`,
    complexId,
    ...n,
    type: n.type as NotificationItem["type"],
    createdAt: isoDaysAgo(i),
    read: i > 2,
  }))

  const auditActions: Omit<AuditEvent, "id" | "complexId" | "timestamp">[] = [
    { user: "Martha Lucía Peña", role: "admin", action: "Cambió asignación de parqueadero", module: "Asignaciones", description: "P-045 reasignado a Torre 2 · 803", status: "success" },
    { user: "Carlos Mendoza", role: "security", action: "Registró ingreso de vehículo", module: "Control de acceso", description: "Placa KLM432 ingresó al conjunto", status: "info" },
    { user: "Valentina Torres", role: "resident", action: "Creó autorización de visitante", module: "Visitantes", description: "Autorización PK-AB1234 generada", status: "info" },
    { user: "Martha Lucía Peña", role: "admin", action: "Creó multa", module: "Multas", description: "Multa por parqueo en zona no autorizada", status: "warning" },
    { user: "Carlos Mendoza", role: "security", action: "Registró salida de vehículo", module: "Control de acceso", description: "Placa QRS221 salió del conjunto", status: "info" },
    { user: "Martha Lucía Peña", role: "admin", action: "Ejecutó sorteo de parqueaderos", module: "Sorteos", description: "Sorteo 2026-1 completado con 108 asignaciones", status: "success" },
    { user: "Andrés Gómez", role: "resident", action: "Registró un vehículo", module: "Vehículos", description: "Nuevo vehículo Mazda CX-30", status: "info" },
    { user: "Martha Lucía Peña", role: "admin", action: "Registró pago", module: "Pagos", description: "Pago de administración recibido", status: "success" },
  ]
  const audit: AuditEvent[] = Array.from({ length: 18 }).map((_, i) => {
    const base = auditActions[i % auditActions.length]
    return { id: `${complexId}-aud-${i + 1}`, complexId, ...base, timestamp: isoDaysAgo(0 + i * 0.12) }
  })

  const security: SecurityStaff[] = [
    { name: "Carlos Mendoza", shift: "morning" },
    { name: "Jairo Beltrán", shift: "afternoon" },
    { name: "Wilson Cárdenas", shift: "night" },
    { name: "Édgar Nieto", shift: "night" },
  ].map((s, i) => ({
    id: `${complexId}-sec-${i + 1}`,
    complexId,
    name: s.name,
    identification: `${int(10, 99)}.${int(100, 999)}.${int(100, 999)}`,
    phone: `+57 3${int(10, 29)} ${int(100, 999)} ${int(1000, 9999)}`,
    shift: s.shift as SecurityStaff["shift"],
    status: "active",
  }))

  const access: AccessLog[] = Array.from({ length: 20 }).map((_, i) => {
    const veh = pick(vehicles)
    const isVisitor = chance(0.3)
    return {
      id: `${complexId}-acc-${i + 1}`,
      complexId,
      plate: isVisitor ? plate("car") : veh.plate,
      driver: isVisitor ? fullName() : veh.residentName,
      apartmentLabel: veh.apartmentLabel,
      kind: isVisitor ? "visitor" : "resident",
      direction: i % 2 === 0 ? "entry" : "exit",
      timestamp: isoDaysAgo(i * 0.05),
      guard: pick(security).name,
    }
  })

  return {
    apartments,
    residents,
    vehicles,
    parking,
    assignments,
    draws,
    reservations,
    visitors,
    fines,
    payments,
    notifications,
    audit,
    security,
    access,
  }
}

export const DATASETS: Record<string, ComplexDataset> = {
  [DEFAULT_COMPLEX_ID]: buildDataset(DEFAULT_COMPLEX_ID, 150, 180),
}

export function getDataset(complexId: string): ComplexDataset {
  return DATASETS[complexId] ?? DATASETS[DEFAULT_COMPLEX_ID]
}

export function getComplex(complexId: string): Complex {
  return COMPLEXES.find((c) => c.id === complexId) ?? COMPLEXES[0]
}

// Platform-wide aggregates for the super admin dashboard.
export const PLATFORM_STATS = {
  totalComplexes: COMPLEXES.length,
  activeComplexes: COMPLEXES.filter((c) => c.subscriptionStatus === "active").length,
  trialComplexes: COMPLEXES.filter((c) => c.subscriptionStatus === "trial").length,
  suspendedComplexes: COMPLEXES.filter((c) => c.subscriptionStatus === "suspended").length,
  mrr: COMPLEXES.reduce((sum, c) => sum + c.monthlyRevenue, 0),
  totalResidents: COMPLEXES.reduce((sum, c) => sum + c.activeResidents, 0),
  totalParking: COMPLEXES.reduce((sum, c) => sum + c.parkingSpaces, 0),
}

export const PLATFORM_AUDIT: AuditEvent[] = [
  { user: "Ana María Vélez", role: "super_admin", action: "Activó conjunto residencial", module: "Conjuntos", description: "Brisas del Río pasó a periodo de prueba", status: "success", complexId: "cx-brisas" },
  { user: "Ana María Vélez", role: "super_admin", action: "Suspendió conjunto", module: "Suscripciones", description: "Cedro Real suspendido por falta de pago", status: "warning", complexId: "cx-cedro" },
  { user: "Jorge Enrique Díaz", role: "admin", action: "Actualizó plan", module: "Planes", description: "Portal de la Sabana cambió a plan Profesional", status: "info", complexId: "cx-portal" },
  { user: "Sandra Milena Ruiz", role: "admin", action: "Renovó suscripción", module: "Suscripciones", description: "Mirador de la Colina renovó plan Empresarial", status: "success", complexId: "cx-mirador" },
  { user: "Ana María Vélez", role: "super_admin", action: "Creó usuario administrador", module: "Usuarios", description: "Nuevo administrador para Brisas del Río", status: "info", complexId: "cx-brisas" },
].map((e, i) => ({ id: `plat-aud-${i + 1}`, timestamp: new Date(Date.now() - i * 3600000 * 5).toISOString(), ...e } as AuditEvent))
