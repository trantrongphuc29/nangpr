const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const nhanVienRoutes = require("./routes/nhanVienRoutes");
const banRoutes = require("./routes/banRoutes");

const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/nhanvien", nhanVienRoutes);
app.use("/api/ban", banRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server OK ✅" });
});

module.exports = app;
