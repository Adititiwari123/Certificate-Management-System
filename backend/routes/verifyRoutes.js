const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/verify/:certificate_id", (req, res) => {
  const { certificate_id } = req.params;

  const sql = "SELECT * FROM candidates WHERE certificate_id = ?";

  db.query(sql, [certificate_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.length === 0) {
      return res.json({ valid: false, message: "Invalid Certificate" });
    }

    res.json({ valid: true, data: result[0] });
  });
});

module.exports = router;