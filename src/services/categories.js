export const CATEGORIES = [
  { id: "food", label: "Food & Dining", icon: "🍽️", color: "#f97316", type: "expense" },
  { id: "transport", label: "Transport", icon: "🚗", color: "#3b82f6", type: "expense" },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "#a855f7", type: "expense" },
  { id: "health", label: "Health", icon: "💊", color: "#ef4444", type: "expense" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", color: "#ec4899", type: "expense" },
  { id: "utilities", label: "Utilities", icon: "⚡", color: "#eab308", type: "expense" },
  { id: "housing", label: "Housing", icon: "🏠", color: "#06b6d4", type: "expense" },
  { id: "education", label: "Education", icon: "📚", color: "#8b5cf6", type: "expense" },
  { id: "salary", label: "Salary", icon: "💼", color: "#10b981", type: "income" },
  { id: "freelance", label: "Freelance", icon: "💻", color: "#14b8a6", type: "income" },
  { id: "investment", label: "Investment", icon: "📈", color: "#84cc16", type: "income" },
  { id: "other", label: "Other", icon: "📦", color: "#6b7280", type: "both" },
];

export const getCategory = (catId) => CATEGORIES.find(c => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
export default CATEGORIES;
