import { useState, useRef, useEffect } from "react";

// ─── BEZIER SPLINE CHART ──────────────────────────────────────────────────────
export function SplineChart({ data = [], color = "var(--primary)", height = 140, labels = [], valueFormatter = (v) => v }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
        No historical trends found
      </div>
    );
  }

  // Handle single data point case
  const chartData = data.length === 1 ? [data[0], data[0]] : data;
  const chartLabels = labels.length === 1 ? [labels[0], labels[0]] : labels;

  const min = Math.min(...chartData);
  const max = Math.max(...chartData);
  const range = max - min || 1;

  const W = 500;
  const H = height;
  const paddingY = 20;

  const pts = chartData.map((v, i) => {
    const x = (i / (chartData.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 2 * paddingY) - paddingY;
    return { x, y, value: v, label: chartLabels[i] || "" };
  });

  // Build smooth Cubic Bezier path
  let pathD = "";
  if (pts.length > 1) {
    pathD = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cpX1 = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
      const cpY1 = pts[i].y;
      const cpX2 = pts[i].x + 2 * (pts[i + 1].x - pts[i].x) / 3;
      const cpY2 = pts[i + 1].y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pts[i + 1].x} ${pts[i + 1].y}`;
    }
  }

  const areaD = pts.length > 1 ? `${pathD} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z` : "";
  const gradId = `sg-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;
    
    // Find closest point
    let closestIdx = 0;
    let minDiff = Infinity;
    pts.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoveredIdx(closestIdx);

    // Compute tooltip positions (relative to screen element)
    const targetPt = pts[closestIdx];
    const tooltipX = (targetPt.x / W) * rect.width;
    const tooltipY = (targetPt.y / H) * rect.height - 42;
    setTooltipPos({ x: tooltipX, y: tooltipY });
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  return (
    <div 
      ref={containerRef} 
      style={{ position: "relative", width: "100%", height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg 
        viewBox={`0 0 ${W} ${H}`} 
        style={{ width: "100%", height: "100%", overflow: "visible" }} 
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingY + ratio * (H - 2 * paddingY);
          return (
            <line 
              key={i} 
              x1="0" 
              y1={y} 
              x2={W} 
              y2={y} 
              stroke="var(--border-color)" 
              strokeWidth="0.8" 
              strokeDasharray="4,4" 
            />
          );
        })}

        {/* Bezier Area Fill */}
        {areaD && <path d={areaD} fill={`url(#${gradId})`} />}

        {/* Bezier Spline Stroke */}
        {pathD && (
          <path 
            d={pathD} 
            fill="none" 
            stroke={color} 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        )}

        {/* Dots */}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoveredIdx === i ? 6 : 4}
            fill={color}
            stroke="var(--bg-card)"
            strokeWidth={hoveredIdx === i ? 2.5 : 1.5}
            style={{ transition: "r 0.15s, stroke-width 0.15s" }}
          />
        ))}
      </svg>

      {/* Interactive Tooltip Card */}
      {hoveredIdx !== null && pts[hoveredIdx] && (
        <div
          style={{
            position: "absolute",
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translateX(-50%)",
            background: "var(--bg-sidebar)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-sm)",
            padding: "6px 10px",
            boxShadow: "var(--shadow-md)",
            fontSize: "11px",
            color: "var(--text-primary)",
            pointerEvents: "none",
            zIndex: 10,
            whiteSpace: "nowrap",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            transition: "left 0.15s ease-out, top 0.15s ease-out"
          }}
        >
          <span style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>{pts[hoveredIdx].label}</span>
          <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "12px" }}>
            {valueFormatter(pts[hoveredIdx].value)}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── DYNAMIC DONUT CHART ──────────────────────────────────────────────────────
export function DonutChart({ data = [], size = 140, totalLabel = "Expenses", centerValue = "₹0" }) {
  const r = 50;
  const cx = 60;
  const cy = 60;
  const stroke = 14;
  const circ = 2 * Math.PI * r;

  const validData = data.filter(d => d.value > 0);
  const total = validData.reduce((s, d) => s + d.value, 0) || 1;
  
  let offset = 0;
  const slices = validData.map(d => {
    const pct = d.value / total;
    const s = {
      pct,
      dasharray: `${pct * circ} ${circ}`,
      dashoffset: -offset * circ,
      ...d
    };
    offset += pct;
    return s;
  });

  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg 
        viewBox="0 0 120 120" 
        style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
      >
        {/* Gray base circle if empty */}
        {slices.length === 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--border-color)"
            strokeWidth={stroke}
          />
        )}
        
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={s.dasharray}
            strokeDashoffset={s.dashoffset}
            strokeLinecap={slices.length > 1 ? "butt" : "round"}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transition: "stroke-dasharray 0.5s ease-out, stroke-dashoffset 0.5s ease-out, stroke-width 0.15s",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => e.target.setAttribute("stroke-width", stroke + 3)}
            onMouseLeave={(e) => e.target.setAttribute("stroke-width", stroke)}
          />
        ))}
      </svg>
      
      {/* Center Label Context */}
      <div 
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "70%",
          pointerEvents: "none"
        }}
      >
        <span style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
          {totalLabel}
        </span>
        <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
          {centerValue}
        </span>
      </div>
    </div>
  );
}

