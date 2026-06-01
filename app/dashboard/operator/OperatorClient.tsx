'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Shipment, TrackingItem,
  ShipmentCard, ShipmentFilters, StatusBadge,
  ShipmentStepper,
  ShipmentSearch
} from "../../components/shipments"
import { StatusEditor } from "../../components/shipments/StatusEditor"
import { Pagination } from "../../components/Pagination"

interface Props {
  shipments: Shipment[]
  total: number
  currentPage: number
  totalPages: number
}

export default function OperatorClient({ shipments, total, currentPage, totalPages }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [selected, setSelected] = useState<Shipment | null>(null)
  const [tracking, setTracking] = useState<TrackingItem[]>([])
  const [localShipments, setLocalShipments] = useState<Shipment[]>(shipments)

  useEffect(() => {
    setLocalShipments(shipments)
  }, [shipments])

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
    const updated = { ...selected, status: newStatus }
    setSelected(updated)
    setLocalShipments(prev => prev.map(s => s.id === selected.id ? updated : s))
  }

  function handleNovedadAdded(updatedTracking: TrackingItem[]) {
    setTracking(updatedTracking)
  }

  if (selected) {
    const items = selected.items ?? []
    const main = items[0]

    return (
      <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
        <div onClick={() => { setSelected(null); router.refresh() }} style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}>
          ← Volver a envíos
        </div>
        <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 16, overflow: "hidden", marginBottom: 12, display: "flex" }}>
          <div style={{ width: 120, minHeight: 120, background: "var(--color-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, flexShrink: 0 }}>
            {main?.imageUrl ? <img src={main.imageUrl} alt={main.name} style={{ width: 80, height: 80, objectFit: "contain" }} /> : "👟"}
          </div>
          <div style={{ padding: "1rem 1.25rem", flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>Orden #{selected.orderId}</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>{main?.name ?? "Producto"}</div>
            <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 10 }}>{selected.address} · {selected.carrier === "MAIL" ? "Correo" : "Retiro"}</div>
            <StatusBadge status={selected.status} />
          </div>
        </div>

        <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 10 }}>Estado del envío</div>
          <ShipmentStepper status={selected.status} tracking={tracking} />
        </div>

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
      <div style={{ fontSize: 18, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>Gestión de envíos</div>
      <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: "1.5rem" }}>Actualizá estados y registrá novedades</div>

      <ShipmentSearch value={search} onChange={v => updateParams({ search: v })} />
      <ShipmentFilters filtro={filtro} onChange={f => updateParams({ status: f === "TODOS" ? "" : f })} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {localShipments.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, fontSize: 14, color: "var(--color-muted)" }}>
            📦 {search ? `No hay envíos con orden #${search}` : filtro === "TODOS" ? "No hay envíos registrados" : "No hay envíos en ese estado"}
          </div>
        ) : (
          localShipments.map(s => <ShipmentCard key={s.id} shipment={s} onClick={selectShipment} />)
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{total} envío{total !== 1 ? "s" : ""}</span>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  )
}