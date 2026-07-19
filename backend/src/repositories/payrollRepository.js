const db = require("../config/database");

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toYMD(nam, thang, ngay) {
  return `${nam}-${pad2(thang)}-${pad2(ngay)}`;
}

async function ensureKyLuong({ thang, nam }) {
  await db.execute(
    `INSERT INTO ky_luong (thang, nam) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id`,
    [thang, nam]
  );
  const [rows] = await db.execute(`SELECT * FROM ky_luong WHERE thang = ? AND nam = ?`, [thang, nam]);
  return rows[0];
}

async function recalculateBangCong({ ky_luong_id, thang, nam }) {
  const firstDay = toYMD(nam, thang, 1);
  const lastDay = toYMD(nam, thang, new Date(nam, thang, 0).getDate());

  // Chỉ tự tính khi cần (ky_luong đã được service kiểm tra trạng thái).
  await db.execute(`DELETE FROM bang_cong_chi_tiet WHERE ky_luong_id = ?`, [ky_luong_id]);
  await db.execute(`DELETE FROM bang_cong_thang WHERE ky_luong_id = ?`, [ky_luong_id]);

  // Tên ca / thời gian / số giờ lấy từ bảng calam; áp hệ số ngày lễ để ra "số giờ quy đổi" (tính lương)
  const insertDetailsSql = `
    INSERT INTO bang_cong_chi_tiet
      (ky_luong_id, ma_nhan_vien, ngay, ma_ca, ten_ca, thoi_gian_ca, so_gio, he_so, so_gio_quy_doi)
    SELECT
      ? AS ky_luong_id,
      pc.ma_nhan_vien,
      pc.ngay,
      pc.ma_ca,
      COALESCE(cl.buoi, 'Ca Khác') AS ten_ca,
      CASE
        WHEN cl.gio_bat_dau IS NOT NULL AND cl.gio_ket_thuc IS NOT NULL
          THEN CONCAT(cl.gio_bat_dau, '-', cl.gio_ket_thuc)
        ELSE ''
      END AS thoi_gian_ca,
      COALESCE(
        TIMESTAMPDIFF(MINUTE, STR_TO_DATE(cl.gio_bat_dau, '%H:%i'), STR_TO_DATE(cl.gio_ket_thuc, '%H:%i')) / 60.0,
        0
      ) AS so_gio,
      COALESCE(nl.he_so, 1) AS he_so,
      COALESCE(
        TIMESTAMPDIFF(MINUTE, STR_TO_DATE(cl.gio_bat_dau, '%H:%i'), STR_TO_DATE(cl.gio_ket_thuc, '%H:%i')) / 60.0,
        0
      ) * COALESCE(nl.he_so, 1) AS so_gio_quy_doi
    FROM phancong pc
    LEFT JOIN calam cl ON pc.ma_ca = cl.ma_ca
    LEFT JOIN ngay_le nl ON nl.ngay = pc.ngay
    WHERE pc.ngay >= ? AND pc.ngay <= ?
      AND pc.ngay + INTERVAL 7 HOUR < CURDATE() + INTERVAL 7 HOUR
  `;

  await db.execute(insertDetailsSql, [ky_luong_id, firstDay, lastDay]);

  const insertSummarySql = `
    INSERT INTO bang_cong_thang
      (ky_luong_id, ma_nhan_vien, so_ca_sang, so_ca_chieu, so_ca_toi, so_ngay_lam,
       so_ca_1, so_ca_2, so_ca_3, so_ca_4, so_ca_5, so_ca_6,
       tong_ca, tong_gio, tong_gio_quy_doi, last_recalc_at)
    SELECT
      ky_luong_id,
      ma_nhan_vien,
      SUM(CASE WHEN ma_ca IN (1, 2) THEN 1 ELSE 0 END) AS so_ca_sang,
      SUM(CASE WHEN ma_ca IN (3, 4) THEN 1 ELSE 0 END) AS so_ca_chieu,
      SUM(CASE WHEN ma_ca IN (5, 6) THEN 1 ELSE 0 END) AS so_ca_toi,
      COUNT(DISTINCT ngay) AS so_ngay_lam,
      SUM(CASE ma_ca WHEN 1 THEN 1 ELSE 0 END) AS so_ca_1,
      SUM(CASE ma_ca WHEN 2 THEN 1 ELSE 0 END) AS so_ca_2,
      SUM(CASE ma_ca WHEN 3 THEN 1 ELSE 0 END) AS so_ca_3,
      SUM(CASE ma_ca WHEN 4 THEN 1 ELSE 0 END) AS so_ca_4,
      SUM(CASE ma_ca WHEN 5 THEN 1 ELSE 0 END) AS so_ca_5,
      SUM(CASE ma_ca WHEN 6 THEN 1 ELSE 0 END) AS so_ca_6,
      COUNT(*) AS tong_ca,
      SUM(so_gio) AS tong_gio,
      SUM(so_gio_quy_doi) AS tong_gio_quy_doi,
      NOW() AS last_recalc_at
    FROM bang_cong_chi_tiet
    WHERE ky_luong_id = ?
    GROUP BY ma_nhan_vien
  `;

  await db.execute(insertSummarySql, [ky_luong_id]);
}

