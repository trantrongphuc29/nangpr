const db = require("../config/database");

const getAll = async () => {
  const sql = "SELECT ma_nhan_vien, ten, DATE_FORMAT(ngay_sinh, '%Y-%m-%d') as ngay_sinh, so_dien_thoai, dia_chi, trang_thai FROM nhanvien ORDER BY ma_nhan_vien DESC";
  const [rows] = await db.execute(sql);
  return rows;
};

const getShifts = async () => {
  const [rows] = await db.execute(
    "SELECT ma_ca, buoi, gio_bat_dau, gio_ket_thuc FROM calam ORDER BY ma_ca ASC"
  );
  return rows.map((r) => ({ ...r, ma_ca: Number(r.ma_ca) }));
};

function normalizeNgayYmd(value) {
  if (!value) return "";
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return s.substring(0, 10);
}

const getAssignments = async (queryOptions) => {
  const { startDate, endDate, name } = queryOptions;
  let sql = `
    SELECT pc.ma_nhan_vien, pc.ma_ca, DATE_FORMAT(pc.ngay, '%Y-%m-%d') AS ngay, nv.ten, cl.buoi
    FROM phancong pc
    INNER JOIN nhanvien nv ON pc.ma_nhan_vien = nv.ma_nhan_vien
    LEFT JOIN calam cl ON pc.ma_ca = cl.ma_ca
    WHERE 1=1
  `;
  const params = [];

  if (startDate && endDate) {
    sql += " AND pc.ngay >= ? AND pc.ngay <= ?";
    params.push(startDate, endDate);
  } else if (startDate) {
    sql += " AND pc.ngay = ?";
    params.push(startDate);
  } else {
    sql += " AND pc.ngay + INTERVAL 7 HOUR = CURDATE() + INTERVAL 7 HOUR";
  }

  if (name) {
    sql += " AND nv.ten LIKE ?";
    params.push(`%${name}%`);
  }

  sql += " ORDER BY pc.ngay ASC, pc.ma_ca ASC";
  const [rows] = await db.execute(sql, params);
  return rows.map((row) => ({
    ...row,
    ma_ca: Number(row.ma_ca),
    ma_nhan_vien: Number(row.ma_nhan_vien),
    ngay: normalizeNgayYmd(row.ngay),
  }));
};

const createStaff = async (staff) => {
  const { ten, ngay_sinh, so_dien_thoai, dia_chi } = staff;
  const sql = "INSERT INTO nhanvien (ten, ngay_sinh, so_dien_thoai, dia_chi, trang_thai) VALUES (?, ?, ?, ?, 'dang_lam')";
  const [result] = await db.execute(sql, [ten, ngay_sinh, so_dien_thoai, dia_chi]);
  return result;
};

const updateStatus = async (id, trang_thai) => {
  const maNhanVien = parseInt(id, 10);
  if (!Number.isFinite(maNhanVien)) return false;
  const sql = "UPDATE nhanvien SET trang_thai = ? WHERE ma_nhan_vien = ?";
  const [result] = await db.execute(sql, [trang_thai, maNhanVien]);
  return result.affectedRows > 0;
};

const createAssignment = async (assignment) => {
  const { ma_nhan_vien, ma_ca, ngay } = assignment;
  const sql = "INSERT INTO phancong (ma_nhan_vien, ma_ca, ngay) VALUES (?, ?, ?)";
  const [result] = await db.execute(sql, [ma_nhan_vien, ma_ca, ngay]);
  return result;
};

const removeAssignment = async (assignment) => {
  const { ma_nhan_vien, ma_ca, ngay } = assignment;
  const sql = "DELETE FROM phancong WHERE ma_nhan_vien = ? AND ma_ca = ? AND ngay = ?";
  const [result] = await db.execute(sql, [ma_nhan_vien, ma_ca, ngay]);
  return result.affectedRows > 0;
};

const updateStaff = async (id, staff) => {
  const { ten, ngay_sinh, so_dien_thoai, dia_chi } = staff;
  const sql = "UPDATE nhanvien SET ten = ?, ngay_sinh = ?, so_dien_thoai = ?, dia_chi = ? WHERE ma_nhan_vien = ?";
  const [result] = await db.execute(sql, [ten, ngay_sinh, so_dien_thoai, dia_chi, id]);
  return result.affectedRows > 0;
};

const removeStaff = async (id) => {
  const sql = "DELETE FROM nhanvien WHERE ma_nhan_vien = ?";
  const [result] = await db.execute(sql, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  getShifts,
  getAssignments,
  createStaff,
  updateStatus,
  createAssignment,
  removeAssignment,
  updateStaff,
  removeStaff,
};