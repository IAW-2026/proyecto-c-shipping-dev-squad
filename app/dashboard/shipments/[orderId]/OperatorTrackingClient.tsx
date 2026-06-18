'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Shipment, TrackingItem, StatusBadge, ShipmentStepper
} from "../../../components/shipments"
import { StatusEditor } from "../../../components/shipments/StatusEditor"

interface Props {
  shipment: Shipment
  role: string
}

export default function OperatorTrackingClient({ shipment, role }: Props) {
  const [currentShipment, setCurrentShipment] = useState<Shipment>(shipment)
  const [tracking, setTracking] = useState<TrackingItem[]>([])
  const router = useRouter()

  const backLabel = role === "admin" ? "← Volver al detalle" : "← Volver a envíos"

  useEffect(() => {
    Promise.all([
      fetch(`/api/shipments/${shipment.orderId}`).then(r => r.json()),
      fetch(`/api/shipments/${shipment.orderId}/tracking`).then(r => r.json()),
    ]).then(([shipmentData, trackingData]) => {
      setCurrentShipment(prev => ({ ...prev, status: shipmentData.status }))
      setTracking(trackingData)
    })
  }, [shipment.orderId])

  function handleStatusUpdated(newStatus: string, updatedTracking: TrackingItem[]) {
    setTracking(updatedTracking)
    setCurrentShipment(prev => ({ ...prev, status: newStatus }))
  }

  function handleNovedadAdded(updatedTracking: TrackingItem[]) {
    setTracking(updatedTracking)
  }

  const main = currentShipment.items?.[0]

  return (
    <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem" }}>
      <div
        onClick={() => {
          if (role === "admin") {
            router.push(`/dashboard/shipments/${shipment.orderId}`)
          } else {
            router.push("/dashboard/operator")
          }
        }}
        style={{ fontSize: 13, color: "var(--color-muted)", cursor: "pointer", marginBottom: "1.5rem" }}
      >
        {backLabel}
      </div>

      <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 16, overflow: "hidden", marginBottom: 12, display: "flex" }}>
        <div style={{ width: 120, minHeight: 120, background: "var(--color-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, flexShrink: 0 }}>
          {main?.imageUrl
            ? <img src={main.imageUrl} alt={main.name} style={{ width: 80, height: 80, objectFit: "contain" }} />
            : "👟"}
        </div>
        <div style={{ padding: "1rem 1.25rem", flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>Orden #{currentShipment.orderId}</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>{main?.name ?? "Producto"}</div>
          <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 10 }}>
            {currentShipment.address} · {currentShipment.carrier === "MAIL" ? "Correo" : "Retiro"}
          </div>
          <StatusBadge status={currentShipment.status} />
        </div>
      </div>

      <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 10 }}>Estado del envío</div>
        <ShipmentStepper status={currentShipment.status} tracking={tracking} />
      </div>

      <StatusEditor
        selected={currentShipment}
        tracking={tracking}
        onStatusUpdated={handleStatusUpdated}
        onNovedadAdded={handleNovedadAdded}
      />
    </div>
  )
}