/* ===== KIEM TRA TOAN BO HE THONG =====
 * Gom: kiem tra database + API + nghiep vu
 * Chay: node test.js
 * Yeu cau: DB dang chay, server backend dang chay o cong 3001
 * ===================================== */
const db = require("./src/config/database");
const http = require("http");

// === Ket qua ===
let pass = 0, fail = 0;
const errors = [];

function ghiNhan(ok, label, detail) {
  if (ok) { console.log("  [PASS] " + label); pass++; }
  else {
    console.log("  [FAIL] " + label + (detail ? " -> " + detail : ""));
    fail++; errors.push({ label, detail });
  }
}

function nganCach(title) { console.log("\n--- " + title + " ---"); }

async function demBang(table) {
  const [r] = await db.execute("SELECT COUNT(*) as cnt FROM `" + table + "`");
  return r[0].cnt;
}

// === API helpers ===
let TOKEN = null;

function api(path, method, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      method: method || "GET",
      hostname: "localhost",
      port: 3001,
      path: path,
      headers: { "Content-Type": "application/json" },
    };
    if (TOKEN) opts.headers["Authorization"] = "Bearer " + TOKEN;
    const req = http.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data: data }); }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function testAPI(name, fn) {
  return fn().then((r) => {
    const ok = r.status >= 200 && r.status < 400;
    ghiNhan(ok, name, ok ? "" : r.status + " " + (r.data?.message || JSON.stringify(r.data).slice(0, 120)));
  }).catch((e) => { ghiNhan(false, name, e.message); });
}

// Lay JSON data tu API (de luu lai ket qua)
function layData(name, fn) {
  return fn().then((r) => {
    if (r.status >= 200 && r.status < 400) return r.data;
    ghiNhan(false, name + " (lay data that bai)", r.status + " " + (r.data?.message || ""));
    return null;
  }).catch((e) => {
    ghiNhan(false, name + " (lay data that bai)", e.message);
    return null;
  });
}

