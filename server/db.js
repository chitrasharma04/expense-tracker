import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "fintrack.db");
const db = new sqlite3.Database(dbPath);

// Enable foreign key constraints
db.run("PRAGMA foreign_keys = ON");

// Promisified DB helpers
export const query = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// Seeding utilities
const genId = () => Math.random().toString(36).slice(2, 10);

const SEED_BUDGETS = [
  { category: "food", limit_amount: 8000 },
  { category: "transport", limit_amount: 4000 },
  { category: "shopping", limit_amount: 10000 },
  { category: "entertainment", limit_amount: 2000 },
  { category: "utilities", limit_amount: 3000 },
];

const CATEGORIES = [
  { id: "food", type: "expense" },
  { id: "transport", type: "expense" },
  { id: "shopping", type: "expense" },
  { id: "health", type: "expense" },
  { id: "entertainment", type: "expense" },
  { id: "utilities", type: "expense" },
  { id: "housing", type: "expense" },
  { id: "education", type: "expense" },
  { id: "salary", type: "income" },
  { id: "freelance", type: "income" },
  { id: "investment", type: "income" },
  { id: "other", type: "both" },
];

function generateSeedTransactions() {
  const now = new Date();
  const txns = [];
  
  for (let i = 5; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    
    // Monthly Salary
    txns.push({
      id: genId(),
      type: "income",
      category: "salary",
      amount: 85000,
      desc: "Monthly Salary",
      date: new Date(m.getFullYear(), m.getMonth(), 1).toISOString()
    });
    
    // Freelance Income
    if (i < 3) {
      txns.push({
        id: genId(),
        type: "income",
        category: "freelance",
        amount: Math.round(Math.random() * 20000 + 5000),
        desc: "Freelance Project",
        date: new Date(m.getFullYear(), m.getMonth(), 10).toISOString()
      });
    }
    
    // Expenses
    const expItems = [
      { cat: "food", amts: [2200, 1800, 3100, 800], descs: ["Zomato Orders", "Grocery Store", "Restaurant Dinner", "Coffee Shop"] },
      { cat: "transport", amts: [1500, 600, 2200], descs: ["Ola/Uber Rides", "Metro Pass", "Petrol"] },
      { cat: "shopping", amts: [3500, 1200, 8000], descs: ["Myntra", "Amazon", "Electronics"] },
      { cat: "utilities", amts: [1800, 900, 600], descs: ["Electricity Bill", "Internet Plan", "Mobile Recharge"] },
      { cat: "entertainment", amts: [500, 1200, 800], descs: ["Netflix", "Movie Tickets", "Spotify"] },
      { cat: "health", amts: [2000, 800], descs: ["Doctor Visit", "Pharmacy"] },
    ];
    
    expItems.forEach(({ cat, amts, descs }) => {
      const idx = Math.floor(Math.random() * amts.length);
      txns.push({
        id: genId(),
        type: "expense",
        category: cat,
        amount: amts[idx],
        desc: descs[idx],
        date: new Date(m.getFullYear(), m.getMonth(), Math.ceil(Math.random() * 28)).toISOString()
      });
    });
  }
  return txns;
}

export async function initDB() {
  // Create tables
  await query.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      currency TEXT DEFAULT 'INR',
      month_start INTEGER DEFAULT 1,
      theme TEXT DEFAULT 'dark',
      reset_token TEXT,
      reset_expires INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add reset columns if they don't exist (for existing DBs)
  try {
    await query.run(`ALTER TABLE users ADD COLUMN reset_token TEXT`);
  } catch (e) { /* column may already exist */ }
  try {
    await query.run(`ALTER TABLE users ADD COLUMN reset_expires INTEGER`);
  } catch (e) { /* column may already exist */ }

  await query.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      desc TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await query.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      limit_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, category)
    )
  `);

  // Check if demo user exists
  const demoUser = await query.get("SELECT * FROM users WHERE email = ?", ["demo@fintrack.app"]);
  if (!demoUser) {
    console.log("Seeding database with demo user...");
    const hashedPassword = bcrypt.hashSync("demo1234", 10);
    const { id: userId } = await query.run(
      "INSERT INTO users (name, email, password, currency, month_start, theme) VALUES (?, ?, ?, ?, ?, ?)",
      ["Demo User", "demo@fintrack.app", hashedPassword, "INR", 1, "dark"]
    );

    // Seed budgets
    for (const budget of SEED_BUDGETS) {
      await query.run(
        "INSERT INTO budgets (id, user_id, category, limit_amount) VALUES (?, ?, ?, ?)",
        [genId(), userId, budget.category, budget.limit_amount]
      );
    }

    // Seed transactions
    const seedTxns = generateSeedTransactions();
    for (const tx of seedTxns) {
      await query.run(
        "INSERT INTO transactions (id, user_id, type, category, amount, desc, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [tx.id, userId, tx.type, tx.category, tx.amount, tx.desc, tx.date]
      );
    }
    console.log("Demo user data seeded successfully.");
  }
}
export default db;
