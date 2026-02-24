const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const { generateCertificate } = require("../services/certificateService");

const router = express.Router();

// ✅ Correct path (backend ke andar run ho raha hai)
const upload = multer({ dest: "uploads/" });

router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        for (let candidate of results) {

          // 1️⃣ Insert with pending status
          await db.execute(
            "INSERT INTO candidates (name, date, grade, email, email_status) VALUES (?, ?, ?, ?, ?)",
            [candidate.name, candidate.date, candidate.grade, candidate.email, "pending"]
          );

          // 2️⃣ Generate certificate
          const certResult = await generateCertificate(candidate);

          console.log("Generated:", certResult);

          // 3️⃣ Update certificate_id + email_status
          await db.execute(
            "UPDATE candidates SET certificate_id = ?, email_status = ? WHERE email = ?",
            [certResult.certificateId, "sent", candidate.email]
          );
        }

        res.json({ message: "CSV processed successfully" });

      } catch (error) {
        console.error("UPLOAD ERROR:", error);
        res.status(500).json({ message: "Error processing CSV" });
      }
    });
});

module.exports = router;