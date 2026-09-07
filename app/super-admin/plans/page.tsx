"use client"

import { Check, Building2, SquareParking, Star } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/parkly/page-header"
import { PLANS, COMPLEXES } from "@/lib/mock-data"
import { formatCOP } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function PlansPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Planes" description="Planes de suscripción que ofrece Parkly a los conjuntos." />
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const count = COMPLEXES.filter((c) => c.plan === plan.id).length
          return (
            <Card
              key={plan.id}
              className={cn("relative flex flex-col", plan.highlighted && "border-primary ring-1 ring-primary/30")}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-2.5 left-4 gap-1 bg-primary text-primary-foreground">
                  <Star className="size-3" />
                  Más popular
                </Badge>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{plan.name}</span>
                  <Badge variant="secondary">{count} conjuntos</Badge>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight tabular-nums">{formatCOP(plan.monthlyPrice)}</span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium tabular-nums">{plan.apartmentLimit}</span>
                      <span className="text-xs text-muted-foreground">Apartamentos</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                    <SquareParking className="size-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium tabular-nums">{plan.parkingLimit}</span>
                      <span className="text-xs text-muted-foreground">Parqueaderos</span>
                    </div>
                  </div>
                </div>
                <ul className="flex flex-col gap-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                  onClick={() => toast.info(`Editando plan ${plan.name}`)}
                >
                  Editar plan
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
