'use client'

import { useEffect, useState } from "react"
import {
  Shipment, TrackingItem, STATUS_LABELS, STATUS_OPTIONS, STATUS_COLORS,
  ShipmentCard, ShipmentFilters, StatusBadge,
  TrackingHistory, ShipmentStepper
} from "../../components/shipments"
import { Pagination } from "../../components/Pagination"

export default function OperatorDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [selected, setSelected] = useState<Shipment | null>(null)
  const [tracking, setTracking] = useState<TrackingItem[]>([])
  const [newStatus, setNewStatus] = useState("")
  const [description, setDescription] = useState("")
  const [novedad, setNovedad] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "error" | "success" } | null>(null)
  const [filtro, setFiltro] = useState("TODOS")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => {
    fetch("/api/shipments")
      .then(r => r.json())
      .then(data => {
        setShipments(Array.isArray(data) ? data : [])
        setLoadingList(false)
      })
  }, [])

  function selectShipment(s: Shipment) {
    setSelected(s)
    setNewStatus(s.status)
    fetch(`/api/shipments/${s.orderId}/tracking`)
      .then(r => r.json())
      .then(data => setTracking([...data].reverse()))
  }

  async function updateStatus() {
    if (!selected) return
    if (!description.trim()) {
      setMensaje({ texto: "Agregá una descripción antes de actualizar el estado", tipo: "error" })
      return
    }
    setLoading(true)
    await fetch(`/api/shipments/${selected.orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, description }),
    })
    const updatedTracking = await fetch(`/api/shipments/${selected.orderId}/tracking`).then(r => r.json())
    setTracking([...updatedTracking].reverse())
    setSelected({ ...selected, status: newStatus })
    setShipments(prev => prev.map(s => s.orderId === selected.orderId ? { ...s, status: newStatus } : s))
    setDescription("")
    setMensaje({ texto: "Estado actualizado correctamente", tipo: "success" })
    setTimeout(() => setMensaje(null), 3000)
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
    const updatedTracking = await fetch(`/api/shipments/${selected.orderId}/tracking`).then(r => r.json())
    setTracking([...updatedTracking].reverse())
    setNovedad("")
    setMensaje({ texto: "Novedad registrada correctamente", tipo: "success" })
    setTimeout(() => setMensaje(null), 3000)
    setLoading(false)
  }

  if (selected) {
    const sc = STATUS_COLORS[selected.status]
    const items = selected.items ?? []
    const main = items[0]

    return (
      <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
        <div onClick={() => setSelected(null)} style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}>
          ← Volver a envíos
        </div>

        <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 16, overflow: "hidden", marginBottom: 12, display: "flex" }}>
          <div style={{ width: 120, minHeight: 120, background: "var(--color-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, flexShrink: 0 }}>
            {main?.imageUrl
              ? <img src={main.imageUrl} alt={main.name} style={{ width: 80, height: 80, objectFit: "contain" }} />
              : "👟"}
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

        <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 10 }}>Cambiar estado general</div>

          {mensaje && (
            <div style={{
              padding: "10px 14px", borderRadius: 8, marginBottom: 10, fontSize: 13,
              background: mensaje.tipo === "error" ? "#fee2e2" : "#dcfce7",
              color: mensaje.tipo === "error" ? "#b91c1c" : "#15803d",
              border: `0.5px solid ${mensaje.tipo === "error" ? "#dc2626" : "#16a34a"}`,
            }}>
              {mensaje.tipo === "error" ? "⚠️ " : "✅ "}{mensaje.texto}
            </div>
          )}

          <select
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border)", fontSize: 13, background: "var(--color-surface)", color: "var(--foreground)", width: "100%", marginBottom: 10 }}
          >
            {STATUS_OPTIONS.map(s => {
              const currentIdx = STATUS_OPTIONS.indexOf(selected.status)
              const optionIdx = STATUS_OPTIONS.indexOf(s)
              return (
                <option key={s} value={s} disabled={optionIdx < currentIdx}>
                  {STATUS_LABELS[s]} {optionIdx < currentIdx ? "✗" : ""}
                </option>
              )
            })}
          </select>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción del cambio de estado"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border)", fontSize: 13, background: "var(--color-surface)", color: "var(--foreground)", marginBottom: 10 }}
          />
          <button onClick={updateStatus} disabled={loading} style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: "#171717", color: "#fff", fontSize: 13, cursor: "pointer" }}>
            {loading ? "Actualizando..." : "Actualizar estado"}
          </button>
        </div>

        <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 4 }}>Registrar novedad</div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 10 }}>El estado general no cambia.</div>
          <input
            value={novedad}
            onChange={e => setNovedad(e.target.value)}
            placeholder="Ej: Salió del centro de distribución en CABA"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border)", fontSize: 13, background: "var(--color-surface)", color: "var(--foreground)", marginBottom: 10 }}
          />
          <button onClick={addTracking} disabled={loading || !novedad.trim()} style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: "#171717", color: "#fff", fontSize: 13, cursor: "pointer" }}>
            Agregar novedad
          </button>
          <TrackingHistory tracking={tracking} simple />
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ fontSize: 18, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>Gestión de envíos</div>
      <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: "1.5rem" }}>Actualizá estados y registrá novedades</div>

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
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {loadingList ? (
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
                  📦 {search ? `No hay envíos con orden #${search}` : filtro === "TODOS" ? "No hay envíos registrados" : "No hay envíos en ese estado"}
                </div>
              ) : (
                paginated.map(s => <ShipmentCard key={s.id} shipment={s} onClick={selectShipment} />)
              )}
            </div>
            {!loadingList && (
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