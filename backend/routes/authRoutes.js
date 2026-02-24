const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

/* =============================
   ADMIN REGISTER API
============================= */

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO admins (email, password) VALUES (?, ?)",
      [email, hashedPassword],
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Admin already exists" });
        }

        res.status(201).json({ message: "Admin registered successfully" });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* =============================
   ADMIN LOGIN API
============================= */

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM admins WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "DB Error" });

      if (results.length === 0)
        return res.status(401).json({ message: "Invalid credentials" });

      const admin = results[0];

      const match = await bcrypt.compare(password, admin.password);

      if (!match)
        return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: admin.id },
        "secretkey",
        { expiresIn: "1h" }
      );

      res.json({ message: "Login successful", token });
    }
  );
});

module.exports = router;