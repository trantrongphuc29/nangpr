const db = require("../config/database");

const findAdminByUsername = (username, callback) => {
  const sql = "SELECT * FROM chuquan WHERE ten_dang_nhap = ?";
  db.query(sql, [username], callback);
};

module.exports = {
  findAdminByUsername,
};
