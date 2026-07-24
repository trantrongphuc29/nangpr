/* =====   BÀN  =====
 * Thao tác SQL với bảng ban
 * ========================================= */
const db = require("../config/database");
const { ACTIVE_ORDER } = require("./donHangRepository");

/* Bàn "đang phục vụ" = còn đơn chưa thanh toán VÀ đơn đó đã có món.
 * Phải có thêm điều kiện "đã có món" để khớp với màn hình POS (co_khach):
 * đơn mở ra nhưng chưa gọi món nào thì bàn vẫn được xem là trống. */
const DANG_PHUC_VU = `
  EXISTS (
    SELECT 1 FROM donhang dh
    WHERE dh.ma_ban = b.ma_ban AND ${ACTIVE_ORDER}
      AND EXISTS (SELECT 1 FROM chitiethoadon ct WHERE ct.ma_don_hang = dh.ma_don_hang)
  )
`;

const getAll = async (sort) => {
  const orderBy = sort === "desc" ? "DESC" : "ASC";
  const sql = `SELECT b.*, ${DANG_PHUC_VU} AS dang_phuc_vu
               FROM ban b
               ORDER BY b.ten_ban ${orderBy}`;
  const [rows] = await db.execute(sql);
  return rows.map((r) => ({ ...r, dang_phuc_vu: Boolean(r.dang_phuc_vu) }));
};

/** Kiểm tra bàn có đang phục vụ khách hay không (dùng chung định nghĩa với DANG_PHUC_VU) */
const hasActiveOrder = async (id) => {
  const [rows] = await db.execute(
    `SELECT 1 FROM donhang dh
     WHERE dh.ma_ban = ? AND ${ACTIVE_ORDER}
       AND EXISTS (SELECT 1 FROM chitiethoadon ct WHERE ct.ma_don_hang = dh.ma_don_hang)
     LIMIT 1`,
    [id]
  );
  return rows.length > 0;
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
  // So sánh không phân biệt hoa/thường và ignore khoảng trắng đầu cuối
  let sql = "SELECT * FROM ban WHERE LOWER(TRIM(ten_ban)) = LOWER(TRIM(?))";
  const params = [tenBan];
  if (excludeId !== null) {
    sql += " AND ma_ban != ?";
    params.push(excludeId);
  }
  const [rows] = await db.execute(sql, params);
  return rows[0] || null;
};

module.exports = {
  getAll,
  hasActiveOrder,
  create,
  removeById,
  updateById,
  findByName,
};