// routes/banRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// ================== LẤY DANH SÁCH BÀN (CÓ SẮP XẾP) ==================
router.get("/", (req, res) => {
  const { sort } = req.query;   

  let orderBy = "ten_ban ASC";   // Mặc định: A → Z

  if (sort === "desc") {
    orderBy = "ten_ban DESC";    // Z → A
  }

  const sql = `SELECT * FROM ban ORDER BY ${orderBy}`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Lỗi lấy danh sách bàn:", err);
      return res.status(500).json({ 
        message: "Lỗi server", 
        error: err.message 
      });
    }
    res.json(result);
  });
});

// ================== THÊM BÀN ==================
router.post("/", (req, res) => {
  const { ten_ban } = req.body;

  if (!ten_ban || ten_ban.trim() === "") {
    return res.status(400).json({ message: "Tên bàn không được để trống" });
  }

  const ten = ten_ban.trim();

  db.query("INSERT INTO ban (ten_ban) VALUES (?)", [ten], (err, result) => {
    if (err) {
      console.error("Lỗi thêm bàn:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ 
          message: `Tên bàn "${ten}" đã tồn tại. Vui lòng chọn tên khác.` 
        });
      }
      return res.status(500).json({ 
        message: "Lỗi server khi thêm bàn", 
        error: err.message 
      });
    }

    console.log(`✅ Thêm bàn thành công: ${ten} (ID: ${result.insertId})`);
    res.json({ 
      message: "Thêm bàn thành công",
      ma_ban: result.insertId 
    });
  });
});

// ================== XÓA BÀN ==================
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM ban WHERE ma_ban = ?", [req.params.id], (err) => {
    if (err) {
      console.error("Lỗi xóa bàn:", err);
      return res.status(500).json({ message: "Lỗi server", error: err.message });
    }
    res.json({ message: "Xoá bàn thành công" });
  });
});

// ================== SỬA BÀN ==================
router.put("/:id", (req, res) => {
  const { ten_ban } = req.body;

  if (!ten_ban || ten_ban.trim() === "") {
    return res.status(400).json({ message: "Tên bàn không được để trống" });
   }

      db.query(
        "UPDATE ban SET ten_ban = ? WHERE ma_ban = ?",
        [ten, req.params.id],
        (err) => {
          if (err) {
            return res.status(500).json({
              message: "Lỗi cập nhật",
              error: err.message,
            });
          }

          res.json({ message: "Cập nhật thành công" });
        }
      );
    }
  );

module.exports = router;