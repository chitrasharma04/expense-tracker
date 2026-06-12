import { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from "../context/ThemeContext";

// Create Auth context
const AuthContext = createContext();

// Hook to consume Auth context
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const { setDarkTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify token and fetch profile on reload
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || "Login failed";
      } catch {
        errorMessage = "Login failed";
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    setUser(data.user);
    // Theme respects user preference; no forced dark mode
    // setDarkTheme(false);
    return data.user;
  };

  const register = async (name, email, password) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || "Registration failed";
      } catch {
        errorMessage = "Registration failed";
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    setUser(data.user);
    // Theme respects user preference; no forced dark mode
    // setDarkTheme(false);
    return data.user;
  };


  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
export default AuthContext;
