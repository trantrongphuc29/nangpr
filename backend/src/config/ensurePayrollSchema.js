const db = require("./database");

async function ensurePayrollSchema() {
  const statements = [
    `
    CREATE TABLE IF NOT EXISTS ky_luong (
      id INT AUTO_INCREMENT PRIMARY KEY,
      thang TINYINT NOT NULL,
      nam SMALLINT NOT NULL,
      trang_thai ENUM('chua_chot','da_chot','da_thanh_toan') NOT NULL DEFAULT 'chua_chot',
      chot_luc DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_thang_nam (thang, nam),
      INDEX idx_ky_luong_trang_thai (trang_thai)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    `
    CREATE TABLE IF NOT EXISTS nhanvien_luong (
      ma_nhan_vien INT NOT NULL,
      luong_gio DECIMAL(12,2) NOT NULL DEFAULT 0,
      phu_cap_mac_dinh DECIMAL(12,2) NOT NULL DEFAULT 0,
      tinh_trang ENUM('dang_lam','tam_nghi','da_nghi') NOT NULL DEFAULT 'dang_lam',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (ma_nhan_vien),
      CONSTRAINT fk_nv_luong_nv
        FOREIGN KEY (ma_nhan_vien) REFERENCES nhanvien(ma_nhan_vien)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    `
    CREATE TABLE IF NOT EXISTS bang_cong_thang (
      ky_luong_id INT NOT NULL,
      ma_nhan_vien INT NOT NULL,
      so_ca_sang INT NOT NULL DEFAULT 0,
      so_ca_chieu INT NOT NULL DEFAULT 0,
      so_ca_toi INT NOT NULL DEFAULT 0,
      so_ngay_lam INT NOT NULL DEFAULT 0,
      tong_ca INT NOT NULL DEFAULT 0,
      tong_gio DECIMAL(6,2) NOT NULL DEFAULT 0,
      last_recalc_at DATETIME NULL,
      PRIMARY KEY (ky_luong_id, ma_nhan_vien),
      INDEX idx_bc_ky (ky_luong_id),
      CONSTRAINT fk_bc_ky
        FOREIGN KEY (ky_luong_id) REFERENCES ky_luong(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_bc_nv
        FOREIGN KEY (ma_nhan_vien) REFERENCES nhanvien(ma_nhan_vien)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    `
    CREATE TABLE IF NOT EXISTS bang_cong_chi_tiet (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      ky_luong_id INT NOT NULL,
      ma_nhan_vien INT NOT NULL,
      ngay DATE NOT NULL,
      ma_ca INT NOT NULL,
      ten_ca VARCHAR(50) NOT NULL,
      thoi_gian_ca VARCHAR(20) NOT NULL,
      so_gio DECIMAL(4,2) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_bcc (ky_luong_id, ma_nhan_vien, ngay, ma_ca),
      INDEX idx_bcc_nv (ma_nhan_vien, ky_luong_id),
      CONSTRAINT fk_bcc_ky
        FOREIGN KEY (ky_luong_id) REFERENCES ky_luong(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_bcc_nv
        FOREIGN KEY (ma_nhan_vien) REFERENCES nhanvien(ma_nhan_vien)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    `
    CREATE TABLE IF NOT EXISTS bang_luong_thang (
      ky_luong_id INT NOT NULL,
      ma_nhan_vien INT NOT NULL,
      tong_ca INT NOT NULL DEFAULT 0,
      tong_gio DECIMAL(6,2) NOT NULL DEFAULT 0,
      luong_gio DECIMAL(12,2) NOT NULL DEFAULT 0,
      luong_co_ban DECIMAL(12,2) NOT NULL DEFAULT 0,

      phu_cap DECIMAL(12,2) NOT NULL DEFAULT 0,
      thuong DECIMAL(12,2) NOT NULL DEFAULT 0,
      khau_tru DECIMAL(12,2) NOT NULL DEFAULT 0,
      tam_ung DECIMAL(12,2) NOT NULL DEFAULT 0,

      luong_thuc_nhan DECIMAL(12,2) NOT NULL DEFAULT 0,
      last_recalc_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (ky_luong_id, ma_nhan_vien),
      INDEX idx_bl_ky (ky_luong_id),
      CONSTRAINT fk_bl_ky
        FOREIGN KEY (ky_luong_id) REFERENCES ky_luong(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_bl_nv
        FOREIGN KEY (ma_nhan_vien) REFERENCES nhanvien(ma_nhan_vien)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  ];

  for (const stmt of statements) {
    await db.execute(stmt);
  }

  const [colRows] = await db.execute(
    `
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'bang_cong_thang'
        AND COLUMN_NAME = 'so_ngay_lam'
      LIMIT 1
    `
  );
  if (!colRows.length) {
    await db.execute(
      `ALTER TABLE bang_cong_thang ADD COLUMN so_ngay_lam INT NOT NULL DEFAULT 0 AFTER so_ca_toi`
    );
    await db.execute(
      `
        UPDATE bang_cong_thang bc
        SET bc.so_ngay_lam = (
          SELECT COUNT(DISTINCT bcc.ngay)
          FROM bang_cong_chi_tiet bcc
          WHERE bcc.ky_luong_id = bc.ky_luong_id
            AND bcc.ma_nhan_vien = bc.ma_nhan_vien
        )
      `
    );
  }

}

module.exports = { ensurePayrollSchema };

