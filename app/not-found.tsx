import Link from "next/link"

export default function NotFound() {
  return (
    <div style={{
      minHeight: "calc(100vh - 56px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--background)",
      padding: "2rem",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
      <div style={{ fontSize: 72, fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>404</div>
      <div style={{ fontSize: 18, fontWeight: 500, color: "var(--foreground)", marginTop: 12, marginBottom: 8 }}>
        Esta página no existe
      </div>
      <div style={{ fontSize: 14, color: "var(--color-muted)", marginBottom: 32, maxWidth: 340 }}>
        La ruta que buscás no existe o fue movida. Revisá la URL o volvé al inicio.
      </div>
      <Link href="/" style={{
        padding: "10px 24px",
        borderRadius: 10,
        background: "var(--foreground)",
        color: "var(--background)",
        fontSize: 14,
        fontWeight: 500,
        textDecoration: "none",
      }}>
        Volver al inicio
      </Link>
    </div>
  )
}