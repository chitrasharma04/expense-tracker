import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? saved === "dark" : true; // Default dark
  });

  useEffect(() => {
    const theme = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [dark]);

  const toggle = () => setDark(d => !d);
  
  const setDarkTheme = (isDark) => setDark(isDark);

  return (
    <ThemeContext.Provider value={{ dark, toggle, setDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export default ThemeContext;
