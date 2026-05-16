import { STATUS_LABELS, STATUS_COLORS } from "./types"

type Props = {
  status: string
  size?: "sm" | "md"
}

export function StatusBadge({ status, size = "md" }: Props) {
  const sc = STATUS_COLORS[status] ?? { bg: "#f3f4f6", color: "#6b7280" }
  const padding = size === "sm" ? "3px 10px" : "4px 12px"
  const fontSize = size === "sm" ? 11 : 12

  return (
    <span style={{
      display: "inline-block",
      padding,
      borderRadius: 99,
      fontSize,
      fontWeight: 500,
      background: sc.bg,
      color: sc.color,
      whiteSpace: "nowrap",
    }}>
      {STATUS_LABELS[status]}
    </span>
  )
}