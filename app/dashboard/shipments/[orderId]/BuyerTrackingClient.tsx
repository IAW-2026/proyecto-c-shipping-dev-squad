'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Shipment, TrackingItem, StatusBadge, TrackingHistory,
  ShipmentInfo, ProductList, ShipmentStepper
} from "../../../components/shipments"

interface Props {
  shipment: Shipment
  canEdit?: boolean
  isGuest?: boolean
  hasToken?: boolean
  theme?: string
}

export default function BuyerTrackingClient({ shipment, canEdit = false, isGuest = false, hasToken = false, theme }: Props) {
  const [tracking, setTracking] = useState<TrackingItem[]>([])
  const [returnUrl, setReturnUrl] = useState("")
  const router = useRouter()

  const backLabel = canEdit ? "← Volver a pedidos" : "← Volver a mis envíos"
  const isDelivered = shipment.status === "DELIVERED"

  useEffect(() => {
    fetch(`/api/shipments/${shipment.orderId}/tracking`)
      .then(r => r.json())
      .then(setTracking)
  }, [shipment.orderId])

  useEffect(() => {
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme)
      localStorage.setItem("theme", theme)
    }
  }, [theme])

  useEffect(() => {
    if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
      setReturnUrl(document.referrer)
    }
  }, [])

  return (
    <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Flecha de volver: solo para usuarios con sesión real (sin referrer externo) */}
      {!returnUrl && !isGuest && !hasToken && (
        <div
          onClick={() => {
            if (canEdit) {
              router.push("/dashboard/admin/pedidos")
            } else {
              router.push("/dashboard/buyer")
            }
          }}
          style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}
        >
          {backLabel}
        </div>
      )}

      {/* Botón de volver a app externa */}
      {returnUrl && (
        <div
          onClick={() => {
            const currentTheme = document.documentElement.getAttribute("data-theme") || "light"
            window.location.href = `https://zapasya.vercel.app/pedidos?theme=${currentTheme}`
          }}
          style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}
        >
          ← Volver a la página
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>ORDEN #{shipment.orderId}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)" }}>Detalle del envío</div>
        {canEdit && !isDelivered && (
          <button
            onClick={() => router.push(`/dashboard/shipments/${shipment.orderId}?mode=edit`)}
            style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--color-border)", fontSize: 13, cursor: "pointer", background: "var(--color-surface)", color: "var(--foreground)" }}
          >
            ✏️ Modificar
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }} className="detail-grid">
        <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1.25rem" }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 6 }}>Estado del envío</div>
          <div style={{ marginBottom: 14 }}>
            <StatusBadge status={shipment.status} />
          </div>
          <ShipmentStepper status={shipment.status} tracking={tracking} />
          <TrackingHistory tracking={tracking} />
          <ShipmentInfo shipment={shipment} />
        </div>
        <ProductList items={shipment.items ?? []} shippingCost={shipment.shippingCost} discount={shipment.discount ?? 0} />
      </div>
      <style>{`
        @media (min-width: 640px) {
          .detail-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}