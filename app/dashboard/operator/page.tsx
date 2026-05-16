'use client'

import { useEffect, useState } from "react"

type Shipment = {
  id: number
  orderId: number
  buyerId: number
  status: string
  address: string
  carrier: string
  estimatedDeliveryDate: string | null
  items: { name: string; price: number; quantity: number; size: number; imageUrl: string }[]
}

type TrackingItem = {
  id: number
  location: string
  status: string
  description: string | null
  timestamp: string
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PREPARING: "En preparación",
  IN_TRANSIT: "En camino",
  DELIVERED: "Entregado",
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#faeeda", color: "#854F0B" },
  PREPARING: { bg: "#dbeafe", color: "#1d4ed8" },
  IN_TRANSIT: { bg: "#E1F5EE", color: "#0F6E56" },
  DELIVERED: { bg: "#dcfce7", color: "#15803d" },
}

const STATUS_OPTIONS = ["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"]

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
    const updatedTracking = await fetch(`/api/shipments/${selected.orderId}/tracking`)
      .then(r => r.json())
    setTracking([...updatedTracking].reverse())
    setLoading(true)
    await fetch(`/api/shipments/${selected.orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, description }),
    })
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
    const res = await fetch(`/api/shipments/${selected.orderId}/tracking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: novedad }),
    })
    const newItem = await res.json()
    const updatedTracking = await fetch(`/api/shipments/${selected.orderId}/tracking`)
      .then(r => r.json())
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
            <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>{items[0]?.name ?? "Producto"}</div>
            <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 10 }}>{selected.address} · {selected.carrier === "MAIL" ? "Correo" : "Retiro"}</div>
            <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 500, background: sc.bg, color: sc.color }}>
              {STATUS_LABELS[selected.status]}
            </span>
          </div>
        </div>

        <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 10 }}>Cambiar estado general</div>

          {mensaje && (
            <div style={{
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 10,
              fontSize: 13,
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

          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "0.5px solid var(--color-border)" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 8 }}>Historial</div>
            {tracking.map(t => (
              <div key={t.id} style={{ fontSize: 12, color: "var(--color-muted)", padding: "6px 0", borderBottom: "0.5px solid var(--color-border)" }}>
                🕐 {new Date(t.timestamp).toLocaleDateString("es-AR")} — {t.description ?? t.location}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ fontSize: 18, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>Gestión de envíos</div>
      <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: "1.5rem" }}>Actualizá estados y registrá novedades</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["TODOS", "PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 99,
              border: "0.5px solid var(--color-border)",
              fontSize: 12,
              cursor: "pointer",
              background: filtro === f ? "#171717" : "var(--color-surface)",
              color: filtro === f ? "#fff" : "var(--foreground)",
              fontWeight: filtro === f ? 500 : 400,
            }}
          >
            {f === "TODOS" ? "Todos" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loadingList ? (
          <div style={{ padding: "2rem", textAlign: "center", fontSize: 14, color: "var(--color-muted)" }}>
            Cargando envíos...
          </div>
        ) : shipments.filter(s => filtro === "TODOS" || s.status === filtro).length === 0 ? (
          <div style={{
            padding: "2rem",
            textAlign: "center",
            background: "var(--color-surface)",
            border: "0.5px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 14,
            color: "var(--color-muted)",
          }}>
            {filtro === "TODOS" ? "📦 No hay envíos registrados" : `📦 No hay envíos en estado "${STATUS_LABELS[filtro]}"`}
          </div>
        ) : (
          shipments
          .filter(s => filtro === "TODOS" || s.status === filtro)
          .map(s => {
            const main = s.items?.[0]
            const sc = STATUS_COLORS[s.status]
            return (
              <div key={s.id} onClick={() => selectShipment(s)} style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 16, overflow: "hidden", display: "flex", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <div style={{ width: 100, minHeight: 100, background: "var(--color-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, flexShrink: 0 }}>
                  {main?.imageUrl
                    ? <img src={main.imageUrl} alt={main.name} style={{ width: 64, height: 64, objectFit: "contain" }} />
                    : "👟"}
                </div>
                <div style={{ padding: "1rem 1.25rem", flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>Orden #{s.orderId}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "var(--foreground)", marginBottom: 2 }}>{main?.name ?? "Producto"}</div>
                  <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 10 }}>{s.address}</div>
                  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: sc.bg, color: sc.color }}>
                    {STATUS_LABELS[s.status]}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}