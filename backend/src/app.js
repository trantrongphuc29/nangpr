const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const nhanVienRoutes = require("./routes/nhanVienRoutes");
const banRoutes = require("./routes/banRoutes");
const nguyenlieuRoutes = require("./routes/nguyenlieuRoutes");
const monRoutes = require('./routes/monRoutes');
const payrollRoutes = require("./routes/payrollRoutes");
const donHangRoutes = require("./routes/donHangRoutes");
const path = require("path");
const app = express();
app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));


app.use("/uploads", (req, res, next) => {
  // Cho phép cross-origin load ảnh (fix CORB blocking cho SVG)
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(__dirname, "../uploads")));
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/nhanvien", nhanVienRoutes);
app.use("/api/ban", banRoutes);
app.use("/api/nguyenlieu", nguyenlieuRoutes);
app.use('/api/mon', monRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/pos", donHangRoutes);
app.get("/", (req, res) => {
    res.json({ message: "Nắng PR Server OK ✅" });
});

module.exports = app;