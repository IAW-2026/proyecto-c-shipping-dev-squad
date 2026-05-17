type Props = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: "6px 12px", borderRadius: 8, border: "0.5px solid var(--color-border)",
          background: "var(--color-surface)", color: currentPage === 1 ? "var(--color-muted)" : "var(--foreground)",
          fontSize: 13, cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
      >
        ←
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            padding: "6px 12px", borderRadius: 8, border: "0.5px solid var(--color-border)",
            background: page === currentPage ? "#171717" : "var(--color-surface)",
            color: page === currentPage ? "#fff" : "var(--foreground)",
            fontSize: 13, cursor: "pointer", fontWeight: page === currentPage ? 500 : 400,
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: "6px 12px", borderRadius: 8, border: "0.5px solid var(--color-border)",
          background: "var(--color-surface)", color: currentPage === totalPages ? "var(--color-muted)" : "var(--foreground)",
          fontSize: 13, cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        }}
      >
        →
      </button>

      <span style={{ fontSize: 12, color: "var(--color-muted)", marginLeft: 4 }}>
        {currentPage} / {totalPages}
      </span>
    </div>
  )
}