import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((msg, type = "success") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(t => [...t, { id, msg, type }]);
    
    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, 3500);
  }, []);

  const remove = (id) => {
    setToasts(t => t.filter(x => x.id !== id));
  };

  const icons = {
    success: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ),
    error: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    ),
    info: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    ),
    warning: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    )
  };

  const colors = {
    success: "var(--success)",
    error: "var(--danger)",
    info: "var(--primary)",
    warning: "var(--warning)"
  };

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        pointerEvents: "none"
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className="animate-slide-in-right"
            style={{
              background: "var(--bg-sidebar)",
              color: "var(--text-primary)",
              borderRadius: "var(--radius-md)",
              padding: "14px 20px",
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "var(--shadow-lg)",
              border: `1px solid var(--border-color)`,
              borderLeft: `4px solid ${colors[t.type]}`,
              minWidth: 280,
              maxWidth: 400,
              pointerEvents: "auto",
              cursor: "pointer"
            }}
            onClick={() => remove(t.id)}
          >
            <span style={{ color: colors[t.type], display: "flex", flexShrink: 0 }}>
              {icons[t.type]}
            </span>
            <span style={{ flex: 1, lineHeight: 1.4 }}>{t.msg}</span>
            <button
              onClick={(e) => { e.stopPropagation(); remove(t.id); }}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-tertiary)",
                cursor: "pointer",
                fontSize: 14,
                padding: 2,
                display: "flex",
                alignItems: "center"
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export default ToastContext;
