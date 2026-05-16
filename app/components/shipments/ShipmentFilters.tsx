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
            border: "0.5px solid var(--color-border)",
            fontSize: 12,
            cursor: "pointer",
            background: filtro === f ? "#171717" : "var(--color-surface)",
            color: filtro === f ? "#fff" : "var(--foreground)",
            fontWeight: filtro === f ? 500 : 400,
          }}
        >
          {f === "TODOS" ? "Todos" : STATUS_LABELS[f]}
        </button>
      ))}
    </div>
  )
}