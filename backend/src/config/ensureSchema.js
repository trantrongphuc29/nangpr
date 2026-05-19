const db = require("./database");

async function columnExists(table, column) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return Number(rows[0].cnt) > 0;
}

async function ensureNguyenLieuSchema() {
  const alters = [
    { col: "danh_muc", sql: "ADD COLUMN `danh_muc` varchar(100) DEFAULT 'Khác' AFTER `ten_nguyen_lieu`" },
    { col: "don_vi_tinh", sql: "ADD COLUMN `don_vi_tinh` varchar(20) DEFAULT 'g' AFTER `danh_muc`" },
    { col: "don_vi_dong_goi", sql: "ADD COLUMN `don_vi_dong_goi` varchar(200) DEFAULT NULL AFTER `don_vi_nhap`" },
    { col: "ghi_chu", sql: "ADD COLUMN `ghi_chu` text DEFAULT NULL AFTER `nguong_canh_bao`" },
    { col: "trang_thai", sql: "ADD COLUMN `trang_thai` tinyint(1) NOT NULL DEFAULT 1 AFTER `ghi_chu`" },
  ];

  for (const { col, sql } of alters) {
    const exists = await columnExists("nguyenlieu", col);
    if (!exists) {
      await db.execute(`ALTER TABLE nguyenlieu ${sql}`);
      console.log(`✅ Đã thêm cột nguyenlieu.${col}`);
    }
  }
}

module.exports = { ensureNguyenLieuSchema };
