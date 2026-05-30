'use client'

import { useState, useEffect, useRef } from "react"
import { Shipment, TrackingItem, STATUS_OPTIONS, STATUS_LABELS } from "./types"
import { TrackingHistory } from "./TrackingHistory"

type Props = {
  selected: Shipment
  tracking: TrackingItem[]
  onStatusUpdated: (newStatus: string, updatedTracking: TrackingItem[]) => void
  onNovedadAdded: (updatedTracking: TrackingItem[]) => void
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "0px"
  el.style.height = el.scrollHeight + "px"
}

export function StatusEditor({ selected, tracking, onStatusUpdated, onNovedadAdded }: Props) {
  const [newStatus, setNewStatus] = useState(selected.status)
  const [description, setDescription] = useState("")
  const [novedad, setNovedad] = useState("")
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "error" | "success" } | null>(null)

  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const novedadRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMensaje(null)
    setDescription("")
    setNovedad("")
    setNewStatus(selected.status)
  }, [selected.orderId])

  // Calcular altura inicial de los textareas al montar
  useEffect(() => {
    if (descriptionRef.current) autoResize(descriptionRef.current)
    if (novedadRef.current) autoResize(novedadRef.current)
  }, [])

  // Resetear altura cuando se limpian los valores
  useEffect(() => {
    if (descriptionRef.current) autoResize(descriptionRef.current)
  }, [description])

  useEffect(() => {
    if (novedadRef.current) autoResize(novedadRef.current)
  }, [novedad])

  const isDelivered = selected.status === "DELIVERED"

  function showMensaje(texto: string, tipo: "error" | "success") {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  async function updateStatus() {
    if (!description.trim()) {
      showMensaje("Agregá una descripción antes de actualizar el estado", "error")
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
    setDescription("")
    showMensaje("Estado actualizado correctamente", "success")
    onStatusUpdated(newStatus, [...data].reverse())
    setLoading(false)
  }

  async function addTracking() {
    if (!novedad.trim()) return
    setLoading(true)
    await fetch(`/api/shipments/${selected.orderId}/tracking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: novedad }),
    })
    const res = await fetch(`/api/shipments/${selected.orderId}/tracking`)
    const data = await res.json()
    setNovedad("")
    showMensaje("Novedad registrada correctamente", "success")
    onNovedadAdded([...data].reverse())
    setLoading(false)
  }

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    border: "0.5px solid var(--color-border)",
    fontSize: 13,
    background: "var(--color-surface)",
    color: "var(--foreground)",
    marginBottom: 10,
    resize: "none",
    overflow: "hidden",
    lineHeight: "1.5",
    boxSizing: "border-box",
    display: "block",
    fontFamily: "inherit",
  }

  if (isDelivered) {
    return (
      <div style={{
        background: "var(--color-surface)",
        border: "0.5px solid var(--color-border)",
        borderRadius: 12,
        padding: "1.25rem",
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>Envío finalizado</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--color-muted)" }}>
          Este envío ya fue entregado. No se pueden realizar más modificaciones.
        </div>
        <TrackingHistory tracking={tracking} simple />
      </div>
    )
  }

  return (
    <>
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

        <textarea
          ref={descriptionRef}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Descripción del cambio de estado"
          rows={1}
          style={textareaStyle}
        />

        <button
          onClick={updateStatus}
          disabled={loading}
          style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: "#171717", color: "#fff", fontSize: 13, cursor: "pointer" }}
        >
          {loading ? "Actualizando..." : "Actualizar estado"}
        </button>
      </div>

      <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 4 }}>Registrar novedad</div>
        <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 10 }}>El estado general no cambia.</div>
        <textarea
          ref={novedadRef}
          value={novedad}
          onChange={e => setNovedad(e.target.value)}
          placeholder="Ej: Salió del centro de distribución en CABA"
          rows={1}
          style={textareaStyle}
        />
        <button
          onClick={addTracking}
          disabled={loading || !novedad.trim()}
          style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: "#171717", color: "#fff", fontSize: 13, cursor: "pointer" }}
        >
          Agregar novedad
        </button>
        <TrackingHistory tracking={tracking} simple />
      </div>
    </>
  )
}