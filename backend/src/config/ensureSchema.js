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
    { col: "ghi_chu", sql: "ADD COLUMN `ghi_chu` text DEFAULT NULL AFTER `nguong_canh_bao`" },
    { col: "trang_thai", sql: "ADD COLUMN `trang_thai` tinyint(1) NOT NULL DEFAULT 1 AFTER `ghi_chu`" },
    { col: "han_su_dung", sql: "ADD COLUMN `han_su_dung` date DEFAULT NULL AFTER `trang_thai`" },
  ];

  for (const { col, sql } of alters) {
    const exists = await columnExists("nguyenlieu", col);
    if (!exists) {
      await db.execute(`ALTER TABLE nguyenlieu ${sql}`);
    }
  }
}

async function ensureLichSuHetHanTable() {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS cnt FROM information_schema.TABLES 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lich_su_nguyen_lieu_het_han'`
  );
  if (Number(rows[0].cnt) === 0) {
    await db.execute(`
      CREATE TABLE lich_su_nguyen_lieu_het_han (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ma_nguyen_lieu INT NOT NULL,
        ten_nguyen_lieu VARCHAR(100),
        han_su_dung DATE,
        ton_kho_con_lai DECIMAL(10,2) DEFAULT 0.00,
        don_vi VARCHAR(20),
        ngay_xu_ly DATE,
        ghi_chu TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        KEY fk_ls_nguyenlieu (ma_nguyen_lieu)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }
}

module.exports = { ensureNguyenLieuSchema, ensureLichSuHetHanTable };
