import { useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import ProgressBar from "../components/ui/ProgressBar";
import { BarChart } from "../components/Charts";
import CATEGORIES, { getCategory } from "../services/categories";
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Percent, 
  Zap,
  Calendar,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function Analytics({ txns = [], formatCurrency }) {
  const [period, setPeriod] = useState("30d");

  const isDaily = period.endsWith("d");
  const timeLabel = isDaily ? "Daily" : "Monthly";

  const getTrendData = (periodStr) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (periodStr === "7d" || periodStr === "30d") {
      const days = periodStr === "7d" ? 7 : 30;
      return Array.from({ length: days }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (days - 1 - i));
        d.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        
        const dayTx = txns.filter(t => {
          const td = new Date(t.date);
          return td >= d && td <= end;
        });
        
        return {
          label: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
          income: dayTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
          expense: dayTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        };
      });
    } else {
      const months = periodStr === "3m" ? 3 : 6;
      return Array.from({ length: months }, (_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth() - (months - 1 - i), 1);
        const end = new Date(today.getFullYear(), today.getMonth() - (months - 1 - i) + 1, 0, 23, 59, 59, 999);
        
        const monthTx = txns.filter(t => {
          const td = new Date(t.date);
          return td >= d && td <= end;
        });
        
        return {
          label: d.toLocaleDateString("en-IN", { month: "short" }),
          income: monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
          expense: monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        };
      });
    }
  };

  const trendData = getTrendData(period);

  const getPeriodStart = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (period === "7d") d.setDate(d.getDate() - 6);
    else if (period === "30d") d.setDate(d.getDate() - 29);
    else if (period === "3m") { d.setMonth(d.getMonth() - 2); d.setDate(1); }
    else if (period === "6m") { d.setMonth(d.getMonth() - 5); d.setDate(1); }
    return d;
  };
  const sinceDate = getPeriodStart();

  const periodExpenses = txns.filter(t => t.type === "expense" && new Date(t.date) >= sinceDate);

  // Compute category totals
  const categoryTotals = {};
  periodExpenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const totalPeriodExpenses = sortedCategories.reduce((s, [, v]) => s + v, 0) || 1;

  // Averages calculations
  const avgIncome = trendData.reduce((s, d) => s + d.income, 0) / (trendData.length || 1);
  const avgExpenses = trendData.reduce((s, d) => s + d.expense, 0) / (trendData.length || 1);
  const avgSavings = avgIncome - avgExpenses;
  const avgSavingsRate = avgIncome > 0 ? Math.round((avgSavings / avgIncome) * 100) : 0;

  // Compute spending by day of the week
  const weeklySpend = Array(7).fill(0);
  periodExpenses.forEach(t => {
    const day = new Date(t.date).getDay();
    weeklySpend[day] += t.amount;
  });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const maxSpendDayIdx = weeklySpend.indexOf(Math.max(...weeklySpend));
  const peakDayName = weeklySpend[maxSpendDayIdx] > 0 ? weekdays[maxSpendDayIdx] : "N/A";

  // Financial Insights calculations
  const biggestCategory = sortedCategories[0] ? getCategory(sortedCategories[0][0]) : null;
  const biggestCategoryAmount = sortedCategories[0] ? sortedCategories[0][1] : 0;

  const insightsList = [
    {
      type: avgSavings >= 0 ? "success" : "danger",
      icon: avgSavings >= 0 ? <CheckCircle size={18} /> : <AlertTriangle size={18} />,
      text: avgSavings >= 0 
        ? `Healthy savings buffer! You maintain an average of ${formatCurrency(Math.round(avgSavings))} savings per ${isDaily ? "day" : "month"}.`
        : `Deficit alert. Your average expenses exceed your earnings by ${formatCurrency(Math.round(Math.abs(avgSavings)))} per ${isDaily ? "day" : "month"}. Review non-essential category limits.`
    },
    {
      type: "info",
      icon: <Zap size={18} />,
      text: biggestCategory 
        ? `Primary outflow: ${biggestCategory.label} is your highest expense area, accounting for ${formatCurrency(biggestCategoryAmount)} (${Math.round((biggestCategoryAmount / totalPeriodExpenses) * 100)}% of total expenses).`
        : "Log more expenses to identify your primary expenditure categories."
    },
    {
      type: "info",
      icon: <Calendar size={18} />,
      text: peakDayName !== "N/A"
        ? `Temporal habit: Your highest spending frequency peaks on ${peakDayName}s, totaling ${formatCurrency(weeklySpend[maxSpendDayIdx])} in this period.`
        : "Temporal analysis will load once more transactions are registered."
    },
    {
      type: avgSavingsRate >= 20 ? "success" : "warning",
      icon: <CheckCircle size={18} />,
      text: avgSavingsRate >= 20
        ? `Savings rate is ${avgSavingsRate}%, exceeding the 20% benchmark. Consider allocating this surplus to automated investments.`
        : `Savings rate is ${avgSavingsRate}%, which is below the recommended 20% threshold. Try setting micro-budgets for entertainment or shopping.`
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>
            Financial Analytics
          </h2>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13px" }}>
            Uncover spending habits and cash-flow efficiency metrics
          </p>
        </div>
        <Input 
          value={period} 
          onChange={setPeriod} 
          options={[
            { value: "7d", label: "Last 7 Days" },
            { value: "30d", label: "Last 30 Days" },
            { value: "3m", label: "Last 3 Months" },
            { value: "6m", label: "Last 6 Months" }
          ]} 
          style={{ width: "160px" }}
        />
      </div>

      {/* Aggregate average metrics */}
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <Card style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--success-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)", flexShrink: 0 }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Avg {timeLabel} Income</p>
            <h4 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              {formatCurrency(Math.round(avgIncome))}
            </h4>
          </div>
        </Card>

        <Card style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--danger-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--danger)", flexShrink: 0 }}>
            <TrendingDown size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Avg {timeLabel} Expense</p>
            <h4 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              {formatCurrency(Math.round(avgExpenses))}
            </h4>
          </div>
        </Card>

        <Card style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: avgSavings >= 0 ? "var(--primary-glow)" : "var(--danger-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: avgSavings >= 0 ? "var(--primary)" : "var(--danger)", flexShrink: 0 }}>
            <PiggyBank size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Avg {timeLabel} Savings</p>
            <h4 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              {formatCurrency(Math.round(avgSavings))}
            </h4>
          </div>
        </Card>

        <Card style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(139, 92, 246, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", flexShrink: 0 }}>
            <Percent size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Avg Savings Rate</p>
            <h4 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              {avgSavingsRate}%
            </h4>
          </div>
        </Card>
      </div>

      {/* Main breakdown row */}
      <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        {/* Category Breakdown Progress indicators */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
            Category Outflow Breakdown
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto", maxHeight: "310px", paddingRight: "4px" }}>
            {sortedCategories.length === 0 ? (
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", textAlign: "center", padding: "24px" }}>
                No expense logs recorded in this period.
              </p>
            ) : (
              sortedCategories.map(([catId, amount]) => {
                const cat = getCategory(catId);
                const pct = Math.round((amount / totalPeriodExpenses) * 100);
                return (
                  <div key={catId} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: 6, fontWeight: 500, color: "var(--text-primary)" }}>
                        <span>{cat.icon}</span>{cat.label}
                      </span>
                      <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {formatCurrency(amount)}
                        <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-tertiary)", marginLeft: 6 }}>
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <ProgressBar value={amount} max={totalPeriodExpenses} />
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Weekday Spending Habits Bar Chart */}
        <Card>
          <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
            Spending Velocity by Weekday
          </h4>
          <BarChart 
            labels={weekdays} 
            datasets={[{ label: "Spending", color: "var(--primary)", data: weeklySpend }]} 
            height={200}
            valueFormatter={formatCurrency}
          />
        </Card>
      </div>

      {/* Monthly comparison grouped bar chart */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
            {isDaily ? "Daily" : "Monthly"} Cashflow Comparison
          </h4>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>
              <span style={{ width: 8, height: 8, background: "var(--success)", borderRadius: "2px" }} />
              Income
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>
              <span style={{ width: 8, height: 8, background: "var(--danger)", borderRadius: "2px" }} />
              Expenses
            </span>
          </div>
        </div>
        
        <BarChart 
          labels={trendData.map(d => d.label)} 
          datasets={[
            { label: "Income", color: "var(--success)", data: trendData.map(d => d.income) },
            { label: "Expenses", color: "var(--danger)", data: trendData.map(d => d.expense) }
          ]} 
          height={200}
          valueFormatter={formatCurrency}
        />
      </Card>

      {/* Dynamic Text Financial Insights */}
      <Card style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
          Smart Financial Insights
        </h4>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
          {insightsList.map((ins, idx) => {
            let itemBg = "var(--bg-input)";
            let itemBorder = "var(--border-color)";
            let itemColor = "var(--text-secondary)";

            if (ins.type === "success") {
              itemBg = "var(--success-glow)";
              itemBorder = "rgba(16, 185, 129, 0.2)";
              itemColor = "var(--success)";
            } else if (ins.type === "danger") {
              itemBg = "var(--danger-glow)";
              itemBorder = "rgba(244, 63, 94, 0.2)";
              itemColor = "var(--danger)";
            } else if (ins.type === "warning") {
              itemBg = "var(--warning-glow)";
              itemBorder = "rgba(245, 158, 11, 0.2)";
              itemColor = "var(--warning)";
            }

            return (
              <div 
                key={idx}
                style={{ 
                  display: "flex", 
                  gap: "12px", 
                  padding: "14px 16px", 
                  background: itemBg, 
                  border: `1px solid ${itemBorder}`,
                  borderRadius: "var(--radius-md)" 
                }}
              >
                <div style={{ color: itemColor, display: "flex", flexShrink: 0, marginTop: "2px" }}>
                  {ins.icon}
                </div>
                <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.5, fontWeight: 500 }}>
                  {ins.text}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
