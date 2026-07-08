const mysql = require("mysql2");

// Sử dụng createPool thay vì createConnection
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "quan_cafe",
    timezone: '+00:00',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Đảm bảo múi giờ MySQL = UTC để NOW(), CURDATE() trả về giờ UTC
// Code xử lý + INTERVAL 7 HOUR ở Repository dựa trên UTC gốc
pool.on('connection', (conn) => {
  conn.execute("SET time_zone = '+00:00'");
});

// Xuất ra dạng promise để các Repository dùng được await db.execute()
module.exports = pool.promise();

console.log("MySQL Pool initialized ");