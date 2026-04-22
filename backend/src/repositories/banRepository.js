const db = require("../config/database");

const getAll = (sort, callback) => {
  const orderBy = sort === "desc" ? "ten_ban DESC" : "ten_ban ASC";
  const sql = `SELECT * FROM ban ORDER BY ${orderBy}`;
  db.query(sql, callback);
};

const create = (tenBan, callback) => {
  db.query("INSERT INTO ban (ten_ban) VALUES (?)", [tenBan], callback);
};

const removeById = (id, callback) => {
  db.query("DELETE FROM ban WHERE ma_ban = ?", [id], callback);
};

const updateById = (id, tenBan, callback) => {
  db.query("UPDATE ban SET ten_ban = ? WHERE ma_ban = ?", [tenBan, id], callback);
};

module.exports = {
  getAll,
  create,
  removeById,
  updateById,
};
