const app = require("./app");
const { PORT } = require("./config/constants");

function start() {
  console.log("\n=== NANG PR COFFEE - KHOI DONG HE THONG ===");

  app.listen(PORT, () => {
    console.log(`\nServer dang chay: http://localhost:${PORT}\n`);
  });
}

start();