async function recalculateBangLuong({ ky_luong_id }) {
  // Xóa các nhân viên không còn có công trong kỳ
  await db.execute(
    `
    DELETE bl
    FROM bang_luong_thang bl
    LEFT JOIN bang_cong_thang bc
      ON bc.ky_luong_id = bl.ky_luong_id AND bc.ma_nhan_vien = bl.ma_nhan_vien
    WHERE bl.ky_luong_id = ? AND bc.ma_nhan_vien IS NULL
    `,
    [ky_luong_id]
  );

  // Thêm row lương cho nhân viên có công nhưng chưa có bảng lương
  await db.execute(
    `
    INSERT INTO bang_luong_thang
      (ky_luong_id, ma_nhan_vien, phu_cap, thuong, khau_tru, tam_ung, last_recalc_at)
    SELECT
      bc.ky_luong_id,
      bc.ma_nhan_vien,
      COALESCE(nvl.phu_cap_mac_dinh, 0) AS phu_cap,
      0 AS thuong,
      0 AS khau_tru,
      0 AS tam_ung,
      NOW() AS last_recalc_at
    FROM bang_cong_thang bc
    LEFT JOIN bang_luong_thang bl
      ON bl.ky_luong_id = bc.ky_luong_id AND bl.ma_nhan_vien = bc.ma_nhan_vien
    LEFT JOIN nhanvien_luong nvl
      ON nvl.ma_nhan_vien = bc.ma_nhan_vien
    WHERE bc.ky_luong_id = ?
      AND bl.ma_nhan_vien IS NULL
  `,
    [ky_luong_id]
  );

  // Cập nhật các trường tính từ bảng công + cấu hình lương (preserve các khoản nhập tay đang có)
  await db.execute(
    `
    UPDATE bang_luong_thang bl
    JOIN bang_cong_thang bc
      ON bc.ky_luong_id = bl.ky_luong_id AND bc.ma_nhan_vien = bl.ma_nhan_vien
    LEFT JOIN nhanvien_luong nvl
      ON nvl.ma_nhan_vien = bl.ma_nhan_vien
    SET
      bl.tong_ca = bc.tong_ca,
      bl.tong_gio = bc.tong_gio,
      bl.luong_gio = COALESCE(nvl.luong_gio, 0),
      bl.luong_co_ban = COALESCE(bc.tong_gio_quy_doi, bc.tong_gio) * COALESCE(nvl.luong_gio, 0),
      bl.phu_cap = COALESCE(nvl.phu_cap_mac_dinh, 0),
      bl.luong_thuc_nhan = (COALESCE(bc.tong_gio_quy_doi, bc.tong_gio) * COALESCE(nvl.luong_gio, 0))
        + COALESCE(nvl.phu_cap_mac_dinh, 0)
        + COALESCE(bl.thuong, 0)
        - COALESCE(bl.khau_tru, 0)
        - COALESCE(bl.tam_ung, 0),
      bl.last_recalc_at = NOW()
    WHERE bl.ky_luong_id = ?
  `,
    [ky_luong_id]
  );
}

