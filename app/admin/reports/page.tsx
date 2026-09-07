"use client"

import * as React from "react"
import { BarChart3, Car, CreditCard, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/parkly/page-header"
import { StatCard } from "@/components/parkly/stat-card"
import { EmptyState } from "@/components/parkly/empty-state"
import { reportsService } from "@/lib/api/services"
import { formatCOP } from "@/lib/format"

interface GroupedRow { status?: string; type?: string; _count?: { _all?: number }; _sum?: { amount?: string | number | null } }
interface OccupancyReport { total: number; byStatus: Array<{ status: string; _count: { _all: number } }> }
interface ReportData { occupancy: OccupancyReport | null; fines: GroupedRow[]; payments: GroupedRow[] }

function label(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/^\w/, (character) => character.toUpperCase()) }
function count(row: GroupedRow) { return row._count?._all ?? 0 }
function amount(row: GroupedRow) { return Number(row._sum?.amount ?? 0) }

export default function ReportsPage() {
  const [data, setData] = React.useState<ReportData>({ occupancy: null, fines: [], payments: [] })
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => { Promise.all([reportsService.parkingOccupancy(), reportsService.fines(), reportsService.payments()]).then(([occupancy, fines, payments]) => setData({ occupancy: occupancy as OccupancyReport, fines: fines as GroupedRow[], payments: payments as GroupedRow[] })).catch((error: Error) => toast.error(error.message)).finally(() => setLoading(false)) }, [])
  const chartData = data.occupancy?.byStatus.map((row) => ({ name: label(row.status), total: row._count._all })) ?? []
  const finesTotal = data.fines.reduce((total, row) => total + amount(row), 0)
  const paymentsTotal = data.payments.reduce((total, row) => total + amount(row), 0)
  return <div className="flex flex-col gap-6"><PageHeader title="Reportes" description="Consulta indicadores operativos y financieros del conjunto." /><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Parqueaderos" value={loading ? "-" : data.occupancy?.total ?? 0} icon={Car} tone="primary" /><StatCard label="Multas" value={loading ? "-" : data.fines.reduce((total, row) => total + count(row), 0)} icon={TriangleAlert} tone="danger" /><StatCard label="Valor multas" value={loading ? "-" : formatCOP(finesTotal)} icon={TriangleAlert} tone="warning" /><StatCard label="Pagos registrados" value={loading ? "-" : formatCOP(paymentsTotal)} icon={CreditCard} tone="success" /></div><div className="grid gap-4 lg:grid-cols-2"><Card><CardHeader><CardTitle>Ocupación de parqueaderos</CardTitle></CardHeader><CardContent>{chartData.length === 0 && !loading ? <EmptyState icon={BarChart3} title="Sin datos de ocupación" /> : <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}</CardContent></Card><Card><CardHeader><CardTitle>Resumen financiero</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-2 py-2 font-medium">Categoría</th><th className="px-2 py-2 font-medium">Estado</th><th className="px-2 py-2 text-right font-medium">Cantidad</th><th className="px-2 py-2 text-right font-medium">Valor</th></tr></thead><tbody>{data.fines.map((row, index) => <tr key={`fine-${row.status}-${index}`} className="border-b"><td className="px-2 py-2">Multas</td><td className="px-2 py-2">{label(row.status ?? "")}</td><td className="px-2 py-2 text-right">{count(row)}</td><td className="px-2 py-2 text-right">{formatCOP(amount(row))}</td></tr>)}{data.payments.map((row, index) => <tr key={`payment-${row.status}-${index}`} className="border-b last:border-0"><td className="px-2 py-2">Pagos</td><td className="px-2 py-2">{label(row.status ?? "")}</td><td className="px-2 py-2 text-right">{count(row)}</td><td className="px-2 py-2 text-right">{formatCOP(amount(row))}</td></tr>)}</tbody></table>{!loading && data.fines.length === 0 && data.payments.length === 0 && <EmptyState icon={BarChart3} title="Sin datos financieros" />}</div></CardContent></Card></div></div>
}
