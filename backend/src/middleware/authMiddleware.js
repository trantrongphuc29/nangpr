const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { SECRET_KEY } = require("../config/constants");

async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Chưa có token xác thực" });
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY || "your_secret_key");

    const adminId = payload?.id;
    if (!adminId) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    const [rows] = await db.execute("SELECT ma_admin, role FROM chuquan WHERE ma_admin = ?", [adminId]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: "Tài khoản admin không tồn tại" });
    }

    const admin = rows[0];
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Không đủ quyền" });
    }

    req.user = { ma_admin: admin.ma_admin, role: admin.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token xác thực hết hạn hoặc không hợp lệ" });
  }
}

module.exports = { requireAdmin };

