import { Shipment, STATUS_LABELS } from "./types"
import { StatusBadge } from "./StatusBadge"

type Props = {
  shipment: Shipment
  onClick: (s: Shipment) => void
  showBuyer?: boolean
}

export function ShipmentCard({ shipment: s, onClick, showBuyer = false }: Props) {
  const main = s.items?.[0]

  return (
    <div
      onClick={() => onClick(s)}
      style={{
        background: "var(--color-surface)",
        border: "0.5px solid var(--color-border)",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        cursor: "pointer",
        minHeight: 120,
        transition: "opacity 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      <div style={{
        width: 100, minWidth: 100,
        background: "var(--color-surface-alt)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 44, flexShrink: 0,
      }}>
        {main?.imageUrl
          ? <img src={main.imageUrl} alt={main.name} style={{ width: 64, height: 64, objectFit: "contain" }} />
          : "👟"}
      </div>
      <div style={{ padding: "0.875rem 1rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>
            Orden #{s.orderId}
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--foreground)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {main?.name ?? "Producto"}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {s.address}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <StatusBadge status={s.status} size="sm" />
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
}