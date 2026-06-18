import { OrderItem } from "./types"

type Props = {
  items: OrderItem[]
  shippingCost?: number | null
  discount?: number | null
}

export function ProductList({ items, shippingCost, discount }: Props) {
  const subtotal = items.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const total = subtotal + (shippingCost ?? 0) - (discount ?? 0)

  return (
    <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 12, padding: "1.25rem" }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 12 }}>Productos</div>
      {items.map((p, i) => (
        <div key={i} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          padding: "12px 0",
          borderBottom: i < items.length - 1 ? "0.5px solid var(--color-border)" : "none"
        }}>
          <div style={{
            width: "100%", height: 120, borderRadius: 10,
            background: "var(--color-surface-alt)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56,
          }}>
            {p.imageUrl
              ? <img src={p.imageUrl} alt={p.name} style={{ width: 90, height: 90, objectFit: "contain" }} />
              : "👟"}
          </div>
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>Talle {p.size}{p.color ? ` · ${p.color}` : ""} · x{p.quantity}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>${p.price.toLocaleString("es-AR")}</div>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "0.5px solid var(--color-border)" }}>
        <span style={{ fontSize: 13, color: "var(--color-muted)" }}>Subtotal</span>
        <span style={{ fontSize: 13, color: "var(--color-muted)" }}>${subtotal.toLocaleString("es-AR")}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 13, color: "var(--color-muted)" }}>Descuento</span>
        <span style={{ fontSize: 13, color: "var(--color-muted)" }}>-${(discount ?? 0).toLocaleString("es-AR")}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 13, color: "var(--color-muted)" }}>Envío</span>
        <span style={{ fontSize: 13, color: shippingCost === 0 ? "#15803d" : "var(--color-muted)" }}>
          {shippingCost == null ? "—" : shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString("es-AR")}`}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "0.5px solid var(--color-border)" }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>Total</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>${total.toLocaleString("es-AR")}</span>
      </div>
    </div>
  )
}