async function getBangCongSummary({ ky_luong_id, ma_nhan_vien }) {
  const params = [ky_luong_id];
  let nvWhere = "1=1";
  if (ma_nhan_vien) {
    nvWhere += " AND nv.ma_nhan_vien = ?";
    params.push(ma_nhan_vien);
  }

  const [totalsRows] = await db.execute(
    `
      SELECT
        SUM(CASE WHEN COALESCE(bc.tong_ca, 0) > 0 THEN 1 ELSE 0 END) AS tong_nhan_vien_co_cong,
        COALESCE(SUM(bc.tong_ca), 0) AS tong_ca_da_lam,
        COALESCE(SUM(bc.tong_gio), 0) AS tong_gio_lam,
        COALESCE(SUM(bc.so_ca_sang), 0) AS tong_ca_sang,
        COALESCE(SUM(bc.so_ca_chieu), 0) AS tong_ca_chieu,
        COALESCE(SUM(bc.so_ca_toi), 0) AS tong_ca_toi
      FROM nhanvien nv
      LEFT JOIN bang_cong_thang bc
        ON bc.ky_luong_id = ? AND bc.ma_nhan_vien = nv.ma_nhan_vien
      WHERE ${nvWhere}
    `,
    params
  );

  const rowParams = ma_nhan_vien ? [ky_luong_id, ma_nhan_vien] : [ky_luong_id];
  const [rows] = await db.execute(
    `
      SELECT
        nv.ma_nhan_vien,
        nv.ten,
        nv.trang_thai,
        COALESCE(bc.so_ca_sang, 0) AS so_ca_sang,
        COALESCE(bc.so_ca_chieu, 0) AS so_ca_chieu,
        COALESCE(bc.so_ca_toi, 0) AS so_ca_toi,
        COALESCE(bc.so_ca_1, 0) AS so_ca_1,
        COALESCE(bc.so_ca_2, 0) AS so_ca_2,
        COALESCE(bc.so_ca_3, 0) AS so_ca_3,
        COALESCE(bc.so_ca_4, 0) AS so_ca_4,
        COALESCE(bc.so_ca_5, 0) AS so_ca_5,
        COALESCE(bc.so_ca_6, 0) AS so_ca_6,
        COALESCE(bc.so_ngay_lam, 0) AS so_ngay_lam,
        COALESCE(bc.tong_ca, 0) AS tong_ca,
        COALESCE(bc.tong_gio, 0) AS tong_gio
      FROM nhanvien nv
      LEFT JOIN bang_cong_thang bc
        ON bc.ky_luong_id = ? AND bc.ma_nhan_vien = nv.ma_nhan_vien
      WHERE ${ma_nhan_vien ? "nv.ma_nhan_vien = ?" : "1=1"}
      ORDER BY COALESCE(bc.tong_ca, 0) DESC, nv.ten ASC
    `,
    rowParams
  );

  const totals = totalsRows[0] || {
    tong_nhan_vien_co_cong: 0,
    tong_ca_da_lam: 0,
    tong_gio_lam: 0,
    tong_ca_sang: 0,
    tong_ca_chieu: 0,
    tong_ca_toi: 0,
  };

  return {
    totals,
    rows,
  };
}

async function getBangCongChiTiet({ ky_luong_id, ma_nhan_vien }) {
  const [rows] = await db.execute(
    `
      SELECT
        ngay,
        ten_ca,
        thoi_gian_ca,
        ma_ca,
        so_gio,
        he_so,
        so_gio_quy_doi
      FROM bang_cong_chi_tiet
      WHERE ky_luong_id = ? AND ma_nhan_vien = ?
      ORDER BY ngay ASC, ma_ca ASC
    `,
    [ky_luong_id, ma_nhan_vien]
  );
  return rows;
}

