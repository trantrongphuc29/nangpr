import { useState, useEffect, useCallback, useMemo } from "react";
import { getRevenueReport } from "../services/donHangService";
import { getCostStats } from "../services/nguyenlieuService";
import { getCongNoStats } from "../services/congNoService";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
const fmtN = (n) => Number(n || 0).toLocaleString("vi-VN");

/* ── StatCard ── */
function StatCard({ label, value, icon, accent, sub }) {
  return (
    <div className="card p-5 border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase text-muted tracking-widest">{label}</p>
          <p className="text-2xl md:text-3xl font-black text-on-surface mt-1 truncate group-hover:text-primary transition-colors">
            {value}
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

/* ── Mini Chart - Daily Revenue Bars ── */
function DailyRevenueChart({ data, loading, onRefresh }) {
  const maxVal = useMemo(() => Math.max(...data.map(d => d.total), 1), [data]);

  return (
    <div className="card border-none shadow-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-on-surface">📈 Doanh thu theo ngày (tháng này)</h3>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-surface-container-high disabled:opacity-40"
          title="Làm mới"
        >
          <span className={`material-symbols-outlined text-base text-muted ${loading ? 'animate-spin' : ''}`}>
            refresh
          </span>
        </button>
      </div>

      {loading ? (
        <div className="h-48 bg-surface-container-high rounded-xl animate-pulse" />
      ) : !data.length ? (
        <p className="text-sm text-muted text-center py-8">Chưa có dữ liệu doanh thu tháng này</p>
      ) : (
        <div className="flex items-end gap-1.5 h-48 overflow-x-auto pb-1 custom-scrollbar">
          {data.map((d) => {
            const pct = maxVal > 0 ? (d.total / maxVal) * 100 : 0;
            const isToday = d.isToday;
            return (
              <div key={d.date} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-high text-on-surface text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg border border-outline/10">
                  {d.dateLabel}: {fmt(d.total)}
                  <span className="text-muted ml-1">({d.count} đơn)</span>
                </div>
                {/* Bar */}
                <div
                  className={`w-full rounded-t-md transition-all duration-300 group-hover:opacity-80 ${
                    isToday
                      ? 'bg-primary shadow-sm shadow-primary/30'
                      : 'bg-primary/40'
                  }`}
                  style={{ height: `${Math.max(pct, 4)}%` }}
                />
                {/* Date label */}
                <span className={`text-[8px] font-semibold text-muted ${isToday ? 'text-primary font-black' : ''}`}>
                  {d.shortLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {!!data.length && (
        <p className="text-[10px] text-muted mt-3 text-center">
          Tổng: <strong className="text-on-surface">{fmt(data.reduce((s, d) => s + d.total, 0))}</strong>
          {" · "}{data.length} ngày có doanh thu
        </p>
      )}
    </div>
  );
}

/* ── RecentActivity ── */
function RecentActivity({ title, items, loading }) {
  return (
    <div className="card border-none shadow-lg p-5">
      <h3 className="text-sm font-bold text-on-surface mb-4">{title}</h3>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-surface-container-high rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">Chưa có dữ liệu</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-outline/50 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-on-surface truncate">{item.label}</p>
                <p className="text-xs text-muted">{item.time}</p>
              </div>
              <span className={`text-sm font-bold shrink-0 ml-3 ${item.positive ? 'text-success' : item.negative ? 'text-error' : 'text-on-surface'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── QuickOverview Panel ── */
function QuickOverview({ todayRevenue, todayCost, debt, costStats }) {
  const todayProfit = todayRevenue.total - todayCost;

  return (
    <div className="card border-none shadow-lg p-5">
      <h3 className="text-sm font-bold text-on-surface mb-4">📊 Tổng quan nhanh</h3>
      <div className="space-y-0 divide-y divide-outline/30">
        <div className="flex justify-between items-center py-2.5">
          <span className="text-sm text-muted">Doanh thu hôm nay</span>
          <span className="text-sm font-bold text-success">{fmt(todayRevenue.total)}</span>
        </div>
        <div className="flex justify-between items-center py-2.5">
          <span className="text-sm text-muted">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success/60" />
              Tiền mặt
            </span>
            {" / "}
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary/60" />
              Chuyển khoản
            </span>
          </span>
          <span className="text-sm font-bold">{fmt(todayRevenue.tm)} / {fmt(todayRevenue.ck)}</span>
        </div>
        <div className="flex justify-between items-center py-2.5">
          <span className="text-sm text-muted">Chi nhập hôm nay</span>
          <span className={`text-sm font-bold ${todayCost > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
            {todayCost > 0 ? fmt(todayCost) : '0đ'}
          </span>
        </div>
        <div className="flex justify-between items-center py-2.5">
          <span className="text-sm text-muted">Lợi nhuận hôm nay (ước tính)</span>
          <span className={`text-sm font-bold ${todayProfit >= 0 ? 'text-success' : 'text-error'}`}>
            {fmt(todayProfit)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2.5">
          <span className="text-sm text-muted">Chi nhập tuần này</span>
          <span className="text-sm font-bold text-error">{fmt(costStats.week)}</span>
        </div>
        <div className="flex justify-between items-center py-2.5">
          <span className="text-sm text-muted">Chi nhập năm nay</span>
          <span className="text-sm font-bold text-error">{fmt(costStats.year)}</span>
        </div>
        <div className="flex justify-between items-center py-2.5">
          <span className="text-sm text-muted">Công nợ chưa thanh toán</span>
          <span className="text-sm font-bold text-error">{fmt(debt.tong_con_no)}</span>
        </div>
        <div className="flex justify-between items-center py-2.5">
          <span className="text-sm text-muted">Số NCC đang nợ</span>
          <span className="text-sm font-bold text-on-surface">{fmtN(debt.so_ncc_dang_no)}</span>
        </div>
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
    <div className="card border-none shadow-lg p-5">
      <h3 className="text-sm font-bold text-on-surface mb-4">🧾 Phân tích doanh thu hôm nay</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-on-surface">Tổng đơn hàng</span>
            <span className="font-bold text-primary">{fmtN(todayRevenue.orders)} đơn</span>
          </div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-success flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success" />
              Tiền mặt
            </span>
            <span className="font-bold text-on-surface">{fmt(todayRevenue.tm)} ({tmPct}%)</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden flex">
            <div
              className="h-full rounded-l-full transition-all duration-500"
              style={{ width: `${tmPct}%`, backgroundColor: "var(--color-success)" }}
            />
            <div
              className="h-full rounded-r-full transition-all duration-500"
              style={{ width: `${ckPct}%`, backgroundColor: "var(--color-primary)" }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span className="font-semibold text-primary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Chuyển khoản
            </span>
            <span className="font-bold text-on-surface">{fmt(todayRevenue.ck)} ({ckPct}%)</span>
          </div>
        </div>
        <div className="border-t border-outline/30 pt-3">
          <p className="text-[10px] font-bold text-muted uppercase mb-2">Loại đơn</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl p-2.5" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)" }}>
              <p className="text-lg font-black text-primary">{fmtN(todayRevenue.taiCho || 0)}</p>
              <p className="text-[9px] text-muted font-medium">Tại chỗ</p>
            </div>
            <div className="rounded-xl p-2.5" style={{ backgroundColor: "color-mix(in srgb, var(--color-secondary) 8%, transparent)" }}>
              <p className="text-lg font-black text-secondary">{fmtN(todayRevenue.mangVe || 0)}</p>
              <p className="text-[9px] text-muted font-medium">Mang về</p>
            </div>
            <div className="rounded-xl p-2.5" style={{ backgroundColor: "color-mix(in srgb, var(--color-warning) 8%, transparent)" }}>
              <p className="text-lg font-black text-warning">{fmtN(todayRevenue.giaoHang || 0)}</p>
              <p className="text-[9px] text-muted font-medium">Giao hàng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Utils: group orders by date ── */
function groupOrdersByDate(orders) {
  const map = {};
  orders.forEach((o) => {
    // ngay_tao is stored in UTC, need to convert to VN time
    const d = new Date(o.ngay_tao);
    const vn = new Date(d.getTime() + 7 * 3600000);
    const key = `${vn.getUTCFullYear()}-${String(vn.getUTCMonth() + 1).padStart(2, '0')}-${String(vn.getUTCDate()).padStart(2, '0')}`;
    const label = `${String(vn.getUTCDate()).padStart(2, '0')}/${String(vn.getUTCMonth() + 1).padStart(2, '0')}`;
    const shortLabel = String(vn.getUTCDate());
    if (!map[key]) {
      map[key] = { date: key, dateLabel: label, shortLabel, total: 0, count: 0 };
    }
    map[key].total += Number(o.tong_tien || 0);
    map[key].count += 1;
  });
  // Sort by date ascending
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

/* ── Main Page ── */
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Revenue data
  const [todayRevenue, setTodayRevenue] = useState({ total: 0, orders: 0, tm: 0, ck: 0, taiCho: 0, mangVe: 0, giaoHang: 0 });
  const [monthRevenue, setMonthRevenue] = useState({ total: 0, orders: 0 });
  const [monthOrders, setMonthOrders] = useState([]); // full list for chart

  // Cost data
  const [costStats, setCostStats] = useState({ day: 0, week: 0, month: 0, year: 0 });

  // Debt data
  const [debt, setDebt] = useState({ tong_con_no: 0, so_phieu_no: 0, da_tra_trong_thang: 0, chi_trong_thang: 0, so_ncc_dang_no: 0 });

  // Recent orders
  const [recentOrders, setRecentOrders] = useState([]);

  // Daily chart data
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

      // ── Today revenue ──
      const todayOrdersList = todayRev.orders || [];
      const tmTotal = todayOrdersList
        .filter((o) => o.hinh_thuc_thanh_toan !== "chuyen_khoan")
        .reduce((s, o) => s + Number(o.tong_tien || 0), 0);
      const ckTotal = todayOrdersList
        .filter((o) => o.hinh_thuc_thanh_toan === "chuyen_khoan")
        .reduce((s, o) => s + Number(o.tong_tien || 0), 0);

      const taiCho = todayOrdersList.filter(o => o.loai_don === 'tai_cho' || !o.loai_don).length;
      const mangVe = todayOrdersList.filter(o => o.loai_don === 'mang_ve').length;
      const giaoHang = todayOrdersList.filter(o => o.loai_don === 'giao_hang').length;

      setTodayRevenue({
        total: todayRev.summary?.total_revenue || 0,
        orders: todayRev.summary?.total_orders || 0,
        tm: tmTotal,
        ck: ckTotal,
        taiCho,
        mangVe,
        giaoHang,
      });

      // ── Month revenue ──
      setMonthRevenue({
        total: monthRev.summary?.total_revenue || 0,
        orders: monthRev.summary?.total_orders || 0,
      });
      setMonthOrders(monthRev.orders || []);

      // ── Cost stats ──
      setCostStats({
        day: costResult.day || 0,
        week: costResult.week || 0,
        month: costResult.month || 0,
        year: costResult.year || 0,
      });

      // ── Debt stats ──
      setDebt({
        tong_con_no: debtResult.tong_con_no || 0,
        so_phieu_no: debtResult.so_phieu_no || 0,
        da_tra_trong_thang: debtResult.da_tra_trong_thang || 0,
        chi_trong_thang: debtResult.chi_trong_thang || 0,
        so_ncc_dang_no: debtResult.so_ncc_dang_no || 0,
      });

      // ── Recent orders ──
      setRecentOrders(
        (todayRev.orders || []).slice(0, 5).map((o) => ({
          label: `Đơn #${o.ma_don_hang}${o.ten_ban ? ` - ${o.ten_ban}` : ''}${o.loai_don === 'mang_ve' ? ' 🥡' : o.loai_don === 'giao_hang' ? ' 🚚' : ''}`,
          time: new Date(o.ngay_tao).toLocaleString("vi-VN"),
          value: fmt(o.tong_tien),
          positive: true,
        }))
      );
    } catch (e) {
      console.error("Dashboard load error:", e);
      setError("Không thể tải dữ liệu dashboard. Vui lòng kiểm tra kết nối.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // ── Derived stats ──
  const loiNhuan = monthRevenue.total - costStats.month;
  const tiLeLoiNhuan = monthRevenue.total > 0
    ? ((loiNhuan / monthRevenue.total) * 100).toFixed(1)
    : "0.0";

  const todayProfit = todayRevenue.total - costStats.day;

  const now = new Date();
  const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const dateStr = `${dayNames[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-container-high rounded-lg animate-pulse" />
        <div className="h-5 w-72 bg-surface-container-high rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 border-none shadow-lg h-28 animate-pulse">
              <div className="h-4 w-24 bg-surface-container-high rounded mb-3" />
              <div className="h-8 w-32 bg-surface-container-high rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="transition-colors duration-500 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }}>dashboard</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-primary)" }}>Dashboard</h2>
            <p className="text-xs text-muted">{dateStr}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="btn-outline !py-2 !px-4 !text-xs flex items-center gap-2 self-start"
        >
          <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>
            refresh
          </span>
          Làm mới
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 rounded-xl bg-error-container border border-error/20 text-sm text-error flex items-center gap-3">
          <span className="material-symbols-outlined text-lg">error_outline</span>
          {error}
          <button onClick={loadDashboard} className="ml-auto underline font-semibold shrink-0">Thử lại</button>
        </div>
      )}

      {!error && (
        <>
          {/* Row 1: Main KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Doanh thu hôm nay"
              value={fmt(todayRevenue.total)}
              icon="payments"
              accent="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              sub={`${fmtN(todayRevenue.orders)} đơn hàng`}
            />
            <StatCard
              label="Doanh thu tháng này"
              value={fmt(monthRevenue.total)}
              icon="trending_up"
              accent="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              sub={`${fmtN(monthRevenue.orders)} đơn hàng`}
            />
            <StatCard
              label="Chi nhập kho tháng"
              value={fmt(costStats.month)}
              icon="shopping_cart"
              accent="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
              sub={`Hôm nay: ${fmt(costStats.day)}`}
            />
            <StatCard
              label="Công nợ đang theo dõi"
              value={fmt(debt.tong_con_no)}
              icon="account_balance"
              accent="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              sub={`${fmtN(debt.so_phieu_no)} phiếu · ${fmtN(debt.so_ncc_dang_no)} NCC`}
            />
          </div>

          {/* Row 2: Secondary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Lợi nhuận tháng (ước tính)"
              value={loiNhuan >= 0 ? fmt(loiNhuan) : `-${fmt(Math.abs(loiNhuan))}`}
              icon={loiNhuan >= 0 ? "emoji_events" : "warning"}
              accent={loiNhuan >= 0
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              }
              sub={`Tỉ lệ lợi nhuận: ${tiLeLoiNhuan}% · Tỉ lệ CP: ${monthRevenue.total > 0 ? ((costStats.month / monthRevenue.total) * 100).toFixed(1) : '0.0'}%`}
            />
            <StatCard
              label="Lợi nhuận hôm nay"
              value={todayProfit >= 0 ? fmt(todayProfit) : `-${fmt(Math.abs(todayProfit))}`}
              icon={todayProfit >= 0 ? "arrow_upward" : "arrow_downward"}
              accent={todayRevenue.total > 0
                ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
              }
              sub={todayRevenue.total > 0
                ? `Tỉ lệ: ${((todayProfit / todayRevenue.total) * 100).toFixed(1)}%`
                : "Chưa có doanh thu"}
            />
            <StatCard
              label="Đã trả NCC tháng này"
              value={fmt(debt.da_tra_trong_thang)}
              icon="check_circle"
              accent="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              sub={`Tổng nhập: ${fmt(debt.chi_trong_thang)}`}
            />
            <StatCard
              label="Hôm nay: Tiền mặt / CK"
              value={`${fmt(todayRevenue.tm)} / ${fmt(todayRevenue.ck)}`}
              icon="account_balance_wallet"
              accent="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              sub={`${fmtN(todayRevenue.orders)} đơn`}
            />
          </div>

          {/* Row 3: Chart + Order Type Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <DailyRevenueChart data={dailyChartData} loading={loading} onRefresh={loadDashboard} />
            </div>
            <OrderTypeBreakdown todayRevenue={todayRevenue} />
          </div>

          {/* Row 4: Recent + Quick Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <RecentActivity
              title="🕐 Đơn hàng gần đây"
              items={recentOrders}
              loading={loading}
            />
            <QuickOverview
              todayRevenue={todayRevenue}
              todayCost={costStats.day}
              debt={debt}
              costStats={costStats}
            />
          </div>
        </>
      )}
    </div>
  );
}
