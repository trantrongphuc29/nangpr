/* ===== 💰 NHẬP HÀNG & CÔNG NỢ =====
 * Quản lý phiếu nhập kho, theo dõi công nợ nhà cung cấp
 * Tích hợp: lịch sử nhập kho + công nợ + in phiếu
 * ==================================== */
import { useState, useEffect, useCallback } from "react";

import * as congNoService from "../services/congNoService";
import { exportPhieuNhapExcel } from "../utils/bangLuongExport";
import { ToastContainer, useToast } from "../components/Toast";

const dinhDangTien = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
const dinhDangNgay = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

const boLocThoiGian = [
  { key: "day", label: "Ngày" },
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
  { key: "year", label: "Năm" },
];

/* ── In phiếu nhập ── */
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

  const targetNCC = phieu.nha_cung_cap || "Đại lý tự do";
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

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Phiếu Nhập Kho #${phieu.ma_phieu}</title>
        <style>
          body { font-family: 'Arial', sans-serif; color: #222; padding: 30px; line-height: 1.5; }
          .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .title { font-size: 24px; font-weight: bold; text-transform: uppercase; color: #064e3b; margin: 0; }
          .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
          .info-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
          .info-table td { padding: 5px 0; font-size: 14px; }
          .main-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .main-table th { background-color: #f3f4f6; border: 1px solid #d1d5db; padding: 10px; font-size: 13px; text-transform: uppercase; }
          .main-table td { border: 1px solid #d1d5db; padding: 10px; font-size: 13px; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .total-row { font-size: 16px; font-weight: bold; color: #064e3b; }
          .footer-sign { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; }
          .sign-box { width: 45%; margin-top: 40px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">NẮNG PR CAFE</div>
          <div class="subtitle">Phiếu Nhập Kho</div>
        </div>
        <table class="info-table">
          <tr><td><strong>Mã phiếu nhập:</strong> #${phieu.ma_phieu}</td></tr>
          <tr><td><strong>Thời gian:</strong> ${formattedDate}</td></tr>
          <tr><td><strong>Nhà cung cấp:</strong> ${targetNCC}</td></tr>
          <tr><td><strong>Ghi chú:</strong> ${phieu.ghi_chu || "Nhập kho hệ thống"}</td></tr>
        </table>
        <table class="main-table">
          <thead>
            <tr>
              <th>STT</th>
              <th style="text-align: left;">Nguyên liệu</th>
              <th>Số lượng</th>
              <th>Đơn vị</th>
              <th style="text-align: right;">Đơn giá</th>
              <th style="text-align: right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item, i) => `
              <tr>
                <td class="text-center">${i + 1}</td>
                <td><strong>${item.ten_nguyen_lieu}</strong></td>
                <td class="text-center">${item.so_luong}</td>
                <td class="text-center" style="text-transform: uppercase;">${item.don_vi_nhap || "Đơn vị"}</td>
                <td class="text-right">${Number(item.gia_nhap).toLocaleString("vi-VN")}đ</td>
                <td class="text-right" style="font-weight: 600;">${(Number(item.so_luong) * Number(item.gia_nhap)).toLocaleString("vi-VN")}đ</td>
              </tr>
            `
              )
              .join("")}
            <tr class="total-row">
              <td colspan="5" class="text-right" style="padding: 12px;">Tổng thanh toán:</td>
              <td class="text-right" style="padding: 12px;">${Number(phieu.tong_tien).toLocaleString("vi-VN")}đ</td>
            </tr>
          </tbody>
        </table>
        <div class="footer-sign">
          <div class="sign-box">Người lập phiếu<br><br><br><br><i>(Ký và ghi rõ họ tên)</i></div>
          <div class="sign-box">Đại diện giao hàng<br><br><br><br><i>(Ký và ghi rõ họ tên)</i></div>
        </div>
        <script>window.onload = function() { window.print(); window.close(); }</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/* ── Thẻ thống kê (giống DoanhThu) ── */
function SummaryCard({ nhan, giaTri, sub, icon, accent }) {
  return (
    <div className="card p-5 border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase text-muted tracking-widest">{nhan}</p>
          <p className="text-2xl md:text-3xl font-black text-on-surface mt-1 truncate group-hover:text-primary transition-colors">
            {giaTri}
          </p>
          {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ml-3 ${accent || 'bg-primary/10 text-primary'}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
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
              <input
                type="number"
                min="1"
                max={conNo}
                className="input-field text-lg font-bold"
                value={soTien}
                onChange={(e) => setSoTien(e.target.value)}
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
                🖨️ In
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

  // Bộ lọc
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

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  useEffect(() => {
    setTrang(1);
  }, [khoangThoiGian, tuNgay, denNgay, boLocTrangThai, tuKhoaTimKiem]);

  const tongTrang = Math.ceil(tongSo / KICH_THUOC_TRANG);

  return (
    <div className="space-y-3 text-on-surface pb-4">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* ── Header + Bộ lọc thời gian (giống DoanhThu) ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }}>account_balance</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-primary)" }}>Công nợ</h2>
            <p className="text-xs text-muted">Quản lý phiếu nhập kho, theo dõi công nợ nhà cung cấp</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-fit">
          <div className="flex bg-surface-container-high p-0.5 rounded-lg items-center">
            {boLocThoiGian.map((k) => (
              <button
                key={k.key}
                onClick={() => {
                  setKhoangThoiGian(k.key);
                  setTuNgay(""); setDenNgay("");
                }}
                className={`flex-1 px-2 py-4 text-xs font-bold rounded-md transition-all duration-200 text-center ${
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
              <button onClick={() => { setTuNgay(""); setDenNgay(""); }}
                className="w-5 h-5 flex items-center justify-center rounded text-xs text-muted hover:bg-surface-container-high hover:text-error transition-all shrink-0" title="Xóa">✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 1: Thống kê chính (3 cột) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tổng công nợ - nổi bật */}
        <div className="card p-6 border-none shadow-lg relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--color-error) 0%, #B4534A 100%)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "var(--color-surface-lowest)", transform: "translate(30%, -30%)" }} />
          <div className="flex items-start justify-between relative z-10">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--color-on-primary)", opacity: 0.7 }}>Tổng tổng nợ</p>
              <p className="text-3xl md:text-4xl font-black mt-1 truncate" style={{ color: "var(--color-on-primary)" }}>
                {dinhDangTien(thongKe.tong_con_no)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ml-3" style={{ backgroundColor: "color-mix(in srgb, var(--color-on-primary) 20%, transparent)" }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: "var(--color-on-primary)" }}>account_balance</span>
            </div>
          </div>
        </div>

        {/* Công nợ trong kỳ */}
        <SummaryCard
          nhan={`Công nợ trong ${boLocThoiGian.find(k => k.key === khoangThoiGian)?.label || 'kỳ'}`}
          giaTri={dinhDangTien(thongKe.tong_con_no_ky)}
          icon="receipt"
          accent="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        />

        {/* Đã thanh toán trong kỳ */}
        <SummaryCard
          nhan={`Đã thanh toán trong ${boLocThoiGian.find(k => k.key === khoangThoiGian)?.label || 'kỳ'}`}
          giaTri={dinhDangTien(thongKe.da_tra_trong_thang)}
          icon="payments"
          accent="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* ── ROW 2: Search (30%) + Filter (30%) + Phiếu chưa TT (20%) + NCC nợ (20%) ── */}
      <div className="grid grid-cols-10 gap-2">
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
          <div className="flex items-center gap-1 bg-surface-container-high p-0.5 rounded-lg w-full">
            {[
              { key: "no", label: "Đang nợ" },
              { key: "da_tra", label: "Đã thanh toán" },
              { key: "all", label: "Tất cả" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setBoLocTrangThai(opt.key)}
                className={`flex-1 px-2 py-4 text-xs font-bold rounded-md transition-all duration-200 text-center ${
                  boLocTrangThai === opt.key
                    ? "bg-primary text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-primary/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Phiếu chưa thanh toán: 20% - cột 7-8 */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm border h-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-amber) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-amber) 20%, transparent)" }}>
            <span className="material-symbols-outlined text-base shrink-0" style={{ color: "var(--color-amber)" }}>receipt_long</span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase text-muted tracking-wider truncate">Phiếu chưa thanh toán</p>
              <p className="text-base font-black" style={{ color: "var(--color-amber)" }}>{thongKe.so_phieu_no}</p>
            </div>
          </div>
        </div>

        {/* Nhà cung cấp đang nợ: 20% - cột 9-10 */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm border h-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-purple) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-purple) 20%, transparent)" }}>
            <span className="material-symbols-outlined text-base shrink-0" style={{ color: "var(--color-purple)" }}>people</span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase text-muted tracking-wider truncate">Nhà cung cấp đang nợ</p>
              <p className="text-base font-black" style={{ color: "var(--color-purple)" }}>{thongKe.so_ncc_dang_no}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Table (giống DoanhThu) ── */}
      <div className="card border-none shadow-lg rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "color-mix(in srgb, var(--color-surface-container-low) 20%, transparent)" }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ color: "var(--color-primary)" }}>receipt_long</span>
            <span className="text-xs font-bold text-on-surface">Danh sách phiếu nhập</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted font-medium">{tongSo} phiếu</span>
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
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:bg-primary/10"
              style={{ color: "var(--color-primary)", backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)" }}
              disabled={danhSach.length === 0}
            >
              <span className="material-symbols-outlined text-xs">table_chart</span>
              Xuất Excel
            </button>
            {boLocTrangThai === "no" && (
              <span className="text-[10px] font-bold text-error">{dinhDangTien(thongKe.tong_con_no)} còn nợ</span>
            )}
          </div>
        </div>

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
                ? "🎉 Không có công nợ nào!"
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
            <table className="w-full text-left" style={{ tableLayout: "fixed" }}>
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
                            ✅ Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: "color-mix(in srgb, var(--color-error) 12%, transparent)", color: "var(--color-error)" }}>
                            ⏳ Chưa thanh toán
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

        {/* Phân trang (giống DoanhThu) */}
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
