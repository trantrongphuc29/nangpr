/* ===== 💰 CÔNG NỢ - ENSURE SCHEMA =====
 * Thêm cột quản lý thanh toán cho bảng phieunhap
 * ====================================== */
const db = require("./database");

async function columnExists(table, column) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return Number(rows[0].cnt) > 0;
}

async function ensureCongNoSchema() {
  const alters = [
    { col: "da_thanh_toan", sql: "ADD COLUMN `da_thanh_toan` tinyint(1) NOT NULL DEFAULT 0 AFTER `ghi_chu`" },
    { col: "ngay_thanh_toan", sql: "ADD COLUMN `ngay_thanh_toan` datetime DEFAULT NULL AFTER `da_thanh_toan`" },
    { col: "so_tien_da_tra", sql: "ADD COLUMN `so_tien_da_tra` decimal(12,2) NOT NULL DEFAULT 0.00 AFTER `ngay_thanh_toan`" },
  ];

  for (const { col, sql } of alters) {
    const exists = await columnExists("phieunhap", col);
    if (!exists) {
      await db.execute(`ALTER TABLE phieunhap ${sql}`);
      console.log(`✅ Đã thêm cột phieunhap.${col}`);
    }
  }
}

module.exports = { ensureCongNoSchema };
