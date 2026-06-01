"use client"

export default function LoadingScreen() {
  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-screen {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          background: var(--color-surface, #fff);
          z-index: 9999;
        }
        .loading-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid var(--color-border, #e5e7eb);
          border-top-color: var(--foreground, #111);
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        .loading-text {
          font-size: 14px;
          color: var(--color-muted, #6b7280);
          letter-spacing: 0.01em;
        }
      `}</style>
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span className="loading-text">Cargando...</span>
      </div>
    </>
  )
}