import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  ReceiptText, 
  Target, 
  TrendingUp, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Sun,
  Moon
} from "lucide-react";

const NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "transactions", icon: ReceiptText, label: "Transactions" },
  { id: "budgets", icon: Target, label: "Budgets" },
  { id: "analytics", icon: TrendingUp, label: "Analytics" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ active, onChange, collapsed, onToggle }) {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();

  // Helper to handle navigation clicks: update active page and close collapsed sidebar on mobile
  const handleNav = (id) => {
    onChange(id);
    // If sidebar is collapsed (mobile view), toggle it closed after navigation
    if (collapsed) {
      onToggle();
    }
  };

  return (
    <div
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      onClick={collapsed ? onToggle : undefined}
      style={{
        width: collapsed ? 76 : 240,
        flexShrink: 0,
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        transition: "width var(--transition-normal)",
        overflow: "hidden",
        position: "relative",
        height: "100%",
        zIndex: 1001,
        cursor: collapsed ? 'pointer' : 'default'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: collapsed ? "center" : "space-between"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--primary), #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 4px 10px rgba(99, 102, 241, 0.3)",
              flexShrink: 0
            }}
          >
            <TrendingDown size={20} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text-primary)",
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.5px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              Expense Tracker
            </span>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {NAV.map((n) => {
          const isActive = active === n.id;
          const Icon = n.icon;
          return (
            <button type="button"
              key={n.id}
              onClick={() => handleNav(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                padding: collapsed ? "12px 0" : "12px 16px",
                border: "none",
                cursor: "pointer",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive ? "var(--primary-glow)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                fontWeight: isActive ? 600 : 500,
                fontSize: "13.5px",
                transition: "all var(--transition-fast)",
                position: "relative",
                outline: "none"
              }}
              className={!isActive ? "sidebar-item-hover" : ""}
            >
              <Icon 
                size={18} 
                strokeWidth={isActive ? 2.5 : 2} 
                style={{ 
                  color: isActive ? "var(--primary)" : "var(--text-secondary)",
                  transition: "color var(--transition-fast)" 
                }} 
              />
              {!collapsed && <span>{n.label}</span>}
              
              {isActive && !collapsed && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "20%",
                    height: "60%",
                    width: 3,
                    background: "var(--primary)",
                    borderRadius: "4px 0 0 4px"
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div
        style={{
          padding: "16px 12px",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        {!collapsed && user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-sm)",
                background: "var(--primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                flexShrink: 0
              }}
            >
              {user.avatar || (user.name ? user.name[0].toUpperCase() : "U")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {user.name ? user.name.split(" ")[0] : ""}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "var(--text-tertiary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {user.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: "10px 16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            borderRadius: "var(--radius-sm)",
            width: "100%",
            color: "var(--danger)",
            fontSize: "12px",
            fontWeight: 600,
            transition: "all var(--transition-fast)"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--danger-glow)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse Trigger Button */}
      <button
        onClick={onToggle}
        style={{
          position: "absolute",
          top: 24,
          right: collapsed ? "calc(50% - 12px)" : "12px",
          background: "var(--bg-input)",
          border: "1px solid var(--border-color)",
          color: "var(--text-secondary)",
          borderRadius: "50%",
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          outline: "none",
          transition: "all var(--transition-fast)"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-color-hover)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-color)"; }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <style>{`
        .sidebar-item-hover:hover {
          background: var(--bg-input) !important;
          color: var(--text-primary) !important;
        }
        .sidebar-item-hover:hover svg {
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
}
