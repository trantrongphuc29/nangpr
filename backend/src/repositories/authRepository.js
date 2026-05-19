const db = require("../config/database");

const findAdminByUsername = async (username) => {
    const sql = "SELECT * FROM chuquan WHERE ten_dang_nhap = ?";
    // Dùng destructuring [rows] vì db.execute trả về [rows, fields]
    const [rows] = await db.execute(sql, [username]);
    return rows; 
};

module.exports = { findAdminByUsername };