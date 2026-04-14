const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
const PORT = 3000;
const SECRET_KEY = "SECRET_KEY";

// ================= MIDDLEWARE =================
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// ================= ROUTES =================
app.use("/api/nhanvien", require("./routes/nhanvienRoutes"));
app.use("/api/ban", require("./routes/banRoutes"));

// ================= LOGIN =================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM chuquan WHERE ten_dang_nhap = ?";
  db.query(sql, [username], async (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });

    if (result.length === 0) {
      return res.status(400).json({ message: "Sai tài khoản" });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.mat_khau);

    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      { id: user.ma_admin, username: user.ten_dang_nhap },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.json({ token });
  });
});

// ================= TEST =================
app.get("/", (req, res) => {
  res.json({ message: "Server OK ✅" });
});

app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
});