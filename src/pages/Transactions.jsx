import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import CATEGORIES, { getCategory } from "../services/categories";
import { useAuth } from "../context/AuthContext";
import { 
  Search, 
  Plus, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  ArrowRight,
  Filter
} from "lucide-react";

export default function Transactions({ txns = [], onAdd, onEdit, onDelete, formatCurrency }) {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);
  
  // Filtering & Pagination state
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [monthOffset, setMonthOffset] = useState(0);
  const [page, setPage] = useState(1);
  const [isMutating, setIsMutating] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const PER_PAGE = 12;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Form state
  const [formType, setFormType] = useState("expense");
  const [formCat, setFormCat] = useState("food");
  const [formAmount, setFormAmount] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));

  const getMonthRange = (offset = 0) => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth() + offset, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + offset + 1, 0, 23, 59, 59);
    return { 
      start, 
      end, 
      label: start.toLocaleDateString("en-IN", { month: "long", year: "numeric" }) 
    };
  };

  const { label: monthLabel, start: monthStart, end: monthEnd } = getMonthRange(monthOffset);

  // Filter transactions
  const filteredTxns = txns.filter(t => {
    // Month constraint
    const tDate = new Date(t.date);
    if (tDate < monthStart || tDate > monthEnd) return false;

    // Type filter
    if (filterType !== "all" && t.type !== filterType) return false;

    // Category filter
    if (filterCat !== "all" && t.category !== filterCat) return false;

    // Search query constraint
    if (search && !t.desc.toLowerCase().includes(search.toLowerCase())) return false;

    return true;
  });

  // Pagination bounds
  const pagesCount = Math.ceil(filteredTxns.length / PER_PAGE) || 1;
  const startIndex = (page - 1) * PER_PAGE;
  const pagedTxns = filteredTxns.slice(startIndex, startIndex + PER_PAGE);

  const handleOpenAddModal = () => {
    setEditTx(null);
    setFormType("expense");
    setFormCat("food");
    setFormAmount("");
    setFormDesc("");
    setFormDate(new Date().toISOString().slice(0, 10));
    setModalOpen(true);
  };

  const handleOpenEditModal = (t) => {
    setEditTx(t);
    setFormType(t.type);
    setFormCat(t.category);
    setFormAmount(t.amount.toString());
    setFormDesc(t.desc);
    setFormDate(new Date(t.date).toISOString().slice(0, 10));
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formAmount || !formDesc || !formDate) {
      toast("Please complete all required fields", "error");
      return;
    }

    const numAmount = parseFloat(formAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast("Please enter a valid numerical amount greater than zero", "error");
      return;
    }

    setIsMutating(true);
    try {
      const payload = {
        type: formType,
        category: formCat,
        amount: numAmount,
        desc: formDesc,
        date: new Date(formDate).toISOString()
      };

      if (editTx) {
        await onEdit({ ...payload, id: editTx.id });
      } else {
        await onAdd({ ...payload, id: Math.random().toString(36).slice(2, 10) });
      }
      setModalOpen(false);
    } catch (err) {
      toast(err.message || "Failed to save record", "error");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this transaction?")) {
      try {
        await onDelete(id);
      } catch (err) {
        toast(err.message || "Failed to delete record", "error");
      }
    }
  };

  const handleExportCSV = () => {
    if (filteredTxns.length === 0) {
      toast("No transactions found to export", "warning");
      return;
    }
    const headers = ["Date", "Type", "Category", "Description", "Amount"];
    const rows = filteredTxns.map(t => [
      new Date(t.date).toLocaleDateString("en-IN"),
      t.type,
      t.category,
      t.desc,
      t.amount
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expense_tracker_transactions_${monthLabel.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("CSV exported successfully", "success");
  };

  const availableCats = CATEGORIES.filter(c => c.type === formType || c.type === "both");

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="page-title" style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>
            Transactions
          </h2>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13px" }}>
            {filteredTxns.length} records • {monthLabel}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!isMobile && (
            <Button variant="secondary" size="sm" onClick={handleExportCSV} icon={<Download size={14} />}>
              Export CSV
            </Button>
          )}
          <Button size="sm" onClick={handleOpenAddModal} icon={<Plus size={14} />}
            style={isMobile ? { flex: 1, minWidth: 0 } : {}}
          >
            {isMobile ? "Add" : "Add Transaction"}
          </Button>
        </div>
      </div>

      {/* Filters Area */}
      <Card style={{ padding: isMobile ? "14px" : "20px 24px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          {/* Search field */}
          <div style={{ flex: "2 1 200px" }}>
            <Input
              placeholder="Search..."
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              icon={<Search size={16} />}
            />
          </div>

          {/* Type dropdown */}
          <div style={{ flex: "1 1 120px" }}>
            <Input
              value={filterType}
              onChange={(v) => { setFilterType(v); setPage(1); }}
              options={[
                { value: "all", label: "All Types" },
                { value: "income", label: "Income" },
                { value: "expense", label: "Expenses" }
              ]}
            />
          </div>

          {/* Category dropdown */}
          {!isMobile && (
            <div style={{ flex: "1 1 150px" }}>
              <Input
                value={filterCat}
                onChange={(v) => { setFilterCat(v); setPage(1); }}
                options={[
                  { value: "all", label: "All Categories" },
                  ...CATEGORIES.map(c => ({ value: c.id, label: `${c.icon} ${c.label}` }))
                ]}
              />
            </div>
          )}

          {/* Month pagination selectors */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg-input)", border: "1px solid var(--border-color)", padding: "4px 6px", borderRadius: "var(--radius-md)", height: "46px" }}>
            <Button
              variant="ghost"
              onClick={() => { setMonthOffset(m => m - 1); setPage(1); }}
              style={{ padding: "6px 8px", minWidth: 30 }}
            >
              <ChevronLeft size={16} />
            </Button>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap", padding: "0 4px" }}>
              {isMobile ? monthLabel.split(" ")[0] : monthLabel}
            </span>
            <Button
              variant="ghost"
              onClick={() => { setMonthOffset(m => Math.min(0, m + 1)); setPage(1); }}
              disabled={monthOffset >= 0}
              style={{ padding: "6px 8px", minWidth: 30 }}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions Table Layout */}
      <Card style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "center", width: "90px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedTxns.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "var(--text-tertiary)" }}>
                    No matching records found for this period.
                  </td>
                </tr>
              ) : (
                pagedTxns.map((t) => {
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
                          color: t.type === "income" ? "var(--success)" : "var(--danger)",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                      </td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                          <button
                            onClick={() => handleOpenEditModal(t)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--text-tertiary)",
                              padding: "4px",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-tertiary)"}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--text-tertiary)",
                              padding: "4px",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--danger)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-tertiary)"}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paging controls */}
        {pagesCount > 1 && (
          <div 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              padding: "16px 24px", 
              borderTop: "1px solid var(--border-color)" 
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
              Page {page} of {pagesCount}
            </span>
            
            <div style={{ display: "flex", gap: 8 }}>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding: "6px 12px" }}
              >
                Previous
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === pagesCount}
                onClick={() => setPage(p => Math.min(pagesCount, p + 1))}
                style={{ padding: "6px 12px" }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Transaction Dialog */}
      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editTx ? "Edit Transaction Record" : "Add Transaction Log"}
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Type Select */}
          <Input 
            label="Transaction Type"
            value={formType}
            onChange={(val) => {
              setFormType(val);
              setFormCat(val === "income" ? "salary" : "food");
            }}
            options={[
              { value: "expense", label: "Expense (Outflow)" },
              { value: "income", label: "Income (Inflow)" }
            ]}
          />

          {/* Category Select */}
          <Input 
            label="Category"
            value={formCat}
            onChange={setFormCat}
            options={availableCats.map(c => ({ value: c.id, label: `${c.icon} ${c.label}` }))}
          />

          {/* Amount field */}
          <Input 
            label="Amount"
            type="number"
            placeholder="0.00"
            required
            value={formAmount}
            onChange={setFormAmount}
            icon={formType === "income" ? "+" : "-"}
            step="any"
          />

          {/* Description field */}
          <Input 
            label="Description"
            placeholder="What was this transaction for?"
            required
            value={formDesc}
            onChange={setFormDesc}
          />

          {/* Date Picker field */}
          <Input 
            label="Transaction Date"
            type="date"
            required
            value={formDate}
            onChange={setFormDate}
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <Button 
              type="submit" 
              loading={isMutating} 
              style={{ flex: 1 }}
            >
              {editTx ? "Update Record" : "Save Record"}
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
