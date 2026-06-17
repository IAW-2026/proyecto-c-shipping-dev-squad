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
  el.style.height = "auto"
  el.style.height = el.scrollHeight + "px"
}

export function StatusEditor({ selected, tracking, onStatusUpdated, onNovedadAdded }: Props) {
  const [description, setDescription] = useState("")
  const [novedad, setNovedad] = useState("")
  const [loading, setLoading] = useState(false)
  const [mensajeEstado, setMensajeEstado] = useState<{ texto: string; tipo: "error" | "success" } | null>(null)
  const [mensajeNovedad, setMensajeNovedad] = useState<{ texto: string; tipo: "error" | "success" } | null>(null)

  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const novedadRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMensajeEstado(null)
    setMensajeNovedad(null)
    setDescription("")
    setNovedad("")
  }, [selected.orderId])

  useEffect(() => {
    if (descriptionRef.current) autoResize(descriptionRef.current)
  }, [description])

  useEffect(() => {
    if (novedadRef.current) autoResize(novedadRef.current)
  }, [novedad])

  const isDelivered = selected.status === "DELIVERED"

  function showMensajeEstado(texto: string, tipo: "error" | "success") {
    setMensajeEstado({ texto, tipo })
    setTimeout(() => setMensajeEstado(null), 3000)
  }

  function showMensajeNovedad(texto: string, tipo: "error" | "success") {
    setMensajeNovedad({ texto, tipo })
    setTimeout(() => setMensajeNovedad(null), 3000)
  }

  async function updateStatus() {
    const currentIdx = STATUS_OPTIONS.indexOf(selected.status)
    const nextStatus = STATUS_OPTIONS[currentIdx + 1]
    if (!nextStatus) return
    if (!description.trim()) {
      showMensajeEstado("Agregá una descripción antes de actualizar el estado", "error")
      return
    }
    setLoading(true)
    await fetch(`/api/shipments/${selected.orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, description }),
    })
    const res = await fetch(`/api/shipments/${selected.orderId}/tracking`)
    const data = await res.json()
    setDescription("")
    showMensajeEstado("Estado actualizado correctamente", "success")
    onStatusUpdated(nextStatus, [...data])
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
    showMensajeNovedad("Novedad registrada correctamente", "success")
    onNovedadAdded([...data])
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

  const mensajeStyle = (tipo: "error" | "success"): React.CSSProperties => ({
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 13,
    background: tipo === "error" ? "#fee2e2" : "#dcfce7",
    color: tipo === "error" ? "#b91c1c" : "#15803d",
    border: `0.5px solid ${tipo === "error" ? "#dc2626" : "#16a34a"}`,
  })

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
      {/* Cambiar estado */}
      <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 10 }}>Cambiar estado general</div>

        {mensajeEstado && (
          <div style={mensajeStyle(mensajeEstado.tipo)}>
            {mensajeEstado.tipo === "error" ? "⚠️ " : "✅ "}{mensajeEstado.texto}
          </div>
        )}

        {(() => {
          const currentIdx = STATUS_OPTIONS.indexOf(selected.status)
          const nextStatus = STATUS_OPTIONS[currentIdx + 1]
          return nextStatus ? (
            <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 10 }}>
              Siguiente estado:{" "}
              <span style={{ fontWeight: 600, color: "var(--foreground)" }}>
                {STATUS_LABELS[nextStatus]}
              </span>
            </div>
          ) : null
        })()}

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
          style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: "var(--foreground)", color: "var(--color-surface)", fontSize: 13, cursor: "pointer" }}
        >
          {loading ? "Actualizando..." : "Actualizar estado"}
        </button>
      </div>

      {/* Registrar novedad */}
      <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 4 }}>Registrar novedad</div>
        <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 10 }}>El estado general no cambia.</div>

        {mensajeNovedad && (
          <div style={mensajeStyle(mensajeNovedad.tipo)}>
            {mensajeNovedad.tipo === "error" ? "⚠️ " : "✅ "}{mensajeNovedad.texto}
          </div>
        )}

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
          style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: "var(--foreground)", color: "var(--color-surface)", fontSize: 13, cursor: "pointer" }}
        >
          Agregar novedad
        </button>
        <TrackingHistory tracking={tracking} simple />
      </div>
    </>
  )
}