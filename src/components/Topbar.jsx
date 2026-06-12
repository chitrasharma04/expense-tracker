import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Sun, Moon, Menu, Wallet, TrendingDown } from "lucide-react";

export default function Topbar({ netWorth = 0, currencyFormatter, onMenuClick, showMenuButton }) {
  const { dark, toggle } = useTheme();

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  // ── MOBILE TOPBAR ──────────────────────────────────────────────────────────
  if (showMenuButton) {
    return (
      <header className="mobile-topbar">
        {/* Left: Hamburger */}
        <button className="mobile-topbar-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>

        {/* Center: Brand */}
        <div className="mobile-topbar-brand">
          <div className="mobile-brand-icon">
            <TrendingDown size={14} strokeWidth={2.5} />
          </div>
          <span className="mobile-brand-name">Expense Tracker</span>
        </div>

        {/* Right: Net Worth pill + theme toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="mobile-networth-pill">
            <Wallet size={12} style={{ color: netWorth >= 0 ? "var(--success)" : "var(--danger)" }} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: netWorth >= 0 ? "var(--success)" : "var(--danger)"
              }}
            >
              {currencyFormatter(netWorth)}
            </span>
          </div>
          <button
            className="mobile-topbar-btn theme-toggle-btn"
            onClick={toggle}
            aria-label="Toggle theme"
            style={{ width: 36, height: 36 }}
          >
            {dark
              ? <Sun size={16} className="theme-toggle-icon" key="sun" />
              : <Moon size={16} className="theme-toggle-icon" key="moon" />
            }
          </button>
        </div>
      </header>
    );
  }

  // ── DESKTOP TOPBAR ─────────────────────────────────────────────────────────
  return (
    <header
      style={{
        padding: "16px 28px",
        borderBottom: "1px solid var(--border-color)",
        background: "var(--bg-topbar)",
        backdropFilter: "var(--backdrop-blur)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        height: 70,
        zIndex: 50,
        position: "sticky",
        top: 0
      }}
    >
      <span style={{ fontSize: "12.5px", color: "var(--text-tertiary)", fontWeight: 500 }}>
        {formattedDate}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Net Worth Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            background: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            transition: "all var(--transition-fast)"
          }}
        >
          <Wallet size={16} style={{ color: "var(--success)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>
              Net Worth
            </span>
            <span style={{ fontSize: "13.5px", fontWeight: 700, color: netWorth >= 0 ? "var(--success)" : "var(--danger)" }}>
              {currencyFormatter(netWorth)}
            </span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button onClick={toggle} className="theme-toggle-btn" aria-label="Toggle theme">
          {dark
            ? <Sun size={18} className="theme-toggle-icon" key="sun" />
            : <Moon size={18} className="theme-toggle-icon" key="moon" />
          }
        </button>
      </div>
    </header>
  );
}
