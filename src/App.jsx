import { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import { StrictMode } from 'react';
import ResetPassword from "./pages/ResetPassword";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Card from "./components/ui/Card";
import Input from "./components/ui/Input";
import Button from "./components/ui/Button";
import api from "./services/api";
import { Mail, Lock, User as UserIcon, TrendingDown, LayoutDashboard, ReceiptText, Target, TrendingUp, Settings as SettingsIcon } from "lucide-react";

// Bottom nav items for mobile
const MOBILE_NAV = [
  { id: "dashboard",    icon: LayoutDashboard, label: "Home"     },
  { id: "transactions", icon: ReceiptText,      label: "Txns"     },
  { id: "budgets",      icon: Target,           label: "Budgets"  },
  { id: "analytics",   icon: TrendingUp,        label: "Analytics"},
  { id: "settings",    icon: SettingsIcon,      label: "Settings" },
];

// Helper function to resolve currency formatting dynamically
function getCurrencyFormatter(currencyCode = "INR") {
  const configs = {
    INR: { locale: "en-IN", currency: "INR" },
    USD: { locale: "en-US", currency: "USD" },
    EUR: { locale: "de-DE", currency: "EUR" }
  };
  const config = configs[currencyCode] || configs.INR;
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    maximumFractionDigits: 0
  }).format;
}

