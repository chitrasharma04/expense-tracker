export default function ProgressBar({ value, max, danger = false }) {
  const pct = Math.min((value / max) * 100, 100);
  
  // Decide color depending on warning threshold
  let barColor = "var(--success)";
  if (danger || pct > 90) {
    barColor = "var(--danger)";
  } else if (pct > 70) {
    barColor = "var(--warning)";
  }

  return (
    <div
      style={{
        background: "var(--bg-input)",
        borderRadius: "99px",
        height: "8px",
        overflow: "hidden",
        border: "1px solid var(--border-color)",
        width: "100%"
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          background: barColor,
          height: "100%",
          borderRadius: "99px",
          transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: `0 0 8px ${barColor}30`
        }}
      />
    </div>
  );
}