// === MAIN ===
async function run() {
  console.log("========== KIEM TRA TOAN BO HE THONG ==========");

  // ============================
  // 1. KIEM TRA DATABASE
  // ============================
  console.log("\n========== 1. DATABASE ==========");

  nganCach("Kiem tra cau truc bang");
  try {
    const [banNull] = await db.execute("SELECT COUNT(*) as cnt FROM ban WHERE trang_thai IS NULL");
    ghiNhan(banNull[0].cnt === 0, "Ban: khong co trang_thai=NULL", banNull[0].cnt + " dong NULL");

    const [orphanMon] = await db.execute("SELECT COUNT(*) as cnt FROM congthuc ct LEFT JOIN mon m ON ct.ma_mon=m.ma_mon WHERE m.ma_mon IS NULL");
    ghiNhan(orphanMon[0].cnt === 0, "Cong thuc: khong co ban ghi le (thieu mon)", orphanMon[0].cnt + " ban ghi le");

    const [orphanNL] = await db.execute("SELECT COUNT(*) as cnt FROM congthuc ct LEFT JOIN nguyenlieu nl ON ct.ma_nguyen_lieu=nl.ma_nguyen_lieu WHERE nl.ma_nguyen_lieu IS NULL");
    ghiNhan(orphanNL[0].cnt === 0, "Cong thuc: khong co ban ghi le (thieu nguyen lieu)", orphanNL[0].cnt + " ban ghi le");

    const [phieuCols] = await db.execute("SHOW COLUMNS FROM phieunhap");
    const hasDaThanhToan = phieuCols.some((c) => c.Field === "da_thanh_toan");
    const hasSoTienDaTra = phieuCols.some((c) => c.Field === "so_tien_da_tra");
    ghiNhan(hasDaThanhToan && hasSoTienDaTra, "Phieunhap: co du cot thanh toan");
  } catch (e) { ghiNhan(false, "Loi kiem tra cau truc bang", e.message); }

  nganCach("So luong ban ghi");
  const tables = [
    ["ban","Ban"],["nguyenlieu","Nguyen lieu"],["mon","Mon"],["congthuc","Cong thuc"],
    ["donhang","Don hang"],["chitiethoadon","Chi tiet hoa don"],
    ["phieunhap","Phieu nhap"],["chitiet_phieunhap","Chi tiet phieu nhap"],
    ["huy_mon_log","Huy mon log"],["nhanvien","Nhan vien"],
    ["lich_su_thanh_toan","Lich su thanh toan"],["lich_su_nguyen_lieu_het_han","Nguyen lieu het han"],
    ["calam","Ca lam"],["phancong","Phan cong"],["kyluong","Ky luong"],
    ["bangluong","Bang luong"],["bangcong","Bang cong"],["luongnhanvien","Luong nhan vien"],
  ];
  for (const [tenBang, tenHienThi] of tables) {
    try { console.log("  [INFO] " + tenHienThi + ": " + await demBang(tenBang) + " dong"); }
    catch { console.log("  [INFO] " + tenHienThi + ": (khong co bang)"); }
  }

  // ============================
  // 2. KIEM TRA API
  // ============================
  console.log("\n========== 2. API ==========");
  let apiOk = true;

  nganCach("Dang nhap");
  try {
    const login = await api("/api/login", "POST", { ten_dang_nhap: "admin", mat_khau: "admin123" });
    if (login.data?.token) { TOKEN = login.data.token; ghiNhan(true, "Dang nhap admin thanh cong"); }
    else { ghiNhan(false, "Dang nhap that bai", JSON.stringify(login.data).slice(0, 100)); apiOk = false; }
  } catch (e) { ghiNhan(false, "Dang nhap that bai (server khong phan hoi)", e.message); apiOk = false; }

  if (apiOk) {
    nganCach("Nguyen lieu API");
    await testAPI("GET /api/nguyenlieu", () => api("/api/nguyenlieu"));
    await testAPI("GET /api/nguyenlieu/categories", () => api("/api/nguyenlieu/categories"));
    await testAPI("GET /api/nguyenlieu/stats", () => api("/api/nguyenlieu/stats"));
    await testAPI("GET /api/nguyenlieu/history", () => api("/api/nguyenlieu/history"));
    await testAPI("GET /api/nguyenlieu/expired-history", () => api("/api/nguyenlieu/expired-history"));

    nganCach("Mon & Cong thuc API");
    await testAPI("GET /api/mon", () => api("/api/mon"));
    await testAPI("GET /api/mon/categories", () => api("/api/mon/categories"));
    await testAPI("GET /api/mon/pos", () => api("/api/mon/pos"));

    nganCach("Ban API");
    await testAPI("GET /api/ban", () => api("/api/ban"));
    await testAPI("GET /api/ban/pos", () => api("/api/ban/pos"));

    nganCach("Ban hang (POS) API");
    await testAPI("GET /api/pos/ban", () => api("/api/pos/ban"));
    await testAPI("GET /api/pos/revenue?period=month&limit=5", () => api("/api/pos/revenue?period=month&limit=5"));
    await testAPI("GET /api/pos/completed-orders?limit=5", () => api("/api/pos/completed-orders?limit=5"));
    await testAPI("GET /api/pos/cancel-history?limit=5", () => api("/api/pos/cancel-history?limit=5"));
    await testAPI("GET /api/pos/bar/queue", () => api("/api/pos/bar/queue"));

    nganCach("Cong no API");
    await testAPI("GET /api/congno?limit=5", () => api("/api/congno?limit=5"));
    await testAPI("GET /api/congno/stats", () => api("/api/congno/stats"));
    await testAPI("GET /api/congno/payments?limit=5", () => api("/api/congno/payments?limit=5"));

    nganCach("Nhan vien API");
    await testAPI("GET /api/nhanvien", () => api("/api/nhanvien"));
    await testAPI("GET /api/nhanvien/lich-phan-cong", () => api("/api/nhanvien/lich-phan-cong"));

    nganCach("Luong & Cham cong API");
    await testAPI("GET /api/payroll/bang-cong", () => api("/api/payroll/bang-cong"));
    await testAPI("GET /api/payroll/bang-cong/chi-tiet", () => api("/api/payroll/bang-cong/chi-tiet"));
    await testAPI("GET /api/payroll/bang-luong", () => api("/api/payroll/bang-luong"));
    await testAPI("GET /api/payroll/luong-nhan-vien", () => api("/api/payroll/luong-nhan-vien"));
  }

  // ============================
  // 3. KIEM TRA NGHIEP VU
  // ============================
  console.log("\n========== 3. NGHIEP VU ==========");

  // --- Luu ID can cleanup ---
  const canClean = { nguyenLieuIds: [], nhanVienIds: [], monIds: [], donHangIds: [], phieuNhapIds: [] };

  // ====== FLOW 1: NGUYEN LIEU ======
  console.log("\n========== FLOW 1: Nhap kho & Ton kho ==========");

  // Lay danh sach nguyen lieu hien co
  let dsNL = await layData("Lay danh sach NL", () => api("/api/nguyenlieu"));
  const nlBanDau = Array.isArray(dsNL) ? dsNL.length : 0;

  if (apiOk) {
    // Buoc 1: Tao nguyen lieu moi
    const taoNL = await api("/api/nguyenlieu", "POST", {
      ten_nguyen_lieu: "[Test] Nguyen lieu A",
      danh_muc: "Nguyen lieu pha che",
      don_vi_tinh: "g",
      don_vi_nhap: "kg",
      dung_tich_san_pham: 1000,
      nguong_canh_bao: 100,
      ghi_chu: "Tao boi test",
    });
    const maNL = taoNL.data?.id || taoNL.data?.data?.ma_nguyen_lieu;
    ghiNhan(maNL != null, "Tao nguyen lieu moi", maNL ? "id=" + maNL : JSON.stringify(taoNL.data).slice(0, 80));
    if (maNL) canClean.nguyenLieuIds.push(maNL);

    // Buoc 2: Kiem tra so luong NL tang
    if (maNL) {
      dsNL = await layData("Kiem tra DS NL sau khi tao", () => api("/api/nguyenlieu"));
      const nlSauTao = Array.isArray(dsNL) ? dsNL.length : 0;
      ghiNhan(nlSauTao === nlBanDau + 1, "So luong NL tang 1", nlBanDau + " -> " + nlSauTao);
    }

    // Buoc 3: Nhap kho
    if (maNL) {
      const nhapKho = await api("/api/nguyenlieu/import", "POST", {
        items: [{ ma_nguyen_lieu: maNL, so_luong: 10, gia_nhap: 50000 }],
        nha_cung_cap: "Nha cung cap test",
        ngay_nhap: new Date().toISOString().split("T")[0],
        ghi_chu: "Nhap test",
      });
      ghiNhan(nhapKho.status === 201, "Nhap kho 10 don vi (50.000d/dv)", nhapKho.data?.message || "");

      // Lay ma phieu nhap de cleanup
      if (nhapKho.data?.data?.ma_phieu) canClean.phieuNhapIds.push(nhapKho.data.data.ma_phieu);
    }

    // Buoc 4: Kiem tra ton kho tang
    if (maNL) {
      dsNL = await layData("Kiem tra DS NL sau khi nhap", () => api("/api/nguyenlieu"));
      const item = Array.isArray(dsNL) ? dsNL.find(n => String(n.ma_nguyen_lieu) === String(maNL)) : null;
      // Neu NL pha che va nhap 10kg, ton kho goc tang 10*1000=10000g
      if (item) {
        const tonKho = Number(item.ton_kho);
        ghiNhan(tonKho >= 10000, "Ton kho sau nhap >= 10000 " + (item.don_vi_tinh || ""), "ton_kho=" + tonKho);
      }
    }
  }

  // ====== FLOW 2: BAN HANG ======
  console.log("\n========== FLOW 2: Ban hang & Thanh toan ==========");

  if (apiOk) {
    // Lay danh sach mon de them vao don
    const dsMon = await layData("Lay danh sach mon", () => api("/api/mon/pos"));
    const dsMonArr = Array.isArray(dsMon) ? dsMon : Array.isArray(dsMon?.data) ? dsMon.data : [];
    const coMon = dsMonArr.length > 0;

    // Buoc 1: Mo don hang
    const openData = await api("/api/pos/open", "POST", { loai_don: "tai_cho" });
    const maDon = openData.data?.ma_don_hang;
    ghiNhan(maDon != null, "Mo don hang moi", maDon ? "ma_don_hang=" + maDon : JSON.stringify(openData.data).slice(0, 80));
    if (maDon) canClean.donHangIds.push(maDon);

    // Buoc 2: Them mon vao don (neu co mon)
    if (maDon && coMon) {
      const monDauTien = dsMonArr[0];
      const themMon = await api("/api/pos/" + maDon + "/items", "POST", {
        ma_mon: monDauTien.ma_mon, so_luong: 2
      });
      ghiNhan(themMon.status < 400, "Them mon '" + (monDauTien.ten_mon || "") + "' x2 vao don", themMon.data?.message || "");

      // Buoc 3: Gui xuong bar
      const guiBar = await api("/api/pos/" + maDon + "/gui-bar", "POST");
      ghiNhan(guiBar.status < 400, "Gui bar (tru kho)", guiBar.data?.message || "");

      // Buoc 4: Kiem tra bar queue
      const barQueue = await layData("Kiem tra bar queue", () => api("/api/pos/bar/queue"));
      ghiNhan(Array.isArray(barQueue), "Bar queue tra ve danh sach");

      // Buoc 5: Thanh toan
      const thanhToan = await api("/api/pos/" + maDon + "/checkout", "POST", { hinh_thuc_thanh_toan: "tien_mat" });
      ghiNhan(thanhToan.status < 400, "Thanh toan don hang", thanhToan.data?.message || "");

      // Buoc 6: Kiem tra doanh thu tang
      const dtTruoc = await layData("Doanh thu ban dau", () => api("/api/pos/revenue?period=month&limit=1"));
      const doanhThuTruoc = dtTruoc?.summary?.total_revenue || 0;
      // So sanh: doanh thu phai >= don_gia * 2
      const donGia = Number(monDauTien.gia_ban || 0);
      ghiNhan(donGia > 0, "Don gia mon > 0", donGia + "d");
      const doanhThuKyVong = donGia * 2;
      ghiNhan(doanhThuTruoc >= doanhThuKyVong, "Doanh thu tang >= " + doanhThuKyVong.toLocaleString("vi-VN") + "d",
        "doanh thu=" + doanhThuTruoc.toLocaleString("vi-VN") + "d");
    } else if (maDon && !coMon) {
      // Khong co mon -> chi test mo don va huy
      console.log("  [SKIP] Khong co mon trong DB -> bo qua test them mon/thanh toan");
      const huyDon = await api("/api/pos/" + maDon + "/cancel", "POST");
      ghiNhan(huyDon.status < 400, "Huy don (khong co mon)", huyDon.data?.message || "");
    }
  }

  // ====== FLOW 3: CONG NO ======
  console.log("\n========== FLOW 3: Cong no & Thanh toan ==========");

  if (apiOk) {
    // Lay danh sach cong no
    const dsNo = await layData("Lay DS cong no", () => api("/api/congno?limit=50"));
    const dsNoArr = Array.isArray(dsNo?.rows) ? dsNo.rows : [];
    const phieuDangNo = dsNoArr.filter(p => Number(p.con_no || 0) > 0);

    if (phieuDangNo.length > 0) {
      // Buoc 1: Thanh toan 1 phan cho phieu dang no dau tien
      const phieu = phieuDangNo[0];
      const conNo = Number(phieu.con_no || 0);
      const soTienTT = Math.min(10000, conNo);

      const thanhToan = await api("/api/congno/" + phieu.ma_phieu + "/pay", "PUT", { so_tien: soTienTT });
      ghiNhan(thanhToan.status < 400,
        "Thanh toan " + soTienTT.toLocaleString("vi-VN") + "d cho phieu #" + phieu.ma_phieu,
        thanhToan.data?.message || "");

      // Buoc 2: Kiem tra lich su thanh toan
      const lsTT = await layData("Kiem tra lich su thanh toan", () => api("/api/congno/payments?limit=5"));
      ghiNhan(Array.isArray(lsTT?.rows) && lsTT.rows.length > 0, "Lich su thanh toan co du lieu",
        lsTT?.rows?.length + " ban ghi");
    } else {
      // Tao phieu no bang cach nhap kho
      console.log("  [INFO] Khong co phieu dang no -> tao phieu no test");

      // Tao 1 NL test
      const taoNL2 = await api("/api/nguyenlieu", "POST", {
        ten_nguyen_lieu: "[Test] Nguyen lieu B (cong no)",
        danh_muc: "Nguyen lieu pha che",
        don_vi_tinh: "g", don_vi_nhap: "kg",
        dung_tich_san_pham: 1000, nguong_canh_bao: 100,
      });
      const maNL2 = taoNL2.data?.id || taoNL2.data?.data?.ma_nguyen_lieu;
      if (maNL2) canClean.nguyenLieuIds.push(maNL2);

      if (maNL2) {
        const nhapKho2 = await api("/api/nguyenlieu/import", "POST", {
          items: [{ ma_nguyen_lieu: maNL2, so_luong: 5, gia_nhap: 200000 }],
          nha_cung_cap: "NCC test cong no",
          ngay_nhap: new Date().toISOString().split("T")[0],
          ghi_chu: "Tao cong no test",
        });
        ghiNhan(nhapKho2.status === 201, "Nhap kho 5 don vi (200.000d/dv) => tao cong no",
          nhapKho2.data?.message || "");

        // Lay lai DS cong no
        const dsNo2 = await layData("Lay DS cong no sau khi nhap", () => api("/api/congno?limit=50"));
        const dsNo2Arr = Array.isArray(dsNo2?.rows) ? dsNo2.rows : [];
        const phieuMoi = dsNo2Arr.filter(p => Number(p.con_no || 0) > 0);

        if (phieuMoi.length > 0) {
          const phieu2 = phieuMoi[0];
          const tt2 = await api("/api/congno/" + phieu2.ma_phieu + "/pay", "PUT", { so_tien: 50000 });
          ghiNhan(tt2.status < 400, "Thanh toan 50.000d cho phieu #" + phieu2.ma_phieu, tt2.data?.message || "");

          const lsTT2 = await layData("Kiem tra lich su thanh toan", () => api("/api/congno/payments?limit=5"));
          ghiNhan(Array.isArray(lsTT2?.rows) && lsTT2.rows.length > 0, "Lich su thanh toan co du lieu",
            lsTT2?.rows?.length + " ban ghi");
        }
      }
    }
  }

  // ====== FLOW 4: NHAN VIEN ======
  console.log("\n========== FLOW 4: Nhan vien (CRUD) ==========");

  if (apiOk) {
    // Buoc 1: Tao nhan vien
    const taoNV = await api("/api/nhanvien", "POST", {
      ten_nhan_vien: "[Test] Nguyen Van A",
      so_dien_thoai: "0900000000",
      chuc_vu: "Pha che",
      ngay_bat_dau: new Date().toISOString().split("T")[0],
    });
    const maNV = taoNV.data?.id;
    ghiNhan(maNV != null, "Tao nhan vien moi", maNV ? "id=" + maNV : JSON.stringify(taoNV.data).slice(0, 80));
    if (maNV) canClean.nhanVienIds.push(maNV);

    // Buoc 2: Cap nhat nhan vien
    if (maNV) {
      const updateNV = await api("/api/nhanvien/" + maNV, "PUT", {
        ten_nhan_vien: "[Test] Nguyen Van A (da cap nhat)",
        so_dien_thoai: "0900000001",
      });
      ghiNhan(updateNV.status < 400, "Cap nhat nhan vien #" + maNV, updateNV.data?.message || "");
    }

    // Buoc 3: Xoa nhan vien (don dep trong cleanup)
    // Khong xoa ngay de kiem tra DS co them
    if (maNV) {
      const dsNV = await layData("Kiem tra DS nhan vien sau khi tao", () => api("/api/nhanvien"));
      const coNV = Array.isArray(dsNV) && dsNV.some(n => String(n.ma_nhan_vien) === String(maNV));
      ghiNhan(coNV, "Nhan vien moi xuat hien trong danh sach");
    }
  }

  // ============================
  // 4. DON DEP (CLEANUP)
  // ============================
  // QUAN TRONG: xoa theo thu tu FK tu con -> cha
  // 1. Xoa phieu nhap (DB) -- giai phong FK chitiet_phieunhap -> nguyenlieu
  // 2. Xoa don hang (DB)
  // 3. Xoa nguyen lieu (API)
  // 4. Xoa nhan vien (API)
  console.log("\n========== 4. DON DEP DU LIEU TEST ==========");

  // Buoc 1: Xoa phieu nhap (DB truoc, giai phong FK)
  for (const id of canClean.phieuNhapIds) {
    try {
      await db.execute("DELETE FROM lich_su_thanh_toan WHERE ma_phieu = ?", [id]);
      await db.execute("DELETE FROM chitiet_phieunhap WHERE ma_phieu = ?", [id]);
      await db.execute("DELETE FROM phieunhap WHERE ma_phieu = ?", [id]);
      console.log("  [CLEAN] Da xoa phieu nhap #" + id);
    } catch (e) { console.log("  [CLEAN] Loi xoa phieu nhap #" + id + ": " + e.message); }
  }

  // Buoc 2: Xoa don hang (DB)
  for (const id of canClean.donHangIds) {
    try {
      await db.execute("DELETE FROM chitiethoadon WHERE ma_don_hang = ?", [id]);
      await db.execute("DELETE FROM huy_mon_log WHERE ma_don_hang = ?", [id]);
      await db.execute("DELETE FROM donhang WHERE ma_don_hang = ?", [id]);
      console.log("  [CLEAN] Da xoa don hang #" + id);
    } catch (e) { console.log("  [CLEAN] Loi xoa don hang #" + id + ": " + e.message); }
  }

  // Buoc 3: Xoa nguyen lieu (API) -- FK da duoc giai phong o buoc 1
  for (const id of canClean.nguyenLieuIds) {
    try {
      await api("/api/nguyenlieu/" + id, "DELETE");
      console.log("  [CLEAN] Da xoa nguyen lieu #" + id);
    } catch { console.log("  [CLEAN] Khong the xoa nguyen lieu #" + id + " (co the da duoc xu ly truoc)"); }
  }

  // Buoc 4: Xoa nhan vien (API)
  for (const id of canClean.nhanVienIds) {
    try {
      await api("/api/nhanvien/" + id, "DELETE");
      console.log("  [CLEAN] Da xoa nhan vien #" + id);
    } catch { console.log("  [CLEAN] Khong the xoa nhan vien #" + id); }
  }

  // ============================
  // KET QUA
  // ============================
  console.log("\n========== KET QUA ==========");
  console.log("  PASS: " + pass);
  console.log("  FAIL: " + fail);
  console.log("  TONG: " + (pass + fail));

  if (errors.length > 0) {
    console.log("\nCHI TIET LOI:");
    for (const e of errors) {
      console.log("  - " + e.label + (e.detail ? ": " + e.detail : ""));
    }
  }

  await db.end();
  process.exit(fail > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error("\n[FAIL] Loi he thong: " + e.message);
  process.exit(1);
});
