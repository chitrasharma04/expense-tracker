import { useEffect, useState } from "react";

export default function Modal({ open, onClose, title, children, width = 480 }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: isMobile ? 0 : "16px",
        animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel animate-scale-up"
        style={{
          width: "100%",
          maxWidth: isMobile ? "100%" : width,
          maxHeight: isMobile ? "92vh" : "90vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-lg)",
          padding: isMobile ? "20px 16px 32px" : "28px",
          border: "1px solid var(--border-color)",
          borderRadius: isMobile
            ? "var(--radius-xl) var(--radius-xl) 0 0"
            : "var(--radius-lg)",
          animation: isMobile
            ? "slideUp 0.32s cubic-bezier(0.34,1.1,0.64,1) forwards"
            : "scaleUp 0.2s ease-out forwards"
        }}
      >
        {/* Handle bar on mobile */}
        {isMobile && (
          <div style={{
            width: 36, height: 4, borderRadius: 99,
            background: "var(--border-color-hover)",
            margin: "0 auto 20px",
          }} />
        )}

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: isMobile ? "16px" : "18px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-color)",
              cursor: "pointer",
              fontSize: "14px",
              color: "var(--text-tertiary)",
              padding: "6px 10px",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all var(--transition-fast)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-tertiary)"}
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

