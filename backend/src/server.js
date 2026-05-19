const app = require("./app");
const { PORT } = require("./config/constants");
const { ensureNguyenLieuSchema } = require("./config/ensureSchema");

async function start() {
  try {
    await ensureNguyenLieuSchema();
  } catch (err) {
    console.error("⚠️ Kiểm tra schema nguyenlieu:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}`);
  });
}

start();
