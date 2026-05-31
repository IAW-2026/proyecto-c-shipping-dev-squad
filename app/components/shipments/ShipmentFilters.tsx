import { STATUS_LABELS } from "./types"

type Props = {
  filtro: string
  onChange: (f: string) => void
}

export function ShipmentFilters({ filtro, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
      {["TODOS", "PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"].map(f => (
        <button
          key={f}
          onClick={() => onChange(f)}
          style={{
            padding: "6px 14px",
            borderRadius: 99,
            border: filtro === f
              ? "1.5px solid var(--foreground)"
              : "0.5px solid var(--color-border)",
            fontSize: 12,
            cursor: "pointer",
            background: filtro === f ? "var(--foreground)" : "var(--color-surface)",
            color: filtro === f ? "var(--color-surface)" : "var(--foreground)",
            fontWeight: filtro === f ? 600 : 400,
          }}
        >
          {f === "TODOS" ? "Todos" : STATUS_LABELS[f]}
        </button>
      ))}
    </div>
  )
}