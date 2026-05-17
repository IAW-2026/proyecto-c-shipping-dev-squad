'use client'

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/dashboard/admin", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/admin/pedidos", label: "Pedidos", icon: "📦" },
]

const SIDEBAR_WIDTH = 220

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    if (isMobile) setOpen(false)
  }, [pathname, isMobile])

  return (
    <>
      {/* Overlay mobile */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(0,0,0,0.35)",
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        background: "var(--color-surface)",
        borderRight: "0.5px solid var(--color-border)",
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        ...(isMobile ? {
          position: "fixed",
          top: 56,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transform: open ? "translateX(0)" : `translateX(-${SIDEBAR_WIDTH}px)`,
          transition: "transform 0.25s ease",
          boxShadow: open ? "4px 0 24px rgba(0,0,0,0.12)" : "none",
        } : {
          position: "sticky",
          top: 56,
          height: "calc(100vh - 56px)",
          overflowY: "auto",
        }),
      }}>
        <div style={{
          fontSize: 11, fontWeight: 500, color: "var(--color-muted)",
          marginBottom: 8, textTransform: "uppercase", letterSpacing: 1,
        }}>
          Admin
        </div>

        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: 8, fontSize: 14, cursor: "pointer",
                background: isActive ? "var(--color-surface-alt)" : "transparent",
                color: isActive ? "var(--foreground)" : "var(--color-muted)",
                fontWeight: isActive ? 500 : 400,
              }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </aside>

      {/* Tab lateral — solo mobile */}
      {isMobile && (
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Abrir menú"
          style={{
            position: "fixed",
            left: open ? SIDEBAR_WIDTH : 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 51,
            transition: "left 0.25s ease",
            background: "var(--color-surface)",
            border: "0.5px solid var(--color-border)",
            borderLeft: "none",
            borderRadius: "0 8px 8px 0",
            boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
            width: 28, height: 52,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="2"  r="1.5" fill="var(--color-muted)" />
            <circle cx="7" cy="7"  r="1.5" fill="var(--color-muted)" />
            <circle cx="7" cy="12" r="1.5" fill="var(--color-muted)" />
          </svg>
        </button>
      )}
    </>
  )
}