async function getBangLuongSummary({ ky_luong_id, ma_nhan_vien }) {
  const params = [ky_luong_id];
  let where = "bl.ky_luong_id = ?";
  if (ma_nhan_vien) {
    where += " AND bl.ma_nhan_vien = ?";
    params.push(ma_nhan_vien);
  }

  const [totalsRows] = await db.execute(
    `
      SELECT
        COUNT(*) AS tong_nhan_vien,
        COALESCE(SUM(bl.tong_ca), 0) AS tong_ca,
        COALESCE(SUM(bl.tong_gio), 0) AS tong_gio,
        COALESCE(SUM(bl.luong_co_ban), 0) AS tong_luong_co_ban,
        COALESCE(SUM(bl.phu_cap), 0) AS tong_phu_cap,
        COALESCE(SUM(bl.thuong), 0) AS tong_thuong,
        COALESCE(SUM(bl.khau_tru), 0) AS tong_khau_tru,
        COALESCE(SUM(bl.tam_ung), 0) AS tong_tam_ung,
        COALESCE(SUM(bl.luong_thuc_nhan), 0) AS tong_tien_phai_tra
      FROM bang_luong_thang bl
      WHERE ${where}
    `,
    params
  );

  const [rows] = await db.execute(
    `
      SELECT
        bl.ma_nhan_vien,
        nv.ten,
        bl.tong_ca,
        bl.tong_gio,
        bl.luong_gio,
        bl.luong_co_ban,
        bl.phu_cap,
        bl.thuong,
        bl.khau_tru,
        bl.tam_ung,
        bl.luong_thuc_nhan
      FROM bang_luong_thang bl
      JOIN nhanvien nv ON nv.ma_nhan_vien = bl.ma_nhan_vien
      WHERE bl.ky_luong_id = ?
        ${ma_nhan_vien ? "AND bl.ma_nhan_vien = ?" : ""}
      ORDER BY nv.ten ASC
    `,
    ma_nhan_vien ? [ky_luong_id, ma_nhan_vien] : [ky_luong_id]
  );

  const totals = totalsRows[0] || {
    tong_nhan_vien: 0,
    tong_ca: 0,
    tong_gio: 0,
    tong_luong_co_ban: 0,
    tong_phu_cap: 0,
    tong_thuong: 0,
    tong_khau_tru: 0,
    tong_tam_ung: 0,
    tong_tien_phai_tra: 0,
  };

  return { totals, rows };
}

async function getBangLuongRow({ ky_luong_id, ma_nhan_vien }) {
  const [rows] = await db.execute(
    `
      SELECT
        bl.ma_nhan_vien,
        nv.ten,
        bl.tong_ca,
        bl.tong_gio,
        bl.luong_gio,
        bl.luong_co_ban,
        bl.phu_cap,
        bl.thuong,
        bl.khau_tru,
        bl.tam_ung,
        bl.luong_thuc_nhan
      FROM bang_luong_thang bl
      JOIN nhanvien nv ON nv.ma_nhan_vien = bl.ma_nhan_vien
      WHERE bl.ky_luong_id = ? AND bl.ma_nhan_vien = ?
    `,
    [ky_luong_id, ma_nhan_vien]
  );
  return rows[0] || null;
}

