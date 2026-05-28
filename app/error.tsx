'use client'

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

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
      <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
      <div style={{ fontSize: 72, fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>500</div>
      <div style={{ fontSize: 18, fontWeight: 500, color: "var(--foreground)", marginTop: 12, marginBottom: 8 }}>
        Algo salió mal
      </div>
      <div style={{ fontSize: 14, color: "var(--color-muted)", marginBottom: 32, maxWidth: 340 }}>
        Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={reset} style={{
          padding: "10px 24px",
          borderRadius: 10,
          background: "var(--foreground)",
          color: "var(--background)",
          fontSize: 14,
          fontWeight: 500,
          border: "none",
          cursor: "pointer",
        }}>
          Intentar de nuevo
        </button>
        <Link href="/" style={{
          padding: "10px 24px",
          borderRadius: 10,
          background: "transparent",
          color: "var(--foreground)",
          fontSize: 14,
          fontWeight: 500,
          textDecoration: "none",
          border: "0.5px solid var(--color-border)",
        }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}