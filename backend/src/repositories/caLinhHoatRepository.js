const db = require("../config/database");

function normalizeNgayYmd(value) {
  if (!value) return "";
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value).substring(0, 10);
}

const getAssignments = async (queryOptions) => {
  const { startDate, endDate, name } = queryOptions;
  let sql = `
    SELECT plh.id, plh.ma_nhan_vien, DATE_FORMAT(plh.ngay, '%Y-%m-%d') AS ngay,
           TIME_FORMAT(plh.gio_bat_dau, '%H:%i') AS gio_bat_dau,
           TIME_FORMAT(plh.gio_ket_thuc, '%H:%i') AS gio_ket_thuc,
           plh.ghi_chu, nv.ten
    FROM phancong_linh_hoat plh
    INNER JOIN nhanvien nv ON plh.ma_nhan_vien = nv.ma_nhan_vien
    WHERE 1=1
  `;
  const params = [];

  if (startDate && endDate) {
    sql += " AND plh.ngay >= ? AND plh.ngay <= ?";
    params.push(startDate, endDate);
  } else if (startDate) {
    sql += " AND plh.ngay = ?";
    params.push(startDate);
  } else {
    sql += " AND plh.ngay + INTERVAL 7 HOUR = CURDATE() + INTERVAL 7 HOUR";
  }

  if (name) {
    sql += " AND nv.ten LIKE ?";
    params.push(`%${name}%`);
  }

  sql += " ORDER BY plh.ngay ASC, plh.gio_bat_dau ASC";
  const [rows] = await db.execute(sql, params);
  return rows.map((row) => ({
    ...row,
    ma_nhan_vien: Number(row.ma_nhan_vien),
    ngay: normalizeNgayYmd(row.ngay),
  }));
};

const getById = async (id) => {
  const [rows] = await db.execute(`SELECT * FROM phancong_linh_hoat WHERE id = ?`, [id]);
  return rows[0] || null;
};

const createAssignment = async ({ ma_nhan_vien, ngay, gio_bat_dau, gio_ket_thuc, ghi_chu }) => {
  const [result] = await db.execute(
    `INSERT INTO phancong_linh_hoat (ma_nhan_vien, ngay, gio_bat_dau, gio_ket_thuc, ghi_chu) VALUES (?, ?, ?, ?, ?)`,
    [ma_nhan_vien, ngay, gio_bat_dau, gio_ket_thuc, ghi_chu || null]
  );
  return result;
};

const updateAssignment = async (id, { ma_nhan_vien, ngay, gio_bat_dau, gio_ket_thuc, ghi_chu }) => {
  const [result] = await db.execute(
    `UPDATE phancong_linh_hoat
     SET ma_nhan_vien = ?, ngay = ?, gio_bat_dau = ?, gio_ket_thuc = ?, ghi_chu = ?
     WHERE id = ?`,
    [ma_nhan_vien, ngay, gio_bat_dau, gio_ket_thuc, ghi_chu || null, id]
  );
  return result.affectedRows > 0;
};

const removeAssignment = async (id) => {
  const [result] = await db.execute(`DELETE FROM phancong_linh_hoat WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAssignments,
  getById,
  createAssignment,
  updateAssignment,
  removeAssignment,
};
