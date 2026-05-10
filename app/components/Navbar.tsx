'use client'

import { useEffect, useState } from "react"
import { useUser, UserButton } from "@clerk/nextjs"

export default function Navbar() {
  const { user } = useUser()
  const [dark, setDark] = useState(false)

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
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "#171717",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>👟</div>
        <span style={{ fontSize: 16, fontWeight: 500, color: dark ? "#ededed" : "#171717" }}>
          ZapasYA
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => setDark(d => !d)}
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