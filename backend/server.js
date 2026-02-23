const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();   // ✅ app yaha define hoga

app.use(cors());
app.use(express.json());

// ✅ Routes import
const verifyRoutes = require("./routes/verifyRoutes");

// ✅ Use routes AFTER app is defined
app.use("/api", verifyRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server running successfully");
});


// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});