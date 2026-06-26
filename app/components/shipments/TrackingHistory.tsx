import { TrackingItem, STATUS_LABELS, STATUS_COLORS } from "./types"

type Props = {
  tracking: TrackingItem[]
  simple?: boolean // operator usa versión simple, admin/dashboard usan la completa
}

export function TrackingHistory({ tracking, simple = false }: Props) {
  if (simple) {
    return (
      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "0.5px solid var(--color-border)" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 8 }}>Historial</div>
        {tracking.map(t => (
          <div key={t.id} style={{ fontSize: 12, color: "var(--color-muted)", padding: "6px 0", borderBottom: "0.5px solid var(--color-border)" }}>
            🕐 {new Date(t.timestamp).toLocaleDateString("es-AR")} — {t.description ?? t.location}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ borderTop: "0.5px solid var(--color-border)", paddingTop: 12, marginTop: 4 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 8 }}>Historial completo</div>
      {[...tracking].sort((a, b) => {
        const timeDiff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        if (timeDiff !== 0) return timeDiff
        const STEPS = ["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"]
        return STEPS.indexOf(b.status) - STEPS.indexOf(a.status)
      }).map(t => {
        const statusStyle = STATUS_COLORS[t.status] ?? { bg: "#f3f4f6", color: "#6b7280" }
        return (
          <div key={t.id} style={{
            padding: "8px 10px",
            marginBottom: 6,
            borderRadius: 8,
            background: "var(--color-surface-alt)",
            border: "0.5px solid var(--color-border)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99,
                background: statusStyle.bg,
                color: statusStyle.color,
              }}>
                {STATUS_LABELS[t.status] ?? t.status}
              </span>
              <span style={{ fontSize: 10, color: "var(--color-muted)" }}>
                {new Date(t.timestamp).toLocaleDateString("es-AR", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                  hour: "2-digit", minute: "2-digit"
                })}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--foreground)" }}>
              📦 {t.description ?? t.location}
            </div>
          </div>
        )
      })}
    </div>
  )
}