"use client"

import { useEffect, useRef } from "react"

type Props = {
  value: string
  onChange: (value: string) => void
}

export function ShipmentSearch({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sincroniza solo si el valor externo cambió y el input no está enfocado
  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = value
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "")
    e.target.value = clean // corrige en el input sin esperar al padre

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange(clean)
    }, 150)
  }

  return (
    <input
      ref={inputRef}
      defaultValue={value}
      onChange={handleChange}
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