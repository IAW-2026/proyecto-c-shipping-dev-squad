'use client'

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Shipment, TrackingItem, ShipmentCard, ShipmentFilters,
  StatusBadge, TrackingHistory, ShipmentInfo, ProductList, ShipmentStepper,
  ShipmentSearch
} from "../components/shipments"
import { Pagination } from "../components/Pagination"

interface Props {
  shipments: Shipment[]
  total: number
  currentPage: number
  totalPages: number
}

export default function BuyerClient({ shipments, total, currentPage, totalPages }: Props) {
  const [selected, setSelected] = useState<Shipment | null>(null)
  const [tracking, setTracking] = useState<TrackingItem[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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
    router.refresh()
    const res = await fetch(`/api/shipments/${s.orderId}/tracking`)
    const data = await res.json()
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    setSelected(s)
    setTracking([...data])
  }

  if (selected) {
    const items = selected.items ?? []

    return (
      <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
        <div onClick={() => { setSelected(null); router.refresh() }} style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}>
          ← Volver a mis envíos
        </div>
        <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>ORDEN #{selected.orderId}</div>
        <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)", marginBottom: "1.5rem" }}>
          Detalle del envío
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }} className="detail-grid">
          <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 6 }}>Estado del envío</div>
            <div style={{ marginBottom: 14 }}>
              <StatusBadge status={selected.status} />
            </div>
            <ShipmentStepper status={selected.status} tracking={tracking} />
            <TrackingHistory tracking={tracking} />
            <ShipmentInfo shipment={selected} />
          </div>
          <ProductList items={items} shippingCost={selected.shippingCost} />
        </div>
        <style>{`
          @media (min-width: 640px) {
            .detail-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ fontSize: 18, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>Mis envíos</div>
      <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: "1.5rem" }}>Seguí el estado de tus pedidos</div>

      <ShipmentSearch value={search} onChange={v => updateParams({ search: v })} />
      <ShipmentFilters filtro={filtro} onChange={f => updateParams({ status: f === "TODOS" ? "" : f })} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {shipments.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, fontSize: 14, color: "var(--color-muted)" }}>
            📦 {search ? `No hay envíos con orden #${search}` : filtro === "TODOS" ? "No hay envíos registrados" : "No tenés envíos en ese estado"}
          </div>
        ) : (
          shipments.map(s => <ShipmentCard key={s.id} shipment={s} onClick={selectShipment} />)
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{total} envío{total !== 1 ? "s" : ""}</span>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  )
}