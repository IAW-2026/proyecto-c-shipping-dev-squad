type AvailableMonth = { year: number; month: number }

type DateFilterProps = {
  selectedYear: number | null
  selectedMonth: number | null
  availableMonths: AvailableMonth[]
  onYearChange: (year: number | null) => void
  onMonthChange: (month: number | null) => void
  onClear: () => void
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export default function DateFilter({
  selectedYear,
  selectedMonth,
  availableMonths,
  onYearChange,
  onMonthChange,
  onClear,
}: DateFilterProps) {
  const filterLabel =
    selectedYear !== null && selectedMonth !== null
      ? `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
      : "Últimos 7 días"

  const availableYears = Array.from(new Set(availableMonths.map(m => m.year)))

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "var(--color-surface)",
      border: "0.5px solid var(--color-border)",
      borderRadius: 10,
      padding: "0.5rem 0.75rem",
      flexWrap: "wrap",
    }}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "var(--color-muted)", flexShrink: 0 }}>
        <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 1v4M11 1v4M1 7h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>

      <select
        value={selectedMonth !== null ? String(selectedMonth) : ""}
        onChange={e => {
          const val = e.target.value
          if (val === "") {
            onMonthChange(null)
            onYearChange(null)
          } else {
            onMonthChange(Number(val))
            if (selectedYear === null) onYearChange(new Date().getFullYear())
          }
        }}
        style={{
          fontSize: 13,
          color: "var(--foreground)",
          background: "transparent",
          border: "none",
          outline: "none",
          cursor: "pointer",
          appearance: "none",
        }}
      >
        <option value="">Todos los meses</option>
        {MONTH_NAMES.map((name, i) => (
          <option key={i} value={String(i)}>{name}</option>
        ))}
      </select>

      <select
        value={selectedYear !== null ? String(selectedYear) : ""}
        onChange={e => {
          const val = e.target.value
          if (val === "") {
            onYearChange(null)
            onMonthChange(null)
          } else {
            onYearChange(Number(val))
            if (selectedMonth === null) onMonthChange(new Date().getMonth())
          }
        }}
        style={{
          fontSize: 13,
          color: "var(--foreground)",
          background: "transparent",
          border: "none",
          outline: "none",
          cursor: "pointer",
          appearance: "none",
        }}
      >
        <option value="">Todos los años</option>
        {availableYears.map(y => (
          <option key={y} value={String(y)}>{y}</option>
        ))}
      </select>

      {(selectedYear !== null || selectedMonth !== null) && (
        <button
          onClick={onClear}
          title="Limpiar filtro"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-muted)",
            padding: 0,
            lineHeight: 1,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
          }}
        >
          ×
        </button>
      )}

      <span style={{
        fontSize: 11,
        color: "var(--color-muted)",
        borderLeft: "0.5px solid var(--color-border)",
        paddingLeft: 8,
        whiteSpace: "nowrap",
      }}>
        {filterLabel}
      </span>
    </div>
  )
}