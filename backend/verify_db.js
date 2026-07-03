const db = require("./src/config/database");

async function verify() {
  try {
    console.log("=== KIỂM TRA DATABASE ===\n");

    // Check ban NULL count
    const [b] = await db.execute("SELECT COUNT(*) as cnt FROM ban WHERE trang_thai IS NULL");
    console.log("Ban trang_thai=NULL:", b[0].cnt, b[0].cnt === 0 ? "✅" : "❌");

    // Count records
    const tables = [
      ["Ban", "ban"],
      ["Nguyen lieu", "nguyenlieu"],
      ["Mon", "mon"],
      ["Cong thuc", "congthuc"],
      ["Don hang", "donhang"],
      ["Chi tiet hoa don", "chitiethoadon"],
      ["Phieu nhap", "phieunhap"],
      ["Chi tiet phieu nhap", "chitiet_phieunhap"],
      ["Huy mon log", "huy_mon_log"],
    ];

    for (const [name, table] of tables) {
      const [r] = await db.execute(`SELECT COUNT(*) as cnt FROM \`${table}\``);
      console.log(`${name}: ${r[0].cnt} records`);
    }

    // Check congthuc references
    const [orphanCt] = await db.execute(
      "SELECT COUNT(*) as cnt FROM congthuc ct LEFT JOIN mon m ON ct.ma_mon=m.ma_mon WHERE m.ma_mon IS NULL"
    );
    console.log("Cong thuc orphan (no mon):", orphanCt[0].cnt, orphanCt[0].cnt === 0 ? "✅" : "❌");

    const [orphanCt2] = await db.execute(
      "SELECT COUNT(*) as cnt FROM congthuc ct LEFT JOIN nguyenlieu nl ON ct.ma_nguyen_lieu=nl.ma_nguyen_lieu WHERE nl.ma_nguyen_lieu IS NULL"
    );
    console.log("Cong thuc orphan (no nguyenlieu):", orphanCt2[0].cnt, orphanCt2[0].cnt === 0 ? "✅" : "❌");

    // Check phieunhap payment columns exist
    const [cols] = await db.execute("SHOW COLUMNS FROM phieunhap");
    const hasPayment = cols.some((c) => c.Field === "da_thanh_toan");
    console.log("Phieunhap has payment columns:", hasPayment ? "✅" : "❌");

    console.log("\n✅ Verification complete!");
    await db.end();
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}

verify();
