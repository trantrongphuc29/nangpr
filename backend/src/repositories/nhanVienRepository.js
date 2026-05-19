const db = require("../config/database");

const getAll = async () => {
  const sql = "SELECT ma_nhan_vien, ten, DATE_FORMAT(ngay_sinh, '%Y-%m-%d') as ngay_sinh, so_dien_thoai, dia_chi, trang_thai FROM nhanvien ORDER BY ma_nhan_vien DESC";
  const [rows] = await db.execute(sql);
  return rows;
};

const getAssignments = async (queryOptions) => {
  const { startDate, endDate, name } = queryOptions;
  let sql = `
    SELECT pc.ma_nhan_vien, pc.ma_ca, DATE_FORMAT(pc.ngay, '%Y-%m-%d') as ngay, nv.ten, cl.buoi
    FROM phancong pc
    JOIN nhanvien nv ON pc.ma_nhan_vien = nv.ma_nhan_vien
    LEFT JOIN calam cl ON pc.ma_ca = cl.ma_ca
    WHERE nv.trang_thai = 1
  `;
  const params = [];

  if (startDate && endDate) {
    sql += " AND pc.ngay BETWEEN ? AND ?";
    params.push(startDate, endDate);
  } else if (startDate) {
    sql += " AND pc.ngay = ?";
    params.push(startDate);
  } else {
    sql += " AND pc.ngay = CURDATE()";
  }

  if (name) {
    sql += " AND nv.ten LIKE ?";
    params.push(`%${name}%`);
  }

  sql += " ORDER BY pc.ngay ASC, pc.ma_ca ASC";
  const [rows] = await db.execute(sql, params);
  return rows;
};

const createStaff = async (staff) => {
  const { ten, ngay_sinh, so_dien_thoai, dia_chi } = staff;
  const sql = "INSERT INTO nhanvien (ten, ngay_sinh, so_dien_thoai, dia_chi, trang_thai) VALUES (?, ?, ?, ?, 1)";
  const [result] = await db.execute(sql, [ten, ngay_sinh, so_dien_thoai, dia_chi]);
  return result;
};

const updateStatus = async (id, trang_thai) => {
  const sql = "UPDATE nhanvien SET trang_thai = ? WHERE ma_nhan_vien = ?";
  const [result] = await db.execute(sql, [trang_thai, id]);
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
  getAssignments,
  createStaff,
  updateStatus,
  createAssignment,
  removeAssignment,
  updateStaff,
  removeStaff,
};