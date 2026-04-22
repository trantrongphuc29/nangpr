const db = require("../config/database");

const getAll = (callback) => {
  const sql =
    "SELECT ma_nhan_vien, ten, DATE_FORMAT(ngay_sinh, '%Y-%m-%d') as ngay_sinh, so_dien_thoai, dia_chi FROM nhanvien ORDER BY ma_nhan_vien DESC";
  db.query(sql, callback);
};

const getAssignments = (queryOptions, callback) => {
  const { startDate, endDate, name } = queryOptions;
  let sql = `
    SELECT pc.ma_nhan_vien, pc.ma_ca, DATE_FORMAT(pc.ngay, '%Y-%m-%d') as ngay, nv.ten, cl.buoi
    FROM phancong pc
    JOIN nhanvien nv ON pc.ma_nhan_vien = nv.ma_nhan_vien
    LEFT JOIN calam cl ON pc.ma_ca = cl.ma_ca
    WHERE 1=1
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
  db.query(sql, params, callback);
};

const createStaff = (staff, callback) => {
  const { ten, ngay_sinh, so_dien_thoai, dia_chi } = staff;
  const sql = "INSERT INTO nhanvien (ten, ngay_sinh, so_dien_thoai, dia_chi) VALUES (?, ?, ?, ?)";
  db.query(sql, [ten, ngay_sinh, so_dien_thoai, dia_chi], callback);
};

const createAssignment = (assignment, callback) => {
  const { ma_nhan_vien, ma_ca, ngay } = assignment;
  const sql = "INSERT INTO phancong (ma_nhan_vien, ma_ca, ngay) VALUES (?, ?, ?)";
  db.query(sql, [ma_nhan_vien, ma_ca, ngay], callback);
};

const removeAssignment = (assignment, callback) => {
  const { ma_nhan_vien, ma_ca, ngay } = assignment;
  const sql = "DELETE FROM phancong WHERE ma_nhan_vien = ? AND ma_ca = ? AND ngay = ?";
  db.query(sql, [ma_nhan_vien, ma_ca, ngay], callback);
};

const updateStaff = (id, staff, callback) => {
  const { ten, ngay_sinh, so_dien_thoai, dia_chi } = staff;
  const sql = "UPDATE nhanvien SET ten = ?, ngay_sinh = ?, so_dien_thoai = ?, dia_chi = ? WHERE ma_nhan_vien = ?";
  db.query(sql, [ten, ngay_sinh, so_dien_thoai, dia_chi, id], callback);
};

const removeStaff = (id, callback) => {
  const sql = "DELETE FROM nhanvien WHERE ma_nhan_vien = ?";
  db.query(sql, [id], callback);
};

module.exports = {
  getAll,
  getAssignments,
  createStaff,
  createAssignment,
  removeAssignment,
  updateStaff,
  removeStaff,
};
