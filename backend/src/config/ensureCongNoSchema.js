/* ===== CÔNG NỢ - =====
 * Thêm cột quản lý thanh toán cho bảng phieunhap
 * + Tạo bảng lich_su_thanh_toan
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

async function tableExists(table) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS cnt FROM information_schema.TABLES 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
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
    }
  }

  // Tạo bảng lịch sử thanh toán công nợ
  const exists = await tableExists("lich_su_thanh_toan");
  if (!exists) {
    await db.execute(`
      CREATE TABLE lich_su_thanh_toan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ma_phieu INT NOT NULL,
        nha_cung_cap VARCHAR(255) DEFAULT NULL,
        so_tien DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        con_no_sau_khi_tra DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        ngay_thanh_toan DATETIME NOT NULL,
        ghi_chu VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ma_phieu) REFERENCES phieunhap(ma_phieu) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }
}

module.exports = { ensureCongNoSchema };
