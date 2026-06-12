export default function Card({ children, style = {}, onClick, hover = false, className = "" }) {
  const isClickable = !!onClick;
  
  return (
    <div
      onClick={onClick}
      className={`${hover && isClickable ? "glass-panel glass-panel-hover" : "glass-panel"} ${className}`.trim()}
      style={{
        padding: "24px 28px",
        cursor: isClickable ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        ...style
      }}
    >
      {children}
    </div>
  );
}

