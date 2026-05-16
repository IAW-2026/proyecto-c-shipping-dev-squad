import { TrackingItem, STATUS_LABELS, STEPS } from "./types"

type Props = {
  status: string
  tracking: TrackingItem[]
}

function getStepState(step: string, currentStatus: string) {
  const currentIdx = STEPS.indexOf(currentStatus)
  const stepIdx = STEPS.indexOf(step)
  if (stepIdx <= currentIdx) return "done"
  if (stepIdx === currentIdx + 1) return "active"
  return "locked"
}

export function ShipmentStepper({ status, tracking }: Props) {
  return (
    <>
      {STEPS.map((step, i) => {
        const state = getStepState(step, status)
        const isLast = i === STEPS.length - 1
        const nextState = !isLast ? getStepState(STEPS[i + 1], status) : null
        const trackItem = tracking.find(t => t.status === step)
        return (
          <div key={step} style={{ display: "flex", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
              <div style={{
                width: 14, height: 14, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                background: state === "done" ? "#16a34a" : state === "active" ? "#2563eb" : "var(--color-surface-alt)",
                border: state === "locked" ? "1.5px solid var(--color-border)" : "none",
              }} />
              {!isLast && (
                <div style={{
                  width: 2, flex: 1, minHeight: 18, margin: "3px 0",
                  background: state === "done" && nextState === "done" ? "#16a34a" :
                    state === "done" && nextState === "active" ? "repeating-linear-gradient(to bottom, #2563eb 0px, #2563eb 5px, transparent 5px, transparent 10px)" :
                    "repeating-linear-gradient(to bottom, var(--color-border) 0px, var(--color-border) 5px, transparent 5px, transparent 10px)"
                }} />
              )}
            </div>
            <div style={{ paddingBottom: 18, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: state === "locked" ? "var(--color-muted)" : "var(--foreground)" }}>
                {STATUS_LABELS[step]}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>
                {state !== "locked" && trackItem ? (
                  <>
                    <div>{trackItem.description ?? trackItem.location}</div>
                    <div style={{ fontSize: 11, marginTop: 2, opacity: 0.7 }}>
                      {new Date(trackItem.timestamp).toLocaleDateString("es-AR", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </div>
                  </>
                ) : state === "locked" ? "🔒 No disponible aún" : ""}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}