const db = require("../config/database");

const getAll = async (sort) => {
  const orderBy = sort === "desc" ? "ten_ban DESC" : "ten_ban ASC";
  const sql = `SELECT * FROM ban ORDER BY ${orderBy}`;
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
  const [result] = await db.execute("UPDATE ban WHERE ma_ban = ?", [tenBan, id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  create,
  removeById,
  updateById,
};