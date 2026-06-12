import express from "express";
import { query } from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET /api/budgets - Retrieve all budgets for user
router.get("/", auth, async (req, res) => {
  try {
    const budgets = await query.all(
      "SELECT id, category, limit_amount FROM budgets WHERE user_id = ?",
      [req.user.id]
    );
    res.json({ budgets });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve budgets: " + err.message });
  }
});

// POST /api/budgets - Create a budget limit for a category
router.post("/", auth, async (req, res) => {
  const { id, category, limit_amount } = req.body;

  if (!id || !category || limit_amount === undefined || isNaN(parseFloat(limit_amount))) {
    return res.status(400).json({ error: "Category and numerical limit amount are required" });
  }

  try {
    // Check if budget for category already exists
    const existing = await query.get(
      "SELECT * FROM budgets WHERE user_id = ? AND category = ?",
      [req.user.id, category]
    );
    if (existing) {
      return res.status(409).json({ error: `A budget already exists for category: ${category}` });
    }

    await query.run(
      "INSERT INTO budgets (id, user_id, category, limit_amount) VALUES (?, ?, ?, ?)",
      [id, req.user.id, category, parseFloat(limit_amount)]
    );
    res.status(214).json({ message: "Budget set successfully", budget: { id, category, limit_amount: parseFloat(limit_amount) } });
  } catch (err) {
    res.status(500).json({ error: "Failed to save budget: " + err.message });
  }
});

// PUT /api/budgets/:id - Update limit amount of a budget
router.put("/:id", auth, async (req, res) => {
  const { limit_amount } = req.body;
  const { id } = req.params;

  if (limit_amount === undefined || isNaN(parseFloat(limit_amount))) {
    return res.status(400).json({ error: "Numerical limit amount is required" });
  }

  try {
    const budget = await query.get("SELECT * FROM budgets WHERE id = ? AND user_id = ?", [id, req.user.id]);
    if (!budget) {
      return res.status(404).json({ error: "Budget not found or unauthorized" });
    }

    await query.run(
      "UPDATE budgets SET limit_amount = ? WHERE id = ? AND user_id = ?",
      [parseFloat(limit_amount), id, req.user.id]
    );
    res.json({ message: "Budget limit updated", budget: { ...budget, limit_amount: parseFloat(limit_amount) } });
  } catch (err) {
    res.status(500).json({ error: "Failed to update budget: " + err.message });
  }
});

// DELETE /api/budgets/:id - Delete a category budget
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const budget = await query.get("SELECT * FROM budgets WHERE id = ? AND user_id = ?", [id, req.user.id]);
    if (!budget) {
      return res.status(404).json({ error: "Budget not found or unauthorized" });
    }

    await query.run("DELETE FROM budgets WHERE id = ? AND user_id = ?", [id, req.user.id]);
    res.json({ message: "Budget category limits removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete budget: " + err.message });
  }
});

export default router;
