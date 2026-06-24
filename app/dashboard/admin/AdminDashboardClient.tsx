'use client'

import { useState, useMemo } from "react"
import DateFilter from "../../components/Datefilter"
import { Shipment, STATUS_LABELS, STATUS_COLORS } from "../../components/shipments"

interface Props {
  shipments: Shipment[]
}

function normalizeLocation(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

function getAvailableMonths(shipments: Shipment[]): { year: number; month: number }[] {
  const set = new Set<string>()
  shipments.forEach(s => {
    const d = new Date(s.createdAt)
    if (!isNaN(d.getTime())) {
      set.add(`${d.getFullYear()}-${d.getMonth()}`)
    }
  })
  return Array.from(set)
    .map(k => {
      const [y, m] = k.split("-").map(Number)
      return { year: y, month: m }
    })
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
}

export default function AdminDashboardClient({ shipments }: Props) {
  const now = new Date()
  const hasCurrentMonth = shipments.some(s => {
    const d = new Date(s.createdAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })

  const [selectedYear, setSelectedYear] = useState<number | null>(hasCurrentMonth ? now.getFullYear() : null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(hasCurrentMonth ? now.getMonth() : null)

  const availableMonths = useMemo(() => getAvailableMonths(shipments), [shipments])

  const filtered = useMemo(() => {
    if (selectedYear === null || selectedMonth === null) {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      sevenDaysAgo.setHours(0, 0, 0, 0)
      return shipments.filter(s => new Date(s.createdAt) >= sevenDaysAgo)
    }
    return shipments.filter(s => {
      const d = new Date(s.createdAt)
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth
    })
  }, [shipments, selectedYear, selectedMonth])

  const stats = {
    total: filtered.length,
    pending: filtered.filter(s => s.status === "PENDING").length,
    transit: filtered.filter(s => s.status === "IN_TRANSIT").length,
    delivered: filtered.filter(s => s.status === "DELIVERED").length,
  }

  const recentShipments = useMemo(() => {
    if (selectedYear !== null && selectedMonth !== null) {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
      const weeks: { label: string; count: number }[] = []
      let weekStart = 1, weekNum = 1
      while (weekStart <= daysInMonth) {
        const weekEnd = Math.min(weekStart + 6, daysInMonth)
        const count = filtered.filter(s => {
          const d = new Date(s.createdAt)
          return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth &&
            d.getDate() >= weekStart && d.getDate() <= weekEnd
        }).length
        weeks.push({ label: `Sem ${weekNum}`, count })
        weekStart += 7; weekNum++
      }
      return weeks
    } else {
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, "0")
        const d = String(date.getDate()).padStart(2, "0")
        const key = `${y}-${m}-${d}`
        return {
          label: date.toLocaleDateString("es-AR", { weekday: "short" }),
          count: shipments.filter(s => s.createdAt.slice(0, 10) === key).length,
        }
      })
    }
  }, [filtered, selectedYear, selectedMonth, shipments])

  const maxRecent = Math.max(...recentShipments.map(d => d.count), 1)
  const deliveryRate = stats.total ? Math.round((stats.delivered / stats.total) * 100) : 0

  const locationCounts = filtered.reduce<Record<string, { label: string; count: number }>>((acc, s) => {
    const parts = s.address.split(",").map(p => p.trim()).filter(Boolean)
    const raw = parts[parts.length - 1] || "Desconocido"
    const key = normalizeLocation(raw)
    if (!acc[key]) acc[key] = { label: raw, count: 0 }
    acc[key].count += 1
    return acc
  }, {})

  const locationData = Object.values(locationCounts).sort((a, b) => b.count - a.count).slice(0, 8)
  const maxLocation = Math.max(...locationData.map(v => v.count), 1)

  return (
    <div style={{ width: "92%", maxWidth: 1400, margin: "0 auto", padding: "1.5rem 0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>Panel de administración</div>
          <div style={{ fontSize: 13, color: "var(--color-muted)" }}>Resumen de métricas, actividad reciente y rendimiento logístico</div>
        </div>
        <DateFilter
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          availableMonths={availableMonths}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          onClear={() => { setSelectedYear(null); setSelectedMonth(null) }}
        />
      </div>

      <div className="grid-stats" style={{ display: "grid", gap: 10, marginBottom: 12 }}>
        {[
          { label: "Total", value: stats.total },
          { label: "Pendientes", value: stats.pending },
          { label: "En tránsito", value: stats.transit },
          { label: "Entregados", value: stats.delivered },
        ].map(stat => (
          <div key={stat.label} style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "0.875rem 1rem" }}>
            <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: "var(--foreground)" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-charts" style={{ display: "grid", gap: 12, marginBottom: 12 }}>
        <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1rem" }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 12 }}>
            {selectedYear !== null && selectedMonth !== null
              ? `Pedidos recibidos — ${["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][selectedMonth]} ${selectedYear}`
              : "Pedidos recibidos (últimos 7 días)"}
          </div>
          <div style={{ display: "flex", alignItems: "end", gap: 8, height: 160 }}>
            {recentShipments.map(day => (
              <div key={day.label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: 120, display: "flex", alignItems: "end", justifyContent: "center" }}>
                  <div style={{ width: "70%", height: `${(day.count / maxRecent) * 100}%`, minHeight: day.count ? 6 : 3, borderRadius: 8, background: "linear-gradient(180deg, #2563eb, #93c5fd)" }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--foreground)", marginTop: 6 }}>{day.count}</div>
                <div style={{ fontSize: 10, color: "var(--color-muted)" }}>{day.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1rem" }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 12 }}>Distribución por estado</div>
          {["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"].map(status => {
            const value = filtered.filter(s => s.status === status).length
            const pct = stats.total ? Math.round((value / stats.total) * 100) : 0
            const c = STATUS_COLORS[status]
            return (
              <div key={status} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "var(--foreground)" }}>{STATUS_LABELS[status]}</span>
                  <span style={{ color: "var(--color-muted)" }}>{value} · {pct}%</span>
                </div>
                <div style={{ height: 8, background: "var(--color-surface-alt)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: c.bg }} />
                </div>
              </div>
            )
          })}
          <div style={{ marginTop: 4, paddingTop: 12, borderTop: "0.5px solid var(--color-border)" }}>
            <div style={{ fontSize: 11, color: "var(--color-muted)" }}>Tasa de entrega</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)" }}>{deliveryRate}%</div>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1rem" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 16 }}>Envíos por destino</div>
        {locationData.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--color-muted)", padding: "1rem 0" }}>Sin datos de destino</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {locationData.map(({ label, count }) => {
              const pct = Math.round((count / maxLocation) * 100)
              return (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{label}</span>
                    <span style={{ color: "var(--color-muted)" }}>{count} envío{count !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ height: 10, background: "var(--color-surface-alt)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #2563eb, #93c5fd)", transition: "width 0.4s ease" }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .grid-stats  { grid-template-columns: repeat(2, 1fr); }
        .grid-charts { grid-template-columns: 1fr; }
        @media (min-width: 768px) {
          .grid-stats  { grid-template-columns: repeat(4, 1fr); }
          .grid-charts { grid-template-columns: 7fr 5fr; }
        }
      `}</style>
    </div>
  )
}