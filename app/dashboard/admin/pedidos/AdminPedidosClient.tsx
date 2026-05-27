'use client'

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Shipment, TrackingItem, STATUS_OPTIONS, STATUS_LABELS,
  ShipmentCard, ShipmentFilters, StatusBadge,
  TrackingHistory, ShipmentInfo, ProductList, ShipmentStepper
} from "../../../components/shipments"
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
  const [newStatus, setNewStatus] = useState("")
  const [description, setDescription] = useState("")
  const [novedad, setNovedad] = useState("")
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "error" | "success" } | null>(null)
  const [localShipments, setLocalShipments] = useState<Shipment[]>(shipments)

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
    setSelected(s)
    setNewStatus(s.status)
    setEditando(false)
    const res = await fetch(`/api/shipments/${s.orderId}/tracking`)
    const data = await res.json()
    setTracking([...data].reverse())
  }

  async function updateStatus() {
    if (!selected || !description.trim()) {
      setMensaje({ texto: "Agregá una descripción antes de actualizar el estado", tipo: "error" })
      return
    }
    setLoading(true)
    await fetch(`/api/shipments/${selected.orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, description }),
    })
    const res = await fetch(`/api/shipments/${selected.orderId}/tracking`)
    const data = await res.json()
    setTracking([...data].reverse())
    setSelected({ ...selected, status: newStatus })
    setLocalShipments(prev => prev.map(s => s.orderId === selected.orderId ? { ...s, status: newStatus } : s))
    setDescription("")
    setMensaje({ texto: "Estado actualizado correctamente", tipo: "success" })
    setTimeout(() => setMensaje(null), 3000)
    setEditando(false)
    setLoading(false)
  }

  async function addTracking() {
    if (!selected || !novedad.trim()) return
    setLoading(true)
    await fetch(`/api/shipments/${selected.orderId}/tracking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: novedad }),
    })
    const res = await fetch(`/api/shipments/${selected.orderId}/tracking`)
    const data = await res.json()
    setTracking([...data].reverse())
    setNovedad("")
    setMensaje({ texto: "Novedad registrada correctamente", tipo: "success" })
    setTimeout(() => setMensaje(null), 3000)
    setLoading(false)
  }

  if (selected) {
    const items = selected.items ?? []
    const main = items[0]

    if (editando) {
      return (
        <div style={{ width: "90%", maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
          <div onClick={() => setEditando(false)} style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}>← Volver al detalle</div>
          <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>ORDEN #{selected.orderId}</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)", marginBottom: "1.5rem" }}>Modificar envío</div>

          <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 10 }}>Cambiar estado general</div>
            {mensaje && (
              <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 10, fontSize: 13, background: mensaje.tipo === "error" ? "#fee2e2" : "#dcfce7", color: mensaje.tipo === "error" ? "#b91c1c" : "#15803d", border: `0.5px solid ${mensaje.tipo === "error" ? "#dc2626" : "#16a34a"}` }}>
                {mensaje.tipo === "error" ? "⚠️ " : "✅ "}{mensaje.texto}
              </div>
            )}
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border)", fontSize: 13, background: "var(--color-surface)", color: "var(--foreground)", width: "100%", marginBottom: 10 }}>
              {STATUS_OPTIONS.map(s => {
                const currentIdx = STATUS_OPTIONS.indexOf(selected.status)
                const optionIdx = STATUS_OPTIONS.indexOf(s)
                return <option key={s} value={s} disabled={optionIdx < currentIdx}>{STATUS_LABELS[s]} {optionIdx < currentIdx ? "✗" : ""}</option>
              })}
            </select>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción del cambio de estado"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border)", fontSize: 13, background: "var(--color-surface)", color: "var(--foreground)", marginBottom: 10 }} />
            <button onClick={updateStatus} disabled={loading}
              style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: "#171717", color: "#fff", fontSize: 13, cursor: "pointer" }}>
              {loading ? "Actualizando..." : "Actualizar estado"}
            </button>
          </div>

          <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 4 }}>Registrar novedad</div>
            <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 10 }}>El estado general no cambia.</div>
            <input value={novedad} onChange={e => setNovedad(e.target.value)} placeholder="Ej: Salió del centro de distribución en CABA"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border)", fontSize: 13, background: "var(--color-surface)", color: "var(--foreground)", marginBottom: 10 }} />
            <button onClick={addTracking} disabled={loading || !novedad.trim()}
              style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: "#171717", color: "#fff", fontSize: 13, cursor: "pointer" }}>
              Agregar novedad
            </button>
            <TrackingHistory tracking={tracking} simple />
          </div>
        </div>
      )
    }

    return (
      <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
        <div onClick={() => setSelected(null)} style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}>← Volver a pedidos</div>
        <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>ORDEN #{selected.orderId}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)" }}>Detalle del envío</div>
          <button onClick={() => setEditando(true)} style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--color-border)", fontSize: 13, cursor: "pointer", background: "var(--color-surface)", color: "var(--foreground)" }}>✏️ Modificar</button>
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

      <input value={search} onChange={e => updateParams({ search: e.target.value })} placeholder="Buscar por número de orden..."
        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border)", fontSize: 13, background: "var(--color-surface)", color: "var(--foreground)", marginBottom: 12 }} />
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