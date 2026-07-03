const db = require("./database");

async function ensureCaLamSchema() {
  // Tạo bảng calam nếu chưa tồn tại
  await db.execute(`
    CREATE TABLE IF NOT EXISTS calam (
      ma_ca INT NOT NULL AUTO_INCREMENT,
      buoi VARCHAR(50) DEFAULT NULL,
      ngay DATE DEFAULT NULL,
      PRIMARY KEY (ma_ca)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // Chèn dữ liệu mặc định nếu bảng đang trống
  const [rows] = await db.execute("SELECT COUNT(*) AS cnt FROM calam");
  if (rows[0].cnt === 0) {
    await db.execute(
      `INSERT INTO calam (ma_ca, buoi, ngay) VALUES (1, 'Ca Sáng', NULL), (2, 'Ca Chiều', NULL), (3, 'Ca Tối', NULL)`
    );
    console.log("✅ Đã thêm dữ liệu mặc định cho bảng calam");
  }

  console.log("✅ Đã đảm bảo schema calam");
}

module.exports = { ensureCaLamSchema };
