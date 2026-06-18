'use client'

import { useState, useEffect } from "react"
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

  const orderId = searchParams.get("order")
  const mode    = searchParams.get("mode")
  const filtro  = searchParams.get("status") || "TODOS"
  const search  = searchParams.get("search") ?? ""

  const [selected, setSelected] = useState<Shipment | null>(null)
  const [tracking, setTracking] = useState<TrackingItem[]>([])
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    if (!searchParams.get("page")) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", "1")
      router.replace(`${pathname}?${params.toString()}`)
    }
  }, [])

  useEffect(() => {
    if (!orderId) {
      setSelected(null)
      setTracking([])
      return
    }

    let cancelled = false
    setLoading(true)

    Promise.all([
      fetch(`/api/shipments/${orderId}`).then(r => r.json()),
      fetch(`/api/shipments/${orderId}/tracking`).then(r => r.json()),
    ]).then(([shipmentData, trackingData]) => {
      if (cancelled) return
      const base = shipments.find(s => s.orderId === orderId) ?? ({ orderId } as unknown as Shipment)
      setSelected({ ...base, status: shipmentData.status })
      setTracking(trackingData)
      window.scrollTo({ top: 0, behavior: "instant" })
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [orderId])

  function buildParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value != null && value !== "") params.set(key, value)
      else params.delete(key)
    })
    return params
  }

  function updateFilters(updates: Record<string, string>) {
    const params = buildParams({ ...updates, page: "1" })
    router.push(`${pathname}?${params.toString()}`)
  }

  function handlePageChange(page: number) {
    const params = buildParams({ page: String(page) })
    router.push(`${pathname}?${params.toString()}`)
  }

  function openOrder(s: Shipment) {
    const params = buildParams({ order: String(s.orderId), mode: null })
    router.push(`${pathname}?${params.toString()}`)
  }

  function goToEdit() {
    const params = buildParams({ mode: "edit" })
    router.push(`${pathname}?${params.toString()}`)
  }

  function goBackToDetail() {
    const params = buildParams({ mode: null })
    router.replace(`${pathname}?${params.toString()}`)
    if (orderId) {
      fetch(`/api/shipments/${orderId}/tracking`)
        .then(r => r.json())
        .then(data => { setTracking([...data]); window.scrollTo({ top: 0, behavior: "instant" }) })
    }
  }

  function goBackToList() {
    const params = buildParams({ order: null, mode: null })
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleStatusUpdated(newStatus: string, updatedTracking: TrackingItem[]) {
    if (!selected) return
    setTracking(updatedTracking)
    setSelected({ ...selected, status: newStatus })
  }

  function handleNovedadAdded(updatedTracking: TrackingItem[]) {
    setTracking(updatedTracking)
  }

  if (orderId && !selected) {
    return (
      <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
        <div style={{ fontSize: 13, color: "var(--color-muted)", marginTop: "4rem", textAlign: "center" }}>Cargando pedido...</div>
      </div>
    )
  }

  if (orderId && selected && mode === "edit") {
    return (
      <div style={{ width: "90%", maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
        <div onClick={goBackToDetail} style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}>← Volver al detalle</div>
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

  if (orderId && selected) {
    const items = selected.items ?? []
    const isDelivered = selected.status === "DELIVERED"

    return (
      <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
        {loading && (
          <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: "1rem" }}>Cargando…</div>
        )}
        <div onClick={goBackToList} style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}>← Volver a pedidos</div>
        <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>ORDEN #{selected.orderId}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)" }}>Detalle del envío</div>
          {!isDelivered && (
            <button
              onClick={goToEdit}
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

      <ShipmentSearch value={search} onChange={v => updateFilters({ search: v })} />
      <ShipmentFilters filtro={filtro} onChange={f => updateFilters({ status: f === "TODOS" ? "" : f })} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {shipments.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, fontSize: 14, color: "var(--color-muted)" }}>
            📦 {search ? `No hay envíos con orden #${search}` : filtro === "TODOS" ? "No hay envíos registrados" : "No hay envíos en ese estado"}
          </div>
        ) : (
          shipments.map(s => <ShipmentCard key={s.id} shipment={s} onClick={openOrder} showBuyer />)
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{total} envío{total !== 1 ? "s" : ""}</span>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  )
}