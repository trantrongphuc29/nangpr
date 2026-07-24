import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { getRevenueReport } from "../services/donHangService";
import { getCostStats, getNguyenLieu } from "../services/nguyenlieuService";
import { getCongNoStats } from "../services/congNoService";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
const fmtN = (n) => Number(n || 0).toLocaleString("vi-VN");

/* ── Nguyên liệu: tính trạng thái tồn kho & hạn dùng ── */
function enrichStock(item) {
  const ton = Number(item.ton_kho ?? 0);
  const nguong = Number(item.nguong_canh_bao || 0);
  let st_ton = "con_hang";
  if (ton <= 0) st_ton = "het_hang";
  else if (nguong > 0 && ton <= nguong) st_ton = "sap_het";

  let st_han = "khong_co_han";
  let so_ngay = null;
  if (item.han_su_dung) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const han = new Date(item.han_su_dung);
    so_ngay = Math.ceil((han.getTime() - today.getTime()) / 86400000);
    if (so_ngay < 0) st_han = "het_han";
    else if (so_ngay <= 7) st_han = "sap_het_han";
    else st_han = "con_han";
  }
  const donVi = item.danh_muc === "Nguyên liệu pha chế" ? item.don_vi_tinh : item.don_vi_nhap;
  return { ...item, ton, nguong, st_ton, st_han, so_ngay, donVi };
}

const fmtTon = (i) => `${Number(i.ton || 0).toLocaleString("vi-VN")} ${i.donVi || ""}`.trim();

/* ── TrendBadge — mũi tên tăng/giảm so với kỳ trước ── */
function TrendBadge({ pct }) {
  if (pct === null || pct === undefined) return null;
  const up = pct >= 0;
  const color = up ? "var(--color-success)" : "var(--color-error)";
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums" style={{ color }}>
      <span className="material-symbols-outlined text-[13px] leading-none">{up ? "arrow_upward" : "arrow_downward"}</span>
      {Math.abs(pct).toLocaleString("vi-VN", { maximumFractionDigits: 0 })}%
    </span>
  );
}

