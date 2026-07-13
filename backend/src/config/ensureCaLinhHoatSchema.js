const db = require("./database");

/** Tạo bảng phân công ca linh hoạt (giờ tùy chỉnh) và mở rộng bảng công để hỗ trợ loại ca này */
async function ensureCaLinhHoatSchema() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS phancong_linh_hoat (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ma_nhan_vien INT NOT NULL,
      ngay DATE NOT NULL,
      gio_bat_dau TIME NOT NULL,
      gio_ket_thuc TIME NOT NULL,
      ghi_chu VARCHAR(255) DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_pclh_nv_ngay (ma_nhan_vien, ngay),
      CONSTRAINT fk_pclh_nv
        FOREIGN KEY (ma_nhan_vien) REFERENCES nhanvien(ma_nhan_vien)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // bang_cong_chi_tiet cần cho phép ma_ca NULL (ca linh hoạt không thuộc bảng calam) + cột phân loại
  const [loaiCaCol] = await db.execute(`
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bang_cong_chi_tiet' AND COLUMN_NAME = 'loai_ca'
    LIMIT 1
  `);
  if (!loaiCaCol.length) {
    await db.execute(`ALTER TABLE bang_cong_chi_tiet MODIFY COLUMN ma_ca INT NULL`);
    await db.execute(
      `ALTER TABLE bang_cong_chi_tiet ADD COLUMN loai_ca ENUM('mac_dinh','linh_hoat') NOT NULL DEFAULT 'mac_dinh' AFTER ma_ca`
    );
  }

  const [soCaLinhHoatCol] = await db.execute(`
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bang_cong_thang' AND COLUMN_NAME = 'so_ca_linh_hoat'
    LIMIT 1
  `);
  if (!soCaLinhHoatCol.length) {
    await db.execute(
      `ALTER TABLE bang_cong_thang ADD COLUMN so_ca_linh_hoat INT NOT NULL DEFAULT 0 AFTER so_ca_toi`
    );
  }
}

module.exports = { ensureCaLinhHoatSchema };
