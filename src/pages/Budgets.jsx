import { useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import ProgressBar from "../components/ui/ProgressBar";
import Badge from "../components/ui/Badge";
import CATEGORIES, { getCategory } from "../services/categories";
import { useToast } from "../context/ToastContext";
import { 
  Target, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  TrendingDown,
  PiggyBank
} from "lucide-react";

export default function Budgets({ txns = [], budgets = [], onAdd, onEdit, onDelete, formatCurrency }) {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [isMutating, setIsMutating] = useState(false);

  // Form states
  const [formCat, setFormCat] = useState("food");
  const [formLimit, setFormLimit] = useState("");

  // Calculate actual spending in current calendar month for each budget category
  const getCurrentMonthSpent = (catId) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    return txns
      .filter(t => t.type === "expense" && t.category === catId)
      .filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleOpenAddModal = () => {
    setEditBudget(null);
    setFormCat("food");
    setFormLimit("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (b) => {
    setEditBudget(b);
    setFormCat(b.category);
    setFormLimit(b.limit_amount.toString());
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formLimit) {
      toast("Please enter a budget limit", "error");
      return;
    }

    const limitVal = parseFloat(formLimit);
    if (isNaN(limitVal) || limitVal <= 0) {
      toast("Please enter a valid numerical limit", "error");
      return;
    }

    setIsMutating(true);
    try {
      if (editBudget) {
        await onEdit({ id: editBudget.id, limit_amount: limitVal });
      } else {
        // Prevent duplicate category budgets
        if (budgets.some(b => b.category === formCat)) {
          toast("A budget limit has already been set for this category", "error");
          setIsMutating(false);
          return;
        }

        await onAdd({
          id: Math.random().toString(36).slice(2, 10),
          category: formCat,
          limit_amount: limitVal
        });
      }
      setModalOpen(false);
    } catch (err) {
      toast(err.message || "Failed to save budget profile", "error");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category budget limit?")) {
      try {
        await onDelete(id);
      } catch (err) {
        toast(err.message || "Failed to delete budget", "error");
      }
    }
  };

  // Aggregated indicators
  const totalBudget = budgets.reduce((s, b) => s + b.limit_amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + getCurrentMonthSpent(b.category), 0);
  const overallUsedPct = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;
  const overallRemaining = Math.max(0, totalBudget - totalSpent);

  const currentMonthLabel = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>
            Monthly Budgets
          </h2>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13px" }}>
            Monitor and control category limits for {currentMonthLabel}
          </p>
        </div>
        <Button size="sm" onClick={handleOpenAddModal} icon={<Plus size={14} />}>
          Set Budget Limit
        </Button>
      </div>

      {/* Aggregate metrics */}
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <Card style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", flexShrink: 0 }}>
            <Target size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Total Budget</p>
            <h4 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              {formatCurrency(totalBudget)}
            </h4>
          </div>
        </Card>

        <Card style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: totalSpent > totalBudget ? "var(--danger-glow)" : "var(--success-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: totalSpent > totalBudget ? "var(--danger)" : "var(--success)", flexShrink: 0 }}>
            <TrendingDown size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Total Spent</p>
            <h4 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              {formatCurrency(totalSpent)}
            </h4>
          </div>
        </Card>

        <Card style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(16, 185, 129, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)", flexShrink: 0 }}>
            <PiggyBank size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Remaining</p>
            <h4 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              {formatCurrency(overallRemaining)}
            </h4>
          </div>
        </Card>
      </div>

      {/* Main progress tracking card */}
      {totalBudget > 0 && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>Overall Budget Usage</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: totalSpent > totalBudget ? "var(--danger)" : "var(--success)" }}>
              {overallUsedPct}% Used
            </span>
          </div>
          <ProgressBar value={totalSpent} max={totalBudget} />
        </Card>
      )}

      {/* Grid of Budget Limit Cards */}
      {budgets.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "64px 32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
          <h4 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>No category budgets yet</h4>
          <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--text-secondary)", maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
            Set category limits to track and reduce spending habits.
          </p>
          <Button onClick={handleOpenAddModal} icon={<Plus size={14} />}>
            Create Budget Limit
          </Button>
        </Card>
      ) : (
        <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {budgets.map((b) => {
            const cat = getCategory(b.category);
            const spent = getCurrentMonthSpent(b.category);
            const pct = b.limit_amount > 0 ? Math.round((spent / b.limit_amount) * 100) : 0;
            const remaining = b.limit_amount - spent;
            const isExceeded = spent > b.limit_amount;
            const isWarning = !isExceeded && pct > 80;

            return (
              <Card 
                key={b.id} 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "16px",
                  borderColor: isExceeded ? "var(--danger)" : isWarning ? "var(--warning)" : "var(--border-color)"
                }}
              >
                {/* Card Header Context */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: cat.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: cat.color }}>
                      {cat.icon}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {cat.label}
                      </h4>
                      <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                        Limit: {formatCurrency(b.limit_amount)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handleOpenEditModal(b)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 4 }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-tertiary)"}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 4 }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--danger)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-tertiary)"}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress bar info */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      Spent: {formatCurrency(spent)}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: isExceeded ? "var(--danger)" : "var(--text-primary)" }}>
                      {pct}%
                    </span>
                  </div>
                  <ProgressBar value={spent} max={b.limit_amount} danger={isExceeded} />
                </div>

                {/* Alerts Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "4px" }}>
                  {isExceeded ? (
                    <Badge color="var(--danger)" style={{ fontSize: "10px" }}>
                      <AlertTriangle size={10} /> Over Limit
                    </Badge>
                  ) : isWarning ? (
                    <Badge color="var(--warning)" style={{ fontSize: "10px" }}>
                      <AlertTriangle size={10} /> Approaching Limit
                    </Badge>
                  ) : (
                    <Badge color="var(--success)" style={{ fontSize: "10px" }}>
                      <CheckCircle size={10} /> Safe Bounds
                    </Badge>
                  )}

                  <span style={{ fontSize: "11px", color: isExceeded ? "var(--danger)" : "var(--text-secondary)", fontWeight: 600 }}>
                    {isExceeded ? `Over by ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} left`}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit/Add budget Modal Dialog */}
      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editBudget ? "Edit Category Budget Limit" : "Create Category Budget Limit"}
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Category Dropdown */}
          <Input 
            label="Category"
            value={formCat}
            onChange={setFormCat}
            disabled={!!editBudget} // Lock category editing
            options={CATEGORIES.filter(c => c.type === "expense").map(c => ({ value: c.id, label: `${c.icon} ${c.label}` }))}
          />

          {/* Limit Amount */}
          <Input 
            label="Monthly Limit Amount"
            type="number"
            placeholder="e.g. 5000"
            required
            value={formLimit}
            onChange={setFormLimit}
            icon="₹"
            step="any"
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <Button 
              type="submit" 
              loading={isMutating} 
              style={{ flex: 1 }}
            >
              {editBudget ? "Save Limits" : "Set Limit"}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