// ─── AUTH SCREEN COMPONENT ───────────────────────────────────────────────────
function AuthScreen() {
  const { login, register } = useAuth();
  const toast = useToast();
  
  const [mode, setMode] = useState("login"); // login, signup, or forgot
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@expense.app");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (mode === "signup" && !name)) {
      toast("Please complete all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast("Welcome back to Daily Expense Tracker! 👋", "success");
      } else {
        await register(name, email, password);
        toast("Account created successfully! 🎉", "success");
      }
    } catch (err) {
      toast(err.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        background: "var(--bg-app)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "20px",
        transition: "background var(--transition-normal)"
      }}
    >
      <div 
        className="animate-slide-up"
        style={{ 
          width: "100%", 
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "28px"
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center" }}>
          <div 
            style={{ 
              width: 52, 
              height: 52, 
              borderRadius: "16px", 
              background: "linear-gradient(135deg, var(--primary), #8b5cf6)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#ffffff", 
              margin: "0 auto 16px",
              boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)"
            }}
          >
            <TrendingDown size={28} strokeWidth={2.5} />
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-1px" }}>
            Daily Expense Tracker
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13.5px", fontWeight: 500 }}>
            Your premium financial dashboard companion
          </p>
        </div>

        {/* Input Card Container */}
        <Card style={{ padding: "32px 28px" }}>
          {/* Form selectors toggler */}
          <div 
            style={{ 
              display: "flex", 
              background: "var(--bg-input)", 
              borderRadius: "var(--radius-md)", 
              padding: "4px", 
              marginBottom: "24px",
              border: "1px solid var(--border-color)"
            }}
          >
            <button 
              onClick={() => { setMode("login"); }}
              style={{ 
                flex: 1, 
                padding: "8px 0", 
                borderRadius: "var(--radius-sm)", 
                border: "none", 
                cursor: "pointer", 
                fontWeight: 600, 
                fontSize: "12.5px", 
                background: mode === "login" ? "var(--bg-card)" : "transparent", 
                color: mode === "login" ? "var(--text-primary)" : "var(--text-tertiary)", 
                transition: "all var(--transition-fast)",
                boxShadow: mode === "login" ? "var(--shadow-sm)" : "none"
              }}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setMode("signup"); }}
              style={{ 
                flex: 1, 
                padding: "8px 0", 
                borderRadius: "var(--radius-sm)", 
                border: "none", 
                cursor: "pointer", 
                fontWeight: 600, 
                fontSize: "12.5px", 
                background: mode === "signup" ? "var(--bg-card)" : "transparent", 
                color: mode === "signup" ? "var(--text-primary)" : "var(--text-tertiary)", 
                transition: "all var(--transition-fast)",
                boxShadow: mode === "signup" ? "var(--shadow-sm)" : "none"
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {mode === "signup" && (
              <Input 
                label="Full Name"
                placeholder="e.g. John Doe"
                required
                value={name}
                onChange={setName}
                icon={<UserIcon size={16} />}
              />
            )}
            
            <Input 
              label="Email Address"
              type="email"
              placeholder="e.g. name@domain.com"
              required
              value={email}
              onChange={setEmail}
              icon={<Mail size={16} />}
            />

            <Input 
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={setPassword}
              icon={<Lock size={16} />}
            />

            <Button 
              type="submit"
              loading={loading}
              style={{ width: "100%", padding: "12px", marginTop: "8px" }}
            >
              {mode === "login" ? "Sign In" : "Register Account"}
            </Button>
          </form>

          {mode === "login" && (
            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 500 }}>
              Demo Login: <span style={{ color: "var(--text-secondary)" }}>demo@expense.app</span> / <span style={{ color: "var(--text-secondary)" }}>demo1234</span>
            </p>
          )}
          {mode === "forgot" && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch("/api/auth/forgot-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email })
                });
                const data = await res.json();
                toast(data.message || "If the email exists, you will receive a reset link.", "success");
                setMode("login");
              } catch (err) {
                toast(err.message || "Failed to request password reset.", "error");
              }
            }} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
              <Input 
                label="Email Address"
                type="email"
                placeholder="e.g. name@domain.com"
                required
                value={email}
                onChange={setEmail}
                icon={<Mail size={16} />}
              />
              <Button 
                type="submit"
                loading={loading}
                style={{ width: "100%", padding: "12px", marginTop: "8px" }}
              >
                Send Reset Link
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── MAIN APPLICATION SHELL ──────────────────────────────────────────────────
function AppShell() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  // --------------------------------------------------------------
  // Fresh‑start logic for demo user – clears demo transactions on login
  // --------------------------------------------------------------
  useEffect(() => {
    if (user && user.email === "demo@expense.app") {
      (async () => {
        try {
          await api.post("/api/settings/clear-data");
          // Reset client‑side state so net worth recomputes to 0
          setTransactions([]);
          setBudgets([]);
          toast("Demo data cleared – starting from ₹ 0", "success");
        } catch (err) {
          console.error("Failed to clear demo data", err);
        }
      })();
    }
  }, [user]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 1024);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Auto-collapse on tablet boundaries if resizing down
      if (window.innerWidth <= 1024 && window.innerWidth > 768) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ensure sidebar can be toggled via topbar button on mobile
  const handleMenuClick = () => setCollapsed(prev => !prev);

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Load Transactions & Budgets from SQLite DB on boot / user change
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setDataLoading(true);
      try {
        const [txData, bData] = await Promise.all([
          api.get("/api/transactions"),
          api.get("/api/budgets")
        ]);
        setTransactions(txData.transactions || []);
        setBudgets(bData.budgets || []);
      } catch (err) {
        toast("Failed to sync records with server", "error");
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    }

    loadData();
  }, [user, toast]);

  // Sync theme setting from DB on user change / login
  const { dark, setDarkTheme } = useTheme();
  useEffect(() => {
    if (user && user.theme) {
      const isUserDark = user.theme === "dark";
      if (dark !== isUserDark) {
        setDarkTheme(isUserDark);
      }
    }
  }, [user]);

  // Sync theme setting to DB when dark state changes locally
  useEffect(() => {
    if (user) {
      const currentTheme = dark ? "dark" : "light";
      if (user.theme !== currentTheme) {
        updateUser({ theme: currentTheme });
        api.put("/api/settings/preferences", {
          currency: user.currency,
          month_start: user.month_start,
          theme: currentTheme
        }).catch(err => console.error("Failed to sync theme preference:", err));
      }
    }
  }, [dark, user, updateUser]);

  // Currency formats resolver
  const formatCurrency = getCurrencyFormatter(user?.currency || "INR");

  // Calculate Net Worth based on transactions
  const salaryTotal = transactions.filter(t => t.type === "income" && t.category === "salary").reduce((s, t) => s + t.amount, 0);
  const netWorth = transactions.reduce((s, t) => t.type === "income" ? s + t.amount : s - t.amount, 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // CRUD API transaction Handlers
  const handleAddTransaction = async (newTx) => {
    const data = await api.post("/api/transactions", newTx);
    setTransactions(prev => [data.transaction, ...prev]);
    toast("Transaction logged successfully", "success");
  };

  const handleEditTransaction = async (updatedTx) => {
    const data = await api.put(`/api/transactions/${updatedTx.id}`, updatedTx);
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? data.transaction : t));
    toast("Transaction updated successfully", "success");
  };

  const handleDeleteTransaction = async (id) => {
    await api.delete(`/api/transactions/${id}`);
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast("Transaction deleted", "success");
  };

  // CRUD API budget Handlers
  const handleAddBudget = async (newB) => {
    const data = await api.post("/api/budgets", newB);
    setBudgets(prev => [...prev, data.budget]);
    toast("Budget limit set", "success");
  };

  const handleEditBudget = async (updatedB) => {
    const data = await api.put(`/api/budgets/${updatedB.id}`, { limit_amount: updatedB.limit_amount });
    setBudgets(prev => prev.map(b => b.id === updatedB.id ? data.budget : b));
    toast("Budget limit updated", "success");
  };

  const handleDeleteBudget = async (id) => {
    await api.delete(`/api/budgets/${id}`);
    setBudgets(prev => prev.filter(b => b.id !== id));
    toast("Budget limits removed", "success");
  };

  const handleClearLocalData = () => {
    setTransactions([]);
    setBudgets([]);
  };

  // Fullscreen loading spinner
  if (dataLoading) {
    return (
      <div style={{ height: "100vh", width: "100vw", background: "var(--bg-app)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3.5" style={{ animation: "spin 1s linear infinite" }}>
          <circle cx="12" cy="12" r="10" strokeOpacity="0.2"></circle>
          <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"></path>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </svg>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>Syncing ledger...</span>
      </div>
    );
  }

  const pagesMap = {
    dashboard: (
      <Dashboard 
        txns={transactions} 
        budgets={budgets} 
        onNavigate={setPage} 
        formatCurrency={formatCurrency} 
        salaryTotal={salaryTotal} 
      />
    ),
    transactions: (
      <Transactions 
        txns={transactions} 
        onAdd={handleAddTransaction} 
        onEdit={handleEditTransaction} 
        onDelete={handleDeleteTransaction}
        formatCurrency={formatCurrency}
      />
    ),
    budgets: (
      <Budgets 
        txns={transactions} 
        budgets={budgets} 
        onAdd={handleAddBudget} 
        onEdit={handleEditBudget} 
        onDelete={handleDeleteBudget}
        formatCurrency={formatCurrency}
      />
    ),
    analytics: (
      <Analytics 
        txns={transactions} 
        formatCurrency={formatCurrency} 
      />
    ),
    settings: (
      <Settings 
        onClearData={handleClearLocalData} 
      />
    ),
    resetPassword: (
      // ResetPassword component renders based on URL token
      <ResetPassword />
    )
  };
  // Determine if URL contains reset token and show ResetPassword page
  const urlPath = window.location.pathname;
  const pageKey = urlPath.startsWith('/reset-password') ? 'resetPassword' : page;
  const renderPage = pagesMap[pageKey] || pagesMap[page];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--bg-app)",
        overflow: "hidden",
        transition: "background var(--transition-normal)"
      }}
    >
      {/* Sidebar – desktop only; on mobile it slides in as a drawer */}
      {!isMobile && (
        <Sidebar
          active={page}
          onChange={setPage}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      )}

      {/* Mobile sidebar drawer */}
      {isMobile && !collapsed && (
        <>
          <div className="mobile-overlay" onClick={handleMenuClick} />
          <Sidebar
            active={page}
            onChange={setPage}
            collapsed={false}
            onToggle={handleMenuClick}
          />
        </>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar
          netWorth={netWorth}
          currencyFormatter={formatCurrency}
          showMenuButton={isMobile}
          onMenuClick={handleMenuClick}
        />

        <div
          style={{
            flex: 1,
            padding: isMobile ? "16px 14px" : "28px",
            paddingBottom: isMobile ? "90px" : "28px",
            overflowY: "auto"
          }}
        >
          {renderPage}
        </div>
      </div>

      {/* ── Mobile Bottom Navigation Bar ─────────────────────────────── */}
      {isMobile && (
        <nav className="bottom-nav">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                className={`bottom-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setPage(item.id)}
                aria-label={item.label}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

// ─── ROOT CONTAINER ──────────────────────────────────────────────────────────
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: "100vh", width: "100vw", background: "var(--bg-app)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3.5" style={{ animation: "spin 1s linear infinite" }}>
          <circle cx="12" cy="12" r="10" strokeOpacity="0.2"></circle>
          <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"></path>
        </svg>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>Loading profiles...</span>
      </div>
    );
  }

  return user ? <AppShell /> : <AuthScreen />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
