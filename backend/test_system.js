/* ===== 🧪 HỆ THỐNG TEST SCRIPT =====
 * Kiểm tra toàn bộ API modules
 * ================================== */
const db = require("./src/config/database");
const http = require("http");

const BASE = "http://localhost:3001";
let TOKEN = null;
const results = { pass: 0, fail: 0, errors: [] };

function api(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      method,
      hostname: "localhost",
      port: 3001,
      path,
      headers: { "Content-Type": "application/json" },
    };
    if (TOKEN) opts.headers["Authorization"] = `Bearer ${TOKEN}`;

    const req = http.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function test(name, fn) {
  return fn()
    .then((r) => {
      if (r.status >= 200 && r.status < 400) {
        console.log(`  ✅ ${name} (${r.status})`);
        results.pass++;
      } else {
        console.log(`  ❌ ${name} (${r.status}): ${JSON.stringify(r.data).slice(0, 100)}`);
        results.fail++;
        results.errors.push({ name, status: r.status, data: r.data });
      }
    })
    .catch((e) => {
      console.log(`  ❌ ${name}: ${e.message}`);
      results.fail++;
      results.errors.push({ name, error: e.message });
    });
}

async function run() {
  console.log("\n=== 🧪 KIỂM TRA TOÀN BỘ HỆ THỐNG ===\n");

  // 1. Login
  console.log("--- AUTH ---");
  const login = await api("/api/login", "POST", {
    ten_dang_nhap: "admin",
    mat_khau: "admin123",
  });
  if (login.data?.token) {
    TOKEN = login.data.token;
    console.log(`  ✅ Login thành công (token: ${TOKEN.slice(0, 20)}...)`);
    results.pass++;
  } else {
    console.log(`  ❌ Login thất bại: ${JSON.stringify(login.data)}`);
    results.fail++;
  }

  // 2. Nguyên liệu
  console.log("\n--- NGUYÊN LIỆU ---");
  await test("GET /api/nguyenlieu", () => api("/api/nguyenlieu"));
  await test("GET /api/nguyenlieu/categories", () => api("/api/nguyenlieu/categories"));
  await test("GET /api/nguyenlieu/stats", () => api("/api/nguyenlieu/stats"));
  await test("GET /api/nguyenlieu/history", () => api("/api/nguyenlieu/history"));

  // 3. Món & Công thức
  console.log("\n--- MÓN & CÔNG THỨC ---");
  await test("GET /api/mon", () => api("/api/mon"));

  // 4. Bàn
  console.log("\n--- BÀN ---");
  await test("GET /api/ban", () => api("/api/ban"));

  // 5. POS (Bán hàng)
  if (TOKEN) {
    console.log("\n--- BÁN HÀNG (POS) ---");
    await test("GET /api/pos/ban", () => api("/api/pos/ban"));
    await test("GET /api/pos/revenue?period=month", () =>
      api("/api/pos/revenue?period=month&limit=5")
    );
    await test("GET /api/pos/completed-orders?limit=5", () =>
      api("/api/pos/completed-orders?limit=5")
    );
    await test("GET /api/pos/cancel-history?limit=5", () =>
      api("/api/pos/cancel-history?limit=5")
    );
  }

  // 6. Công nợ
  console.log("\n--- CÔNG NỢ ---");
  await test("GET /api/congno", () => api("/api/congno?limit=5"));
  await test("GET /api/congno/stats", () => api("/api/congno/stats"));

  // 7. Nhân viên
  console.log("\n--- NHÂN VIÊN ---");
  await test("GET /api/nhanvien", () => api("/api/nhanvien"));

  // Summary
  console.log(`\n=== 📊 KẾT QUẢ ===`);
  console.log(`✅ Pass: ${results.pass}`);
  console.log(`❌ Fail: ${results.fail}`);
  if (results.errors.length > 0) {
    console.log(`\nChi tiết lỗi:`);
    results.errors.forEach((e) => {
      console.log(`  - ${e.name}: ${e.data?.message || e.error || JSON.stringify(e.data).slice(0, 100)}`);
    });
  }

  await db.end();
  process.exit(results.fail > 0 ? 1 : 0);
}

run().catch(console.error);
