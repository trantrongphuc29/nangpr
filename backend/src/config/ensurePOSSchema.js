const db = require("./database");

async function columnExists(table, column) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return Number(rows[0].cnt) > 0;
}

async function ensurePOSSchema() {
  // Thêm cột so_luong_da_gui_bar vào chitiethoadon nếu chưa có
  const exists1 = await columnExists("chitiethoadon", "so_luong_da_gui_bar");
  if (!exists1) {
    await db.execute(
      `ALTER TABLE chitiethoadon
       ADD COLUMN so_luong_da_gui_bar INT NOT NULL DEFAULT 0
       AFTER so_luong,
       ADD INDEX idx_cthd_trang_thai (trang_thai_mon)`
    );
  }

  // Thêm cột loai_don vào donhang nếu chưa có (tai_cho, mang_ve, giao_hang)
  const exists2 = await columnExists("donhang", "loai_don");
  if (!exists2) {
    await db.execute(
      `ALTER TABLE donhang
       ADD COLUMN loai_don VARCHAR(20) NOT NULL DEFAULT 'tai_cho'
       AFTER ma_ban`
    );
  }

  // Thêm cột phi_giao_hang vào donhang nếu chưa có
  const exists3 = await columnExists("donhang", "phi_giao_hang");
  if (!exists3) {
    await db.execute(
      `ALTER TABLE donhang
       ADD COLUMN phi_giao_hang DECIMAL(12,2) NOT NULL DEFAULT 0.00
       AFTER loai_don`
    );
  }

  // Thêm cột so_dien_thoai_giao và dia_chi_giao vào donhang nếu chưa có
  const exists4 = await columnExists("donhang", "so_dien_thoai_giao");
  if (!exists4) {
    await db.execute(
      `ALTER TABLE donhang
       ADD COLUMN so_dien_thoai_giao VARCHAR(20) DEFAULT NULL AFTER phi_giao_hang,
       ADD COLUMN dia_chi_giao VARCHAR(500) DEFAULT NULL AFTER so_dien_thoai_giao`
    );
  }

  // Thêm cột ten_khach vào donhang nếu chưa có
  const exists5 = await columnExists("donhang", "ten_khach");
  if (!exists5) {
    await db.execute(
      `ALTER TABLE donhang
       ADD COLUMN ten_khach VARCHAR(100) DEFAULT NULL AFTER loai_don`
    );
  }

  // Thêm cột hinh_thuc_thanh_toan vào donhang nếu chưa có
  const exists6 = await columnExists("donhang", "hinh_thuc_thanh_toan");
  if (!exists6) {
    await db.execute(
      `ALTER TABLE donhang
       ADD COLUMN hinh_thuc_thanh_toan VARCHAR(20) DEFAULT NULL AFTER phi_giao_hang`
    );
  }

  // Tạo bảng huy_mon_log nếu chưa có
  const [tables] = await db.execute(
    `SELECT COUNT(*) AS cnt FROM information_schema.TABLES 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'huy_mon_log'`
  );
  if (Number(tables[0].cnt) === 0) {
    await db.execute(
      `CREATE TABLE huy_mon_log (
        id INT NOT NULL AUTO_INCREMENT,
        ma_don_hang INT NOT NULL,
        ma_mon INT NOT NULL,
        ten_mon VARCHAR(100) NOT NULL,
        so_luong_huy INT NOT NULL,
        ngay_huy DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_huy_don (ma_don_hang),
        KEY idx_huy_ngay (ngay_huy)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );
  }

  //  MIGRATION: Đổi tên cột ml_thuc_te_ton → ton_kho (nếu cột cũ còn tồn tại)
  const oldColExists = await columnExists("nguyenlieu", "ml_thuc_te_ton");
  if (oldColExists) {
    await db.execute(
      `ALTER TABLE nguyenlieu CHANGE COLUMN ml_thuc_te_ton ton_kho DECIMAL(10,2) NOT NULL DEFAULT '0.00'`
    );
  } else {
    const newColExists = await columnExists("nguyenlieu", "ton_kho");
    if (!newColExists) {
      await db.execute(
        `ALTER TABLE nguyenlieu ADD COLUMN ton_kho DECIMAL(10,2) NOT NULL DEFAULT '0.00'`
      );
    }
  }
}

module.exports = { ensurePOSSchema };
