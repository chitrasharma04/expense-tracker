import { useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { 
  User, 
  Settings as SettingsIcon, 
  Lock, 
  Trash2, 
  Sun, 
  Moon,
  Eye, 
  EyeOff,
  ShieldAlert
} from "lucide-react";

export default function Settings({ onClearData }) {
  const { user, updateUser } = useAuth();
  const { dark, toggle } = useTheme();
  const toast = useToast();

  // Profile forms
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profileLoading, setProfileLoading] = useState(false);

  // Preference forms
  const [prefCurrency, setPrefCurrency] = useState(user?.currency || "INR");
  const [prefMonthStart, setPrefMonthStart] = useState((user?.month_start || 1).toString());
  const [prefLoading, setPrefLoading] = useState(false);

  // Password forms
  const [showPassword, setShowPassword] = useState(false);
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [dangerLoading, setDangerLoading] = useState(false);

  const handleForgotPassword = async () => {
    // Placeholder: In a real app, trigger email reset flow
    toast("Password reset link sent to your email", "info");
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirm) return;
    try {
      await api.delete("/api/settings/delete-account");
      toast("Account deleted successfully", "success");
      // logout and redirect to login screen
      if (typeof updateUser === "function") updateUser(null);
    } catch (err) {
      toast(err.message || "Failed to delete account", "error");
    }
  };

  // Salary input state
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryLoading, setSalaryLoading] = useState(false);

  const handleSetSalary = async (e) => {
    e.preventDefault();
    if (!salaryAmount) {
      toast("Please enter a salary amount", "error");
      return;
    }
    const amountNum = parseFloat(salaryAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast("Enter a valid positive number", "error");
      return;
    }
    setSalaryLoading(true);
    try {
      await api.post("/api/transactions", {
        type: "income",
        category: "salary",
        amount: amountNum,
        desc: "Initial Salary",
        date: new Date().toISOString()
      });
      toast("Salary set successfully", "success");
      setSalaryAmount("");
    } catch (err) {
      toast(err.message || "Failed to set salary", "error");
    } finally {
      setSalaryLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName || !profileEmail) {
      toast("Name and email are required", "error");
      return;
    }

    setProfileLoading(true);
    try {
      const data = await api.put("/api/settings/profile", {
        name: profileName,
        email: profileEmail
      });
      updateUser({ name: profileName, email: profileEmail, avatar: profileName[0].toUpperCase() });
      toast("Profile updated successfully", "success");
    } catch (err) {
      toast(err.message || "Failed to update profile", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setPrefLoading(true);
    try {
      const data = await api.put("/api/settings/preferences", {
        currency: prefCurrency,
        month_start: parseInt(prefMonthStart),
        theme: dark ? "dark" : "light"
      });
      updateUser({ 
        currency: prefCurrency, 
        month_start: parseInt(prefMonthStart),
        theme: dark ? "dark" : "light"
      });
      toast("Preferences saved successfully", "success");
    } catch (err) {
      toast(err.message || "Failed to update preferences", "error");
    } finally {
      setPrefLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currPassword || !newPassword) {
      toast("Please enter current and new passwords", "error");
      return;
    }

    setPassLoading(true);
    try {
      await api.put("/api/settings/password", {
        currentPassword: currPassword,
        newPassword: newPassword
      });
      setCurrPassword("");
      setNewPassword("");
      toast("Password changed successfully", "success");
    } catch (err) {
      toast(err.message || "Failed to change password", "error");
    } finally {
      setPassLoading(false);
    }
  };

  const handleClearAllData = async () => {
    const confirmation = window.confirm(
      "CRITICAL ACTION: This will permanently delete ALL your transactions and budget profiles. This cannot be undone. Are you absolutely sure?"
    );
    if (!confirmation) return;

    setDangerLoading(true);
    try {
      await api.post("/api/settings/clear-data");
      onClearData(); // trigger state reset in root App.jsx
      toast("All account history has been reset", "success");
    } catch (err) {
      toast(err.message || "Failed to reset data", "error");
    } finally {
      setDangerLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "680px" }}>
      {/* Title */}
      <div>
        <h2 style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>
          Settings Preferences
        </h2>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13px" }}>
          Configure user profiles, currencies, themes and security settings
        </p>
      </div>

      {/* User Profile Form */}
      <Card style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
          <User size={16} style={{ color: "var(--primary)" }} /> Personal Details
        </h4>
        
        <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <Input 
                label="Full Name" 
                required 
                value={profileName} 
                onChange={setProfileName} 
              />
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <Input 
                label="Email Address" 
                type="email" 
                required 
                value={profileEmail} 
                onChange={setProfileEmail} 
              />
            </div>
          </div>
          <Button 
            type="submit" 
            loading={profileLoading} 
            style={{ alignSelf: "flex-start" }}
          >
            Save Profile
          </Button>
        </form>
      </Card>

      {/* App Preferences Form */}
      <Card style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
          <SettingsIcon size={16} style={{ color: "var(--primary)" }} /> App Preferences
        </h4>
        
        <form onSubmit={handleSavePreferences} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {/* Currency Select */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <Input 
                label="Base Currency"
                value={prefCurrency}
                onChange={setPrefCurrency}
                options={[
                  { value: "INR", label: "INR (₹) - Indian Rupee" },
                  { value: "USD", label: "USD ($) - US Dollar" },
                  { value: "EUR", label: "EUR (€) - Euro" }
                ]}
              />
            </div>

            {/* Month Start Select */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <Input 
                label="Month Start Date"
                value={prefMonthStart}
                onChange={setPrefMonthStart}
                options={[
                  { value: "1", label: "1st of the month" },
                  { value: "15", label: "15th of the month" }
                ]}
              />
            </div>
          </div>

          {/* Theme Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
            <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.4px" }}>
              App Theme
            </label>
            <div style={{ display: "flex", background: "var(--bg-input)", borderRadius: "var(--radius-md)", padding: "4px", border: "1px solid var(--border-color)", width: "fit-content" }}>
              <button
                type="button"
                onClick={() => { if (dark) toggle(); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "12px",
                  background: !dark ? "var(--bg-card)" : "transparent",
                  color: !dark ? "var(--primary)" : "var(--text-tertiary)",
                  transition: "all var(--transition-fast)",
                  boxShadow: !dark ? "var(--shadow-sm)" : "none"
                }}
              >
                <Sun size={14} /> Light
              </button>
              <button
                type="button"
                onClick={() => { if (!dark) toggle(); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "12px",
                  background: dark ? "var(--bg-card)" : "transparent",
                  color: dark ? "var(--primary)" : "var(--text-tertiary)",
                  transition: "all var(--transition-fast)",
                  boxShadow: dark ? "var(--shadow-sm)" : "none"
                }}
              >
                <Moon size={14} /> Dark
              </button>
            </div>
          </div>
          <Button
            type="submit"
            loading={prefLoading}
            style={{ alignSelf: "flex-start" }}
          >
            Save Preferences
          </Button>
        </form>
      </Card>

      {/* Security Credentials Password Form */}
      <Card style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
          <Lock size={16} style={{ color: "var(--primary)" }} /> Security Credentials
        </h4>
        
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <Input 
                label="Current Password" 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" 
                required 
                value={currPassword} 
                onChange={setCurrPassword}
                suffix={<button type="button" onClick={() => setShowPassword(v => !v)} style={{ background: "none", border: "none", cursor: "pointer" }}><Eye size={16} style={{ color: "var(--text-tertiary)" }} /></button>}
              />
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
                <Input 
                  label="New Password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  value={newPassword} 
                  onChange={setNewPassword} 
                />
                <div style={{ marginTop: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(v => !v)} style={{ marginRight: 6 }} />
                    Show Password
                  </label>
                  <button type="button" onClick={handleForgotPassword} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "12px", marginLeft: 12 }}>
                    Forgot Password?
                  </button>
                </div>
            </div>
          </div>
          <Button 
            type="submit" 
            loading={passLoading} 
            style={{ alignSelf: "flex-start" }}
          >
            Update Password
          </Button>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card style={{ borderColor: "rgba(244, 63, 94, 0.4)", background: "rgba(244, 63, 94, 0.02)" }}>
        <h4 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 700, color: "var(--danger)", display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldAlert size={16} /> Danger Zone
        </h4>
        <p style={{ margin: "0 0 16px", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Performing these actions is permanent and will completely reset your transaction history, categories and budgets.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button 
            variant="danger" 
            size="sm" 
            loading={dangerLoading} 
            onClick={handleClearAllData}
            icon={<Trash2 size={14} />}
          >
            Reset Account Data
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={dangerLoading}
            onClick={handleDeleteAccount}
            icon={<Trash2 size={14} />}
          >
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
