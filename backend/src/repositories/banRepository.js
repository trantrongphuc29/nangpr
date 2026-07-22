/* =====   BÀN  =====
 * Thao tác SQL với bảng ban
 * ========================================= */
const db = require("../config/database");

const getAll = async (sort) => {
  const orderBy = sort === "desc" ? "DESC" : "ASC";
  const sql = `SELECT * FROM ban ORDER BY ten_ban ${orderBy}`;
  const [rows] = await db.execute(sql);
  return rows;
};

const create = async (tenBan) => {
  const [result] = await db.execute("INSERT INTO ban (ten_ban) VALUES (?)", [tenBan]);
  return result;
};

const removeById = async (id) => {
  const [result] = await db.execute("DELETE FROM ban WHERE ma_ban = ?", [id]);
  return result.affectedRows > 0;
};

const updateById = async (id, tenBan) => {
  const [result] = await db.execute("UPDATE ban SET ten_ban = ? WHERE ma_ban = ?", [tenBan, id]);
  return result.affectedRows > 0;
};

/** Kiểm tra tên bàn đã tồn tại chưa (có thể loại trừ id hiện tại khi sửa) */
const findByName = async (tenBan, excludeId = null) => {
  let sql = "SELECT * FROM ban WHERE ten_ban = ?";
  const params = [tenBan];
  if (excludeId !== null) {
    sql += " AND ma_ban != ?";
    params.push(excludeId);
  }
  const [rows] = await db.execute(sql, params);
  return rows[0] || null;
};

/** Kiểm tra bàn có đơn đang phục vụ không */
const hasActiveOrders = async (id) => {
  const sql = `SELECT ma_don_hang FROM donhang
    WHERE ma_ban = ?
      AND trang_thai_thanh_toan = 'Chua thanh toan'
      AND COALESCE(trang_thai_don, '') NOT IN ('Da huy', 'Hoan thanh')
    LIMIT 1`;
  const [rows] = await db.execute(sql, [id]);
  return rows.length > 0;
};

module.exports = {
  getAll,
  create,
  removeById,
  updateById,
  findByName,
  hasActiveOrders,
};