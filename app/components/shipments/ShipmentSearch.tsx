type Props = {
  value: string
  onChange: (value: string) => void
}

export function ShipmentSearch({ value, onChange }: Props) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
      placeholder="Buscar por número de orden..."
      inputMode="numeric"
      style={{
        width: "100%",
        padding: "8px 12px",
        borderRadius: 8,
        border: "0.5px solid var(--color-border)",
        fontSize: 13,
        background: "var(--color-surface)",
        color: "var(--foreground)",
        marginBottom: 12,
      }}
    />
  )
}