'use client'

import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function Home() {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) router.push("/dashboard")
  }, [isSignedIn])

  const cards = [
    { img: "/slide1.svg", title: "Preparamos tu pedido", sub: "Cada orden es empacada con cuidado" },
    { img: "/slide2.svg", title: "Recibí lo que compraste", sub: "Coordinamos la entrega por vos" },
    { img: "/slide3.svg", title: "Tu pedido viaja hacia vos", sub: "Seguí cada movimiento en tiempo real" },
    { img: "/slide4.svg", title: "Entrega rápida y segura", sub: "Nos encargamos de llevarlo hasta tu puerta" },
  ]

  const [dark, setDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      const html = document.documentElement
      const isDark =
        html.getAttribute("data-theme") === "dark" ||
        html.classList.contains("dark") ||
        (!html.getAttribute("data-theme") &&
          !html.classList.contains("light") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)

      setDark(isDark)
    }

    checkTheme()

    // Observa cambios de atributos Y de clases en <html>
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    })

    // También escucha cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", checkTheme)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener("change", checkTheme)
    }
  }, [])
  
  return (
    <>
      <style>{`
        .landing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: calc(100vh - 56px);
        }
        .landing-right {
          display: flex;
          flex-wrap: wrap;
          align-content: center;
          justify-content: center;
          gap: 16px;
          padding: 2rem;
          background: var(--color-surface-alt);
        }
        .landing-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem 3rem;
          background: var(--color-surface);
        }
        @media (max-width: 640px) {
          .landing-grid {
            grid-template-columns: 1fr;
          }
          .landing-left {
            padding: 3rem 1.5rem;
          }
          .landing-right {
            padding: 1.5rem;
          }
        }
      `}</style>

      <div className="landing-grid">
        {/* IZQUIERDA — Login */}
        <div className="landing-left">
        <div
          style={{
            marginBottom: -50,
            marginLeft: "-1.5 rem",

            width: "fit-content",
            lineHeight: 0,
          }}
        >
          <Image
            src={dark ? "/logo-oscuro.png" : "/logo-claro.png"}
            alt="ZapasYA"
            width={180}
            height={40}
            priority
            style={{
              width: "clamp(280px, 38vw, 450px)",
              height: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
            Seguí tu envío ahora
          </div>
          <div style={{ fontSize: 15, color: "var(--color-muted)", marginBottom: "2rem" }}>
            Conocé el estado de tus envíos en todo momento.
          </div>

          <SignInButton mode="modal">
            <button style={{
              padding: "12px 24px",
              borderRadius: 10,
              border: "1px solid var(--foreground)",
              background: "var(--foreground)",
              color: "var(--background)",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
              width: "fit-content",
            }}>
              Iniciar sesión →
            </button>
          </SignInButton>

          <div style={{ marginTop: "1.5rem", fontSize: 13, color: "var(--color-muted)" }}>
            ¿No tenés cuenta?{" "}
            <SignUpButton mode="modal">
              <span style={{ color: "var(--foreground)", cursor: "pointer", textDecoration: "underline" }}>
                Registrate
              </span>
            </SignUpButton>
            {" "}para ver todos tus envíos.
          </div>
        </div>

        {/* DERECHA — Collage */}
        <div className="landing-right">
          {cards.map((c, i) => (
            <div key={i} style={{
              background: "var(--color-surface)",
              borderRadius: 16,
              padding: "1.25rem",
              width: "45%",
              border: "0.5px solid var(--color-border)",
            }}>
              <img src={c.img} alt={c.title} style={{ width: "100%", height: 100, objectFit: "contain" }} />
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)", marginTop: 8 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}