'use client'

import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import LoadingScreen from "./LoadingScreen"
import Image from 'next/image'


const cards = [
  { img: "/slide1.svg", title: "Preparamos tu pedido", sub: "Cada orden es empacada con cuidado" },
  { img: "/slide2.svg", title: "Recibí lo que compraste", sub: "Coordinamos la entrega por vos" },
  { img: "/slide3.svg", title: "Tu pedido viaja hacia vos", sub: "Seguí cada movimiento en tiempo real" },
  { img: "/slide4.svg", title: "Entrega rápida y segura", sub: "Nos encargamos de llevarlo hasta tu puerta" },
]

export default function HomeClient() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false
    const html = document.documentElement
    return (
      html.getAttribute("data-theme") === "dark" ||
      html.classList.contains("dark") ||
      (!html.getAttribute("data-theme") &&
        !html.classList.contains("light") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    )
  })

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/dashboard")
  }, [isLoaded, isSignedIn])

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

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    })

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", checkTheme)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener("change", checkTheme)
    }
  }, [])

  if (!isLoaded || isSignedIn) {
    return <LoadingScreen />
  }

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
          .landing-grid { grid-template-columns: 1fr; }
          .landing-left { padding: 3rem 1.5rem; }
          .landing-right { padding: 1.5rem; }
        }
      `}</style>

      <div className="landing-grid">
        <div className="landing-left">
          <div style={{ marginBottom: -50, marginLeft: "-1.5rem", width: "fit-content", lineHeight: 0 }}>
            <Image
              src={dark ? "/logo-oscuro.webp" : "/logo-claro.webp"}
              alt="ZapasYA"
              width={450}
              height={150}
              priority
              quality={80}
              style={{ width: "clamp(280px, 38vw, 450px)", height: "auto", display: "block" }}
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

        <div className="landing-right">
          {cards.map((c, i) => (
            <div key={i} style={{
              background: "var(--color-surface)",
              borderRadius: 16,
              padding: "1.25rem",
              width: "45%",
              border: "0.5px solid var(--color-border)",
            }}>
              <Image
                src={c.img}
                alt={c.title}
                width={200}
                height={100}
                style={{ width: "100%", height: 100, objectFit: "contain" }}
              />
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)", marginTop: 8 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}