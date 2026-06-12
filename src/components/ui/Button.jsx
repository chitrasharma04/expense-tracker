import { useState } from "react";

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  style = {},
  type = "button"
}) {
  const [hov, setHov] = useState(false);
  const [act, setAct] = useState(false);

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "var(--radius-md)",
    fontWeight: 600,
    cursor: (disabled || loading) ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all var(--transition-fast)",
    letterSpacing: "0.2px",
    border: "none",
    outline: "none",
    transform: act && !(disabled || loading) ? "scale(0.97)" : hov && !(disabled || loading) ? "scale(1.02)" : "scale(1)",
    userSelect: "none",
  };

  const variants = {
    primary: {
      background: hov ? "var(--primary-hover)" : "var(--primary)",
      color: "#ffffff",
      boxShadow: hov ? "0 4px 12px var(--primary-glow)" : "none",
    },
    secondary: {
      background: "var(--bg-sidebar)",
      color: "var(--text-secondary)",
      border: "1px solid var(--border-color)",
      boxShadow: hov ? "var(--shadow-sm)" : "none",
    },
    danger: {
      background: hov ? "var(--danger-hover, #e11d48)" : "var(--danger)",
      color: "#ffffff",
      boxShadow: hov ? "0 4px 12px var(--danger-glow)" : "none",
    },
    ghost: {
      background: hov ? "var(--bg-input)" : "transparent",
      color: "var(--text-secondary)",
    }
  };

  const sizes = {
    sm: { padding: "8px 14px", fontSize: "12px", borderRadius: "var(--radius-sm)" },
    md: { padding: "10px 18px", fontSize: "13px" },
    lg: { padding: "14px 24px", fontSize: "15px" }
  };

  const spinner = (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: "spin 1s linear infinite" }}>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
      <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </svg>
  );

  return (
    <button
      type={type}
      onClick={!disabled && !loading ? onClick : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setAct(false); }}
      onMouseDown={() => setAct(true)}
      onMouseUp={() => setAct(false)}
      disabled={disabled || loading}
      style={{
        ...baseStyle,
        ...variants[variant],
        ...sizes[size],
        ...style
      }}
    >
      {loading && spinner}
      {!loading && icon && <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>}
      {children}
    </button>
  );
}
