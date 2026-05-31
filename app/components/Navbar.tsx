'use client'

import { useEffect, useState } from "react"
import { UserButton } from "@clerk/nextjs"
import Image from "next/image"

export default function Navbar() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("theme") === "dark"
  })

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') setDark(true)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <nav style={{
      background: dark ? "#111111" : "#ffffff",
      borderBottom: `0.5px solid ${dark ? "#2a2a2a" : "#e5e7eb"}`,
      padding: "0 1.5rem",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Image
           src={dark ? "/logo-oscuro.png" : "/logo-claro.png"}
           alt="ZapasYA"
           width={140}
           height={40}
           priority
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => setDark(d => !d)}
          aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          style={{
            background: dark ? "#27272a" : "#f3f4f6",
            border: "none", borderRadius: 8,
            padding: "6px 10px", cursor: "pointer", fontSize: 16, lineHeight: 1,
          }}
        >
          {dark ? "☀️" : "🌙"}
        </button>
        <UserButton />
      </div>
    </nav>
  )
} 