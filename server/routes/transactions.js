import express from "express";
import { query } from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET /api/transactions - Retrieve all transactions for user
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await query.all(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC",
      [req.user.id]
    );
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve transactions: " + err.message });
  }
});

// POST /api/transactions - Create new transaction
router.post("/", auth, async (req, res) => {
  const { id, type, category, amount, desc, date } = req.body;

  if (!id || !type || !category || amount === undefined || !desc || !date) {
    return res.status(400).json({ error: "Missing required transaction fields" });
  }

  if (type !== "income" && type !== "expense") {
    return res.status(400).json({ error: "Type must be 'income' or 'expense'" });
  }

  try {
    await query.run(
      "INSERT INTO transactions (id, user_id, type, category, amount, desc, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, req.user.id, type, category, amount, desc, date]
    );
    res.status(214).json({ message: "Transaction created successfully", transaction: { id, type, category, amount, desc, date } });
  } catch (err) {
    res.status(500).json({ error: "Failed to create transaction: " + err.message });
  }
});

// PUT /api/transactions/:id - Update existing transaction
router.put("/:id", auth, async (req, res) => {
  const { type, category, amount, desc, date } = req.body;
  const { id } = req.params;

  if (!type || !category || amount === undefined || !desc || !date) {
    return res.status(400).json({ error: "Missing required fields for update" });
  }

  try {
    // Verify ownership
    const tx = await query.get("SELECT * FROM transactions WHERE id = ? AND user_id = ?", [id, req.user.id]);
    if (!tx) {
      return res.status(404).json({ error: "Transaction not found or unauthorized" });
    }

    await query.run(
      "UPDATE transactions SET type = ?, category = ?, amount = ?, desc = ?, date = ? WHERE id = ? AND user_id = ?",
      [type, category, amount, desc, date, id, req.user.id]
    );

    res.json({ message: "Transaction updated successfully", transaction: { id, type, category, amount, desc, date } });
  } catch (err) {
    res.status(500).json({ error: "Failed to update transaction: " + err.message });
  }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const tx = await query.get("SELECT * FROM transactions WHERE id = ? AND user_id = ?", [id, req.user.id]);
    if (!tx) {
      return res.status(404).json({ error: "Transaction not found or unauthorized" });
    }

    await query.run("DELETE FROM transactions WHERE id = ? AND user_id = ?", [id, req.user.id]);
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete transaction: " + err.message });
  }
});

export default router;
