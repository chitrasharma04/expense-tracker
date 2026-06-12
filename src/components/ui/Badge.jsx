export default function Badge({ children, color = "#6b7280", style = {} }) {
  return (
    <span
      style={{
        background: color + "15",
        color: color,
        borderRadius: "var(--radius-sm)",
        padding: "3px 8px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.4px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        border: `1px solid ${color}20`,
        ...style
      }}
    >
      {children}
    </span>
  );
}
