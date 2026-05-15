'use client'

import { useEffect, useState } from "react"
import { mockOrderItems } from "@/lib/mockProducts"

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
  PREPARING: { bg: "#f6f0bd", color: "#b5a621" },
  IN_TRANSIT: { bg: "#dbeafe", color: "#1d4ed8" },
  DELIVERED: { bg: "#dcfce7", color: "#15803d" },
}

const STATUS_OPTIONS = ["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"]
const STEPS = ["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"]
const DEFAULT_DESCRIPTIONS = ["Envío registrado", "Preparando el paquete", "El paquete está en camino", "Entregado al destinatario"]

export default function AdminPedidos() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [selected, setSelected] = useState<Shipment | null>(null)
  const [tracking, setTracking] = useState<TrackingItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [filtro, setFiltro] = useState("TODOS")
  const [editando, setEditando] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [description, setDescription] = useState("")
  const [novedad, setNovedad] = useState("")
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "error" | "success" } | null>(null)

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
    setEditando(false)
    fetch(`/api/shipments/${s.orderId}/tracking`)
      .then(r => r.json())
      .then(setTracking)
  }

  function getStepState(step: string, currentStatus: string) {
    const currentIdx = STEPS.indexOf(currentStatus)
    const stepIdx = STEPS.indexOf(step)
    if (stepIdx <= currentIdx) return "done"
    if (stepIdx === currentIdx + 1) return "active"
    return "locked"
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
    setSelected({ ...selected, status: newStatus })
    setShipments(prev => prev.map(s => s.orderId === selected.orderId ? { ...s, status: newStatus } : s))
    setDescription("")
    const updatedTracking = await fetch(`/api/shipments/${selected.orderId}/tracking`).then(r => r.json())
    setTracking([...updatedTracking].reverse())
    setMensaje({ texto: "Estado actualizado correctamente", tipo: "success" })
    setTimeout(() => setMensaje(null), 3000)
    setEditando(false)
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
    const updatedTracking = await fetch(`/api/shipments/${selected.orderId}/tracking`).then(r => r.json())
    setTracking([...updatedTracking].reverse())
    setNovedad("")
    setMensaje({ texto: "Novedad registrada correctamente", tipo: "success" })
    setTimeout(() => setMensaje(null), 3000)
    setLoading(false)
  }

  if (selected) {
    const products = mockOrderItems[selected.orderId] ?? []
    const sc = STATUS_COLORS[selected.status]
    const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0)

    if (editando) {
      return (
        <div style={{ width: "90%", maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
          <div onClick={() => setEditando(false)} style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}>
            ← Volver al detalle
          </div>

          <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>ORDEN #{selected.orderId}</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)", marginBottom: "1.5rem" }}>
            Modificar envío
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
      <div style={{ width: "90%", maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
        <div onClick={() => setSelected(null)} style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}>
          ← Volver a pedidos
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>ORDEN #{selected.orderId} · BUYER #{selected.buyerId}</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)" }}>Detalle del envío</div>
          </div>
          <button
            onClick={() => setEditando(true)}
            style={{ padding: "8px 20px", borderRadius: 8, border: "0.5px solid var(--color-border)", background: "var(--color-surface)", color: "var(--foreground)", fontSize: 13, cursor: "pointer", fontWeight: 500 }}
          >
            ✏️ Modificar estado
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }} className="detail-grid-admin">

          <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 6 }}>Estado del envío</div>
            <div style={{ marginBottom: 14 }}>
              <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 500, background: sc.bg, color: sc.color }}>
                {STATUS_LABELS[selected.status]}
              </span>
            </div>
            {STEPS.map((step, i) => {
              const state = getStepState(step, selected.status)
              const isLast = i === STEPS.length - 1
              const nextState = !isLast ? getStepState(STEPS[i + 1], selected.status) : null
              const trackItem = tracking.find(t => t.status === step)
              return (
                <div key={step} style={{ display: "flex", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                      background: state === "done" ? "#16a34a" : state === "active" ? "#2563eb" : "var(--color-surface-alt)",
                      border: state === "locked" ? "1.5px solid var(--color-border)" : "none",
                    }} />
                    {!isLast && (
                      <div style={{
                        width: 2, flex: 1, minHeight: 18, margin: "3px 0",
                        background: state === "done" && nextState === "done" ? "#16a34a" :
                          state === "done" && nextState === "active" ? "repeating-linear-gradient(to bottom, #2563eb 0px, #2563eb 5px, transparent 5px, transparent 10px)" :
                          "repeating-linear-gradient(to bottom, var(--color-border) 0px, var(--color-border) 5px, transparent 5px, transparent 10px)"
                      }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 18, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: state === "locked" ? "var(--color-muted)" : "var(--foreground)" }}>
                      {STATUS_LABELS[step]}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>
                      {state !== "locked" && trackItem ? (
                        <>
                          <div>{trackItem.description ?? trackItem.location}</div>
                          <div style={{ fontSize: 11, marginTop: 2, opacity: 0.7 }}>
                            {new Date(trackItem.timestamp).toLocaleDateString("es-AR", {
                              day: "2-digit", month: "2-digit", year: "numeric",
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </div>
                        </>
                      ) : state === "locked" ? "🔒 No disponible aún" : ""}
                    </div>
                  </div>
                </div>
              )
            })}

            <div style={{ borderTop: "0.5px solid var(--color-border)", paddingTop: 12, marginTop: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 8 }}>Historial completo</div>
              {[...tracking].sort((a, b) => {
                const timeDiff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                if (timeDiff !== 0) return timeDiff
                return STEPS.indexOf(b.status) - STEPS.indexOf(a.status)
              }).map(t => {
                const isNovedad = t.description && !DEFAULT_DESCRIPTIONS.includes(t.description)
                const statusStyle = STATUS_COLORS[t.status] ?? { bg: "#f3f4f6", color: "#6b7280" }
                return (
                  <div key={t.id} style={{
                    padding: "8px 10px", marginBottom: 6, borderRadius: 8,
                    background: "var(--color-surface-alt)",
                    borderLeft: `3px solid ${statusStyle.color}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>
                        {isNovedad ? "📝 " : "📦 "}{t.description ?? t.location}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--color-muted)", marginLeft: 8, flexShrink: 0 }}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 3 }}>
                      {new Date(t.timestamp).toLocaleDateString("es-AR", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ borderTop: "0.5px solid var(--color-border)", paddingTop: 12, marginTop: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 8 }}>Datos del envío</div>
              {[
                ["Dirección", selected.address],
                ["Carrier", selected.carrier === "MAIL" ? "Correo" : "Retiro en persona"],
                ["Entrega estimada", selected.estimatedDeliveryDate ? new Date(selected.estimatedDeliveryDate).toLocaleDateString("es-AR") : "—"],
                ["Fecha de entrega", selected.deliveryDate ? new Date(selected.deliveryDate).toLocaleDateString("es-AR") : "—"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid var(--color-border)", fontSize: 13 }}>
                  <span style={{ color: "var(--color-muted)" }}>{label}</span>
                  <span style={{ color: "var(--foreground)", textAlign: "right", maxWidth: "60%" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 12 }}>Productos</div>
            {products.map((p, i) => (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                padding: "12px 0",
                borderBottom: i < products.length - 1 ? "0.5px solid var(--color-border)" : "none"
              }}>
                <div style={{ width: "100%", height: 120, borderRadius: 10, background: "var(--color-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>
                  {p.image}
                </div>
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>{p.brand} · Talle {p.size} · x{p.quantity}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>${p.price.toLocaleString("es-AR")}</div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "0.5px solid var(--color-border)" }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>Total</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>${total.toLocaleString("es-AR")}</span>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 640px) {
            .detail-grid-admin {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ fontSize: 18, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>Pedidos</div>
      <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: "1.5rem" }}>Todos los envíos del sistema</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["TODOS", "PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: "6px 14px", borderRadius: 99,
              border: "0.5px solid var(--color-border)",
              fontSize: 12, cursor: "pointer",
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
            padding: "2rem", textAlign: "center",
            background: "var(--color-surface)",
            border: "0.5px solid var(--color-border)",
            borderRadius: 12, fontSize: 14, color: "var(--color-muted)",
          }}>
            {filtro === "TODOS" ? "📦 No hay envíos registrados" : `📦 No hay envíos en estado "${STATUS_LABELS[filtro]}"`}
          </div>
        ) : (
          shipments
            .filter(s => filtro === "TODOS" || s.status === filtro)
            .map(s => {
              const products = mockOrderItems[s.orderId] ?? []
              const main = products[0]
              const sc = STATUS_COLORS[s.status]
              return (
                <div key={s.id} onClick={() => selectShipment(s)} style={{
                  background: "var(--color-surface)",
                  border: "0.5px solid var(--color-border)",
                  borderRadius: 16, overflow: "hidden",
                  display: "flex", cursor: "pointer", minHeight: 120,
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <div style={{ width: 100, minWidth: 100, background: "var(--color-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, flexShrink: 0 }}>
                    {main?.image ?? "👟"}
                  </div>
                  <div style={{ padding: "0.875rem 1rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>Orden #{s.orderId} · Buyer #{s.buyerId}</div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: "var(--foreground)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{main?.name ?? "Producto"}</div>
                      <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.address}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: sc.bg, color: sc.color, whiteSpace: "nowrap" }}>
                        {STATUS_LABELS[s.status]}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                        {s.status === "DELIVERED" && s.deliveryDate
                          ? `Entregado ${new Date(s.deliveryDate).toLocaleDateString("es-AR")}`
                          : s.estimatedDeliveryDate
                          ? `Est. ${new Date(s.estimatedDeliveryDate).toLocaleDateString("es-AR")}`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
        )}
      </div>
    </div>
  )
}