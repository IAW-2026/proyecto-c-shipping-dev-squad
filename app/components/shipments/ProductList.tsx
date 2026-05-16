import { OrderItem } from "./types"

type Props = {
  items: OrderItem[]
}

export function ProductList({ items }: Props) {
  const total = items.reduce((sum, p) => sum + p.price * p.quantity, 0)

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
              <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>Talle {p.size} · x{p.quantity}</div>
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
  )
}