async function updateBangLuongEmployee({ ky_luong_id, ma_nhan_vien, phu_cap, thuong, khau_tru, tam_ung }) {
  const [result] = await db.execute(
    `
      UPDATE bang_luong_thang bl
      JOIN ky_luong kl ON kl.id = bl.ky_luong_id
      SET
        bl.phu_cap = ?,
        bl.thuong = ?,
        bl.khau_tru = ?,
        bl.tam_ung = ?,
        bl.luong_thuc_nhan = bl.luong_co_ban + ? + ? - ? - ?
      WHERE bl.ky_luong_id = ?
        AND bl.ma_nhan_vien = ?
        AND kl.trang_thai = 'chua_chot'
    `,
    [
      phu_cap,
      thuong,
      khau_tru,
      tam_ung,
      phu_cap,
      thuong,
      khau_tru,
      tam_ung,
      ky_luong_id,
      ma_nhan_vien,
    ]
  );

  // eslint-disable-next-line no-underscore-dangle
  if (!result || result.affectedRows === 0) {
    throw { status: 400, message: "Không thể cập nhật. Kỳ lương đã chốt hoặc nhân viên không thuộc kỳ." };
  }
}

async function lockKyLuong({ ky_id }) {
  const [result] = await db.execute(
    `
      UPDATE ky_luong
      SET
        trang_thai = 'da_chot',
        chot_luc = NOW()
      WHERE id = ? AND trang_thai = 'chua_chot'
    `,
    [ky_id]
  );

  if (!result || result.affectedRows === 0) {
    throw { status: 400, message: "Không thể chốt. Kỳ lương không ở trạng thái Chưa chốt." };
  }
}

async function unlockKyLuong({ ky_id }) {
  await db.execute(
    `
      UPDATE ky_luong
      SET trang_thai = 'chua_chot'
      WHERE id = ?
    `,
    [ky_id]
  );
}

async function markKyLuongPaid({ ky_id }) {
  const [result] = await db.execute(
    `
      UPDATE ky_luong
      SET
        trang_thai = 'da_thanh_toan'
      WHERE id = ? AND trang_thai = 'da_chot'
    `,
    [ky_id]
  );

  if (!result || result.affectedRows === 0) {
    throw { status: 400, message: "Không thể đánh dấu thanh toán. Kỳ lương chưa ở trạng thái Đã chốt." };
  }
}

async function revertKyLuongPaid({ ky_id }) {
  const [result] = await db.execute(
    `
      UPDATE ky_luong
      SET trang_thai = 'da_chot'
      WHERE id = ? AND trang_thai = 'da_thanh_toan'
    `,
    [ky_id]
  );

  if (!result || result.affectedRows === 0) {
    throw { status: 400, message: "Không thể hoàn tác. Kỳ lương chưa ở trạng thái Đã thanh toán." };
  }
}

async function getLuongNhanVien() {
  const [rows] = await db.execute(
    `
      SELECT
        nv.ma_nhan_vien,
        nv.ten,
        COALESCE(nvl.luong_gio, 0) AS luong_gio,
        COALESCE(nvl.phu_cap_mac_dinh, 0) AS phu_cap_mac_dinh,
        nv.trang_thai
      FROM nhanvien nv
      LEFT JOIN nhanvien_luong nvl ON nvl.ma_nhan_vien = nv.ma_nhan_vien
      ORDER BY nv.ten ASC
    `
  );
  return rows;
}

async function recalculateAllOpenKyBangLuong() {
  const [kys] = await db.execute(
    `SELECT id FROM ky_luong WHERE trang_thai = 'chua_chot' ORDER BY id`
  );
  for (const ky of kys) {
    await recalculateBangLuong({ ky_luong_id: ky.id });
  }
  return kys.length;
}