/* ── StatCard — left accent border, clean layout ── */
function StatCard({ label, value, sub, icon, variant, trend }) {
  const borderColors = {
    default: "var(--color-primary)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
  };
  const borderColor = borderColors[variant] || borderColors.default;
  const hasTrend = trend !== null && trend !== undefined;

  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ backgroundColor: borderColor }} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="text-xl font-bold text-on-surface mt-1 truncate tabular-nums">{value}</p>
          {(hasTrend || sub) && (
            <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1 min-w-0">
              {hasTrend && <TrendBadge pct={trend} />}
              {sub && <span className="truncate">{sub}</span>}
            </p>
          )}
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `color-mix(in srgb, ${borderColor} 10%, transparent)` }}
        >
          <span className="material-symbols-outlined text-xl" style={{ color: borderColor }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

/* ── DailyRevenueChart ── */
function DailyRevenueChart({ data, loading }) {
  const maxVal = useMemo(() => Math.max(...data.map(d => d.total), 1), [data]);
  const hasData = data.some((d) => d.total > 0);
  const soNgayCoDoanhThu = data.filter((d) => d.total > 0).length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-on-surface">Doanh thu theo ngày</h3>
          <p className="text-xs text-muted mt-0.5">Tháng này</p>
        </div>
      </div>

      {loading ? (
        <div className="h-52 bg-surface-container-high rounded-lg animate-pulse" />
      ) : !hasData ? (
        <div className="h-52 flex items-center justify-center">
          <p className="text-sm text-muted">Chưa có doanh thu tháng này</p>
        </div>
      ) : (
        // pt-10: chừa khoảng phía trên để tooltip không bị cắt (overflow-x ép overflow-y = auto)
        <div className="flex items-end gap-1 h-52 pt-10 overflow-x-auto pb-1 custom-scrollbar">
          {data.map((d) => {
            const pct = maxVal > 0 ? (d.total / maxVal) * 100 : 0;
            return (
              <div key={d.date} className="flex-1 min-w-[24px] h-full flex flex-col items-center gap-1 group relative">
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-on-surface text-card text-[10px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md pointer-events-none">
                  {d.dateLabel}: {fmt(d.total)}
                  <span className="text-card/60 ml-1">({d.count} đơn)</span>
                </div>
                <div className="flex-1 w-full flex items-end">
                  <div
                    className={`w-full rounded-t-sm transition-colors ${d.isToday ? 'bg-primary' : 'bg-primary/20'}`}
                    style={{ height: `${Math.max(pct, 3)}%` }}
                  />
                </div>
                <span className={`text-[9px] leading-none ${d.isToday ? 'text-primary font-semibold' : 'text-muted'}`}>
                  {d.shortLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {hasData && (
        <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-outline-subtle text-xs text-muted">
          <span>Tổng: <span className="font-semibold text-on-surface">{fmt(data.reduce((s, d) => s + d.total, 0))}</span></span>
          <span className="text-outline">|</span>
          <span>{soNgayCoDoanhThu} ngày có doanh thu</span>
        </div>
      )}
    </div>
  );
}

/* ── RecentActivity ── */
function RecentActivity({ title, items, loading }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-on-surface mb-3">{title}</h3>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-surface-container-high rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center">
          <span className="material-symbols-outlined text-3xl text-muted/30 block mb-1">receipt_long</span>
          <p className="text-sm text-muted">Chưa có đơn hàng hôm nay</p>
        </div>
      ) : (
        <div className="divide-y divide-outline-subtle">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-on-surface truncate">{item.label}</p>
                <p className="text-[11px] text-muted mt-0.5">{item.time}</p>
              </div>
              <span className={`text-sm font-semibold tabular-nums shrink-0 ml-3 ${item.positive ? 'text-success' : item.negative ? 'text-error' : 'text-on-surface'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── OrderTypeBreakdown ── */
function OrderTypeBreakdown({ todayRevenue }) {
  const paid = todayRevenue.tm + todayRevenue.ck;
  // Làm tròn 1 lần rồi lấy phần bù để 2 tỉ lệ luôn cộng đủ 100%
  const tmPct = paid > 0 ? Math.round((todayRevenue.tm / paid) * 100) : 0;
  const ckPct = paid > 0 ? 100 - tmPct : 0;

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-on-surface mb-3">Phân tích hôm nay</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted">Tổng đơn</span>
            <span className="font-semibold text-on-surface tabular-nums">{fmtN(todayRevenue.orders)}</span>
          </div>

          {/* Payment method bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success" />
                Tiền mặt ({tmPct}%)
              </span>
              <span className="font-medium tabular-nums">{fmt(todayRevenue.tm)}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden flex">
              <div className="h-full rounded-l-full" style={{ width: `${tmPct}%`, backgroundColor: "var(--color-success)" }} />
              <div className="h-full rounded-r-full" style={{ width: `${ckPct}%`, backgroundColor: "var(--color-primary)" }} />
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Chuyển khoản ({ckPct}%)
              </span>
              <span className="font-medium tabular-nums">{fmt(todayRevenue.ck)}</span>
            </div>
          </div>
        </div>

        {/* Order types */}
        <div className="pt-3 border-t border-outline-subtle">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">Loại đơn</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Tại chỗ", value: todayRevenue.taiCho || 0 },
              { label: "Mang về", value: todayRevenue.mangVe || 0 },
              { label: "Giao hàng", value: todayRevenue.giaoHang || 0 },
            ].map((t) => (
              <div key={t.label} className="text-center py-2.5 px-2 rounded-lg"
                style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 5%, transparent)" }}
              >
                <p className="text-lg font-bold text-on-surface tabular-nums">{fmtN(t.value)}</p>
                <p className="text-[11px] text-muted mt-0.5">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── StockOverview — thống kê kho nguyên liệu ── */
function StockOverview({ stats, alerts, loading }) {
  const tiles = [
    { label: "Nguyên liệu", value: stats.total, color: "var(--color-primary)", icon: "inventory_2" },
    { label: "Sắp hết", value: stats.sapHet, color: "var(--color-warning)", icon: "warning" },
    { label: "Hết hàng", value: stats.hetHang, color: "var(--color-error)", icon: "error" },
    { label: "Sắp/đã hết hạn", value: stats.sapHetHan + stats.hetHan, color: "var(--color-error)", icon: "hourglass_bottom" },
  ];

  const badgeCanhBao = (a) => {
    if (a.st_ton === "het_hang") return { text: "Hết hàng", color: "var(--color-error)" };
    if (a.st_han === "het_han") return { text: "Hết hạn", color: "var(--color-error)" };
    if (a.st_ton === "sap_het") return { text: "Sắp hết", color: "var(--color-warning)" };
    if (a.st_han === "sap_het_han") return { text: `HSD ${a.so_ngay} ngày`, color: "var(--color-warning)" };
    return { text: "", color: "var(--color-muted)" };
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-on-surface">Kho nguyên liệu</h3>
        <Link to="/nguyenlieu" className="text-xs font-medium flex items-center gap-0.5 hover:underline" style={{ color: "var(--color-primary)" }}>
          Xem kho <span className="material-symbols-outlined text-sm">chevron_right</span>
        </Link>
      </div>

      {loading ? (
        <div className="h-40 bg-surface-container-high rounded-lg animate-pulse" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-xl px-3 py-3 text-center" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 5%, transparent)" }}>
                <span className="material-symbols-outlined text-lg" style={{ color: t.color }}>{t.icon}</span>
                <p className="text-xl font-bold text-on-surface tabular-nums leading-tight mt-0.5">{fmtN(t.value)}</p>
                <p className="text-[11px] text-muted mt-0.5">{t.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-outline-subtle">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">Cần chú ý</p>
            {alerts.length === 0 ? (
              <div className="py-6 text-center">
                <span className="material-symbols-outlined text-2xl text-success/50 block mb-1">check_circle</span>
                <p className="text-sm text-muted">Kho ổn định, không có cảnh báo</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-subtle">
                {alerts.map((a) => {
                  const b = badgeCanhBao(a);
                  return (
                    <div key={a.ma_nguyen_lieu} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-on-surface truncate">{a.ten_nguyen_lieu}</p>
                        <p className="text-[11px] text-muted mt-0.5">
                          Còn {fmtTon(a)}{a.nguong > 0 ? ` · ngưỡng ${a.nguong.toLocaleString("vi-VN")} ${a.donVi}` : ""}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0"
                        style={{ color: b.color, backgroundColor: `color-mix(in srgb, ${b.color} 12%, transparent)` }}>
                        {b.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Utils ── */
function groupOrdersByDate(orders) {
  const map = {};
  orders.forEach((o) => {
    const d = new Date(o.ngay_tao);
    const vn = new Date(d.getTime() + 7 * 3600000);
    const key = `${vn.getUTCFullYear()}-${String(vn.getUTCMonth() + 1).padStart(2, '0')}-${String(vn.getUTCDate()).padStart(2, '0')}`;
    const label = `${String(vn.getUTCDate()).padStart(2, '0')}/${String(vn.getUTCMonth() + 1).padStart(2, '0')}`;
    const shortLabel = String(vn.getUTCDate());
    if (!map[key]) map[key] = { date: key, dateLabel: label, shortLabel, total: 0, count: 0 };
    map[key].total += Number(o.tong_tien || 0);
    map[key].count += 1;
  });
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

/* ── Main ── */
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const [todayRevenue, setTodayRevenue] = useState({ total: 0, orders: 0, tm: 0, ck: 0, taiCho: 0, mangVe: 0, giaoHang: 0 });
  const [monthRevenue, setMonthRevenue] = useState({ total: 0, orders: 0 });
  const [trend, setTrend] = useState({ today: null, month: null });
  const [monthOrders, setMonthOrders] = useState([]);
  const [costStats, setCostStats] = useState({ day: 0, month: 0 });
  const [debt, setDebt] = useState({ tong_con_no: 0, so_phieu_no: 0, so_ncc_dang_no: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [stockStats, setStockStats] = useState({ total: 0, sapHet: 0, hetHang: 0, sapHetHan: 0, hetHan: 0 });
  const [stockAlerts, setStockAlerts] = useState([]);

  // Biểu đồ doanh thu theo ngày — liên tục từ ngày 1 đến hôm nay (lấp ngày trống bằng 0)
  const dailyChartData = useMemo(() => {
    const map = new Map(groupOrdersByDate(monthOrders).map((d) => [d.date, d]));
    const vnToday = new Date(Date.now() + 7 * 3600000);
    const y = vnToday.getUTCFullYear(), m = vnToday.getUTCMonth(), today = vnToday.getUTCDate();
    const pad = (n) => String(n).padStart(2, "0");
    const out = [];
    for (let dd = 1; dd <= today; dd++) {
      const key = `${y}-${pad(m + 1)}-${pad(dd)}`;
      const found = map.get(key);
      out.push({
        date: key,
        dateLabel: `${pad(dd)}/${pad(m + 1)}`,
        shortLabel: String(dd),
        total: found ? found.total : 0,
        count: found ? found.count : 0,
        isToday: dd === today,
      });
    }
    return out;
  }, [monthOrders]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const today = ymd(now);
      const yesterday = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
      const lastMonthRef = ymd(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const [todayRev, monthRev, costResult, debtResult, nlList, yesterdayRev, lastMonthRev] = await Promise.all([
        // limit lớn để TM/CK & phân loại đơn tính đủ, khớp với summary.total_orders
        getRevenueReport({ period: "day", date: today, limit: 1000, offset: 0 }),
        getRevenueReport({ period: "month", limit: 500, offset: 0 }),
        getCostStats(),
        getCongNoStats(),
        getNguyenLieu(),
        getRevenueReport({ period: "day", date: yesterday, limit: 1, offset: 0 }),
        getRevenueReport({ period: "month", date: lastMonthRef, limit: 1, offset: 0 }),
      ]);

      // % thay đổi so với kỳ trước (null nếu kỳ trước = 0 để tránh chia 0 / vô nghĩa)
      const tinhTrend = (nay, truoc) => (truoc > 0 ? ((nay - truoc) / truoc) * 100 : null);
      const dtHomNay = todayRev.summary?.total_revenue || 0;
      const dtThang = monthRev.summary?.total_revenue || 0;
      setTrend({
        today: tinhTrend(dtHomNay, yesterdayRev.summary?.total_revenue || 0),
        month: tinhTrend(dtThang, lastMonthRev.summary?.total_revenue || 0),
      });

      const todayOrdersList = todayRev.orders || [];
      const tmTotal = todayOrdersList.filter((o) => o.hinh_thuc_thanh_toan !== "chuyen_khoan").reduce((s, o) => s + Number(o.tong_tien || 0), 0);
      const ckTotal = todayOrdersList.filter((o) => o.hinh_thuc_thanh_toan === "chuyen_khoan").reduce((s, o) => s + Number(o.tong_tien || 0), 0);
      const taiCho = todayOrdersList.filter(o => o.loai_don === 'tai_cho' || !o.loai_don).length;
      const mangVe = todayOrdersList.filter(o => o.loai_don === 'mang_ve').length;
      const giaoHang = todayOrdersList.filter(o => o.loai_don === 'giao_hang').length;

      setTodayRevenue({ total: todayRev.summary?.total_revenue || 0, orders: todayRev.summary?.total_orders || 0, tm: tmTotal, ck: ckTotal, taiCho, mangVe, giaoHang });
      setMonthRevenue({ total: monthRev.summary?.total_revenue || 0, orders: monthRev.summary?.total_orders || 0 });
      setMonthOrders(monthRev.orders || []);
      setCostStats({ day: costResult.day || 0, month: costResult.month || 0 });
      setDebt({ tong_con_no: debtResult.tong_con_no || 0, so_phieu_no: debtResult.so_phieu_no || 0, so_ncc_dang_no: debtResult.so_ncc_dang_no || 0 });

      setRecentOrders(
        (todayRev.orders || []).slice(0, 5).map((o) => ({
          label: `#${o.ma_don_hang}${o.ten_ban ? ` · ${o.ten_ban}` : ''}${o.loai_don === 'mang_ve' ? ' · Mang về' : o.loai_don === 'giao_hang' ? ' · Giao hàng' : ''}`,
          time: new Date(o.ngay_tao).toLocaleString("vi-VN"),
          value: fmt(o.tong_tien),
          positive: true,
        }))
      );

      // Thống kê kho nguyên liệu (chỉ tính nguyên liệu đang dùng)
      const activeNL = (nlList || []).filter((i) => Number(i.trang_thai) !== 0).map(enrichStock);
      setStockStats({
        total: activeNL.length,
        sapHet: activeNL.filter((i) => i.st_ton === "sap_het").length,
        hetHang: activeNL.filter((i) => i.st_ton === "het_hang").length,
        sapHetHan: activeNL.filter((i) => i.st_han === "sap_het_han").length,
        hetHan: activeNL.filter((i) => i.st_han === "het_han").length,
      });
      // Danh sách cần chú ý — ưu tiên theo mức độ nghiêm trọng
      const uuTien = { het_hang: 0, het_han: 1, sap_het: 2, sap_het_han: 3 };
      const mucDo = (i) => {
        if (i.st_ton === "het_hang") return uuTien.het_hang;
        if (i.st_han === "het_han") return uuTien.het_han;
        if (i.st_ton === "sap_het") return uuTien.sap_het;
        if (i.st_han === "sap_het_han") return uuTien.sap_het_han;
        return 99;
      };
      setStockAlerts(
        activeNL
          .filter((i) => i.st_ton === "het_hang" || i.st_ton === "sap_het" || i.st_han === "het_han" || i.st_han === "sap_het_han")
          .sort((a, b) => mucDo(a) - mucDo(b) || a.ton - b.ton)
          .slice(0, 6)
      );
    } catch (e) {
      console.error("Dashboard load error:", e);
      setError("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const now = new Date();
  const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const dateStr = `${dayNames[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} tháng ${now.getMonth() + 1}, ${now.getFullYear()}`;

  if (initialLoad) {
    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <div className="h-8 w-40 bg-surface-container-high rounded-lg animate-pulse" />
            <div className="h-4 w-52 bg-surface-container-high rounded mt-2 animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-surface-container-high rounded-lg animate-pulse" />
        </div>
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 h-24 animate-pulse">
              <div className="h-3 w-20 bg-surface-container-high rounded mb-3" />
              <div className="h-6 w-28 bg-surface-container-high rounded" />
            </div>
          ))}
        </div>
        {/* Cột chính + cột phụ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="card h-80 animate-pulse" />
            <div className="card h-56 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="card h-64 animate-pulse" />
            <div className="card h-72 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Dashboard</h2>
          <p className="text-[13px] text-muted mt-0.5">{dateStr}</p>
        </div>
        <button type="button" onClick={loadDashboard} disabled={loading}
          className="btn-outline !py-2 !px-3.5 !text-xs self-start sm:self-auto"
        >
          <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>refresh</span>
          Làm mới
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3.5 rounded-xl bg-error-container border border-error/15 text-sm text-error flex items-center gap-2.5">
          <span className="material-symbols-outlined text-lg">error_outline</span>
          {error}
          <button onClick={loadDashboard} className="ml-auto underline font-medium shrink-0 hover:no-underline">Thử lại</button>
        </div>
      )}

      {!error && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Doanh thu hôm nay" value={fmt(todayRevenue.total)} icon="payments" sub={`${fmtN(todayRevenue.orders)} đơn hàng`} variant="success" trend={trend.today} />
            <StatCard label="Doanh thu tháng" value={fmt(monthRevenue.total)} icon="trending_up" sub={`${fmtN(monthRevenue.orders)} đơn hàng`} variant="default" trend={trend.month} />
            <StatCard label="Chi nhập kho tháng" value={fmt(costStats.month)} icon="shopping_cart" sub={`Hôm nay: ${fmt(costStats.day)}`} variant="warning" />
            <StatCard label="Công nợ" value={fmt(debt.tong_con_no)} icon="account_balance" sub={`${fmtN(debt.so_ncc_dang_no)} NCC · ${fmtN(debt.so_phieu_no)} phiếu`} variant={Number(debt.tong_con_no) > 0 ? "error" : "default"} />
          </div>

          {/* Cột chính (biểu đồ + đơn gần đây) + Cột phụ (phân tích + kho) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-2 space-y-4">
              <DailyRevenueChart data={dailyChartData} loading={loading} />
              <RecentActivity title="Đơn hàng gần đây" items={recentOrders} loading={loading} />
            </div>
            <div className="space-y-4">
              <OrderTypeBreakdown todayRevenue={todayRevenue} />
              <StockOverview stats={stockStats} alerts={stockAlerts} loading={loading} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
