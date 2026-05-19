const mysql = require("mysql2");

// Sử dụng createPool thay vì createConnection
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "quan_cafe",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Xuất ra dạng promise để các Repository dùng được await db.execute()
module.exports = pool.promise();

console.log("MySQL Pool initialized ✅");