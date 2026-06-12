import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db.js";
import auth from "../middleware/auth.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fintrack_secret_key_987654";

// Email transporter (configure via .env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// POST /register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  try {
    // Check if email already exists
    const existingUser = await query.get("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await query.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: result.id, name, email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: { id: result.id, name, email, avatar: name[0].toUpperCase(), currency: "INR", theme: "dark", month_start: 1 }
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
});

// POST /forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const user = await query.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      // Do not reveal existence
      return res.status(200).json({ message: "If that email exists, a reset link has been sent" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour
    await query.run(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?",
      [token, expires, user.id]
    );
    const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${token}`;
    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Password Reset",
      text: `Click the link to reset your password: ${resetLink}`,
    });
    res.status(200).json({ message: "If that email exists, a reset link has been sent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to process request: " + err.message });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await query.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.name[0].toUpperCase(),
        currency: user.currency,
        theme: user.theme,
        month_start: user.month_start
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

// GET /me
router.get("/me", auth, async (req, res) => {
  try {
    const user = await query.get("SELECT id, name, email, currency, theme, month_start FROM users WHERE id = ?", [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.name[0].toUpperCase(),
        currency: user.currency,
        theme: user.theme,
        month_start: user.month_start
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user context: " + err.message });
  }
});

export default router;
