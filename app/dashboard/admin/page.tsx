'use client'

import { useEffect, useState } from "react"

type Shipment = {
  id: number
  orderId: number
  buyerId: number
  status: string
  address: string
  carrier: string
  shipmentDate: string | null
  estimatedDeliveryDate: string | null
  deliveryDate: string | null
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PREPARING: "En preparación",
  IN_TRANSIT: "En camino",
  DELIVERED: "Entregado",
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#faeeda", color: "#854F0B" },
  PREPARING: { bg: "#f6f0bd", color: "#b5a621" },
  IN_TRANSIT: { bg: "#dbeafe", color: "#1d4ed8" },
  DELIVERED: { bg: "#dcfce7", color: "#15803d" },
}

export default function AdminDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loadingList, setLoadingList] = useState(true)

  useEffect(() => {
    fetch("/api/shipments")
      .then(r => r.json())
      .then(data => {
        setShipments(Array.isArray(data) ? data : [])
        setLoadingList(false)
      })
  }, [])

  const stats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === "PENDING").length,
    transit: shipments.filter(s => s.status === "IN_TRANSIT").length,
    delivered: shipments.filter(s => s.status === "DELIVERED").length,
    delayed: shipments.filter(s =>
      s.estimatedDeliveryDate &&
      s.deliveryDate &&
      new Date(s.deliveryDate).getTime() > new Date(s.estimatedDeliveryDate).getTime()
    ).length,
  }

  const recentShipments = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const key = date.toISOString().slice(0, 10)
    return {
      label: date.toLocaleDateString("es-AR", { weekday: "short" }),
      count: shipments.filter(s => (s.shipmentDate ?? "").slice(0, 10) === key).length,
    }
  })

  const maxRecent = Math.max(...recentShipments.map(d => d.count), 1)
  const deliveryRate = stats.total ? Math.round((stats.delivered / stats.total) * 100) : 0

  const locationCounts = shipments.reduce<Record<string, number>>((acc, s) => {
    const parts = s.address.split(",").map(p => p.trim()).filter(Boolean)
    const location = parts[parts.length - 1] || "Desconocido"
    acc[location] = (acc[location] ?? 0) + 1
    return acc
  }, {})

  const locationData = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const maxLocation = Math.max(...locationData.map(([, v]) => v), 1)

  return (
    <div style={{ width: "92%", maxWidth: 1400, margin: "0 auto", padding: "1.5rem 0" }}>
      <div style={{ fontSize: 18, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>
        Panel de administración
      </div>
      <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: "1.5rem" }}>
        Resumen de métricas, actividad reciente y rendimiento logístico
      </div>

      {/* Stats cards — 2 cols en mobile, 4 en desktop */}
      <div className="grid-stats" style={{ display: "grid", gap: 10, marginBottom: 12 }}>
        {[
          { label: "Total", value: stats.total },
          { label: "Pendientes", value: stats.pending },
          { label: "En tránsito", value: stats.transit },
          { label: "Entregados", value: stats.delivered },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "var(--color-surface)",
            border: "0.5px solid var(--color-border)",
            borderRadius: 12, padding: "0.875rem 1rem",
          }}>
            <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: "var(--foreground)" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row — apilados en mobile, side-by-side en desktop */}
      <div className="grid-charts" style={{ display: "grid", gap: 12, marginBottom: 12 }}>
        {/* Envíos recientes */}
        <div style={{
          background: "var(--color-surface)",
          border: "0.5px solid var(--color-border)",
          borderRadius: 12, padding: "1rem",
        }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 12 }}>
            Envíos recientes
          </div>
          <div style={{ display: "flex", alignItems: "end", gap: 8, height: 160 }}>
            {recentShipments.map(day => (
              <div key={day.label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: 120, display: "flex", alignItems: "end", justifyContent: "center" }}>
                  <div style={{
                    width: "70%",
                    height: `${(day.count / maxRecent) * 100}%`,
                    minHeight: day.count ? 6 : 3,
                    borderRadius: 8,
                    background: "linear-gradient(180deg, #2563eb, #93c5fd)",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--foreground)", marginTop: 6 }}>{day.count}</div>
                <div style={{ fontSize: 10, color: "var(--color-muted)" }}>{day.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución por estado */}
        <div style={{
          background: "var(--color-surface)",
          border: "0.5px solid var(--color-border)",
          borderRadius: 12, padding: "1rem",
        }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 12 }}>
            Distribución por estado
          </div>
          {["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"].map(status => {
            const value = shipments.filter(s => s.status === status).length
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
          <div style={{
            marginTop: 4, paddingTop: 12,
            borderTop: "0.5px solid var(--color-border)",
            display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10,
          }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-muted)" }}>Entregas a tiempo</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)" }}>{deliveryRate}%</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-muted)" }}>Retrasos detectados</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)" }}>{stats.delayed}</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI row — 1 col en mobile, 3 en desktop */}
      <div className="grid-kpi" style={{ display: "grid", gap: 10, marginBottom: 12 }}>
        {[
          { label: "Tasa de entrega", value: `${deliveryRate}%` },
          { label: "En tránsito", value: stats.transit },
          { label: "Retrasos", value: stats.delayed },
        ].map(k => (
          <div key={k.label} style={{
            background: "var(--color-surface)",
            border: "0.5px solid var(--color-border)",
            borderRadius: 12, padding: "0.875rem 1rem",
          }}>
            <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: "var(--foreground)" }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Gráfico de destinos */}
      <div style={{
        background: "var(--color-surface)",
        border: "0.5px solid var(--color-border)",
        borderRadius: 12, padding: "1rem",
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 16 }}>
          Envíos por destino
        </div>
        {loadingList ? (
          <div style={{ fontSize: 13, color: "var(--color-muted)", padding: "1rem 0" }}>Cargando...</div>
        ) : locationData.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--color-muted)", padding: "1rem 0" }}>Sin datos de destino</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {locationData.map(([location, count]) => {
              const pct = Math.round((count / maxLocation) * 100)
              return (
                <div key={location}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{location}</span>
                    <span style={{ color: "var(--color-muted)" }}>{count} envío{count !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ height: 10, background: "var(--color-surface-alt)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", borderRadius: 99,
                      background: "linear-gradient(90deg, #2563eb, #93c5fd)",
                      transition: "width 0.4s ease",
                    }} />
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
        .grid-kpi    { grid-template-columns: repeat(2, 1fr); }

        @media (min-width: 768px) {
          .grid-stats  { grid-template-columns: repeat(4, 1fr); }
          .grid-charts { grid-template-columns: 7fr 5fr; }
          .grid-kpi    { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  )
}