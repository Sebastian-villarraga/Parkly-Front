"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/parkly/empty-state"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
  align?: "left" | "right" | "center"
}

export interface TableFilter<T> {
  id: string
  placeholder: string
  options: { label: string; value: string }[]
  getValue: (row: T) => string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchAccessor,
  searchPlaceholder = "Buscar...",
  filters = [],
  pageSize = 10,
  onRowClick,
}: {
  data: T[]
  columns: Column<T>[]
  searchAccessor?: (row: T) => string
  searchPlaceholder?: string
  filters?: TableFilter<T>[]
  pageSize?: number
  onRowClick?: (row: T) => void
}) {
  const [query, setQuery] = React.useState("")
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({})
  const [page, setPage] = React.useState(0)

  const filtered = React.useMemo(() => {
    return data.filter((row) => {
      if (searchAccessor && query.trim()) {
        if (!searchAccessor(row).toLowerCase().includes(query.trim().toLowerCase())) return false
      }
      for (const f of filters) {
        const selected = filterValues[f.id]
        if (selected && selected !== "all" && f.getValue(row) !== selected) return false
      }
      return true
    })
  }, [data, query, filterValues, filters, searchAccessor])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, pageCount - 1)
  const rows = filtered.slice(current * pageSize, current * pageSize + pageSize)

  React.useEffect(() => setPage(0), [query, filterValues])

  return (
    <Card className="gap-0 overflow-hidden py-0">
      {(searchAccessor || filters.length > 0) && (
        <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center">
          {searchAccessor && (
            <InputGroup className="sm:max-w-xs">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
          )}
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            {filters.map((f) => (
              <Select
                key={f.id}
                value={filterValues[f.id] ?? "all"}
                onValueChange={(v) => setFilterValues((prev) => ({ ...prev, [f.id]: v as string }))}
              >
                <SelectTrigger size="sm" className="min-w-36">
                  <SelectValue placeholder={f.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{f.placeholder}</SelectItem>
                  {f.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className,
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.className,
                    )}
                  >
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="Sin resultados"
            description="No se encontraron registros con los filtros aplicados."
            className="m-3 border-0"
          />
        )}
      </div>

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2.5">
          <span className="text-xs text-muted-foreground">
            {current * pageSize + 1}–{Math.min((current + 1) * pageSize, filtered.length)} de{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
              aria-label="Anterior"
            >
              <ChevronLeft />
            </Button>
            <span className="px-1 text-xs text-muted-foreground">
              {current + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={current >= pageCount - 1}
              onClick={() => setPage(current + 1)}
              aria-label="Siguiente"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
