'use client'

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import {
  Shipment, TrackingItem, STATUS_LABELS, STATUS_COLORS, STEPS,
  ShipmentCard, ShipmentFilters, StatusBadge,
  TrackingHistory, ShipmentInfo, ProductList, ShipmentStepper
} from "../components/shipments"
import { Pagination } from "../components/Pagination"

export default function ClientDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [selected, setSelected] = useState<Shipment | null>(null)
  const [tracking, setTracking] = useState<TrackingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("TODOS")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    const role = user.publicMetadata?.role as string
    if (role === "admin") router.push("/dashboard/admin/pedidos")
    else if (role === "logistics_operator") router.push("/dashboard/operator")
  }, [user])

  useEffect(() => {
    if (!user) return
    fetch(`/api/shipments?buyer_id=${user.id}`)
      .then(r => r.json())
      .then(data => {
        setShipments(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [user])

  if (!user) return <div>Cargando...</div>

  function selectShipment(s: Shipment) {
    setSelected(s)
    fetch(`/api/shipments/${s.orderId}/tracking`)
      .then(r => r.json())
      .then(setTracking)
  }

  if (selected) {
    const items = selected.items ?? []

    return (
      <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
        <div onClick={() => setSelected(null)} style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}>
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

      <input
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1) }}
        placeholder="Buscar por número de orden..."
        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border)", fontSize: 13, background: "var(--color-surface)", color: "var(--foreground)", marginBottom: 12 }}
      />

      <ShipmentFilters filtro={filtro} onChange={f => { setFiltro(f); setPage(1) }} />

      {(() => {
        const filtered = shipments
          .filter(s => filtro === "TODOS" || s.status === filtro)
          .filter(s => search.trim() === "" || String(s.orderId).includes(search.trim()))
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
        const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

        return (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {loading ? (
                <div style={{ padding: "2rem", textAlign: "center", fontSize: 14, color: "var(--color-muted)" }}>
                  Cargando envíos...
                </div>
              ) : paginated.length === 0 ? (
                <div style={{
                  padding: "2rem", textAlign: "center",
                  background: "var(--color-surface)",
                  border: "0.5px solid var(--color-border)",
                  borderRadius: 12, fontSize: 14, color: "var(--color-muted)",
                }}>
                  📦 {search ? `No hay envíos con orden #${search}` : filtro === "TODOS" ? "No hay envíos registrados" : "No tenés envíos en ese estado"}
                </div>
              ) : (
                paginated.map(s => <ShipmentCard key={s.id} shipment={s} onClick={selectShipment} />)
              )}
            </div>
            {!loading && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
                  {filtered.length} envío{filtered.length !== 1 ? "s" : ""}
                </span>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )
      })()}
    </div>
  )
}