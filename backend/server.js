require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const verifyRoutes = require("./routes/verifyRoutes"); // ✅ ADD THIS

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api", verifyRoutes); // ✅ ADD THIS

app.get("/", (req, res) => {
  res.send("Backend Core Running...");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port " + (process.env.PORT || 5000));
});