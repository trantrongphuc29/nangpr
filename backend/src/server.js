const app = require("./app");
const { PORT } = require("./config/constants");
const { ensureNguyenLieuSchema } = require("./config/ensureSchema");
const { ensurePayrollSchema } = require("./config/ensurePayrollSchema");
const { ensureNhanVienSchema } = require("./config/ensureNhanVienSchema");
const { ensurePOSSchema } = require("./config/ensurePOSSchema");
const { ensureCongNoSchema } = require("./config/ensureCongNoSchema");
const { ensureCaLamSchema } = require("./config/ensureCaLamSchema");

async function start() {
  try {
    await ensureNguyenLieuSchema();
  } catch (err) {
    console.error("⚠️ Kiểm tra schema nguyenlieu:", err.message);
  }

  try {
    await ensureNhanVienSchema();
  } catch (err) {
    console.error("⚠️ Kiểm tra schema nhanvien:", err.message);
  }

  try {
    await ensurePayrollSchema();
  } catch (err) {
    console.error("⚠️ Kiểm tra schema payroll:", err.message);
  }

  try {
    await ensurePOSSchema();
  } catch (err) {
    console.error("⚠️ Kiểm tra schema POS:", err.message);
  }

  try {
    await ensureCongNoSchema();
  } catch (err) {
    console.error("⚠️ Kiểm tra schema công nợ:", err.message);
  }

  try {
    await ensureCaLamSchema();
  } catch (err) {
    console.error("⚠️ Kiểm tra schema calam:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}`);
  });
}

start();
