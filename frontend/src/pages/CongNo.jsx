/* =====NHẬP HÀNG & CÔNG NỢ =====
 * Quản lý phiếu nhập kho, theo dõi công nợ nhà cung cấp
 * Tích hợp: lịch sử nhập kho + công nợ + in phiếu
 * ==================================== */
import { useState, useEffect, useCallback } from "react";

import * as congNoService from "../services/congNoService";
import { exportPhieuNhapExcel } from "../utils/bangLuongExport";
import { ToastContainer, useToast } from "../components/Toast";
import PriceInput from "../components/PriceInput";

function moCuaSoIn(html) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép popup cho trang này rồi thử lại.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  const kickOffPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  if (printWindow.document.readyState === "complete") {
    setTimeout(kickOffPrint, 200);
  } else {
    printWindow.addEventListener("load", () => setTimeout(kickOffPrint, 200));
  }

  let daDong = false;
  const dongCuaSo = () => {
    if (daDong) return;
    daDong = true;
    printWindow.close();
  };
  printWindow.addEventListener("afterprint", dongCuaSo);

  setTimeout(dongCuaSo, 60000);
}

/* ── Đọc số tiền bằng chữ (theo quy ước phiếu thu/chi kế toán VN) ── */
function soTienBangChu(soTien) {
  const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const donViNhom = ["", "nghìn", "triệu", "tỷ"];

  function docBaChuSo(baSo, canHienThiTramNeuKhong) {
    const tram = Math.floor(baSo / 100);
    const chuc = Math.floor((baSo % 100) / 10);
    const donVi = baSo % 10;
    const phan = [];

    if (tram > 0) {
      phan.push(chuSo[tram], "trăm");
    } else if (canHienThiTramNeuKhong) {
      phan.push("không", "trăm");
    }

    if (chuc > 1) {
      phan.push(chuSo[chuc], "mươi");
      if (donVi === 1) phan.push("mốt");
      else if (donVi === 5) phan.push("lăm");
      else if (donVi > 0) phan.push(chuSo[donVi]);
    } else if (chuc === 1) {
      phan.push("mười");
      if (donVi === 5) phan.push("lăm");
      else if (donVi > 0) phan.push(chuSo[donVi]);
    } else if (donVi > 0) {
      if (tram > 0 || canHienThiTramNeuKhong) phan.push("linh");
      phan.push(chuSo[donVi]);
    }

    return phan.join(" ");
  }

  let so = Math.floor(Math.abs(Number(soTien) || 0));
  if (so === 0) return "Không đồng";

  const nhom = [];
  while (so > 0) {
    nhom.unshift(so % 1000);
    so = Math.floor(so / 1000);
  }

  const tongSoNhom = nhom.length;
  const cacPhan = [];
  nhom.forEach((giaTri, idx) => {
    if (giaTri === 0) return;
    const canHienThiTram = idx > 0 && giaTri < 100;
    const chu = docBaChuSo(giaTri, canHienThiTram);
    const bacSo = donViNhom[tongSoNhom - idx - 1];
    cacPhan.push(bacSo ? `${chu} ${bacSo}` : chu);
  });

  const cauChu = cacPhan.join(" ").replace(/\s+/g, " ").trim();
  return cauChu.charAt(0).toUpperCase() + cauChu.slice(1) + " đồng";
}

/* ── CSS dùng chung cho các phiếu in — dạng chứng từ kế toán chuyên nghiệp ── */
const CSS_PHIEU_IN = `
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Georgia, serif; color: #1a1a1a; margin: 0; padding: 22px; font-size: 13.5px; line-height: 1.55; }
  .sheet { max-width: 740px; margin: 0 auto; padding: 26px 38px 34px; border: 1px solid #000; }
  .brand-bar { height: 4px; background: #2F5D50; margin: -26px -38px 20px; }
  .letterhead { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 1.5px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
  .brand-name { font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .brand-sub { font-size: 11px; color: #555; margin-top: 2px; }
  .doc-meta { text-align: right; font-size: 12px; color: #333; white-space: nowrap; }
  .doc-meta b { color: #000; }
  .doc-title-block { text-align: center; margin-bottom: 18px; }
  .doc-title { font-size: 21px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
  .doc-subtitle { font-size: 12.5px; font-style: italic; color: #444; margin-top: 4px; }
  .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  .info-grid td { padding: 4.5px 0; font-size: 13.5px; vertical-align: top; }
  .info-grid td.label { width: 190px; color: #333; }
  .info-grid td.value { font-weight: 600; }
  .info-grid tr.amount-row td { border-top: 1px solid #000; padding-top: 12px; margin-top: 4px; }
  .info-grid td.amount-value { font-size: 17px; font-weight: 700; letter-spacing: 0.3px; }
  .info-grid td.words-value { font-weight: 600; font-style: italic; color: #333; }
  .amount-words { font-size: 12.5px; font-style: italic; color: #333; margin-top: 8px; }
  .item-table { width: 100%; border-collapse: collapse; margin: 4px 0 6px; }
  .item-table th { border: 1px solid #000; background: #eeeeec; padding: 7px 6px; font-size: 11.5px; font-weight: 700; text-align: center; text-transform: uppercase; }
  .item-table td { border: 1px solid #000; padding: 6px 8px; font-size: 12.5px; }
  .item-table tbody tr:nth-child(even) { background: #fafaf8; }
  .item-table tfoot td { font-weight: 700; padding: 8px; border-top: 1.5px solid #000; }
  .sign-date { text-align: right; font-size: 12.5px; font-style: italic; color: #333; margin: 24px 0 6px; }
  .signatures { display: flex; justify-content: space-between; text-align: center; margin-top: 4px; }
  .sign-box { flex: 1; }
  .sign-role { font-size: 12.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
  .sign-hint { font-size: 11px; font-style: italic; color: #666; margin-top: 2px; }
  .sign-space { height: 64px; }
  @media print {
    body { padding: 0; }
    .sheet { border: none; max-width: none; }
    .brand-bar { margin: 0 0 20px; }
    @page { size: A4; margin: 14mm; }
  }
`;

