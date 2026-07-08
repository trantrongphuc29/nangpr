const db = require("./database");

async function columnType(table, column) {
  const [rows] = await db.execute(
    `SELECT DATA_TYPE, COLUMN_TYPE FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0] || null;
}

async function ensureNhanVienSchema() {
  const col = await columnType("nhanvien", "trang_thai");
  if (!col) return;

  const isEnum =
    col.COLUMN_TYPE &&
    col.COLUMN_TYPE.toLowerCase().includes("enum('dang_lam'");

  if (!isEnum) {
    await db.execute(
      `ALTER TABLE nhanvien MODIFY COLUMN trang_thai VARCHAR(20) NOT NULL DEFAULT 'dang_lam'`
    );

    await db.execute(`
      UPDATE nhanvien nv
      LEFT JOIN nhanvien_luong nvl ON nvl.ma_nhan_vien = nv.ma_nhan_vien
      SET nv.trang_thai = CASE
        WHEN nv.trang_thai IN ('1', 1) THEN 'dang_lam'
        WHEN nv.trang_thai IN ('0', 0) THEN COALESCE(nvl.tinh_trang, 'da_nghi')
        WHEN nv.trang_thai IN ('dang_lam', 'tam_nghi', 'da_nghi') THEN nv.trang_thai
        ELSE 'dang_lam'
      END
    `);

    await db.execute(`
      ALTER TABLE nhanvien
      MODIFY COLUMN trang_thai ENUM('dang_lam','tam_nghi','da_nghi') NOT NULL DEFAULT 'dang_lam'
      COMMENT 'Trạng thái làm việc'
    `);

  }

  await db.execute(`
    UPDATE nhanvien_luong nvl
    INNER JOIN nhanvien nv ON nv.ma_nhan_vien = nvl.ma_nhan_vien
    SET nvl.tinh_trang = nv.trang_thai
    WHERE CAST(nvl.tinh_trang AS CHAR) <> CAST(nv.trang_thai AS CHAR)
  `);
}

module.exports = { ensureNhanVienSchema };
