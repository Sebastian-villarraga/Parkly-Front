"use client"

import * as React from "react"
import { CalendarClock, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/parkly/page-header"
import { EmptyState } from "@/components/parkly/empty-state"
import { StatusBadge } from "@/components/parkly/status-badge"
import { reservationsService } from "@/lib/api/services"
import type { Reservation } from "@/lib/api/types"

export default function ReservationsPage() {
  const [reservations, setReservations] = React.useState<Reservation[]>([])
  const [loading, setLoading] = React.useState(true)
  const load = React.useCallback(async () => { setLoading(true); try { setReservations(await reservationsService.list()) } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudieron cargar las reservas") } finally { setLoading(false) } }, [])
  React.useEffect(() => { void load() }, [load])
  async function cancel(reservation: Reservation) {
    if (!window.confirm("¿Cancelar esta reserva?")) {
      return
    }
    try {
      await reservationsService.cancel(reservation.id)
      toast.success("Reserva cancelada")
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cancelar la reserva")
    }
  }
  return <div className="flex flex-col gap-6"><PageHeader title="Reservas" description="Consulta y administra las reservas del conjunto." /><Card><CardHeader><CardTitle>{loading ? "Cargando..." : `${reservations.length} reservas`}</CardTitle></CardHeader><CardContent>{!loading && reservations.length === 0 ? <EmptyState icon={CalendarClock} title="Sin reservas" description="No hay reservas registradas en el conjunto." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-3 py-2 font-medium">Parqueadero</th><th className="px-3 py-2 font-medium">Residente</th><th className="px-3 py-2 font-medium">Inicio</th><th className="px-3 py-2 font-medium">Fin</th><th className="px-3 py-2 font-medium">Estado</th><th className="px-3 py-2 text-right font-medium">Acciones</th></tr></thead><tbody>{reservations.map((reservation) => <tr key={reservation.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{reservation.parkingSpaceId}</td><td className="px-3 py-3">{reservation.residentId}</td><td className="px-3 py-3">{new Date(reservation.startDateTime).toLocaleString("es-CO")}</td><td className="px-3 py-3">{new Date(reservation.endDateTime).toLocaleString("es-CO")}</td><td className="px-3 py-3"><StatusBadge status={reservation.status.toLowerCase()} /></td><td className="px-3 py-3 text-right">{!["CANCELLED", "COMPLETED", "EXPIRED"].includes(reservation.status) && <Button variant="ghost" size="icon" className="text-destructive" onClick={() => void cancel(reservation)} aria-label="Cancelar reserva"><XCircle /></Button>}</td></tr>)}</tbody></table></div>}</CardContent></Card></div>
}