async function syncBangLuongFromLuongConfig(ma_nhan_vien_list) {
  const ids = [...new Set((ma_nhan_vien_list || []).map(Number).filter(Number.isFinite))];
  if (!ids.length) return 0;

  const placeholders = ids.map(() => "?").join(",");
  const [result] = await db.execute(
    `
      UPDATE bang_luong_thang bl
      INNER JOIN ky_luong kl ON kl.id = bl.ky_luong_id AND kl.trang_thai = 'chua_chot'
      INNER JOIN nhanvien_luong nvl ON nvl.ma_nhan_vien = bl.ma_nhan_vien
      SET
        bl.luong_gio = COALESCE(nvl.luong_gio, 0),
        bl.phu_cap = COALESCE(nvl.phu_cap_mac_dinh, 0),
        bl.luong_co_ban = bl.tong_gio * COALESCE(nvl.luong_gio, 0),
        bl.luong_thuc_nhan = (bl.tong_gio * COALESCE(nvl.luong_gio, 0))
          + COALESCE(nvl.phu_cap_mac_dinh, 0)
          + COALESCE(bl.thuong, 0)
          - COALESCE(bl.khau_tru, 0)
          - COALESCE(bl.tam_ung, 0),
        bl.last_recalc_at = NOW()
      WHERE bl.ma_nhan_vien IN (${placeholders})
    `,
    ids
  );
  return result?.affectedRows || 0;
}

async function upsertLuongNhanVienBulk({ items }) {
  const updatedIds = [];

  for (const item of items) {
    const ma_nhan_vien = Number(item.ma_nhan_vien);
    if (!Number.isFinite(ma_nhan_vien)) continue;

    const luong_gio = Number(item.luong_gio || 0);
    const phu_cap_mac_dinh = Number(item.phu_cap_mac_dinh || 0);
    const trang_thai = item.trang_thai || item.tinh_trang || "dang_lam";

    await db.execute(`UPDATE nhanvien SET trang_thai = ? WHERE ma_nhan_vien = ?`, [
      trang_thai,
      ma_nhan_vien,
    ]);

    await db.execute(
      `
        INSERT INTO nhanvien_luong (ma_nhan_vien, luong_gio, phu_cap_mac_dinh, tinh_trang)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          luong_gio = VALUES(luong_gio),
          phu_cap_mac_dinh = VALUES(phu_cap_mac_dinh),
          tinh_trang = VALUES(tinh_trang)
      `,
      [ma_nhan_vien, luong_gio, phu_cap_mac_dinh, trang_thai]
    );
    updatedIds.push(ma_nhan_vien);
  }

  const bangLuongDongBo = await syncBangLuongFromLuongConfig(updatedIds);
  const soKyDaTinh = await recalculateAllOpenKyBangLuong();

  return {
    message: "Đã cập nhật cấu hình lương nhân viên",
    da_cap_nhat: updatedIds.length,
    bang_luong_dong_bo: bangLuongDongBo,
    ky_luong_da_tinh_lai: soKyDaTinh,
  };
}

// ===== Ngày lễ / hệ số lương =====
async function getNgayLe() {
  const [rows] = await db.execute(
    `SELECT DATE_FORMAT(ngay, '%Y-%m-%d') AS ngay, ten, he_so FROM ngay_le ORDER BY ngay ASC`
  );
  return rows.map((r) => ({ ...r, he_so: Number(r.he_so) }));
}

async function upsertNgayLe({ ngay, ten, he_so }) {
  await db.execute(
    `INSERT INTO ngay_le (ngay, ten, he_so) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE ten = VALUES(ten), he_so = VALUES(he_so)`,
    [ngay, ten || null, he_so]
  );
  return { ngay, ten: ten || null, he_so: Number(he_so) };
}

async function deleteNgayLe({ ngay }) {
  const [result] = await db.execute(`DELETE FROM ngay_le WHERE ngay = ?`, [ngay]);
  return result.affectedRows > 0;
}

module.exports = {
  ensureKyLuong,
  getNgayLe,
  upsertNgayLe,
  deleteNgayLe,
  recalculateBangCong,
  recalculateBangLuong,
  getBangCongSummary,
  getBangCongChiTiet,
  getBangLuongSummary,
  getBangLuongRow,
  updateBangLuongEmployee,
  lockKyLuong,
  unlockKyLuong,
  markKyLuongPaid,
  revertKyLuongPaid,
  getLuongNhanVien,
  upsertLuongNhanVienBulk,
  syncBangLuongFromLuongConfig,
  recalculateAllOpenKyBangLuong,
};

