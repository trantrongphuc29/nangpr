import { useState, useEffect, useCallback, useMemo } from "react";
import { getRevenueReport } from "../services/donHangService";
import { getCostStats } from "../services/nguyenlieuService";
import { getCongNoStats } from "../services/congNoService";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
const fmtN = (n) => Number(n || 0).toLocaleString("vi-VN");

/* ── StatCard — left accent border, clean layout ── */
function StatCard({ label, value, sub, icon, variant }) {
  const borderColors = {
    default: "var(--color-primary)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
  };
  const borderColor = borderColors[variant] || borderColors.default;

  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ backgroundColor: borderColor }} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="text-xl font-bold text-on-surface mt-1 truncate tabular-nums">{value}</p>
          {sub && <p className="text-[11px] text-muted mt-0.5">{sub}</p>}
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-muted"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 6%, transparent)" }}
        >
          <span className="material-symbols-outlined text-xl" style={{ color: borderColor }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

/* ── DailyRevenueChart ── */
function DailyRevenueChart({ data, loading, onRefresh }) {
  const maxVal = useMemo(() => Math.max(...data.map(d => d.total), 1), [data]);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-on-surface">Doanh thu theo ngày</h3>
          <p className="text-xs text-muted mt-0.5">Tháng này</p>
        </div>
        <button
          type="button" onClick={onRefresh} disabled={loading}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container-high disabled:opacity-40 transition-colors"
        >
          <span className={`material-symbols-outlined text-lg text-muted ${loading ? 'animate-spin' : ''}`}>refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="h-48 bg-surface-container-high rounded-lg animate-pulse" />
      ) : !data.length ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-sm text-muted">Chưa có dữ liệu tháng này</p>
        </div>
      ) : (
        <div className="flex items-end gap-1 h-48 overflow-x-auto pb-1 custom-scrollbar">
          {data.map((d) => {
            const pct = maxVal > 0 ? (d.total / maxVal) * 100 : 0;
            return (
              <div key={d.date} className="flex-1 min-w-[24px] flex flex-col items-center gap-1 group relative">
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-on-surface text-card text-[10px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md pointer-events-none">
                  {d.dateLabel}: {fmt(d.total)}
                  <span className="text-card/60 ml-1">({d.count} đơn)</span>
                </div>
                <div
                  className={`w-full rounded-t-sm transition-colors ${d.isToday ? 'bg-primary' : 'bg-primary/20'}`}
                  style={{ height: `${Math.max(pct, 3)}%` }}
                />
                <span className={`text-[9px] leading-none ${d.isToday ? 'text-primary font-semibold' : 'text-muted'}`}>
                  {d.shortLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {!!data.length && (
        <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-outline-subtle text-xs text-muted">
          <span>Tổng: <span className="font-semibold text-on-surface">{fmt(data.reduce((s, d) => s + d.total, 0))}</span></span>
          <span className="text-outline">|</span>
          <span>{data.length} ngày có doanh thu</span>
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

/* ── QuickOverview ── */
function QuickOverview({ todayRevenue, todayCost, debt, costStats, monthRevenue, monthCost }) {
  const todayProfit = todayRevenue.total - todayCost;
  const monthProfit = monthRevenue.total - monthCost;

  const sections = [
    {
      title: "Hôm nay",
      rows: [
        { label: "Doanh thu", value: fmt(todayRevenue.total) },
        { label: "TM / CK", value: `${fmt(todayRevenue.tm)} / ${fmt(todayRevenue.ck)}` },
        { label: "Chi nhập kho", value: todayCost > 0 ? fmt(todayCost) : "—", color: todayCost > 0 ? "text-error" : "" },
        { label: "Lợi nhuận (ước tính)", value: fmt(todayProfit), color: todayProfit >= 0 ? "text-success" : "text-error" },
      ],
    },
    {
      title: "Tháng này",
      rows: [
        { label: "Lợi nhuận", value: fmt(monthProfit), color: monthProfit >= 0 ? "text-success" : "text-error" },
        { label: "Chi nhập kho", value: fmt(costStats.month), color: "text-error" },
      ],
    },
    {
      title: "Công nợ",
      rows: [
        { label: "Chưa thanh toán", value: fmt(debt.tong_con_no), color: Number(debt.tong_con_no) > 0 ? "text-error" : "" },
        { label: "NCC đang nợ", value: fmtN(debt.so_ncc_dang_no) },
      ],
    },
  ];

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-on-surface mb-3">Tổng quan nhanh</h3>
      <div className="space-y-4">
        {sections.map((sec, si) => (
          <div key={si}>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-1.5">{sec.title}</p>
            <div className="divide-y divide-outline-subtle">
              {sec.rows.map((row, ri) => (
                <div key={ri} className="flex justify-between items-center py-2 first:pt-0 last:pb-0">
                  <span className="text-sm text-muted">{row.label}</span>
                  <span className={`text-sm font-semibold tabular-nums ${row.color || 'text-on-surface'}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── OrderTypeBreakdown ── */
function OrderTypeBreakdown({ todayRevenue }) {
  const total = todayRevenue.tm + todayRevenue.ck || 1;
  const tmPct = ((todayRevenue.tm / total) * 100).toFixed(0);
  const ckPct = ((todayRevenue.ck / total) * 100).toFixed(0);

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
  const [error, setError] = useState("");
  const [todayRevenue, setTodayRevenue] = useState({ total: 0, orders: 0, tm: 0, ck: 0, taiCho: 0, mangVe: 0, giaoHang: 0 });
  const [monthRevenue, setMonthRevenue] = useState({ total: 0, orders: 0 });
  const [monthOrders, setMonthOrders] = useState([]);
  const [costStats, setCostStats] = useState({ day: 0, week: 0, month: 0, year: 0 });
  const [debt, setDebt] = useState({ tong_con_no: 0, so_phieu_no: 0, da_tra_trong_thang: 0, chi_trong_thang: 0, so_ncc_dang_no: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  const dailyChartData = useMemo(() => {
    const grouped = groupOrdersByDate(monthOrders);
    const today = new Date();
    const vnToday = new Date(today.getTime() + 7 * 3600000);
    const todayKey = `${vnToday.getUTCFullYear()}-${String(vnToday.getUTCMonth() + 1).padStart(2, '0')}-${String(vnToday.getUTCDate()).padStart(2, '0')}`;
    return grouped.map(d => ({ ...d, isToday: d.date === todayKey }));
  }, [monthOrders]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const [todayRev, monthRev, costResult, debtResult] = await Promise.all([
        getRevenueReport({ period: "day", date: today, limit: 100, offset: 0 }),
        getRevenueReport({ period: "month", limit: 500, offset: 0 }),
        getCostStats(),
        getCongNoStats(),
      ]);

      const todayOrdersList = todayRev.orders || [];
      const tmTotal = todayOrdersList.filter((o) => o.hinh_thuc_thanh_toan !== "chuyen_khoan").reduce((s, o) => s + Number(o.tong_tien || 0), 0);
      const ckTotal = todayOrdersList.filter((o) => o.hinh_thuc_thanh_toan === "chuyen_khoan").reduce((s, o) => s + Number(o.tong_tien || 0), 0);
      const taiCho = todayOrdersList.filter(o => o.loai_don === 'tai_cho' || !o.loai_don).length;
      const mangVe = todayOrdersList.filter(o => o.loai_don === 'mang_ve').length;
      const giaoHang = todayOrdersList.filter(o => o.loai_don === 'giao_hang').length;

      setTodayRevenue({ total: todayRev.summary?.total_revenue || 0, orders: todayRev.summary?.total_orders || 0, tm: tmTotal, ck: ckTotal, taiCho, mangVe, giaoHang });
      setMonthRevenue({ total: monthRev.summary?.total_revenue || 0, orders: monthRev.summary?.total_orders || 0 });
      setMonthOrders(monthRev.orders || []);
      setCostStats({ day: costResult.day || 0, week: costResult.week || 0, month: costResult.month || 0, year: costResult.year || 0 });
      setDebt({ tong_con_no: debtResult.tong_con_no || 0, so_phieu_no: debtResult.so_phieu_no || 0, da_tra_trong_thang: debtResult.da_tra_trong_thang || 0, chi_trong_thang: debtResult.chi_trong_thang || 0, so_ncc_dang_no: debtResult.so_ncc_dang_no || 0 });

      setRecentOrders(
        (todayRev.orders || []).slice(0, 5).map((o) => ({
          label: `#${o.ma_don_hang}${o.ten_ban ? ` · ${o.ten_ban}` : ''}${o.loai_don === 'mang_ve' ? ' · Mang về' : o.loai_don === 'giao_hang' ? ' · Giao hàng' : ''}`,
          time: new Date(o.ngay_tao).toLocaleString("vi-VN"),
          value: fmt(o.tong_tien),
          positive: true,
        }))
      );
    } catch (e) {
      console.error("Dashboard load error:", e);
      setError("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const now = new Date();
  const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const dateStr = `${dayNames[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} tháng ${now.getMonth() + 1}, ${now.getFullYear()}`;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="h-7 w-36 bg-surface-container-high rounded-lg animate-pulse" />
            <div className="h-4 w-52 bg-surface-container-high rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 h-24 animate-pulse">
              <div className="h-3 w-20 bg-surface-container-high rounded mb-3" />
              <div className="h-6 w-28 bg-surface-container-high rounded" />
            </div>
          ))}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Doanh thu hôm nay" value={fmt(todayRevenue.total)} icon="payments" sub={`${fmtN(todayRevenue.orders)} đơn hàng`} variant="success" />
            <StatCard label="Doanh thu tháng" value={fmt(monthRevenue.total)} icon="trending_up" sub={`${fmtN(monthRevenue.orders)} đơn hàng`} variant="default" />
            <StatCard label="Chi nhập kho tháng" value={fmt(costStats.month)} icon="shopping_cart" sub={`Hôm nay: ${fmt(costStats.day)}`} variant="warning" />
            <StatCard label="Công nợ" value={fmt(debt.tong_con_no)} icon="account_balance" sub={`${fmtN(debt.so_ncc_dang_no)} NCC · ${fmtN(debt.so_phieu_no)} phiếu`} variant={Number(debt.tong_con_no) > 0 ? "error" : "default"} />
          </div>

          {/* Chart + Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <DailyRevenueChart data={dailyChartData} loading={loading} onRefresh={loadDashboard} />
            </div>
            <OrderTypeBreakdown todayRevenue={todayRevenue} />
          </div>

          {/* Recent + Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RecentActivity title="Đơn hàng gần đây" items={recentOrders} loading={loading} />
            <QuickOverview todayRevenue={todayRevenue} todayCost={costStats.day} debt={debt} costStats={costStats} monthRevenue={monthRevenue} monthCost={costStats.month} />
          </div>
        </>
      )}
    </div>
  );
}
