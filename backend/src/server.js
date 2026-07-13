const app = require("./app");
const { PORT } = require("./config/constants");
const { ensureNguyenLieuSchema, ensureDiscardTable } = require("./config/ensureSchema");
const { ensurePayrollSchema } = require("./config/ensurePayrollSchema");
const { ensureNhanVienSchema } = require("./config/ensureNhanVienSchema");
const { ensurePOSSchema } = require("./config/ensurePOSSchema");
const { ensureCongNoSchema } = require("./config/ensureCongNoSchema");
const { ensureCaLamSchema } = require("./config/ensureCaLamSchema");
const { ensureCaLinhHoatSchema } = require("./config/ensureCaLinhHoatSchema");

const MODULES = [
  { name: "Nguyên liệu và Hạn sử dụng", fn: async () => { await ensureNguyenLieuSchema(); await ensureDiscardTable(); } },
  { name: "Nhân viên",                fn: ensureNhanVienSchema },
  { name: "Lương/Ca",       fn: ensurePayrollSchema },
  { name: "Bán hàng",           fn: ensurePOSSchema },
  { name: "Công nợ",                  fn: ensureCongNoSchema },
  { name: "Ca làm",                   fn: ensureCaLamSchema },
  { name: "Ca linh hoạt",             fn: ensureCaLinhHoatSchema },
];

async function start() {
  console.log("\n=== NANG PR COFFEE - KHOI DONG HE THONG ===");

  const ok = [];
  const fail = [];

  for (const mod of MODULES) {
    try {
      await mod.fn();
      ok.push(mod.name);
    } catch (err) {
      fail.push({ name: mod.name, error: err.message });
    }
  }

  console.log("\nCac module OK:");
  for (const name of ok) {
    console.log(`  - ${name}`);
  }

  if (fail.length > 0) {
    console.log("\nModule loi:");
    for (const { name, error } of fail) {
      console.log(`  - ${name}: ${error}`);
    }
  }

  app.listen(PORT, () => {
    console.log(`\nServer dang chay: http://localhost:${PORT}\n`);
  });
}

start();
