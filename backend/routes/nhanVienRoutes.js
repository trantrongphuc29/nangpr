const express = require("express");
const router = express.Router();
const db = require("../db");

// ================= 1. LẤY DS NHÂN VIÊN =================
router.get("/", (req, res) => {
  // SỬA: Ép MySQL trả về chuỗi ngày chính xác bằng DATE_FORMAT
  const sql = "SELECT ma_nhan_vien, ten, DATE_FORMAT(ngay_sinh, '%Y-%m-%d') as ngay_sinh, so_dien_thoai, dia_chi FROM nhanvien ORDER BY ma_nhan_vien DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ================= 2. LẤY LỊCH PHÂN CÔNG =================
router.get("/lich-phan-cong", (req, res) => {
  const { startDate, endDate, name } = req.query; 

  // SỬA: Ép MySQL trả về chuỗi ngày chính xác bằng DATE_FORMAT, dẹp luôn lỗi lệch múi giờ
  let sql = `
    SELECT pc.ma_nhan_vien, pc.ma_ca, DATE_FORMAT(pc.ngay, '%Y-%m-%d') as ngay, nv.ten, cl.buoi
    FROM phancong pc
    JOIN nhanvien nv ON pc.ma_nhan_vien = nv.ma_nhan_vien
    LEFT JOIN calam cl ON pc.ma_ca = cl.ma_ca
    WHERE 1=1
  `;
  const params = [];

  if (startDate && endDate) {
    sql += ` AND pc.ngay BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  } else if (startDate) {
    sql += ` AND pc.ngay = ?`;
    params.push(startDate);
  } else {
    sql += ` AND pc.ngay = CURDATE()`; 
  }

  if (name) {
    sql += ` AND nv.ten LIKE ?`;
    params.push(`%${name}%`);
  }

  sql += ` ORDER BY pc.ngay ASC, pc.ma_ca ASC`;

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ================= 3. THÊM NHÂN VIÊN =================
router.post("/", (req, res) => {
  const { ten, ngay_sinh, so_dien_thoai, dia_chi } = req.body;
  if (!ten || !so_dien_thoai) return res.status(400).json({ message: "Thiếu dữ liệu" });

  const sql = "INSERT INTO nhanvien (ten, ngay_sinh, so_dien_thoai, dia_chi) VALUES (?, ?, ?, ?)";
  db.query(sql, [ten, ngay_sinh, so_dien_thoai, dia_chi], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json({ message: "Thêm thành công", id: result.insertId });
  });
});

// ================= 4. THÊM PHÂN CÔNG =================
router.post("/phan-cong", (req, res) => {
  const { ma_nhan_vien, ma_ca, ngay } = req.body;
  if (!ma_nhan_vien || !ma_ca || !ngay) return res.status(400).json({ message: "Vui lòng chọn đủ nhân viên, ca làm và ngày" });

  const sql = "INSERT INTO phancong (ma_nhan_vien, ma_ca, ngay) VALUES (?, ?, ?)";
  db.query(sql, [ma_nhan_vien, ma_ca, ngay], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Nhân viên đã được phân công vào ca này!" });
      return res.status(500).json({ message: err.sqlMessage });
    }
    res.json({ message: "Phân công thành công!" });
  });
});

// ================= 5. XÓA PHÂN CÔNG (PHẢI ĐẶT TRƯỚC XÓA NHÂN VIÊN) =================
router.delete("/phan-cong", (req, res) => {
  const { ma_nhan_vien, ma_ca, ngay } = req.body;
  if (!ma_nhan_vien || !ma_ca || !ngay) return res.status(400).json({ message: "Thiếu dữ liệu xóa" });

  const sql = "DELETE FROM phancong WHERE ma_nhan_vien = ? AND ma_ca = ? AND ngay = ?";
  db.query(sql, [ma_nhan_vien, ma_ca, ngay], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Đã xóa phân công" });
  });
});

// ================= 6. SỬA NHÂN VIÊN =================
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { ten, ngay_sinh, so_dien_thoai, dia_chi } = req.body;
  const sql = "UPDATE nhanvien SET ten = ?, ngay_sinh = ?, so_dien_thoai = ?, dia_chi = ? WHERE ma_nhan_vien = ?";
  db.query(sql, [ten, ngay_sinh, so_dien_thoai, dia_chi, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Cập nhật thành công" });
  });
});

// ================= 7. XÓA NHÂN VIÊN =================
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM nhanvien WHERE ma_nhan_vien = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Đã xóa" });
  });
});

module.exports = router;