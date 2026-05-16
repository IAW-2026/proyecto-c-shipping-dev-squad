import { Shipment } from "./types"

type Props = {
  shipment: Shipment
}

export function ShipmentInfo({ shipment }: Props) {
  const rows = [
    ["Dirección", shipment.address],
    ["Carrier", shipment.carrier === "MAIL" ? "Correo" : "Retiro en persona"],
    ["Entrega estimada", shipment.estimatedDeliveryDate ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString("es-AR") : "—"],
    ["Fecha de entrega", shipment.deliveryDate ? new Date(shipment.deliveryDate).toLocaleDateString("es-AR") : "—"],
  ]

  return (
    <div style={{ borderTop: "0.5px solid var(--color-border)", paddingTop: 12, marginTop: 4 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 8 }}>Datos del envío</div>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid var(--color-border)", fontSize: 13 }}>
          <span style={{ color: "var(--color-muted)" }}>{label}</span>
          <span style={{ color: "var(--foreground)", textAlign: "right", maxWidth: "60%" }}>{value}</span>
        </div>
      ))}
    </div>
  )
}