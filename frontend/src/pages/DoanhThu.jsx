/* =====  DOANH THU - TRANG CHÍNH =====
 * Giao diện tổng hợp doanh thu bán hàng, món đã hủy
 * và tổng doanh thu sau khi trừ công nợ nhà cung cấp
 * ======================================= */
import { useState, useEffect, useCallback, useMemo } from "react";
import { getAllCancelHistory, getRevenueReport } from "../services/donHangService";
import { getCongNoStats } from "../services/congNoService";
import { exportDoanhThuExcel } from "../utils/bangLuongExport";

const dinhDangTien = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
const dinhDangNgay = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
};

const loaiDonLabel = {
  tai_cho: "Tại chỗ",
  mang_ve: "Mang về",
  giao_hang: "Giao hàng",
};

const hinhThucThanhToanLabel = {
  tien_mat: "Tiền mặt",
  chuyen_khoan: "Chuyển khoản",
};

const CAC_KHOANG_THOI_GIAN = [
  { key: "day", label: "Ngày" },
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
  { key: "year", label: "Năm" },
];

/* ── Print helpers ── */
function baseHTML(body) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>In don hang</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Courier New',monospace;color:#000;background:#fff;font-size:13px;line-height:1.4}
  @media print{body{background:#fff}}
  table{width:100%;border-collapse:collapse}
  td,th{padding:4px 6px;font-size:13px}
  .line{border-top:1px solid #000;margin:8px 0}
  .center{text-align:center}
  .right{text-align:right}
  .bold{font-weight:700}
  .small{font-size:11px}
  .xsmall{font-size:10px}
  .mt8{margin-top:8px}
  .mt4{margin-top:4px}
  .mb8{margin-bottom:8px}
  .mb4{margin-bottom:4px}
</style></head>
<body>${body}</body></html>`;
}

/* ── In hóa đơn chi tiết đơn hàng (dạng bill nhỏ) ── */
function buildPrintBill(order, loaiDonLabel, hinhThucThanhToanLabel) {
  const items = order?.items || [];
  const tien = Number(order.tong_tien || 0);
  const phi = Number(order.phi_giao_hang || 0);
  const isGiaoHang = order.loai_don === "giao_hang";
  const rows = items.map((item) => `
    <tr>
      <td>${item.ten_mon}${item.ghi_chu_mon ? `<br><span class="xsmall">(Ghi chú: ${item.ghi_chu_mon})</span>` : ''}</td>
      <td class="center" style="width:30px">${item.so_luong}</td>
      <td class="right" style="width:70px">${dinhDangTien(item.don_gia)}</td>
      <td class="right" style="width:80px">${dinhDangTien(item.so_luong * item.don_gia)}</td>
    </tr>
  `).join("");

  return baseHTML(`
    <div style="padding:16px;max-width:360px;margin:0 auto">
      <div class="center mb8">
        <div style="font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:1px">NANG PR</div>
        <div class="xsmall mt4">${isGiaoHang ? 'HÓA ĐƠN GIAO HÀNG' : 'CHI TIẾT ĐƠN HÀNG'}</div>
      </div>
      <div class="line"></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0">
        <span class="bold">Đơn #${order.ma_don_hang}</span>
        <span>${dinhDangNgay(order.ngay_tao)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0">
        <span>${loaiDonLabel[order.loai_don] || "Tại chỗ"}${order.ten_ban ? " - " + order.ten_ban : ""}</span>
        <span>${hinhThucThanhToanLabel[order.hinh_thuc_thanh_toan] || "Tiền mặt"}</span>
      </div>

      ${isGiaoHang && (order.ten_khach || order.so_dien_thoai_giao || order.dia_chi_giao) ? `
      <div class="line"></div>
      <div style="font-size:12px;font-weight:700;margin-bottom:6px">Thông tin giao hàng</div>
      ${order.ten_khach ? `<div style="font-size:12px;padding:2px 0">Người nhận: ${order.ten_khach}</div>` : ''}
      ${order.so_dien_thoai_giao ? `<div style="font-size:12px;padding:2px 0">SĐT: ${order.so_dien_thoai_giao}</div>` : ''}
      ${order.dia_chi_giao ? `<div style="font-size:12px;padding:2px 0">Địa chỉ: ${order.dia_chi_giao}</div>` : ''}
      ` : ''}

      <div class="line"></div>
      <table>
        <thead>
          <tr style="border-bottom:2px solid #000;font-size:10px;text-transform:uppercase">
            <th style="text-align:left">Mon</th>
            <th class="center" style="width:28px">SL</th>
            <th class="right" style="width:65px">Don gia</th>
            <th class="right" style="width:75px">Tien</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="4" class="center small" style="padding:20px 0">Trống</td></tr>'}
        </tbody>
      </table>
      <div class="line"></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 6px">
        <span>Tiền món:</span><span>${dinhDangTien(tien)}</span>
      </div>
      ${isGiaoHang ? `
      <div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 6px">
        <span>Phí giao hàng:</span><span>${dinhDangTien(phi)}</span>
      </div>
      ` : ''}
      <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:900;padding:4px 6px;border-top:2px solid #000">
        <span>TỔNG CỘNG:</span><span>${dinhDangTien(tien + phi)}</span>
      </div>
      <div class="line"></div>
      <div class="center small mt8">Cảm ơn quý khách. Hẹn gặp lại!</div>
      <div class="center xsmall">${new Date().toLocaleString("vi-VN")}</div>
    </div>
  `);
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

/* ── Nút chọn khoảng thời gian ── */  function NutKhoangThoiGian({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}              className={`flex-1 px-2 py-2.5 md:py-4 text-xs font-bold rounded-md transition-all duration-200 text-center ${
        active
          ? "bg-primary text-white shadow-sm"
          : "text-on-surface-variant hover:text-on-surface hover:bg-primary/5"
      }`}
    >
      {label}
    </button>
  );
}

/* ── Badge trạng thái ── */
function Badge({ label, color, bg }) {
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: bg || "var(--color-surface-container-high)", color: color || "var(--color-on-surface-variant)" }}
    >
      {label}
    </span>
  );
}

/* ── Modal chi tiết đơn hàng (có nút in) ── */
function ModalChiTietDon({ donHang, onDong }) {
  if (!donHang) return null;
  const tien = Number(donHang.tong_tien || 0);
  const phi = Number(donHang.phi_giao_hang || 0);
  const tong = tien + phi;

  /* ── In chi tiết đơn hàng (hóa đơn) ── */
  const handlePrint = () => {
    const html = buildPrintBill(donHang, loaiDonLabel, hinhThucThanhToanLabel);
    const w = window.open("", "_blank", "width=380,height=600,menubar=no,toolbar=no,scrollbars=yes");
    if (!w) { alert("Trình duyệt đã chặn popup. Hãy cho phép popup và thử lại."); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onDong} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl animate-fade-in" style={{ backgroundColor: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-10 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
              <div>
                <h3 className="font-bold text-base text-on-surface">Đơn hàng #{donHang.ma_don_hang}</h3>
                <p className="text-xs text-muted mt-0.5">{dinhDangNgay(donHang.ngay_tao)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-105"
                title="In đơn hàng"
                style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)", color: "var(--color-primary)" }}
              >
                <span className="material-symbols-outlined text-lg">print</span>
              </button>
              <button
                onClick={onDong}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
                style={{ backgroundColor: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)" }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Info row */}
          <div className="px-6 py-3 border-b flex flex-wrap items-center gap-2 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-on-surface-variant)" }}>
            <Badge label={loaiDonLabel[donHang.loai_don] || "Tại chỗ"} color="var(--color-secondary)" bg="color-mix(in srgb, var(--color-secondary) 12%, transparent)" />
            <Badge label={hinhThucThanhToanLabel[donHang.hinh_thuc_thanh_toan] || "Tiền mặt"} color="var(--color-primary)" bg="color-mix(in srgb, var(--color-primary) 10%, transparent)" />
            {donHang.ten_ban && (
              <Badge label={donHang.ten_ban} color="var(--color-warning)" bg="color-mix(in srgb, var(--color-warning) 12%, transparent)" />
            )}
          </div>

          {/* Thông tin giao hàng */}
          {donHang.loai_don === "giao_hang" && (donHang.ten_khach || donHang.so_dien_thoai_giao || donHang.dia_chi_giao) && (
            <div className="px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-sm" style={{ color: "var(--color-primary)" }}>local_shipping</span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Thông tin giao hàng</span>
              </div>
              <div className="space-y-1.5 text-sm">
                {donHang.ten_khach && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-muted">person</span>
                    <span className="font-medium text-on-surface">{donHang.ten_khach}</span>
                  </div>
                )}
                {donHang.so_dien_thoai_giao && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-muted">phone</span>
                    <span className="text-on-surface">{donHang.so_dien_thoai_giao}</span>
                  </div>
                )}
                {donHang.dia_chi_giao && (
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-muted mt-0.5">location_on</span>
                    <span className="text-on-surface">{donHang.dia_chi_giao}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items table */}
          <div className="px-6 py-4">
            {!(donHang.items || []).length ? (
              <p className="text-sm text-muted py-6 text-center">Không có chi tiết</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted font-semibold border-b" style={{ borderColor: "var(--color-border)" }}>
                    <th className="text-left py-2.5 text-[10px] uppercase tracking-wider">Món</th>
                    <th className="text-center py-2.5 w-14 text-[10px] uppercase tracking-wider">SL</th>
                    <th className="text-right py-2.5 text-[10px] uppercase tracking-wider">Đơn giá</th>
                    <th className="text-right py-2.5 text-[10px] uppercase tracking-wider">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(donHang.items || []).map((item, idx) => (
                    <tr key={item.ma_mon || idx} className="border-b" style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}>
                      <td className="py-3 text-on-surface">
                        <div className="font-medium">{item.ten_mon}</div>
                        {item.ghi_chu_mon && <div className="text-[10px] text-muted mt-0.5 italic"><span className="material-symbols-outlined text-[10px] align-text-bottom">edit_note</span> {item.ghi_chu_mon}</div>}
                      </td>
                      <td className="py-3 text-center font-semibold text-on-surface">{item.so_luong}</td>
                      <td className="py-3 text-right text-on-surface-variant">{dinhDangTien(item.don_gia)}</td>
                      <td className="py-3 text-right font-semibold text-on-surface">{dinhDangTien(item.so_luong * item.don_gia)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-3 text-right text-sm font-medium text-on-surface-variant">Tiền món</td>
                    <td className="py-3 text-right font-bold text-on-surface">{dinhDangTien(tien)}</td>
                  </tr>
                  {donHang.loai_don === "giao_hang" && phi > 0 && (
                    <tr style={{ borderTop: "1px solid var(--color-border)" }}>
                      <td colSpan={3} className="py-2 text-right text-sm text-on-surface-variant">Phí giao hàng</td>
                      <td className="py-2 text-right font-semibold" style={{ color: "var(--color-primary)" }}>{dinhDangTien(phi)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="py-3 text-right font-bold border-t-2 text-on-surface" style={{ borderColor: "var(--color-primary)" }}>Tổng cộng</td>
                    <td className="py-3 text-right font-bold text-base border-t-2" style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>{dinhDangTien(tong)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t flex justify-end gap-2" style={{ borderColor: "var(--color-border)" }}>
            <button
              onClick={onDong}
              className="px-4 py-2 rounded-lg text-xs font-bold border transition-all"
              style={{ borderColor: "var(--color-border)", color: "var(--color-on-surface-variant)" }}
            >
              Đóng
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <span className="material-symbols-outlined text-sm">print</span> In đơn
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Phân trang ── */
const KICH_THUOC_TRANG = 10;

function PhanTrang({ phanTrang, onChangeTrang }) {
  if (!phanTrang || phanTrang.total_pages <= 1) return null;

  const { page, total_pages, total } = phanTrang;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(total_pages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "var(--color-border)", backgroundColor: "color-mix(in srgb, var(--color-surface-container-low) 40%, transparent)" }}>
      <span className="text-xs text-muted font-medium">
        {total} đơn hàng · Trang {page}/{total_pages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChangeTrang(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-surface-container-high"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          ◀
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChangeTrang(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
              p === page ? "text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
            style={p === page ? { backgroundColor: "var(--color-primary)" } : {}}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChangeTrang(page + 1)}
          disabled={page >= total_pages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-surface-container-high"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

/* ── Trang chính ── */
export default function DoanhThu() {
  // === State ===
  const [khoangThoiGian, setKhoangThoiGian] = useState("day");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tabHienTai, setTabHienTai] = useState("don_hang");
  const [timKiem, setTimKiem] = useState("");
  const [loaiDonFilter, setLoaiDonFilter] = useState("");
  const [hinhThucThanhToanFilter, setHinhThucThanhToanFilter] = useState("");

  const [duLieu, setDuLieu] = useState({
    orders: [],
    summary: {},
    pagination: { total: 0, total_pages: 0, page: 1 },
  });
  const [thongKeCongNo, setThongKeCongNo] = useState({
    tong_con_no: 0,
    da_tra_trong_thang: 0,
    chi_trong_thang: 0,
  });
  const [danhSachHuy, setDanhSachHuy] = useState([]);
  const [trangHuy, setTrangHuy] = useState(1);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState("");
  const [donChon, setDonChon] = useState(null);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true); setLoi("");
    try {
      const offset = (trangHienTai - 1) * KICH_THUOC_TRANG;
      const [resDoanhThu, resThongKeNo, resHuy] = await Promise.all([
        getRevenueReport({
          period: khoangThoiGian, date: undefined,
          from_date: tuNgay || undefined, to_date: denNgay || undefined,
          loai_don: loaiDonFilter || undefined,
          hinh_thuc_thanh_toan: hinhThucThanhToanFilter || undefined,
          limit: KICH_THUOC_TRANG, offset,
        }),
        getCongNoStats(),
        getAllCancelHistory(999, 0),
      ]);
      setDuLieu(resDoanhThu);
      setThongKeCongNo(resThongKeNo || {});
      setDanhSachHuy(resHuy || []);
    } catch (e) {
      setLoi(e?.message || "Lỗi tải dữ liệu doanh thu");
      setDuLieu({ orders: [], summary: {}, pagination: { total: 0, total_pages: 0, page: 1 } });
    } finally { setDangTai(false); }
  }, [khoangThoiGian, tuNgay, denNgay, trangHienTai, loaiDonFilter, hinhThucThanhToanFilter]);

  useEffect(() => { taiDuLieu(); }, [taiDuLieu]);

  // === Tính toán ===
  const { orders, pagination } = duLieu;
  const doanhThuTong = duLieu.summary?.total_revenue || 0;
  const tongSoDon = duLieu.summary?.total_orders || 0;
  const chiPhiNhap = Number(thongKeCongNo.chi_trong_thang || 0);
  const tongCongNo = Number(thongKeCongNo.tong_con_no || 0);
  const tienMat = orders.filter((o) => o.hinh_thuc_thanh_toan !== "chuyen_khoan").reduce((s, o) => s + Number(o.tong_tien || 0), 0);
  const chuyenKhoan = orders.filter((o) => o.hinh_thuc_thanh_toan === "chuyen_khoan").reduce((s, o) => s + Number(o.tong_tien || 0), 0);

  // Lọc orders theo từ khóa tìm kiếm (mã đơn, bàn, loại đơn, món, thanh toán) — client-side
  const ordersFiltered = useMemo(() => {
    if (!timKiem.trim()) return orders;
    const q = removeVietnameseTones(timKiem.trim());
    return orders.filter((o) => {
      const items = o.items || [];
      return (
        String(o.ma_don_hang).includes(q) ||
        removeVietnameseTones(o.ten_ban || '').includes(q) ||
        removeVietnameseTones(o.loai_don || '').includes(q) ||
        removeVietnameseTones(o.hinh_thuc_thanh_toan || '').includes(q) ||
        items.some(item => removeVietnameseTones(item.ten_mon || '').includes(q))
      );
    });
  }, [orders, timKiem]);

  // Lọc món hủy
  const monDaHuy = useMemo(() => {
    if (!danhSachHuy.length) return [];
    const taoLocalDate = (str) => {
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m - 1, d);
    };
    const mocTu = tuNgay ? taoLocalDate(tuNgay) : new Date();
    const mocDen = denNgay
      ? new Date(taoLocalDate(denNgay).setHours(23, 59, 59, 999))
      : new Date(mocTu);
    return danhSachHuy.filter((x) => {
      const d = new Date(x.ngay_huy);
      if (tuNgay && denNgay) return d >= mocTu && d <= mocDen;
      if (khoangThoiGian === "day") return d.toDateString() === mocTu.toDateString();
      if (khoangThoiGian === "week") {
        const tuanCuaNgay = (ngay) => {
          const d2 = new Date(ngay); d2.setHours(0, 0, 0, 0);
          d2.setDate(d2.getDate() + 3 - ((d2.getDay() + 6) % 7));
          const dauNam = new Date(d2.getFullYear(), 0, 4);
          return Math.round(((d2 - dauNam) / 86400000 - 3 + ((dauNam.getDay() + 6) % 7)) / 7) + 1;
        };
        return tuanCuaNgay(d) === tuanCuaNgay(mocTu) && d.getFullYear() === mocTu.getFullYear();
      }
      if (khoangThoiGian === "month") return d.getMonth() === mocTu.getMonth() && d.getFullYear() === mocTu.getFullYear();
      if (khoangThoiGian === "year") return d.getFullYear() === mocTu.getFullYear();
      return true;
    });
  }, [danhSachHuy, khoangThoiGian, tuNgay, denNgay]);

  const tongMonDaHuy = monDaHuy.reduce((s, x) => s + Number(x.so_luong_huy || 0), 0);

  return (
    <div className="transition-colors duration-500 space-y-3">
      {/* ── Header + Bộ lọc thời gian ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Doanh thu</h2>
          <p className="text-sm text-muted">Tổng hợp doanh thu bán hàng</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-fit">
          <div className="flex bg-surface-container-high p-0.5 rounded-lg items-center">
            {CAC_KHOANG_THOI_GIAN.map((k) => (
              <NutKhoangThoiGian key={k.key} active={!tuNgay && khoangThoiGian === k.key}
                onClick={() => { setKhoangThoiGian(k.key); setTuNgay(""); setDenNgay(""); setTrangHienTai(1); }} label={k.label} />
            ))}
          </div>
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ backgroundColor: "var(--color-surface-container-high)" }}>
            <input type="date" value={tuNgay}
              onChange={(e) => { setTuNgay(e.target.value); setKhoangThoiGian(""); setTrangHienTai(1); }}
              className="flex-1 min-w-0 border-none rounded-md px-1.5 py-1 text-xs font-bold focus:ring-1 transition-all"
              style={{ backgroundColor: "var(--color-surface-lowest)", color: "var(--color-on-surface-variant)" }} />
            <span className="text-xs text-muted font-semibold px-0.5 shrink-0">→</span>
            <input type="date" value={denNgay}
              onChange={(e) => { setDenNgay(e.target.value); setKhoangThoiGian(""); setTrangHienTai(1); }}
              className="flex-1 min-w-0 border-none rounded-md px-1.5 py-1 text-xs font-bold focus:ring-1 transition-all"
              style={{ backgroundColor: "var(--color-surface-lowest)", color: "var(--color-on-surface-variant)" }} />
            {(tuNgay || denNgay) && (
              <button onClick={() => { setTuNgay(""); setDenNgay(""); setTrangHienTai(1); }}
                className="w-5 h-5 flex items-center justify-center rounded text-xs text-muted hover:bg-surface-container-high hover:text-error transition-all shrink-0" title="Xóa">✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {dangTai && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-[3px] rounded-full"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent", borderRightColor: "transparent" }} />
        </div>
      )}

      {/* Error */}
      {loi && !dangTai && (
        <div className="p-4 rounded-xl text-sm flex items-center gap-2"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)", color: "var(--color-error)", border: "1px solid color-mix(in srgb, var(--color-error) 20%, transparent)" }}>
          <span className="material-symbols-outlined text-lg">error_outline</span>
          {loi}
        </div>
      )}

      {!dangTai && !loi && (
        <>
          {/* ── Summary Cards - Hàng trên: Doanh thu nổi bật + Tiền mặt + Chuyển khoản ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Doanh thu */}
            <div className="card p-5 relative overflow-hidden" style={{ backgroundColor: "var(--color-primary)" }}>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--color-on-primary)", opacity: 0.7 }}>Doanh thu</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1 truncate tabular-nums" style={{ color: "var(--color-on-primary)" }}>
                    {dinhDangTien(doanhThuTong)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3" style={{ backgroundColor: "color-mix(in srgb, var(--color-on-primary) 15%, transparent)" }}>
                  <span className="material-symbols-outlined text-xl" style={{ color: "var(--color-on-primary)" }}>payments</span>
                </div>
              </div>
            </div>

            <SummaryCard nhan="Tiền mặt" giaTri={dinhDangTien(tienMat)} icon="money" borderColor="var(--color-success)" />
            <SummaryCard nhan="Chuyển khoản" giaTri={dinhDangTien(chuyenKhoan)} icon="account_balance" borderColor="var(--color-primary)" />
          </div>

          {/* ── Search + Summary Cards: Tìm kiếm 50% | Số đơn hàng + Món hủy 50% ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <input type="text" placeholder="Tìm đơn hàng..." value={timKiem} onChange={(e) => setTimKiem(e.target.value)}
                className="w-full border-none rounded-xl pl-3 pr-9 py-1.5 text-sm transition-all h-full focus:ring-1"
                style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)", color: "var(--color-on-surface)" }} />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-primary)" }}>search</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ backgroundColor: "var(--color-primary)" }} />
                <div className="pl-2">
                  <p className="text-[11px] font-medium text-muted">Số đơn hàng</p>
                  <p className="text-xl font-bold text-on-surface tabular-nums">{tongSoDon.toLocaleString("vi-VN")} <span className="text-xs font-medium text-muted">đơn</span></p>
                </div>
              </div>
              <div className="card p-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ backgroundColor: "var(--color-error)" }} />
                <div className="pl-2">
                  <p className="text-[11px] font-medium text-muted">Món hủy</p>
                  <p className="text-xl font-bold text-on-surface tabular-nums">{tongMonDaHuy}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main Table ── */}
          <div className="card overflow-hidden">
            {/* Tabs + Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex">
                <button onClick={() => setTabHienTai("don_hang")}
                  className="px-5 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2"
                  style={{
                    color: tabHienTai === "don_hang" ? "var(--color-primary)" : "var(--color-on-surface-variant)",
                    borderBottomColor: tabHienTai === "don_hang" ? "var(--color-primary)" : "transparent"
                  }}>
                  Đơn hàng
                  {tongSoDon > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>{tongSoDon}</span>
                  )}
                </button>
                <button onClick={() => setTabHienTai("mon_huy")}
                  className="px-5 py-3.5 text-xs font-medium transition-all border-b-2 flex items-center gap-2"
                  style={{
                    color: tabHienTai === "mon_huy" ? "var(--color-primary)" : "var(--color-on-surface-variant)",
                    borderBottomColor: tabHienTai === "mon_huy" ? "var(--color-primary)" : "transparent"
                  }}>
                  Món hủy
                  {tongMonDaHuy > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "color-mix(in srgb, var(--color-error) 12%, transparent)", color: "var(--color-error)" }}>{tongMonDaHuy}</span>
                  )}
                </button>
              </div>
              {/* Export + Combo filters */}
              <div className="flex items-center gap-2 px-4">
                {orders.length > 0 && (
                  <button
                    onClick={() => {
                      try {
                        exportDoanhThuExcel({
                          orders,
                          tuNgay: tuNgay || undefined,
                          denNgay: denNgay || undefined,
                        });
                      } catch (err) {
                        setLoi(err.message || "Không thể xuất Excel");
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-all hover:bg-primary/10"
                    style={{ color: "var(--color-primary)", backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)" }}
                  >
                    Xuất Excel
                  </button>
                )}
                <select
                  value={loaiDonFilter}
                  onChange={(e) => { setLoaiDonFilter(e.target.value); setTrangHienTai(1); }}
                  className="text-[10px] font-bold border-none rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                  style={{ backgroundColor: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)" }}
                >
                  <option value="">Loại: Tất cả</option>
                  <option value="tai_cho">Tại chỗ</option>
                  <option value="mang_ve">Mang về</option>
                  <option value="giao_hang">Giao hàng</option>
                </select>
                <select
                  value={hinhThucThanhToanFilter}
                  onChange={(e) => { setHinhThucThanhToanFilter(e.target.value); setTrangHienTai(1); }}
                  className="text-[10px] font-bold border-none rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                  style={{ backgroundColor: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)" }}
                >
                  <option value="">TT: Tất cả</option>
                  <option value="tien_mat">Tiền mặt</option>
                  <option value="chuyen_khoan">Chuyển khoản</option>
                </select>
              </div>
            </div>

            {/* Tab: Đơn hàng */}
            {tabHienTai === "don_hang" && (
              <>
                {ordersFiltered.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-muted">
                    <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                    <p className="font-medium">Không có đơn hàng phù hợp</p>
                    <p className="text-xs mt-1">Thử thay đổi bộ lọc thời gian</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: "700px" }}>
                      <thead>
                        <tr className="text-[10px] font-bold text-muted uppercase tracking-wider" style={{ backgroundColor: "color-mix(in srgb, var(--color-surface-container-low) 40%, transparent)" }}>
                          <th className="px-5 py-3.5 w-[15%]">Đơn hàng</th>
                          <th className="px-5 py-3.5 w-[20%]">Thời gian</th>
                          <th className="px-5 py-3.5 w-[15%]">Bàn</th>
                          <th className="px-5 py-3.5 text-center w-[12%]">Số lượng</th>
                          <th className="px-5 py-3.5 text-right w-[15%]">Tổng tiền</th>
                          <th className="px-5 py-3.5 w-[15%]">Thanh toán</th>
                          <th className="px-5 py-3.5 text-center w-[8%]"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                        {ordersFiltered.map((o) => {
                          const soMon = (o.items || []).reduce((s, item) => s + Number(item.so_luong || 0), 0);
                          return (
                            <tr key={o.ma_don_hang} className="hover:bg-surface-container-low/40 transition-colors">
                              <td className="px-5 py-3.5 w-[15%]">
                                <span className="font-bold text-xs" style={{ color: "var(--color-primary)" }}>#{o.ma_don_hang}</span>
                              </td>
                              <td className="px-5 py-3.5 text-xs text-on-surface-variant whitespace-nowrap w-[20%]">{dinhDangNgay(o.ngay_tao)}</td>
                              <td className="px-5 py-3.5 text-xs w-[15%]">
                                {o.ten_ban || loaiDonLabel[o.loai_don] || "Tại chỗ"}
                              </td>
                              <td className="px-5 py-3.5 text-center text-xs font-semibold w-[12%]">{soMon}</td>
                              <td className="px-5 py-3.5 text-right font-bold text-xs w-[15%]" style={{ color: "var(--color-primary)" }}>{dinhDangTien(o.tong_tien)}</td>
                              <td className="px-5 py-3.5 w-[15%]">
                                <Badge
                                  label={hinhThucThanhToanLabel[o.hinh_thuc_thanh_toan] || "Tiền mặt"}
                                  color={o.hinh_thuc_thanh_toan === "chuyen_khoan" ? "var(--color-secondary)" : "var(--color-on-surface-variant)"}
                                  bg={o.hinh_thuc_thanh_toan === "chuyen_khoan" ? "color-mix(in srgb, var(--color-secondary) 15%, transparent)" : "var(--color-surface-container-high)"}
                                />
                              </td>
                              <td className="px-5 py-3.5 text-center w-[8%]">
                                <button onClick={() => setDonChon(o)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:bg-primary/10"
                                  style={{ color: "var(--color-primary)" }} title="Chi tiết">
                                  <span className="material-symbols-outlined text-lg">visibility</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <PhanTrang phanTrang={pagination} onChangeTrang={setTrangHienTai} />
              </>
            )}

            {/* Tab: Món hủy */}
            {tabHienTai === "mon_huy" && (
              <>
                {monDaHuy.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-muted">
                    <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                    <p className="font-medium">Chưa có món nào bị hủy</p>
                    <p className="text-xs mt-1">Khi bạn giảm số lượng món đã in xuống bếp, thông tin sẽ hiển thị tại đây</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-bold text-muted uppercase tracking-wider" style={{ backgroundColor: "color-mix(in srgb, var(--color-surface-container-low) 40%, transparent)" }}>
                          <th className="px-5 py-3.5">Đơn hàng</th>
                          <th className="px-5 py-3.5">Thời gian</th>
                          <th className="px-5 py-3.5">Bàn</th>
                          <th className="px-5 py-3.5">Món hủy</th>
                          <th className="px-5 py-3.5 text-center">SL hủy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                        {monDaHuy.map((x) => (
                          <tr key={x.id} className="hover:bg-surface-container-low/40 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-xs font-semibold">#{x.ma_don_hang}</td>
                            <td className="px-5 py-3.5 text-xs text-on-surface-variant whitespace-nowrap">{dinhDangNgay(x.ngay_huy)}</td>
                            <td className="px-5 py-3.5 text-xs text-on-surface">{x.ten_ban || "—"}</td>
                            <td className="px-5 py-3.5 text-xs font-medium text-on-surface">{x.ten_mon}</td>
                            <td className="px-5 py-3.5 text-center text-xs font-bold" style={{ color: "var(--color-error)" }}>{x.so_luong_huy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Bottom Summary ── */}
          <div className="flex justify-end text-xs text-muted px-1">
            <span>Công nợ nhà cung cấp: <strong style={{ color: "var(--color-error)" }}>{dinhDangTien(tongCongNo)}</strong></span>
          </div>
        </>
      )}

      {/* Modal chi tiết */}
      {donChon && <ModalChiTietDon donHang={donChon} onDong={() => setDonChon(null)} />}
    </div>
  );
}
