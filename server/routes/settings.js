import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// PUT /api/settings/profile - Update user profile (name, email)
router.put("/profile", auth, async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    // Check if email is already taken by another user
    const otherUser = await query.get("SELECT * FROM users WHERE email = ? AND id != ?", [email, req.user.id]);
    if (otherUser) {
      return res.status(409).json({ error: "Email is already taken by another account" });
    }

    await query.run(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, req.user.id]
    );

    res.json({ message: "Profile updated successfully", name, email });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile: " + err.message });
  }
});

// PUT /api/settings/preferences - Update preferences (theme, currency, month start)
router.put("/preferences", auth, async (req, res) => {
  const { theme, currency, month_start } = req.body;

  try {
    const user = await query.get("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newTheme = theme !== undefined ? theme : user.theme;
    const newCurrency = currency !== undefined ? currency : user.currency;
    const newMonthStart = month_start !== undefined ? parseInt(month_start) : user.month_start;

    await query.run(
      "UPDATE users SET theme = ?, currency = ?, month_start = ? WHERE id = ?",
      [newTheme, newCurrency, newMonthStart, req.user.id]
    );

    res.json({
      message: "Preferences updated successfully",
      theme: newTheme,
      currency: newCurrency,
      month_start: newMonthStart
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update preferences: " + err.message });
  }
});

// PUT /api/settings/password - Change user password
router.put("/password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current password and new password are required" });
  }

  try {
    const user = await query.get("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await query.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to change password: " + err.message });
  }
});

// POST /api/settings/clear-data - Delete all transactions & budgets for the user
router.post("/clear-data", auth, async (req, res) => {
  try {
    await query.run("DELETE FROM transactions WHERE user_id = ?", [req.user.id]);
    await query.run("DELETE FROM budgets WHERE user_id = ?", [req.user.id]);
    res.json({ message: "All transactions and budget profiles have been successfully reset." });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear account data: " + err.message });
  }
});

export default router;
