'use client'

import { useEffect, useState } from "react"
import { UserButton } from "@clerk/nextjs"
import Image from "next/image"

export default function Navbar() {
  const [dark, setDark] = useState(false)       // siempre false en servidor
  const [mounted, setMounted] = useState(false)  // evita el mismatch

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved === "dark") setDark(true)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light")
    localStorage.setItem("theme", dark ? "dark" : "light")
  }, [dark, mounted])

  return (
    <nav
      suppressHydrationWarning
      style={{
        background: mounted && dark ? "#111111" : "#ffffff",
        borderBottom: `0.5px solid ${mounted && dark ? "#2a2a2a" : "#e5e7eb"}`,
        padding: "0 1.5rem",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Image
          src={mounted && dark ? "/logo-oscuro.webp" : "/logo-claro.webp"}
          alt="ZapasYA"
          width={140}
          height={40}
          priority
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => setDark(d => !d)}
          aria-label={mounted && dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          style={{
            background: mounted && dark ? "#27272a" : "#f3f4f6",
            border: "none", borderRadius: 8,
            padding: "6px 10px", cursor: "pointer", fontSize: 16, lineHeight: 1,
          }}
        >
          {mounted && dark ? "☀️" : "🌙"}
        </button>
        <UserButton />
      </div>
    </nav>
  )
}