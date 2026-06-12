import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { SplineChart, DonutChart, BarChart } from "../components/Charts";
import CATEGORIES, { getCategory } from "../services/categories";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Calendar
} from "lucide-react";

export default function Dashboard({ txns = [], budgets = [], onNavigate, formatCurrency, salaryTotal }) {
  const { user } = useAuth();

  // Date filtering utilities
  const getMonthRange = (offset = 0) => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth() + offset, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + offset + 1, 0, 23, 59, 59);
    return { start, end };
  };

  const filterByMonth = (list, offset = 0) => {
    const { start, end } = getMonthRange(offset);
    return list.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  };

  const currentMonthTxns = filterByMonth(txns, 0);
  const prevMonthTxns = filterByMonth(txns, -1);

  // Financial aggregates
  const income = currentMonthTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = currentMonthTxns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  const prevIncome = prevMonthTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevMonthTxns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  
  const incomeDelta = prevIncome ? ((income - prevIncome) / prevIncome) * 100 : 0;
  const expenseDelta = prevExpenses ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;

  // Category mapping
  const categorySpend = {};
  currentMonthTxns.filter(t => t.type === "expense").forEach(t => {
    categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
  });
  
  const topCategories = Object.entries(categorySpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const donutData = topCategories.map(([catId, amount]) => {
    const cat = getCategory(catId);
    return {
      label: cat.label,
      value: amount,
      color: cat.color
    };
  });

  // Last 6 months trends
  const monthsData = Array.from({ length: 6 }, (_, idx) => {
    const offset = idx - 5;
    const monthTx = filterByMonth(txns, offset);
    const label = getMonthRange(offset).start.toLocaleDateString("en-IN", { month: "short" });
    const incVal = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expVal = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { label, income: incVal, expense: expVal };
  });

  const last6Labels = monthsData.map(d => d.label);
  const last6Inc = monthsData.map(d => d.income);
  const last6Exp = monthsData.map(d => d.expense);

  const recentTxns = txns.slice(0, 5);

  const currentMonthLabel = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Page Title & Context Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
      <h2 className="page-title" style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>
            Dashboard Overview
          </h2>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13px", display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={14} style={{ color: "var(--primary)" }} /> {currentMonthLabel} overview
          </p>
        </div>
      </div>

      {/* Four Core Stat Cards */}
      <div
        className="stat-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px"
        }}
      >
      {/* Salary Card */}
      <Card className="stat-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "var(--info-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--info)", flexShrink: 0 }}>
          <TrendingUp size={22} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Salary Remaining</p>
          <h3 style={{ margin: "4px 0 2px", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>
            {formatCurrency(Math.max(0, salaryTotal - expenses))}
          </h3>
          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)" }}>Salary: {formatCurrency(salaryTotal)} • Expenses: {formatCurrency(expenses)}</p>
        </div>
      </Card>
        <Card className="stat-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", flexShrink: 0 }}>
            <Wallet size={22} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Net Balance</p>
            <h3 style={{ margin: "4px 0 2px", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>
              {formatCurrency(balance)}
            </h3>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)" }}>
              Savings Rate: <span style={{ fontWeight: 600, color: "var(--success)" }}>{savingsRate}%</span>
            </p>
          </div>
        </Card>

        {/* Monthly Income Card */}
        <Card className="stat-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "var(--success-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)", flexShrink: 0 }}>
            <TrendingUp size={22} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Income</p>
            <h3 style={{ margin: "4px 0 2px", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>
              {formatCurrency(income)}
            </h3>
            <p style={{ margin: 0, fontSize: "11px", color: incomeDelta >= 0 ? "var(--success)" : "var(--danger)", display: "flex", alignItems: "center", gap: 3 }}>
              {incomeDelta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span style={{ fontWeight: 600 }}>{Math.abs(incomeDelta).toFixed(1)}%</span> vs last month
            </p>
          </div>
        </Card>

        {/* Monthly Expenses Card */}
        <Card className="stat-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "var(--danger-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--danger)", flexShrink: 0 }}>
            <TrendingDown size={22} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Expenses</p>
            <h3 style={{ margin: "4px 0 2px", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>
              {formatCurrency(expenses)}
            </h3>
            <p style={{ margin: 0, fontSize: "11px", color: expenseDelta <= 0 ? "var(--success)" : "var(--danger)", display: "flex", alignItems: "center", gap: 3 }}>
              {expenseDelta <= 0 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
              <span style={{ fontWeight: 600 }}>{Math.abs(expenseDelta).toFixed(1)}%</span> vs last month
            </p>
          </div>
        </Card>

        {/* Net Savings Card */}
        <Card className="stat-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "rgba(139, 92, 246, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", flexShrink: 0 }}>
            <Wallet size={22} style={{ transform: "rotate(-10deg)" }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Savings</p>
            <h3 style={{ margin: "4px 0 2px", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>
              {formatCurrency(Math.max(0, balance))}
            </h3>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)" }}>
              Net target buffer
            </p>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div
        className="chart-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px"
        }}
      >
        {/* Income vs Expenses Bar Chart */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              Income vs Expenses
            </h4>
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Last 6 months</span>
          </div>
          
          <div style={{ display: "flex", gap: 12, marginBottom: "16px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>
              <span style={{ width: 8, height: 8, background: "var(--success)", borderRadius: "2px" }} />
              Income
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>
              <span style={{ width: 8, height: 8, background: "var(--danger)", borderRadius: "2px" }} />
              Expenses
            </span>
          </div>
          
          <BarChart 
            labels={last6Labels} 
            datasets={[
              { label: "Income", color: "var(--success)", data: last6Inc },
              { label: "Expenses", color: "var(--danger)", data: last6Exp }
            ]} 
            height={160}
            valueFormatter={formatCurrency}
          />
        </Card>

        {/* Spend by Category Donut Chart */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              Spending Breakdown
            </h4>
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Current month</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", justifyContent: "center", flex: "1 0 auto" }}>
              <DonutChart 
                data={donutData} 
                size={130} 
                totalLabel="Spent" 
                centerValue={formatCurrency(expenses)} 
              />
            </div>
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", minWidth: 160 }}>
              {topCategories.length === 0 ? (
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>No expenses logged this month.</p>
              ) : (
                topCategories.map(([catId, amount]) => {
                  const cat = getCategory(catId);
                  const share = expenses ? Math.round((amount / expenses) * 100) : 0;
                  return (
                    <div key={catId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, background: cat.color, borderRadius: "50%" }} />
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
                          {cat.label}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {formatCurrency(amount)}
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>
                          ({share}%)
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Expense Trend Spline Chart */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              Monthly Expense Trend
            </h4>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-tertiary)" }}>
              Line shows expense velocity over last 6 months
            </p>
          </div>
        </div>
        <SplineChart 
          data={last6Exp} 
          labels={last6Labels} 
          color="var(--danger)" 
          height={110} 
          valueFormatter={formatCurrency}
        />
      </Card>

      {/* Recent Transactions Section */}
      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 16px" }}>
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
            Recent Activity
          </h4>
          <button
            onClick={() => onNavigate("transactions")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--primary)",
              fontWeight: 600,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "opacity var(--transition-fast)"
            }}
            onMouseEnter={(e) => e.target.style.opacity = 0.8}
            onMouseLeave={(e) => e.target.style.opacity = 1}
          >
            See All <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTxns.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "36px", color: "var(--text-tertiary)" }}>
                    No recent transactions. Add one to get started!
                  </td>
                </tr>
              ) : (
                recentTxns.map((t) => {
                  const cat = getCategory(t.category);
                  const formattedDate = new Date(t.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  });

                  return (
                    <tr key={t.id}>
                      <td style={{ fontSize: "12px" }}>{formattedDate}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: "16px" }}>{cat.icon}</span>
                          <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{t.desc}</span>
                        </div>
                      </td>
                      <td>
                        <Badge color={cat.color}>{cat.label}</Badge>
                      </td>
                      <td>
                        <Badge color={t.type === "income" ? "var(--success)" : "var(--danger)"}>
                          {t.type === "income" ? "Income" : "Expense"}
                        </Badge>
                      </td>
                      <td 
                        style={{ 
                          textAlign: "right", 
                          fontWeight: 700, 
                          color: t.type === "income" ? "var(--success)" : "var(--danger)"
                        }}
                      >
                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
