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
    console.log("✅ Đã thêm cột chitiethoadon.so_luong_da_gui_bar");
  }

  // Thêm cột loai_don vào donhang nếu chưa có (tai_cho, mang_ve, giao_hang)
  const exists2 = await columnExists("donhang", "loai_don");
  if (!exists2) {
    await db.execute(
      `ALTER TABLE donhang
       ADD COLUMN loai_don VARCHAR(20) NOT NULL DEFAULT 'tai_cho'
       AFTER ma_ban`
    );
    console.log("✅ Đã thêm cột donhang.loai_don");
  }

  // Thêm cột phi_giao_hang vào donhang nếu chưa có
  const exists3 = await columnExists("donhang", "phi_giao_hang");
  if (!exists3) {
    await db.execute(
      `ALTER TABLE donhang
       ADD COLUMN phi_giao_hang DECIMAL(12,2) NOT NULL DEFAULT 0.00
       AFTER loai_don`
    );
    console.log("✅ Đã thêm cột donhang.phi_giao_hang");
  }

  // Thêm cột so_dien_thoai_giao và dia_chi_giao vào donhang nếu chưa có
  const exists4 = await columnExists("donhang", "so_dien_thoai_giao");
  if (!exists4) {
    await db.execute(
      `ALTER TABLE donhang
       ADD COLUMN so_dien_thoai_giao VARCHAR(20) DEFAULT NULL AFTER phi_giao_hang,
       ADD COLUMN dia_chi_giao VARCHAR(500) DEFAULT NULL AFTER so_dien_thoai_giao`
    );
    console.log("✅ Đã thêm cột donhang.so_dien_thoai_giao và dia_chi_giao");
  }

  // Thêm cột ten_khach vào donhang nếu chưa có
  const exists5 = await columnExists("donhang", "ten_khach");
  if (!exists5) {
    await db.execute(
      `ALTER TABLE donhang
       ADD COLUMN ten_khach VARCHAR(100) DEFAULT NULL AFTER loai_don`
    );
    console.log("✅ Đã thêm cột donhang.ten_khach");
  }

  // Thêm cột hinh_thuc_thanh_toan vào donhang nếu chưa có
  const exists6 = await columnExists("donhang", "hinh_thuc_thanh_toan");
  if (!exists6) {
    await db.execute(
      `ALTER TABLE donhang
       ADD COLUMN hinh_thuc_thanh_toan VARCHAR(20) DEFAULT NULL AFTER phi_giao_hang`
    );
    console.log("✅ Đã thêm cột donhang.hinh_thuc_thanh_toan");
  }

  console.log("✅ Đã đảm bảo schema POS");
}

module.exports = { ensurePOSSchema };
