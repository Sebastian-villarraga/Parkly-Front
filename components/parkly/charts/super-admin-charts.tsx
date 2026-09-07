"use client"

import { Area, AreaChart, CartesianGrid, XAxis, Cell, Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const growthData = [
  { month: "Abr", conjuntos: 2, residentes: 380 },
  { month: "May", conjuntos: 2, residentes: 410 },
  { month: "Jun", conjuntos: 3, residentes: 520 },
  { month: "Jul", conjuntos: 3, residentes: 560 },
  { month: "Ago", conjuntos: 4, residentes: 620 },
  { month: "Sep", conjuntos: 5, residentes: 685 },
]

const growthConfig = {
  residentes: { label: "Residentes", color: "var(--chart-1)" },
  conjuntos: { label: "Conjuntos", color: "var(--chart-3)" },
} satisfies ChartConfig

export function GrowthChart() {
  return (
    <ChartContainer config={growthConfig} className="h-64 w-full">
      <AreaChart data={growthData} margin={{ left: 4, right: 4, top: 8 }}>
        <defs>
          <linearGradient id="fillResidentes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-residentes)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-residentes)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="residentes"
          type="natural"
          fill="url(#fillResidentes)"
          stroke="var(--color-residentes)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

const planConfig = {
  value: { label: "Conjuntos" },
  basic: { label: "Básico", color: "var(--chart-4)" },
  professional: { label: "Profesional", color: "var(--chart-1)" },
  enterprise: { label: "Empresarial", color: "var(--chart-5)" },
} satisfies ChartConfig

export function PlanDistributionChart({
  data,
}: {
  data: { plan: string; label: string; value: number; color: string }[]
}) {
  return (
    <ChartContainer config={planConfig} className="mx-auto aspect-square max-h-56">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
        <Pie data={data} dataKey="value" nameKey="label" innerRadius={55} strokeWidth={3}>
          {data.map((entry) => (
            <Cell key={entry.plan} fill={entry.color} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="label" />} className="flex-wrap gap-2" />
      </PieChart>
    </ChartContainer>
  )
}