function layNgayThangNamHienTai() {
  const now = new Date();
  return `Ngày ${String(now.getDate()).padStart(2, "0")} tháng ${String(now.getMonth() + 1).padStart(2, "0")} năm ${now.getFullYear()}`;
}

/* Định dạng dd/MM/yyyy cố định — không phụ thuộc locale mặc định của từng trình duyệt/hệ điều hành */
function formatDdMmYyyy(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/* ── In phiếu thanh toán công nợ (form giấy tờ) ── */
function inPhieuThanhToan(thanhToan) {
  const date = new Date(thanhToan.ngay_thanh_toan);
  const formattedDate = date.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  const soPhieu = `TT-${String(thanhToan.id).padStart(6, "0")}`;
  const soTien = Number(thanhToan.so_tien || 0);
  const conNo = Number(thanhToan.con_no_sau_khi_tra || 0);

  const html = `
    <html>
      <head>
        <title>Phieu Thanh Toan ${soPhieu}</title>
        <style>${CSS_PHIEU_IN}</style>
      </head>
      <body>
        <div class="sheet">
          <div class="brand-bar"></div>
          <div class="letterhead">
            <div>
              <div class="brand-name">Nắng PR</div>
              <div class="brand-sub">Hệ thống quản lý bán hàng &amp; công nợ</div>
            </div>
            <div class="doc-meta">
              Số: <b>${soPhieu}</b><br />
              Ngày lập: <b>${formatDdMmYyyy(date)}</b>
            </div>
          </div>

          <div class="doc-title-block">
            <p class="doc-title">Phiếu chi</p>
            <p class="doc-subtitle">(Thanh toán công nợ nhà cung cấp)</p>
          </div>

          <table class="info-grid">
            <tr><td class="label">Họ, tên người nhận tiền:</td><td class="value">${thanhToan.nha_cung_cap || "Đại lý tự do"}</td></tr>
            <tr><td class="label">Lý do chi:</td><td class="value">Thanh toán công nợ nhập hàng — Phiếu nhập #${thanhToan.ma_phieu}</td></tr>
            <tr><td class="label">Thời gian thanh toán:</td><td class="value">${formattedDate}</td></tr>
            <tr><td class="label">Ghi chú:</td><td class="value">${thanhToan.ghi_chu || "—"}</td></tr>
            <tr class="amount-row"><td class="label">Số tiền:</td><td class="value amount-value">${soTien.toLocaleString("vi-VN")} đồng</td></tr>
            <tr><td class="label">Viết bằng chữ:</td><td class="value words-value">${soTienBangChu(soTien)}</td></tr>
            <tr><td class="label">Còn nợ lại sau thanh toán:</td><td class="value">${conNo.toLocaleString("vi-VN")} đồng</td></tr>
          </table>

          <div class="sign-date">Nắng PR, ${layNgayThangNamHienTai()}</div>
          <div class="signatures">
            <div class="sign-box">
              <div class="sign-role">Người thanh toán</div>
              <div class="sign-hint">(Ký, ghi rõ họ tên)</div>
              <div class="sign-space"></div>
            </div>
            <div class="sign-box">
              <div class="sign-role">Người nhận tiền</div>
              <div class="sign-hint">(Ký, ghi rõ họ tên)</div>
              <div class="sign-space"></div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
  moCuaSoIn(html);
}

const dinhDangTien = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
const dinhDangNgay = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

const boLocThoiGian = [
  { key: "day", label: "Ngày" },
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
  { key: "year", label: "Năm" },
];

/* ── In phiếu nhập (form giấy tờ) ── */
function inPhieuNhap(phieu) {
  const items = (() => {
    try {
      return Array.isArray(phieu.chi_tiet_hang)
        ? phieu.chi_tiet_hang
        : JSON.parse(phieu.chi_tiet_hang || "[]");
    } catch {
      return [];
    }
  })();

  const targetNCC = phieu.nha_cung_cap || "Dai ly tu do";
  const date = new Date(phieu.ngay_nhap);
  const formattedDate = date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const soPhieu = `PN-${String(phieu.ma_phieu).padStart(6, "0")}`;
  const tongTien = Number(phieu.tong_tien || 0);

  const html = `
    <html>
      <head>
        <title>Phieu Nhap Kho ${soPhieu}</title>
        <style>${CSS_PHIEU_IN}</style>
      </head>
      <body>
        <div class="sheet">
          <div class="brand-bar"></div>
          <div class="letterhead">
            <div>
              <div class="brand-name">Nắng PR</div>
              <div class="brand-sub">Hệ thống quản lý bán hàng &amp; công nợ</div>
            </div>
            <div class="doc-meta">
              Số: <b>${soPhieu}</b><br />
              Ngày lập: <b>${formatDdMmYyyy(date)}</b>
            </div>
          </div>

          <div class="doc-title-block">
            <p class="doc-title">Phiếu nhập kho</p>
            <p class="doc-subtitle">(Nhập hàng từ nhà cung cấp)</p>
          </div>

          <table class="info-grid">
            <tr><td class="label">Nhà cung cấp:</td><td class="value">${targetNCC}</td></tr>
            <tr><td class="label">Thời gian nhập:</td><td class="value">${formattedDate}</td></tr>
            <tr><td class="label">Ghi chú:</td><td class="value">${phieu.ghi_chu || "Nhập kho hệ thống"}</td></tr>
          </table>

          <table class="item-table">
            <thead>
              <tr>
                <th style="width:36px">STT</th>
                <th style="text-align:left">Nguyên liệu</th>
                <th style="width:70px">Số lượng</th>
                <th style="width:60px">ĐVT</th>
                <th style="width:100px">Đơn giá</th>
                <th style="width:120px">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item, i) => `
                <tr>
                  <td style="text-align:center">${i + 1}</td>
                  <td>${item.ten_nguyen_lieu}</td>
                  <td style="text-align:center">${item.so_luong}</td>
                  <td style="text-align:center;text-transform:uppercase">${item.don_vi_nhap || "—"}</td>
                  <td style="text-align:right">${Number(item.gia_nhap).toLocaleString("vi-VN")}</td>
                  <td style="text-align:right">${(Number(item.so_luong) * Number(item.gia_nhap)).toLocaleString("vi-VN")}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" style="text-align:right">Tổng cộng</td>
                <td style="text-align:right">${tongTien.toLocaleString("vi-VN")} đ</td>
              </tr>
            </tfoot>
          </table>
          <div class="amount-words" style="margin-bottom: 18px;">Bằng chữ: ${soTienBangChu(tongTien)}</div>

          <div class="sign-date">Nắng PR, ${layNgayThangNamHienTai()}</div>
          <div class="signatures">
            <div class="sign-box">
              <div class="sign-role">Người lập phiếu</div>
              <div class="sign-hint">(Ký, ghi rõ họ tên)</div>
              <div class="sign-space"></div>
            </div>
            <div class="sign-box">
              <div class="sign-role">Người giao hàng</div>
              <div class="sign-hint">(Ký, ghi rõ họ tên)</div>
              <div class="sign-space"></div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
  moCuaSoIn(html);
}

function SummaryCard({ nhan, giaTri, sub, icon, accent, borderColor }) {
  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ backgroundColor: borderColor || "var(--color-primary)" }} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted">{nhan}</p>
          <p className="text-xl font-bold text-on-surface mt-1 truncate tabular-nums">{giaTri}</p>
          {sub && <p className="text-[11px] text-muted mt-0.5">{sub}</p>}
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 6%, transparent)" }}
        >
          <span className="material-symbols-outlined text-xl" style={{ color: borderColor || "var(--color-primary)" }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Modal thanh toán ── */
function ModalThanhToan({ phieu, onDong, onThanhCong }) {
  const [soTien, setSoTien] = useState("");
  const [dangXuLy, setDangXuLy] = useState(false);
  const { toasts, show: toast, dismiss } = useToast();

  const conNo = Number(phieu?.tong_tien || 0) - Number(phieu?.so_tien_da_tra || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!soTien || Number(soTien) <= 0) return toast("Nhập số tiền thanh toán", "error");
    if (Number(soTien) > conNo) return toast("Số tiền vượt quá công nợ còn lại", "error");
    setDangXuLy(true);
    try {
      await congNoService.payCongNo(phieu.ma_phieu, soTien);
      toast("Thanh toán thành công!");
      onThanhCong();
      onDong();
    } catch (err) {
      toast(err.response?.data?.message || "Lỗi thanh toán", "error");
    } finally {
      setDangXuLy(false);
    }
  };

  if (!phieu) return null;

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onDong} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl animate-fade-in" style={{ backgroundColor: "var(--color-card-bg)", border: "1px solid var(--color-border)" }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-on-surface">Thanh toán công nợ</h3>
            <button onClick={onDong} className="w-7 h-7 rounded-full hover:bg-primary/10 flex items-center justify-center text-muted">
              ✕
            </button>
          </div>
          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Phiếu nhập</span>
              <span className="font-semibold">#{phieu.ma_phieu}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Nhà cung cấp</span>
              <span className="font-semibold">{phieu.nha_cung_cap}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Tổng tiền</span>
              <span className="font-semibold">{dinhDangTien(phieu.tong_tien)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Đã thanh toán</span>
              <span className="font-semibold text-success">{dinhDangTien(phieu.so_tien_da_tra)}</span>
            </div>
            <div className="border-t border-outline pt-3 flex justify-between">
              <span className="font-bold">Còn nợ</span>
              <span className="font-bold text-error text-lg">{dinhDangTien(conNo)}</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Số tiền thanh toán</label>
              <PriceInput
                className="input-field text-lg font-bold"
                value={soTien}
                onChange={(val) => setSoTien(val)}
                placeholder="0"
                required
                autoFocus
              />
              <p className="text-xs text-muted mt-1">Tối đa: {dinhDangTien(conNo)}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onDong} className="btn-outline flex-1">Hủy</button>
              <button type="submit" disabled={dangXuLy} className="btn-primary flex-1">
                {dangXuLy ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/* ── Modal chi tiết phiếu nhập ── */
function ModalChiTiet({ phieu, onDong }) {
  if (!phieu) return null;
  const items = (() => {
    try {
      return Array.isArray(phieu.chi_tiet_hang)
        ? phieu.chi_tiet_hang
        : JSON.parse(phieu.chi_tiet_hang || "[]");
    } catch {
      return [];
    }
  })();

  const conNo = Number(phieu.tong_tien || 0) - Number(phieu.so_tien_da_tra || 0);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onDong} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl animate-fade-in" style={{ backgroundColor: "var(--color-card-bg)", border: "1px solid var(--color-border)" }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            <div>
              <h3 className="font-bold text-on-surface">Phiếu nhập #{phieu.ma_phieu}</h3>
              <p className="text-xs text-muted mt-0.5">{dinhDangNgay(phieu.ngay_nhap)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => inPhieuNhap(phieu)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                title="In phiếu nhập"
              >
                <span className="material-symbols-outlined text-sm">print</span> In
              </button>
              <button
                onClick={onDong}
                className="w-7 h-7 rounded-full hover:bg-primary/10 flex items-center justify-center text-muted"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Thông tin */}
          <div className="px-5 py-3 border-b border-outline space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Nhà cung cấp</span>
              <span className="font-semibold">{phieu.nha_cung_cap}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Tổng tiền</span>
              <span className="font-bold">{dinhDangTien(phieu.tong_tien)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Đã thanh toán</span>
              <span className="font-semibold text-success">{dinhDangTien(phieu.so_tien_da_tra)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Còn nợ</span>
              <span className={`font-bold ${conNo > 0 ? "text-error" : "text-success"}`}>
                {dinhDangTien(conNo)}
              </span>
            </div>
            {phieu.ngay_thanh_toan && (
              <div className="flex justify-between">
                <span className="text-muted">Ngày thanh toán</span>
                <span className="font-semibold">{dinhDangNgay(phieu.ngay_thanh_toan)}</span>
              </div>
            )}
            {phieu.ghi_chu && (
              <div className="flex justify-between">
                <span className="text-muted">Ghi chú</span>
                <span className="font-semibold">{phieu.ghi_chu}</span>
              </div>
            )}
          </div>

          {/* Chi tiết hàng */}
          {items.length > 0 && (
            <div className="px-5 py-3">
              <p className="text-xs font-semibold text-muted uppercase mb-2">Chi tiết hàng nhập</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted font-medium border-b border-outline">
                    <th className="text-left py-1">Nguyên liệu</th>
                    <th className="text-center py-1">Số lượng</th>
                    <th className="text-center py-1">Đơn vị</th>
                    <th className="text-right py-1">Đơn giá</th>
                    <th className="text-right py-1">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-outline/50">
                      <td className="py-2 font-medium">{item.ten_nguyen_lieu}</td>
                      <td className="py-2 text-center">{item.so_luong}</td>
                      <td className="py-2 text-center text-xs text-muted uppercase">{item.don_vi_nhap || "—"}</td>
                      <td className="py-2 text-right">{dinhDangTien(item.gia_nhap)}</td>
                      <td className="py-2 text-right font-semibold">
                        {dinhDangTien(Number(item.so_luong) * Number(item.gia_nhap))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Trang chính ── */
export default function CongNo() {
  const { toasts, show: toast, dismiss } = useToast();
  const [tab, setTab] = useState('import'); // 'import' | 'payment'

  // Tab: Phiếu nhập
  const [danhSach, setDanhSach] = useState([]);
  const [tongSo, setTongSo] = useState(0);
  const [thongKe, setThongKe] = useState({
    tong_con_no: 0,
    so_phieu_no: 0,
    da_tra_trong_thang: 0,
    chi_trong_thang: 0,
    so_ncc_dang_no: 0,
    tong_con_no_ky: 0,
  });
  const [dangTai, setDangTai] = useState(true);

  // Tab: Lịch sử thanh toán
  const [payments, setPayments] = useState([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentsSummary, setPaymentsSummary] = useState({ tong_da_tra: 0, so_lan_thanh_toan: 0 });
  const [dangTaiPayments, setDangTaiPayments] = useState(false);

  // Bộ lọc chung
  const [khoangThoiGian, setKhoangThoiGian] = useState("month");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [boLocTrangThai, setBoLocTrangThai] = useState("no");
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [trang, setTrang] = useState(1);
  const KICH_THUOC_TRANG = 10;

  // Modal
  const [modalThanhToan, setModalThanhToan] = useState(null);
  const [modalChiTiet, setModalChiTiet] = useState(null);

  // Format ngày theo giờ địa phương (YYYY-MM-DD) — nhất quán không bị lệch múi giờ
  const fmtDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Chuyển đổi khoảng thời gian sang from_date/to_date
  const tinhKhoangNgay = useCallback(() => {
    if (tuNgay && denNgay) {
      return { from_date: tuNgay, to_date: denNgay };
    }
    const now = new Date();
    if (khoangThoiGian === "day") {
      const d = fmtDate(now);
      return { from_date: d, to_date: d };
    }
    if (khoangThoiGian === "week") {
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        from_date: fmtDate(monday),
        to_date: fmtDate(sunday),
      };
    }
    if (khoangThoiGian === "month") {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
      return { from_date: `${y}-${m}-01`, to_date: `${y}-${m}-${String(lastDay).padStart(2, "0")}` };
    }
    if (khoangThoiGian === "year") {
      const y = now.getFullYear();
      return { from_date: `${y}-01-01`, to_date: `${y}-12-31` };
    }
    return {};
  }, [khoangThoiGian, tuNgay, denNgay]);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const khoang = tinhKhoangNgay();
      const offset = (trang - 1) * KICH_THUOC_TRANG;
      const [data, thongKeData] = await Promise.all([
        congNoService.getCongNo({
          trang_thai: boLocTrangThai || undefined,
          search: tuKhoaTimKiem || undefined,
          from_date: khoang.from_date,
          to_date: khoang.to_date,
          limit: KICH_THUOC_TRANG,
          offset,
        }),
        congNoService.getCongNoStats({ from_date: khoang.from_date, to_date: khoang.to_date }),
      ]);
      setDanhSach(data.rows || []);
      setTongSo(data.total || 0);
      setThongKe(thongKeData || {});
    } catch (err) {
      toast("Không tải được dữ liệu", "error");
    } finally {
      setDangTai(false);
    }
  }, [tinhKhoangNgay, boLocTrangThai, tuKhoaTimKiem, trang, toast]);

  const taiPayments = useCallback(async () => {
    setDangTaiPayments(true);
    try {
      const khoang = tinhKhoangNgay();
      const offset = (trang - 1) * KICH_THUOC_TRANG;
      const data = await congNoService.getPaymentHistory({
        from_date: khoang.from_date,
        to_date: khoang.to_date,
        search: tuKhoaTimKiem || undefined,
        limit: KICH_THUOC_TRANG,
        offset,
      });
      setPayments(data.rows || []);
      setPaymentsTotal(data.total || 0);
      setPaymentsSummary({ tong_da_tra: data.tong_da_tra || 0, so_lan_thanh_toan: data.so_lan_thanh_toan || 0 });
    } catch (err) {
      toast("Không tải được lịch sử thanh toán", "error");
    } finally {
      setDangTaiPayments(false);
    }
  }, [tinhKhoangNgay, tuKhoaTimKiem, trang, toast]);

  useEffect(() => {
    if (tab === 'import') {
      taiDuLieu();
    } else {
      taiPayments();
    }
  }, [tab, taiDuLieu, taiPayments]);

  useEffect(() => {
    setTrang(1);
  }, [khoangThoiGian, tuNgay, denNgay, boLocTrangThai, tuKhoaTimKiem, tab]);

  const tongTrang = Math.ceil(tongSo / KICH_THUOC_TRANG);

  return (
    <div className="space-y-3 text-on-surface pb-4">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* ── Header + Bộ lọc thời gian (giống DoanhThu) ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Công nợ</h2>
          <p className="text-sm text-muted">Quản lý phiếu nhập kho, theo dõi công nợ NCC</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-fit">
          <div className="flex bg-surface-container-high p-0.5 rounded-lg items-center">
            {boLocThoiGian.map((k) => (
              <button
                key={k.key}
                onClick={() => {
                  setKhoangThoiGian(k.key);
                  setTuNgay(""); setDenNgay("");
                }}
                className={`flex-1 px-2 py-2.5 md:py-4 text-xs font-bold rounded-md transition-all duration-200 text-center ${
                  khoangThoiGian === k.key && !tuNgay
                    ? "bg-primary text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-primary/5"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ backgroundColor: "var(--color-surface-container-high)" }}>
            <input type="date" value={tuNgay}
              onChange={(e) => { setTuNgay(e.target.value); setKhoangThoiGian(""); }}
              className="flex-1 min-w-0 border-none rounded-md px-1.5 py-1 text-xs font-bold focus:ring-1 transition-all"
              style={{ backgroundColor: "var(--color-surface-lowest)", color: "var(--color-on-surface-variant)" }} />
            <span className="text-xs text-muted font-semibold px-0.5 shrink-0">→</span>
            <input type="date" value={denNgay}
              onChange={(e) => { setDenNgay(e.target.value); setKhoangThoiGian(""); }}
              className="flex-1 min-w-0 border-none rounded-md px-1.5 py-1 text-xs font-bold focus:ring-1 transition-all"
              style={{ backgroundColor: "var(--color-surface-lowest)", color: "var(--color-on-surface-variant)" }} />
            {(tuNgay || denNgay) && (
              <button onClick={() => { setTuNgay(""); setDenNgay(""); setKhoangThoiGian("month"); }}
                className="w-5 h-5 flex items-center justify-center rounded text-xs text-muted hover:bg-surface-container-high hover:text-error transition-all shrink-0" title="Xóa">✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 1: Thống kê chính (3 cột) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tổng công nợ */}
        <div className="card p-5 relative overflow-hidden" style={{ backgroundColor: "var(--color-error)" }}>
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--color-on-error)", opacity: 0.7 }}>Tổng công nợ</p>
              <p className="text-2xl md:text-3xl font-bold mt-1 truncate tabular-nums" style={{ color: "var(--color-on-error)" }}>
                {dinhDangTien(thongKe.tong_con_no)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3" style={{ backgroundColor: "color-mix(in srgb, var(--color-on-error) 15%, transparent)" }}>
              <span className="material-symbols-outlined text-xl" style={{ color: "var(--color-on-error)" }}>account_balance</span>
            </div>
          </div>
        </div>

        {/* Công nợ trong kỳ */}
        <SummaryCard
          nhan={`Công nợ trong ${boLocThoiGian.find(k => k.key === khoangThoiGian)?.label || 'kỳ'}`}
          giaTri={dinhDangTien(thongKe.tong_con_no_ky)}
          icon="receipt"
          borderColor="var(--color-warning)"
        />

        {/* Đã thanh toán trong kỳ */}
        <SummaryCard
          nhan={`Đã thanh toán trong ${boLocThoiGian.find(k => k.key === khoangThoiGian)?.label || 'kỳ'}`}
          giaTri={dinhDangTien(thongKe.da_tra_trong_thang)}
          icon="payments"
          borderColor="var(--color-success)"
        />
      </div>

      {/* ── ROW 2: Search (30%) + Filter (30%) + Thống kê nhanh ── */}
      <div className="grid grid-cols-1 sm:grid-cols-10 gap-2">
        {/* Search: 30% - cột 1-3 */}
        <div className="col-span-3 relative">
          <input type="text" placeholder="Tìm kiếm..." value={tuKhoaTimKiem}
            onChange={(e) => { setTuKhoaTimKiem(e.target.value); }}
            className="w-full border-none rounded-xl pl-3 pr-9 py-2 text-sm transition-all h-full focus:ring-1"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)", color: "var(--color-on-surface)" }} />
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-primary)" }}>search</span>
          {tuKhoaTimKiem && (
            <button onClick={() => { setTuKhoaTimKiem(""); }}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-error transition-all z-10" title="Xóa">✕</button>
          )}
        </div>

        {/* Filter: 30% - cột 4-6 */}
        <div className="col-span-3 flex items-center">
          {tab === 'import' ? (
            <div className="flex items-center gap-1 bg-surface-container-high p-0.5 rounded-lg w-full">
              {[
                { key: "no", label: "Đang nợ" },
                { key: "da_tra", label: "Đã thanh toán" },
                { key: "all", label: "Tất cả" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setBoLocTrangThai(opt.key)}
                  className={`flex-1 px-2 py-2.5 md:py-4 text-xs font-bold rounded-md transition-all duration-200 text-center ${
                    boLocTrangThai === opt.key
                      ? "bg-primary text-white shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-primary/5"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border h-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-success) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-success) 20%, transparent)" }}>
              <span className="material-symbols-outlined text-base shrink-0" style={{ color: "var(--color-success)" }}>payments</span>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase text-muted tracking-wider">Đã thanh toán</p>
                <p className="text-sm font-black" style={{ color: "var(--color-success)" }}>{dinhDangTien(paymentsSummary.tong_da_tra)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Thống kê nhanh: 40% - cột 7-10 */}
        {tab === 'import' ? (
          <>
            <div className="col-span-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm border h-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-amber) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-amber) 20%, transparent)" }}>
                <span className="material-symbols-outlined text-base shrink-0" style={{ color: "var(--color-amber)" }}>receipt_long</span>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase text-muted tracking-wider truncate">Phiếu chưa thanh toán</p>
                  <p className="text-base font-black" style={{ color: "var(--color-amber)" }}>{thongKe.so_phieu_no}</p>
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm border h-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-purple) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-purple) 20%, transparent)" }}>
                <span className="material-symbols-outlined text-base shrink-0" style={{ color: "var(--color-purple)" }}>people</span>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase text-muted tracking-wider truncate">Nhà cung cấp đang nợ</p>
                  <p className="text-base font-black" style={{ color: "var(--color-purple)" }}>{thongKe.so_ncc_dang_no}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="col-span-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm border h-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-info) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-info) 20%, transparent)" }}>
                <span className="material-symbols-outlined text-base shrink-0" style={{ color: "var(--color-info)" }}>receipt_long</span>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase text-muted tracking-wider truncate">Số lần thanh toán</p>
                  <p className="text-base font-black" style={{ color: "var(--color-info)" }}>{paymentsSummary.so_lan_thanh_toan}</p>
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm border h-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-success) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-success) 20%, transparent)" }}>
                <span className="material-symbols-outlined text-base shrink-0" style={{ color: "var(--color-success)" }}>payments</span>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase text-muted tracking-wider truncate">Tổng đã thanh toán</p>
                  <p className="text-base font-black" style={{ color: "var(--color-success)" }}>{dinhDangTien(paymentsSummary.tong_da_tra)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Card chứa Tabs + Nội dung ── */}
      <div className="card overflow-hidden">
        {/* Header card: Tabs Phiếu nhập | Phiếu thanh toán */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "color-mix(in srgb, var(--color-surface-container-low) 20%, transparent)" }}>
          <div className="flex gap-1 bg-surface-container-high p-0.5 rounded-lg">
            <button
              onClick={() => setTab('import')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                tab === 'import'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-primary/5'
              }`}
            >
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              Phiếu nhập
              {tab === 'import' && <span className="text-[10px] opacity-70 ml-1">({tongSo})</span>}
            </button>
            <button
              onClick={() => setTab('payment')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                tab === 'payment'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-primary/5'
              }`}
            >
              <span className="material-symbols-outlined text-sm">payments</span>
              Phiếu thanh toán
              {tab === 'payment' && paymentsSummary.so_lan_thanh_toan > 0 && (
                <span className="text-[10px] opacity-70 ml-1">({paymentsTotal})</span>
              )}
            </button>
          </div>

          {/* Nút xuất Excel (chỉ hiện khi tab import) */}
          {tab === 'import' && danhSach.length > 0 && (
            <button
              onClick={() => {
                try {
                  exportPhieuNhapExcel({
                    rows: danhSach,
                    tuNgay: tuNgay || undefined,
                    denNgay: denNgay || undefined,
                  });
                } catch (err) {
                  toast(err.message || "Không thể xuất Excel", "error");
                }
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all hover:bg-primary/10"
              style={{ color: "var(--color-primary)", backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)" }}
            >
              <span className="material-symbols-outlined text-xs">table_chart</span>
              Xuất Excel
            </button>
          )}
        </div>

        {/* Nội dung tab */}
        {tab === 'import' ? (
          <>
            {dangTai ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-8 h-8 border-[3px] rounded-full"
                  style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent", borderRightColor: "transparent" }} />
              </div>
            ) : danhSach.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-muted">
                <span className="material-symbols-outlined text-4xl mb-2">account_balance</span>
                <p className="font-medium">
                  {boLocTrangThai === "no"
                    ? <><span className="material-symbols-outlined text-lg">celebration</span> Không có công nợ nào!</>
                    : "Không có phiếu nhập nào"}
                </p>
                <p className="text-xs mt-1">
                  {boLocTrangThai === "no"
                    ? "Tất cả các phiếu nhập đã được thanh toán đầy đủ."
                    : "Chưa có phiếu nhập kho nào trong khoảng thời gian này."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: "750px" }}>
                  <thead>
                    <tr className="text-[10px] font-bold text-muted uppercase tracking-wider" style={{ backgroundColor: "color-mix(in srgb, var(--color-surface-container-low) 40%, transparent)" }}>
                    <th className="px-4 py-3.5 w-[10%]">Mã phiếu</th>
                    <th className="px-4 py-3.5 w-[15%]">Ngày nhập</th>
                    <th className="px-4 py-3.5 w-[17%]">Nhà cung cấp</th>
                    <th className="px-4 py-3.5 text-right w-[13%]">Tổng tiền</th>
                    <th className="px-4 py-3.5 text-right w-[13%]">Đã thanh toán</th>
                    <th className="px-4 py-3.5 text-right w-[13%]">Còn nợ</th>
                    <th className="px-4 py-3.5 text-center w-[11%]">Trạng thái</th>
                    <th className="px-4 py-3.5 text-center w-[8%]">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                    {danhSach.map((phieu) => {
                      const conNo = Number(phieu.con_no || 0);
                      const isPaid = conNo <= 0;
                      return (
                        <tr key={phieu.ma_phieu} className={`hover:bg-surface-container-low/40 transition-colors ${isPaid ? "opacity-60" : ""}`}>
                          <td className="px-4 py-3.5 w-[10%]">
                            <span className="font-bold text-xs" style={{ color: "var(--color-primary)" }}>#{phieu.ma_phieu}</span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-on-surface-variant whitespace-nowrap w-[15%]">
                            {new Date(phieu.ngay_nhap).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-medium text-on-surface w-[17%]">{phieu.nha_cung_cap}</td>
                          <td className="px-4 py-3.5 text-right font-bold text-xs w-[13%]">{dinhDangTien(phieu.tong_tien)}</td>
                          <td className="px-4 py-3.5 text-right text-xs font-medium w-[13%]" style={{ color: "var(--color-success)" }}>{dinhDangTien(phieu.so_tien_da_tra)}</td>
                          <td className={`px-4 py-3.5 text-right font-bold text-xs w-[13%] ${isPaid ? "text-success" : ""}`} style={{ color: isPaid ? "var(--color-success)" : "var(--color-error)" }}>
                            {dinhDangTien(conNo)}
                          </td>
                          <td className="px-4 py-3.5 text-center w-[11%]">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: "color-mix(in srgb, var(--color-success) 12%, transparent)", color: "var(--color-success)" }}>
                                <span className="material-symbols-outlined text-[10px]">check_circle</span> Đã thanh toán
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: "color-mix(in srgb, var(--color-error) 12%, transparent)", color: "var(--color-error)" }}>
                                <span className="material-symbols-outlined text-[10px]">hourglass_top</span> Chưa thanh toán
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center w-[8%]">
                            <div className="flex items-center justify-center gap-0.5">
                              <button onClick={() => setModalChiTiet(phieu)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all hover:bg-primary/10"
                                style={{ color: "var(--color-primary)" }} title="Chi tiết">
                                <span className="material-symbols-outlined text-sm">visibility</span>
                              </button>
                              <button onClick={() => inPhieuNhap(phieu)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all hover:bg-primary/10"
                                style={{ color: "var(--color-primary)" }} title="In phiếu">
                                <span className="material-symbols-outlined text-sm">print</span>
                              </button>
                              {!isPaid && (
                                <button onClick={() => setModalThanhToan(phieu)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all"
                                  style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)", color: "var(--color-primary)" }} title="Thanh toán">
                                  <span className="material-symbols-outlined text-sm">payments</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {tongTrang > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "var(--color-border)", backgroundColor: "color-mix(in srgb, var(--color-surface-container-low) 40%, transparent)" }}>
                <span className="text-xs text-muted font-medium">
                  {tongSo} phiếu · Trang {trang}/{tongTrang}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setTrang((p) => Math.max(1, p - 1))} disabled={trang <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-surface-container-high"
                    style={{ color: "var(--color-on-surface-variant)" }}>◀</button>
                  {Array.from({ length: tongTrang }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setTrang(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${p === trang ? "text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container-high"}`}
                      style={p === trang ? { backgroundColor: "var(--color-primary)" } : {}}>{p}</button>
                  ))}
                  <button onClick={() => setTrang((p) => Math.min(tongTrang, p + 1))} disabled={trang >= tongTrang}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-surface-container-high"
                    style={{ color: "var(--color-on-surface-variant)" }}>▶</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {dangTaiPayments ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-8 h-8 border-[3px] rounded-full"
                  style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent", borderRightColor: "transparent" }} />
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-muted">
                <span className="material-symbols-outlined text-4xl mb-2">payments</span>
                <p className="font-medium">Chưa có lịch sử thanh toán</p>
                <p className="text-xs mt-1">Chưa có phiếu thanh toán nào trong khoảng thời gian này.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: "750px" }}>
                  <thead>
                    <tr className="text-[10px] font-bold text-muted uppercase tracking-wider" style={{ backgroundColor: "color-mix(in srgb, var(--color-surface-container-low) 40%, transparent)" }}>
                      <th className="px-4 py-3.5 w-[10%]">Mã TT</th>
                      <th className="px-4 py-3.5 w-[12%]">Phiếu nhập</th>
                      <th className="px-4 py-3.5 w-[16%]">Thời gian</th>
                      <th className="px-4 py-3.5 w-[17%]">Nhà cung cấp</th>
                      <th className="px-4 py-3.5 text-right w-[13%]">Số tiền</th>
                      <th className="px-4 py-3.5 text-right w-[13%]">Còn nợ sau TT</th>
                      <th className="px-4 py-3.5 w-[12%]">Ghi chú</th>
                      <th className="px-4 py-3.5 text-center w-[7%]">In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                    {payments.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-xs" style={{ color: "var(--color-primary)" }}>#{item.id}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-on-surface-variant">#{item.ma_phieu}</td>
                        <td className="px-4 py-3.5 text-xs text-on-surface-variant whitespace-nowrap">
                          {new Date(item.ngay_thanh_toan).toLocaleString("vi-VN")}
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium">{item.nha_cung_cap || '—'}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-xs" style={{ color: "var(--color-success)" }}>{dinhDangTien(item.so_tien)}</td>
                        <td className={`px-4 py-3.5 text-right font-bold text-xs ${Number(item.con_no_sau_khi_tra) > 0 ? 'text-error' : 'text-success'}`}>
                          {dinhDangTien(item.con_no_sau_khi_tra)}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted">{item.ghi_chu || '—'}</td>
                        <td className="px-4 py-3.5 text-center">
                          {/* ── In phiếu thanh toán công nợ từ bảng ── */}
                          <button onClick={() => inPhieuThanhToan(item)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all hover:bg-primary/10"
                            style={{ color: "var(--color-primary)" }} title="In phiếu thanh toán">
                            <span className="material-symbols-outlined text-sm">print</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {Math.ceil(paymentsTotal / KICH_THUOC_TRANG) > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "var(--color-border)", backgroundColor: "color-mix(in srgb, var(--color-surface-container-low) 40%, transparent)" }}>
                <span className="text-xs text-muted font-medium">
                  {paymentsTotal} phiếu · Trang {trang}/{Math.ceil(paymentsTotal / KICH_THUOC_TRANG)}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setTrang((p) => Math.max(1, p - 1))} disabled={trang <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-surface-container-high"
                    style={{ color: "var(--color-on-surface-variant)" }}>◀</button>
                  {Array.from({ length: Math.ceil(paymentsTotal / KICH_THUOC_TRANG) }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setTrang(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${p === trang ? "text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container-high"}`}
                      style={p === trang ? { backgroundColor: "var(--color-primary)" } : {}}>{p}</button>
                  ))}
                  <button onClick={() => setTrang((p) => Math.min(Math.ceil(paymentsTotal / KICH_THUOC_TRANG), p + 1))} disabled={trang >= Math.ceil(paymentsTotal / KICH_THUOC_TRANG)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-surface-container-high"
                    style={{ color: "var(--color-on-surface-variant)" }}>▶</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal thanh toán */}
      {modalThanhToan && (
        <ModalThanhToan
          phieu={modalThanhToan}
          onDong={() => setModalThanhToan(null)}
          onThanhCong={taiDuLieu}
        />
      )}

      {/* Modal chi tiết */}
      {modalChiTiet && (
        <ModalChiTiet phieu={modalChiTiet} onDong={() => setModalChiTiet(null)} />
      )}
    </div>
  );
}
