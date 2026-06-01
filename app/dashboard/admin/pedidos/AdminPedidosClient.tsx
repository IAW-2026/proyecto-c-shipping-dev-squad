'use client'

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Shipment, TrackingItem,
  ShipmentCard, ShipmentFilters, StatusBadge,
  TrackingHistory, ShipmentInfo, ProductList, ShipmentStepper,
  ShipmentSearch
} from "../../../components/shipments"
import { StatusEditor } from "../../../components/shipments/StatusEditor"
import { Pagination } from "../../../components/Pagination"

interface Props {
  shipments: Shipment[]
  total: number
  currentPage: number
  totalPages: number
}

export default function AdminPedidosClient({ shipments, total, currentPage, totalPages }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [selected, setSelected] = useState<Shipment | null>(null)
  const [tracking, setTracking] = useState<TrackingItem[]>([])
  const [editando, setEditando] = useState(false)

  const filtro = searchParams.get("status") ?? "TODOS"
  const search = searchParams.get("search") ?? ""

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  async function selectShipment(s: Shipment) {
    setEditando(false)
    const [shipmentRes, trackingRes] = await Promise.all([
      fetch(`/api/shipments/${s.orderId}`),
      fetch(`/api/shipments/${s.orderId}/tracking`),
    ])
    const shipmentData = await shipmentRes.json()
    const trackingData = await trackingRes.json()
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    setSelected({ ...s, status: shipmentData.status })
    setTracking([...trackingData])
  }

  function handleStatusUpdated(newStatus: string, updatedTracking: TrackingItem[]) {
    if (!selected) return
    setTracking(updatedTracking)
    setSelected({ ...selected, status: newStatus })
  }

  function handleNovedadAdded(updatedTracking: TrackingItem[]) {
    setTracking(updatedTracking)
  }

  if (selected) {
    const items = selected.items ?? []
    const isDelivered = selected.status === "DELIVERED"

    if (editando) {
      return (
        <div style={{ width: "90%", maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
          <div onClick={async () => {
            const res = await fetch(`/api/shipments/${selected.orderId}/tracking`)
            const data = await res.json()
            window.scrollTo(0, 0)
            setEditando(false)
            setTracking([...data])
          }} style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}>← Volver al detalle</div>
          <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>ORDEN #{selected.orderId}</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)", marginBottom: "1.5rem" }}>Modificar envío</div>
          <StatusEditor
            selected={selected}
            tracking={tracking}
            onStatusUpdated={handleStatusUpdated}
            onNovedadAdded={handleNovedadAdded}
          />
        </div>
      )
    }

    return (
      <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
        <div onClick={() => { setSelected(null); router.refresh() }} style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}>← Volver a pedidos</div>
        <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>ORDEN #{selected.orderId}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)" }}>Detalle del envío</div>
          {!isDelivered && (
            <button
              onClick={() => setEditando(true)}
              style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--color-border)", fontSize: 13, cursor: "pointer", background: "var(--color-surface)", color: "var(--foreground)" }}
            >
              ✏️ Modificar
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }} className="detail-grid-admin">
          <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 6 }}>Estado del envío</div>
            <div style={{ marginBottom: 14 }}><StatusBadge status={selected.status} /></div>
            <ShipmentStepper status={selected.status} tracking={tracking} />
            <TrackingHistory tracking={tracking} />
            <ShipmentInfo shipment={selected} />
          </div>
          <ProductList items={items} shippingCost={selected.shippingCost} />
        </div>
        <style>{`@media (min-width: 640px) { .detail-grid-admin { grid-template-columns: 1fr 1fr !important; } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ fontSize: 18, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>Pedidos</div>
      <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: "1.5rem" }}>Todos los envíos del sistema</div>

      <ShipmentSearch value={search} onChange={v => updateParams({ search: v })} />
      <ShipmentFilters filtro={filtro} onChange={f => updateParams({ status: f === "TODOS" ? "" : f })} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {shipments.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, fontSize: 14, color: "var(--color-muted)" }}>
            📦 {search ? `No hay envíos con orden #${search}` : filtro === "TODOS" ? "No hay envíos registrados" : "No hay envíos en ese estado"}
          </div>
        ) : (
          shipments.map(s => <ShipmentCard key={s.id} shipment={s} onClick={selectShipment} showBuyer />)
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{total} envío{total !== 1 ? "s" : ""}</span>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  )
}