// ─── GROUPED BAR CHART ────────────────────────────────────────────────────────
export function BarChart({ labels = [], datasets = [], height = 180, valueFormatter = (v) => v }) {
  const [hoveredBar, setHoveredBar] = useState(null); // { datasetIdx, labelIdx, value, x, y }
  
  if (!labels || labels.length === 0 || !datasets || datasets.length === 0) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
        No metric comparison available
      </div>
    );
  }

  const allVals = datasets.flatMap(d => d.data || []);
  const maxV = Math.max(...allVals, 1);

  // Layout math
  const paddingX = 16;
  const paddingBottom = 25;
  const barW = Math.max(6, Math.floor(180 / (labels.length * datasets.length + labels.length)));
  const gap = 2; // gap between bars in a group
  const groupW = datasets.length * barW + (datasets.length - 1) * gap;
  const groupSpacing = 16; // space between groups
  const totalW = labels.length * (groupW + groupSpacing) - groupSpacing + 2 * paddingX;

  const svgH = height + paddingBottom;

  return (
    <div style={{ overflowX: "auto", position: "relative", width: "100%" }}>
      <svg 
        viewBox={`0 0 ${Math.max(totalW, 300)} ${svgH}`} 
        style={{ width: "100%", minWidth: Math.max(totalW, 300), height: svgH, overflow: "visible" }}
      >
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = (1 - ratio) * height;
          return (
            <line 
              key={i} 
              x1="0" 
              y1={y} 
              x2={Math.max(totalW, 300)} 
              y2={y} 
              stroke="var(--border-color)" 
              strokeWidth="0.8" 
              strokeDasharray="4,4" 
            />
          );
        })}

        {labels.map((lbl, i) => {
          const gx = paddingX + i * (groupW + groupSpacing);
          return (
            <g key={i}>
              {datasets.map((ds, j) => {
                const v = ds.data[i] || 0;
                const bh = (v / maxV) * (height - 10); // leave 10px spacing on top
                const bx = gx + j * (barW + gap);
                const by = height - bh;
                const isHovered = hoveredBar && hoveredBar.datasetIdx === j && hoveredBar.labelIdx === i;

                return (
                  <rect
                    key={j}
                    x={bx}
                    y={by}
                    width={barW}
                    height={Math.max(bh, 2)} // ensure at least 2px height for visual mapping
                    rx={2.5}
                    fill={ds.color}
                    opacity={hoveredBar ? (isHovered ? 1 : 0.4) : 0.85}
                    style={{ transition: "opacity 0.15s, y 0.25s, height 0.25s" }}
                    onMouseEnter={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      const parentRect = e.target.parentElement.parentElement.getBoundingClientRect();
                      setHoveredBar({
                        datasetIdx: j,
                        labelIdx: i,
                        value: v,
                        label: lbl,
                        datasetLabel: ds.label,
                        x: bx + barW / 2,
                        y: by - 12
                      });
                    }}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                );
              })}
              
              {/* Group Label */}
              <text
                x={gx + groupW / 2}
                y={height + 16}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="var(--text-tertiary)"
                fontFamily="var(--font-body)"
              >
                {lbl}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip details */}
      {hoveredBar && (
        <div
          style={{
            position: "absolute",
            left: `${(hoveredBar.x / totalW) * 100}%`,
            top: hoveredBar.y,
            transform: "translate(-50%, -100%)",
            background: "var(--bg-sidebar)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-sm)",
            padding: "6px 10px",
            boxShadow: "var(--shadow-md)",
            fontSize: "11px",
            color: "var(--text-primary)",
            pointerEvents: "none",
            zIndex: 15,
            whiteSpace: "nowrap",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            transition: "left 0.1s ease-out, top 0.1s ease-out"
          }}
        >
          <span style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
            {hoveredBar.label} {hoveredBar.datasetLabel ? `· ${hoveredBar.datasetLabel}` : ""}
          </span>
          <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "12px" }}>
            {valueFormatter(hoveredBar.value)}
          </span>
        </div>
      )}
    </div>
  );
}
