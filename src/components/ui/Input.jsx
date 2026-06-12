import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  icon,
  suffix,
  options,
  style = {},
  containerStyle = {},
  error,
  ...props
}) {


  const [focus, setFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" && showPassword ? "text" : type;

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);


  const baseInputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: icon ? "12px 14px 12px 42px" : (suffix ? "12px 42px 12px 14px" : "12px 14px"),
    background: "var(--bg-input)",
    border: `1.5px solid ${error ? "var(--danger)" : focus ? "var(--primary)" : "var(--border-color)"}`,
    borderRadius: "var(--radius-md)",
    fontSize: "14px",
    color: "var(--text-primary)",
    outline: "none",
    transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
    boxShadow: focus ? `0 0 0 3px ${error ? "var(--danger-glow)" : "var(--primary-glow)"}` : "none",
    ...style
  };

  return (
    <div style={{ position: "relative", width: "100%", ...containerStyle }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            letterSpacing: "0.4px"
          }}
        >
          {label}
          {required && <span style={{ color: "var(--danger)", marginLeft: "3px" }}>*</span>}
        </label>
      )}

      <div style={{ position: "relative" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "16px",
              color: "var(--text-tertiary)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center"
            }}
          >
            {icon}
          </span>
        )}
        {suffix && (
          <span
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
          >
            {suffix}
          </span>
        )}

        {options ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            style={baseInputStyle}
            {...props}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            placeholder={placeholder}
            style={{ ...baseInputStyle, minHeight: 80, resize: "vertical" }}
            {...props}
          />
        ) : (
          <>
            <input
              type={inputType}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              placeholder={placeholder}
              style={baseInputStyle}
              {...props}
            />
            {type === "password" && (
              <span
                onClick={togglePasswordVisibility}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            )}
          </>
        )}
      </div>

      {error && (
        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--danger)", fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
}
