const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/verify/:certificate_id", async (req, res) => {
  try {
    const { certificate_id } = req.params;

    if (!certificate_id) {
      return res.status(400).json({
        success: false,
        message: "Certificate ID is required"
      });
    }

    const [rows] = await db.execute(
      "SELECT name, grade, date, certificate_id FROM candidates WHERE certificate_id = ?",
      [certificate_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invalid or tampered certificate"
      });
    }

    const cert = rows[0];

    return res.status(200).json({
      success: true,
      certificate: {
        id: cert.certificate_id,
        name: cert.name,
        grade: cert.grade,
        issued_on: cert.date
      }
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying certificate"
    });
  }
});

module.exports = router;