import { useCallback, useEffect, useMemo, useState } from "react";
import { getBanPosList } from "../services/banService";
import { getMenuPos } from "../services/monService";
import * as donHangApi from "../services/donHangService";
import PosMenu from "../components/PosMenu";

/* ───── banhangUtils ───── */
const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

const isTableBusy = (ban) => Boolean(ban.co_khach || ban.ma_don_hang);

function baseHTML(body) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>In</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Courier New',monospace;color:#000;background:#fff}
  @media print{body{background:#fff}}
</style>
</head>
<body>${body}</body>
</html>`;
}

function buildPrintHTML(mode, { table, order, newItems, tenKhach, soDienThoaiGiao, diaChiGiao, phiGiaoHang }) {
  const now = new Date().toLocaleString("vi-VN");
  const items = order?.items || [];
  const tenBan = table?.ten_ban || (order?.loai_don === "mang_ve" ? "🥡 Mang về" : order?.loai_don === "giao_hang" ? "🚚 Giao hàng" : "—");
  const maDon = order?.ma_don_hang || "";
  const deliveryOrder = order?.loai_don === "giao_hang";

  if (mode === "mon") {
    const monItems =
      newItems?.length > 0
        ? newItems
        : items.filter((i) => (i.so_luong_cho_bar || 0) > 0);

    const rows = monItems
      .map(
        (i, idx) => `
        <tr${idx % 2 === 1 ? ' style="background:#f5f5f5"' : ""}>
          <td style="padding:10px 8px;font-weight:700;font-size:15px">${i.ten_mon}</td>
          <td style="padding:10px 8px;text-align:center;font-weight:900;font-size:20px">${i.so_luong_cho_bar || i.so_luong}</td>
        </tr>`
      )
      .join("");

    return baseHTML(`
      <div style="padding:20px;font-family:'Courier New',monospace;max-width:320px;margin:0 auto;color:#000">
        <div style="text-align:center;margin-bottom:12px">
          <div style="font-size:22px;font-weight:900;letter-spacing:2px;text-transform:uppercase">Nắng PR</div>
          <div style="font-size:11px;color:#888;margin-top:2px">Phiếu chế biến</div>
        </div>
        <div style="border-top:2px solid #000;border-bottom:2px solid #000;padding:10px 0;margin-bottom:14px;text-align:center">
          <div style="font-size:28px;font-weight:900">${tenBan}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="border-bottom:1px solid #999;font-size:10px;text-transform:uppercase">
              <th style="padding:4px 8px;text-align:left;font-weight:700">Món</th>
              <th style="padding:4px 8px;text-align:center;width:48px;font-weight:700">SL</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="2" style="padding:20px;text-align:center;color:#999">Không có món</td></tr>'}
          </tbody>
        </table>
        <div style="margin-top:16px;text-align:center;font-size:10px;color:#aaa">${now}</div>
      </div>
    `);
  }

  // mode === "bill"
  const rows = items
    .map(
      (i, idx) => `
      <tr${idx % 2 === 1 ? ' style="background:#f5f5f5"' : ""}>
        <td style="padding:8px 6px">${i.ten_mon}</td>
        <td style="padding:8px 6px;text-align:center;width:36px">${i.so_luong}</td>
        <td style="padding:8px 6px;text-align:right;width:80px">${fmtMoney(i.so_luong * i.don_gia)}</td>
      </tr>`
    )
    .join("");

  const tongTienMon = Number(order?.tong_tien || 0);
  const phiGiao = Number(phiGiaoHang || 0);
  const tongCong = tongTienMon + phiGiao;

  return baseHTML(`
    <div style="padding:20px;font-family:'Courier New',monospace;max-width:360px;margin:0 auto;color:#000">
      <div style="text-align:center;margin-bottom:12px">
        <div style="font-size:22px;font-weight:900;letter-spacing:2px;text-transform:uppercase">Nắng PR</div>
        <div style="font-size:11px;color:#888;margin-top:2px">Hoá đơn thanh toán</div>
      </div>
      <div style="border-top:1px solid #000;border-bottom:1px solid #000;padding:8px 0;margin-bottom:12px;text-align:center">
        <div style="font-weight:700">${tenBan}</div>
        <div style="font-size:10px;color:#888">Đơn #${maDon}</div>
      </div>
      ${deliveryOrder ? `
      <div style="margin-bottom:12px;padding:8px 6px;border:1px solid #000;border-radius:2px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:6px">Thông tin giao hàng</div>
        ${tenKhach ? `<div style="font-size:12px;margin-bottom:2px"><span style="font-weight:700">Tên KH:</span> ${tenKhach}</div>` : ''}
        ${soDienThoaiGiao ? `<div style="font-size:12px;margin-bottom:2px"><span style="font-weight:700">SĐT:</span> ${soDienThoaiGiao}</div>` : ''}
        ${diaChiGiao ? `<div style="font-size:12px"><span style="font-weight:700">Địa chỉ:</span> ${diaChiGiao}</div>` : ''}
      </div>
      ` : ''}
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="border-bottom:2px solid #000;font-size:9px;text-transform:uppercase">
            <th style="padding:4px 6px;text-align:left;font-weight:700">Món</th>
            <th style="padding:4px 6px;text-align:center;width:32px;font-weight:700">SL</th>
            <th style="padding:4px 6px;text-align:right;width:72px;font-weight:700">Tiền</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="3" style="padding:20px;text-align:center;color:#999">Trống</td></tr>'}
        </tbody>
      </table>
      ${deliveryOrder ? `
      <div style="border-top:2px solid #000;margin-top:10px;padding-top:6px">
        <div style="display:flex;justify-content:space-between;font-size:14px;padding:2px 0">
          <span>Tiền món:</span>
          <span>${fmtMoney(tongTienMon)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 0;color:#666">
          <span>Phí giao hàng:</span>
          <span>${fmtMoney(phiGiao)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:900;border-top:1px dashed #000;padding-top:4px;margin-top:2px">
          <span>Tổng cộng:</span>
          <span>${fmtMoney(tongCong)}</span>
        </div>
      </div>
      ` : `
      <div style="border-top:2px solid #000;margin-top:8px;padding-top:6px;display:flex;justify-content:space-between;font-size:16px;font-weight:900">
        <span>Tổng cộng:</span>
        <span>${fmtMoney(order?.tong_tien || 0)}</span>
      </div>
      `}
      <div style="margin-top:16px;text-align:center;font-size:10px;color:#aaa">${now}</div>
      <div style="margin-top:2px;text-align:center;font-size:10px;color:#aaa">Cảm ơn quý khách!</div>
    </div>
  `);
}

function buildCombinedPrintHTML({ table, order, tenKhach, soDienThoaiGiao, diaChiGiao, phiGiaoHang }) {
  const html1 = buildPrintHTML("mon", { table, order, newItems: null });
  const html2 = buildPrintHTML("bill", { table, order, tenKhach, soDienThoaiGiao, diaChiGiao, phiGiaoHang });
  // Trích body từ 2 trang và ghép với page-break
  const body1 = html1.match(/<body>([\s\S]*)<\/body>/)?.[1] || "";
  const body2 = html2.match(/<body>([\s\S]*)<\/body>/)?.[1] || "";
  return baseHTML(`
    <div style="page-break-after:always">${body1}</div>
    ${body2}
  `);
}

/* ───── BanHangCart ───── */
function BanHangCart({
  table,
  order,
  busy,
  loaiDon,
  phiGiaoHang,
  tenKhach,
  diaChiGiao,
  soDienThoaiGiao,
  onUpdatePhiGiaoHang,
  onUpdateDeliveryInfo,
  onQty,
  onPrintMon,
  onPrintBill,
  onPay,
  onCombinedPay,
}) {
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-stone-400">
        <span className="material-symbols-outlined text-4xl mb-2">table_restaurant</span>
        <p className="text-sm font-medium">Chọn bàn trống để gọi món</p>
        <p className="text-xs mt-1">Bấm vào bàn màu trắng để bắt đầu</p>
      </div>
    );
  }

  const items = order.items || [];
  const hasNewItems = items.some((i) => i.so_luong_cho_bar > 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-primary uppercase text-sm">
          {table?.ten_ban} · #{order.ma_don_hang}
        </h3>
        {hasNewItems && (
          <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full animate-pulse">
            +{items.reduce((s, i) => s + (i.so_luong_cho_bar || 0), 0)} món mới
          </span>
        )}
      </div>

      {/* Items list */}
      <ul className="flex-1 overflow-y-auto space-y-1.5 min-h-[180px] max-h-[340px]">
        {items.map((item) => {
          const daGui = Number(item.so_luong_da_gui_bar || 0);
          const choBar = Number(item.so_luong_cho_bar || 0);
          const daInHet = choBar <= 0 && daGui > 0;
          return (
          <li key={item.ma_mon} className={`flex items-center gap-2 p-2.5 rounded-lg text-sm transition-all ${daInHet ? 'bg-stone-100/70 border border-stone-200' : 'bg-stone-50'}`}>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{item.ten_mon}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {daGui > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200/60">
                    🖨️ {daGui} đã in
                  </span>
                )}
                {choBar > 0 && (
                  <span className="text-[10px] font-bold text-red-600">+{choBar} mới</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={busy || daInHet}
                title={daInHet ? `Món này đã in ${daGui} cái — không thể xoá` : 'Giảm số lượng'}
                className={`w-7 h-7 rounded font-bold transition-all ${
                  busy || daInHet
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-stone-200 hover:bg-stone-300 active:scale-90'
                }`}
                onClick={() => onQty(item.ma_mon, item.so_luong - 1)}
              >−</button>
              <span className="w-5 text-center font-black">{item.so_luong}</span>
              <button
                type="button"
                disabled={busy}
                className={`w-7 h-7 rounded font-bold transition-all ${
                  busy
                    ? 'bg-primary/40 text-white cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/80 active:scale-90'
                }`}
                onClick={() => onQty(item.ma_mon, item.so_luong + 1)}
              >+</button>
            </div>
            <span className="font-bold w-16 text-right text-primary">{fmtMoney(item.so_luong * item.don_gia)}</span>
          </li>
          );
        })}
        {!items.length && <li className="text-center text-stone-400 py-6">Chưa có món</li>}
      </ul>

      {/* Delivery info form (only for Giao hàng) */}
      {loaiDon === "giao_hang" && (
        <div className="space-y-2 pt-1 mb-2">
          {/* Tên khách hàng */}
          <div className="flex items-center gap-2 bg-sky-50/50 rounded-xl p-3 border border-sky-200/50">
            <span className="material-symbols-outlined text-sky-600 text-lg">person</span>
            <input
              type="text"
              className="flex-1 bg-transparent border-none text-sm font-medium placeholder:text-muted/60 focus:ring-0 p-0"
              placeholder="Tên khách hàng..."
              value={tenKhach || ""}
              onChange={(e) => onUpdateDeliveryInfo({ ten_khach: e.target.value })}
            />
          </div>
          {/* Số điện thoại */}
          <div className="flex items-center gap-2 bg-sky-50/50 rounded-xl p-3 border border-sky-200/50">
            <span className="material-symbols-outlined text-sky-600 text-lg">phone</span>
            <input
              type="tel"
              className="flex-1 bg-transparent border-none text-sm font-medium placeholder:text-muted/60 focus:ring-0 p-0"
              placeholder="Số điện thoại người nhận..."
              value={soDienThoaiGiao || ""}
              onChange={(e) => onUpdateDeliveryInfo({ so_dien_thoai_giao: e.target.value })}
            />
          </div>
          {/* Địa chỉ */}
          <div className="flex items-start gap-2 bg-sky-50/50 rounded-xl p-3 border border-sky-200/50">
            <span className="material-symbols-outlined text-sky-600 text-lg mt-0.5">location_on</span>
            <textarea
              className="flex-1 bg-transparent border-none text-sm font-medium placeholder:text-muted/60 focus:ring-0 p-0 resize-none min-h-[38px]"
              rows={2}
              placeholder="Địa chỉ giao hàng..."
              value={diaChiGiao || ""}
              onChange={(e) => onUpdateDeliveryInfo({ dia_chi_giao: e.target.value })}
            />
          </div>
          {/* Phí giao hàng */}
          <div className="flex items-center justify-between bg-amber-50/50 rounded-xl p-3 border border-amber-200/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-lg">delivery_dining</span>
              <span className="text-xs font-bold text-amber-800">Phí giao hàng</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1000"
                className="w-24 text-right font-bold text-sm bg-white border border-amber-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-amber-400/30"
                placeholder="0"
                value={phiGiaoHang || ""}
                onChange={(e) => onUpdatePhiGiaoHang(e.target.value)}
              />
              <span className="text-xs font-bold text-amber-700">đ</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-stone-200 pt-3 mt-2 space-y-2">
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>Tạm tính</span>
            <span>{fmtMoney(order.tong_tien)}</span>
          </div>
          {loaiDon === "giao_hang" && (
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Phí giao hàng</span>
              <span>{fmtMoney(phiGiaoHang)}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between font-black text-lg text-primary border-t border-stone-200 pt-2">
          <span>Tổng cộng</span>
          <span>{fmtMoney(Number(order.tong_tien) + Number(phiGiaoHang))}</span>
        </div>
        {loaiDon === 'tai_cho' ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={busy || !items.length || !hasNewItems}
                onClick={onPrintMon}
                className="py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs uppercase disabled:opacity-40 transition-all hover:bg-amber-600"
              >
                🖨️ In món
              </button>
              <button
                type="button"
                disabled={busy || !items.length}
                onClick={onPrintBill}
                className="py-2.5 rounded-xl border-2 border-stone-300 font-bold text-xs uppercase hover:border-primary hover:text-primary transition-all"
              >
                In bill
              </button>
            </div>
            <button
              type="button"
              disabled={busy || !items.length}
              onClick={onPay}
              className="w-full py-3 rounded-xl bg-primary text-white font-black uppercase text-sm disabled:opacity-40 hover:bg-primary/90 transition-all"
            >
              Thanh toán
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={busy || !items.length}
            onClick={onCombinedPay}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black uppercase text-sm disabled:opacity-40 hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-200/50 flex items-center justify-center gap-2"
          >
            <span className="text-lg">🧾</span>
            <span>In bill &amp; Thanh toán</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ───── BanHangTables ───── */
function BanHangTables({ tables, selected, busy, onSelect, onMoveBan, order }) {
  const [swapMode, setSwapMode] = useState(false);

  const handleClick = (ban) => {
    if (swapMode && order?.ma_don_hang && ban.ma_ban !== selected?.ma_ban) {
      if (window.confirm(`Chuyển đơn #${order.ma_don_hang} từ "${selected?.ten_ban}" sang "${ban.ten_ban}"?`)) {
        onMoveBan(ban.ma_ban);
      }
      setSwapMode(false);
      return;
    }
    onSelect(ban);
  };

  const handleSwapToggle = () => {
    if (swapMode) {
      setSwapMode(false);
    } else {
      if (!order?.ma_don_hang) {
        return;
      }
      setSwapMode(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with counter */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-stone-400 uppercase text-[10px] tracking-wider">
            Bàn trong quán
          </h3>
          <span className="text-[9px] font-bold text-stone-400 bg-stone-100/80 px-2 py-0.5 rounded-full">
            {tables.length} bàn
          </span>
        </div>
        {order?.ma_don_hang && (
          <button
            type="button"
            onClick={handleSwapToggle}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
              swapMode
                ? "bg-amber-500 text-white ring-2 ring-amber-300"
                : "text-amber-600 hover:bg-amber-50 border border-stone-200"
            }`}
          >
            {swapMode ? "✕ Huỷ" : "⇄ Đổi bàn"}
          </button>
        )}
      </div>

      {swapMode && (
        <div className="mb-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700 text-center">
          👆 Chọn bàn muốn chuyển đến
        </div>
      )}

      {/* Quầy indicator */}
      <div className="relative flex items-center justify-center mb-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
        <span className="absolute flex items-center gap-1.5 text-[9px] text-stone-400 font-medium bg-white px-3 py-1 rounded-full border border-stone-100 shadow-sm">
          <span className="text-[11px]">🏪</span>
          Quầy thu ngân
        </span>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {tables.map((b) => {
          const busyTable = isTableBusy(b);
          const active = selected?.ma_ban === b.ma_ban;
          const isMoving = swapMode && active;

          return (
            <button
              key={b.ma_ban}
              type="button"
              disabled={busy && !swapMode}
              onClick={() => handleClick(b)}
              className={[
                "relative rounded-xl text-center transition-all duration-150",
                "hover:shadow-lg",
                active && !isMoving && "ring-4 ring-primary ring-offset-2 scale-[1.02] z-10",
                isMoving && "ring-4 ring-amber-400 ring-offset-2 bg-amber-50 border-amber-400 scale-[1.02] z-10",
                swapMode && !active && busyTable && "cursor-pointer border-2 border-amber-300 bg-amber-50/30 hover:bg-amber-50",
                !isMoving && busyTable && !swapMode
                  ? "bg-gradient-to-br from-red-500 to-rose-600 border-0 text-white shadow-md shadow-rose-200/50"
                  : "",
                !isMoving && !busyTable && !swapMode
                  ? "group bg-white border border-stone-200 text-stone-800 hover:border-primary hover:bg-primary/5 hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-200/50"
                  : "",
                swapMode && !active && !busyTable && "border-2 border-dashed border-stone-300 text-stone-500 hover:border-amber-400 hover:bg-amber-50/50",
              ].filter(Boolean).join(" ")}
              style={!isMoving && !swapMode && !busyTable ? { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' } : {}}
            >
              {/* Background decoration for busy tables */}
              {busyTable && !isMoving && (
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" />
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-white/5" />
                </div>
              )}

              <div className="relative z-10 p-3">
                <div className={[
                  "w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center text-base transition-all",
                  busyTable && !isMoving ? "bg-white/20" : "bg-stone-50 group-hover:bg-primary/5",
                ].join(" ")}>
                  {busyTable ? "🍽️" : "🪑"}
                </div>

                <p className="font-bold text-xs leading-tight">{b.ten_ban}</p>

                <p className={[
                  "text-[9px] font-semibold mt-1",
                  busyTable && !isMoving ? "text-white/80" : "text-stone-400",
                ].join(" ")}>
                  {busyTable ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-white/60 animate-pulse" />
                      {fmtMoney(b.tong_tien_hien_tai)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-green-400" />
                      <span className="text-stone-400">Trống</span>
                    </span>
                  )}
                </p>
              </div>

              {active && !isMoving && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary border-[3px] border-white shadow-md z-20" />
              )}

              {swapMode && !active && (
                <span className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-md flex items-center justify-center text-[7px] font-black text-white z-20">
                  +
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───── useBanHang ───── */
function useBanHang() {
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [table, setTable] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refreshTables = useCallback(async () => {
    try {
      const data = await getBanPosList();
      // Sắp xếp theo tên bàn (natural order: Bàn 1, Bàn 2, ..., Bàn 10)
      setTables(data.sort((a, b) => {
        const numA = parseInt(a.ten_ban?.match(/\d+/)?.[0] || 0, 10);
        const numB = parseInt(b.ten_ban?.match(/\d+/)?.[0] || 0, 10);
        return numA - numB;
      }));
    } catch (e) {
      const msg = e.response?.data?.message || e.message || "Không thể tải danh sách bàn";
      setError(msg);
      console.error("Lỗi tải danh sách bàn:", e);
    }
  }, []);

  const refreshMenu = useCallback(async () => {
    try {
      setMenu(await getMenuPos());
    } catch (e) {
      console.error("Lỗi tải thực đơn:", e);
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([refreshTables(), refreshMenu()]);
    } catch (e) {
      setError("Không thể tải dữ liệu ban đầu. Vui lòng refresh trang.");
    } finally {
      setLoading(false);
    }
  }, [refreshTables, refreshMenu]);

  useEffect(() => {
    init();
  }, [init]);

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      return await fn();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Có lỗi xảy ra");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const [loaiDon, setLoaiDon] = useState("tai_cho");
  const [phiGiaoHang, setPhiGiaoHang] = useState(0);
  const [soDienThoaiGiao, setSoDienThoaiGiao] = useState("");
  const [diaChiGiao, setDiaChiGiao] = useState("");
  const [tenKhach, setTenKhach] = useState("");

  const selectTable = (ban) =>
    run(async () => {
      setTable(ban);
      const data = await donHangApi.openOrder({ ma_ban: ban.ma_ban, loai_don: loaiDon });
      setOrder(data);
      // Đồng bộ loai_don từ order (backend chỉ cập nhật nếu khác, an toàn khi mở lại đơn cũ)
      if (data?.loai_don) setLoaiDon(data.loai_don);
      if (data?.phi_giao_hang !== undefined) setPhiGiaoHang(Number(data.phi_giao_hang));
      if (data?.so_dien_thoai_giao) setSoDienThoaiGiao(data.so_dien_thoai_giao);
      if (data?.dia_chi_giao) setDiaChiGiao(data.dia_chi_giao);
      if (data?.ten_khach) setTenKhach(data.ten_khach);
      await refreshTables();
    });

  const openKhongBan = (newType) =>
    run(async () => {
      setTable(null);
      setLoaiDon(newType);
      if (newType === "giao_hang") {
        setPhiGiaoHang(0);
        setSoDienThoaiGiao("");
        setDiaChiGiao("");
        setTenKhach("");
      }
      const data = await donHangApi.openOrder({ loai_don: newType });
      setOrder(data);
      if (data?.loai_don) setLoaiDon(data.loai_don);
      if (data?.phi_giao_hang !== undefined) setPhiGiaoHang(Number(data.phi_giao_hang));
      if (data?.so_dien_thoai_giao) setSoDienThoaiGiao(data.so_dien_thoai_giao);
      if (data?.dia_chi_giao) setDiaChiGiao(data.dia_chi_giao);
      if (data?.ten_khach) setTenKhach(data.ten_khach);
    });

  const addMon = (mon) => {
    if (!order?.ma_don_hang) {
      setError("Vui lòng mở đơn trước khi gọi món");
      return Promise.resolve();
    }
    if (mon.het_hang) {
      setError(`"${mon.ten_mon}" hết kho — tạm khóa`);
      return Promise.resolve();
    }
    return run(async () => {
      const data = await donHangApi.addItem(order.ma_don_hang, { ma_mon: mon.ma_mon, so_luong: 1 });
      setOrder(data);
      await refreshTables();
    });
  };

  const changeQty = (ma_mon, so_luong) =>
    run(async () => {
      const data = await donHangApi.updateItemQty(order.ma_don_hang, ma_mon, so_luong);
      setOrder(data);
      await refreshTables();
    });

  const sendBar = () =>
    run(async () => {
      const data = await donHangApi.sendToBar(order.ma_don_hang);
      setOrder(data);
      setError("");
      return true;
    });

  const pay = (hinhThuc) =>
    run(async () => {
      await donHangApi.checkout(order.ma_don_hang, hinhThuc);
      setOrder(null);
      setTable(null);
      await Promise.all([refreshTables(), refreshMenu()]);
      return true;
    });

  const moveBan = (targetMaBan) =>
    run(async () => {
      if (!order?.ma_don_hang) {
        setError("Không có đơn để chuyển");
        return null;
      }
      const result = await donHangApi.moveOrderToBan(order.ma_don_hang, targetMaBan);
      setOrder(result.data);
      const targetTable = tables.find(t => t.ma_ban === targetMaBan);
      setTable(targetTable || null);
      await refreshTables();
      return result;
    });

  const clearSelection = () => {
    setTable(null);
    setOrder(null);
    setLoaiDon("tai_cho");
    setPhiGiaoHang(0);
    setSoDienThoaiGiao("");
    setDiaChiGiao("");
    setTenKhach("");
    setError("");
  };

  return {
    tables,
    menu,
    table,
    order,
    loading,
    busy,
    error,
    setError,
    selectTable,
    addMon,
    changeQty,
    sendBar,
    pay,    moveBan, clearSelection, refreshTables,
    loaiDon, openKhongBan,
    phiGiaoHang, soDienThoaiGiao, diaChiGiao, tenKhach,
    updatePhiGiaoHang: async (value) => {
      const phi = Number(value) || 0;
      setPhiGiaoHang(phi);
      if (order?.ma_don_hang) {
        try {
          const data = await donHangApi.updatePhiGiaoHang(order.ma_don_hang, phi);
          if (data?.data) setOrder(data.data);
        } catch (e) {
          console.error("Lỗi cập nhật phí giao hàng:", e);
        }
      }
    },
    updateDeliveryInfo: async (field) => {
      if (field.so_dien_thoai_giao !== undefined) setSoDienThoaiGiao(field.so_dien_thoai_giao);
      if (field.dia_chi_giao !== undefined) setDiaChiGiao(field.dia_chi_giao);
      if (field.ten_khach !== undefined) setTenKhach(field.ten_khach);
      if (order?.ma_don_hang) {
        try {
          const data = await donHangApi.updateDeliveryInfo(order.ma_don_hang, {
            ten_khach: field.ten_khach ?? tenKhach,
            so_dien_thoai_giao: field.so_dien_thoai_giao ?? soDienThoaiGiao,
            dia_chi_giao: field.dia_chi_giao ?? diaChiGiao,
          });
          if (data?.data) setOrder(data.data);
        } catch (e) {
          console.error("Lỗi cập nhật thông tin giao hàng:", e);
        }
      }
    },
  };
}

/* ───── Main Page Component ───── */
export default function BanHang() {
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveBanErr, setMoveBanErr] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hinhThucThanhToan, setHinhThucThanhToan] = useState("tien_mat");
  const bh = useBanHang();

  const doPrint = async (mode) => {
    if (!bh.order?.items?.length) return;

    if (mode === "mon") {
      const newItems = bh.order.items.filter((i) => i.so_luong_cho_bar > 0);
      if (!newItems.length) {
        bh.setError("Không có món mới để in");
        return;
      }
      const ok = await bh.sendBar();
      if (!ok) return;
      const html = buildPrintHTML("mon", { table: bh.table, order: bh.order, newItems });
      openAndPrint(html);
      bh.clearSelection();
    } else {
      const html = buildPrintHTML("bill", {
        table: bh.table,
        order: bh.order,
        tenKhach: bh.tenKhach,
        soDienThoaiGiao: bh.soDienThoaiGiao,
        diaChiGiao: bh.diaChiGiao,
        phiGiaoHang: bh.phiGiaoHang,
      });
      openAndPrint(html);
    }
  };

  const openAndPrint = (html) => {
    const w = window.open("", "_blank", "width=400,height=600,menubar=no,toolbar=no,scrollbars=yes");
    if (!w) {
      bh.setError("Trình duyệt đã chặn cửa sổ popup. Hãy cho phép popup và thử lại.");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const handlePay = async () => {
    if (!bh.order?.items?.length) return;
    if (!window.confirm(`Thanh toán ${fmtMoney(bh.order.tong_tien)}?`)) return;
    const ok = await bh.pay();
    if (ok) bh.setError("✅ Đã thanh toán thành công!");
  };

  const handleCombinedPay = async (hinhThuc) => {
    setShowPaymentModal(false);
    if (!bh.order?.items?.length) return;

    // 1. In 2 bill TRƯỚC (phiếu chế biến + hóa đơn) — cần build trước khi sendToBar
    //    vì sendToBar sẽ reset so_luong_cho_bar về 0
    const html = buildCombinedPrintHTML({
      table: bh.table,
      order: bh.order,
      tenKhach: bh.tenKhach,
      soDienThoaiGiao: bh.soDienThoaiGiao,
      diaChiGiao: bh.diaChiGiao,
      phiGiaoHang: bh.phiGiaoHang,
    });
    openAndPrint(html);

    // 2. Gửi bar (đánh dấu món đã gửi xuống chế biến)
    await bh.sendBar();

    // 3. Thanh toán với hình thức đã chọn
    const ok = await bh.pay(hinhThuc);
    if (ok) {
      bh.setError("✅ Đã thanh toán thành công!");
    }
  };

  const handleMoveBan = async (targetBan) => {
    setMoveBanErr("");
    const result = await bh.moveBan(targetBan.ma_ban);
    if (result) {
      setShowMoveModal(false);
    } else {
      requestAnimationFrame(() => {
        setMoveBanErr(bh.error || "Không thể chuyển bàn");
      });
    }
  };

  const hasOrder = Boolean(bh.order);

  if (bh.loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-stone-200 rounded-lg w-48" />
        <div className="h-96 bg-stone-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <div>
        {bh.error && (
          <div className="mb-4 p-3 rounded-lg bg-stone-100 border-l-4 border-primary text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">info</span>
            {bh.error}
          </div>
        )}

        {hasOrder ? (
          <div className="flex flex-col h-screen">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <h2 className="text-lg font-black text-stone-800">
                  {bh.table ? bh.table.ten_ban : bh.loaiDon === "mang_ve" ? "🥡 Mang về" : "🚚 Giao hàng"}
                </h2>
                <span className="text-stone-300">·</span>
                <span className="text-sm text-stone-500 font-medium">
                  Đơn #{bh.order.ma_don_hang}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {bh.table && (
                  <button
                    type="button"
                    onClick={() => {
                      setMoveBanErr("");
                      setShowMoveModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-xs font-bold text-amber-600 hover:bg-amber-100 hover:border-amber-300 transition-all flex items-center gap-1.5"
                  >
                    ⇄ Đổi bàn
                  </button>
                )}
                <button
                  type="button"
                  onClick={bh.clearSelection}
                  className="px-4 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-500 hover:text-primary hover:border-primary transition-all flex items-center gap-1.5"
                >
                  ← Về sơ đồ bàn
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
              <section className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 p-4 shadow-sm overflow-y-auto">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="font-black text-stone-600 uppercase text-xs tracking-wider">
                    🍽️ Thực đơn
                  </h3>
                </div>
                <PosMenu menu={bh.menu} busy={bh.busy} onAdd={bh.addMon} />
              </section>

              <section className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-4 shadow-sm lg:sticky lg:top-0 self-start">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="font-black text-stone-600 uppercase text-xs tracking-wider">
                    🛒 Giỏ hàng
                  </h3>
                  {bh.order?.items?.length > 0 && (
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                      {bh.order.items.reduce((s, i) => s + i.so_luong, 0)} món
                    </span>
                  )}
                </div>
                <BanHangCart
                  table={bh.table}
                  order={bh.order}
                  busy={bh.busy}
                  loaiDon={bh.loaiDon}
                  phiGiaoHang={bh.phiGiaoHang}
                  tenKhach={bh.tenKhach}
                  soDienThoaiGiao={bh.soDienThoaiGiao}
                  diaChiGiao={bh.diaChiGiao}
                  onUpdatePhiGiaoHang={bh.updatePhiGiaoHang}
                  onUpdateDeliveryInfo={bh.updateDeliveryInfo}
                  onQty={bh.changeQty}
                  onPrintMon={() => doPrint("mon")}
                  onPrintBill={() => doPrint("bill")}
                  onPay={handlePay}
                  onCombinedPay={() => { setHinhThucThanhToan("tien_mat"); setShowPaymentModal(true); }}
                />
              </section>
            </div>
          </div>
        ) : (
          <section className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col h-screen">
            {/* Fixed header + buttons area */}
            <div className="shrink-0 px-6 md:px-8 pt-5 md:pt-6 pb-0 border-b border-stone-100 bg-gradient-to-b from-white to-stone-50/30">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-stone-800 tracking-tight flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-base">🏠</span>
                    Sơ đồ bàn
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5 ml-[2.5rem]">
                    Chọn bàn để gọi món
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200" />
                    <span className="text-[10px] font-semibold text-emerald-600">Trống</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100">
                    <span className="w-2 h-2 rounded-full bg-rose-400 shadow-sm shadow-rose-200" />
                    <span className="text-[10px] font-semibold text-rose-600">Có khách</span>
                  </span>
                </div>
              </div>

              {/* Mang về + Giao hàng quick actions */}
              <div className="grid grid-cols-2 gap-3 pb-4">
                <button
                  type="button"
                  disabled={bh.busy}
                  onClick={() => bh.openKhongBan("mang_ve")}
                  className="group relative overflow-hidden rounded-xl border-2 border-amber-200/70 bg-gradient-to-br from-amber-50 via-amber-50/50 to-white p-3 text-left transition-all duration-200 hover:shadow-lg hover:shadow-amber-200/30 hover:border-amber-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-50"
                >
                  <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-amber-200/10 group-hover:bg-amber-200/20 transition-all" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-400 flex items-center justify-center text-lg shadow-sm shadow-amber-200/50 group-hover:scale-110 group-hover:shadow-md transition-all shrink-0">
                      🥡
                    </div>
                    <div>
                      <p className="font-black text-amber-800 text-sm">Mang về</p>
                      <p className="text-[9px] font-medium text-amber-600/60 mt-0.5">Khách mua mang đi</p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  disabled={bh.busy}
                  onClick={() => bh.openKhongBan("giao_hang")}
                  className="group relative overflow-hidden rounded-xl border-2 border-sky-200/70 bg-gradient-to-br from-sky-50 via-sky-50/50 to-white p-3 text-left transition-all duration-200 hover:shadow-lg hover:shadow-sky-200/30 hover:border-sky-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-50"
                >
                  <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-sky-200/10 group-hover:bg-sky-200/20 transition-all" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-300 to-sky-400 flex items-center justify-center text-lg shadow-sm shadow-sky-200/50 group-hover:scale-110 group-hover:shadow-md transition-all shrink-0">
                      🚚
                    </div>
                    <div>
                      <p className="font-black text-sky-800 text-sm">Giao hàng</p>
                      <p className="text-[9px] font-medium text-sky-600/60 mt-0.5">Giao tận nơi</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Scrollable tables area */}
            <div className="flex-1 overflow-y-auto min-h-0 px-6 md:px-8 py-5 md:py-6">
              <BanHangTables
                tables={bh.tables}
                selected={bh.table}
                busy={bh.busy}
                order={bh.order}
                onSelect={bh.selectTable}
                onMoveBan={bh.moveBan}
              />
            </div>
          </section>
        )}
      </div>

      {/* Payment Modal for Mang về / Giao hàng */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowPaymentModal(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-stone-800 uppercase text-sm flex items-center gap-2">
                <span className="text-lg">💳</span> Xác nhận thanh toán
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Bill preview */}
            <div className="mb-4 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono">
              <div className="text-center font-bold text-stone-700 mb-2 text-sm">
                Nắng PR — {bh.loaiDon === "mang_ve" ? "🥡 Mang về" : "🚚 Giao hàng"}
              </div>
              <div className="space-y-1">
                {bh.order?.items?.map((i) => (
                  <div key={i.ma_mon} className="flex justify-between text-stone-600">
                    <span className="truncate mr-2">{i.ten_mon}</span>
                    <span className="font-bold whitespace-nowrap">x{i.so_luong} · {fmtMoney(i.so_luong * i.don_gia)}</span>
                  </div>
                ))}
              </div>
              <hr className="my-2 border-stone-300" />
              <div className="flex justify-between text-sm font-bold text-stone-800">
                <span>Tổng cộng:</span>
                <span>{fmtMoney(Number(bh.order?.tong_tien || 0) + Number(bh.phiGiaoHang || 0))}</span>
              </div>
            </div>

            {/* Hình thức thanh toán */}
            <div className="mb-5">
              <p className="text-[11px] font-bold text-stone-500 uppercase mb-2">Hình thức thanh toán</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHinhThucThanhToan("tien_mat")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    hinhThucThanhToan === "tien_mat"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
                  }`}
                >
                  <span>💵</span> Tiền mặt
                </button>
                <button
                  type="button"
                  onClick={() => setHinhThucThanhToan("chuyen_khoan")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    hinhThucThanhToan === "chuyen_khoan"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
                  }`}
                >
                  <span>💳</span> Chuyển khoản
                </button>
              </div>
            </div>

            {/* Actions */}
            <button
              type="button"
              disabled={bh.busy}
              onClick={() => handleCombinedPay(hinhThucThanhToan)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black uppercase text-sm disabled:opacity-40 hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-200/50 flex items-center justify-center gap-2"
            >
              <span className="text-lg">🧾</span>
              <span>In bill &amp; Thanh toán</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="w-full mt-2 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-500 hover:bg-stone-50 transition-all"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowMoveModal(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-stone-800 uppercase text-sm">⇄ Chọn bàn muốn chuyển</h3>
              <button
                type="button"
                onClick={() => setShowMoveModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Chuyển đơn <strong>#{bh.order?.ma_don_hang}</strong> từ <strong>{bh.table?.ten_ban}</strong> sang:
            </p>
            {moveBanErr && (
              <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-200 text-[11px] font-bold text-red-600 text-center">
                {moveBanErr}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto">
              {bh.tables
                .filter((b) => b.ma_ban !== bh.table?.ma_ban)
                .map((b) => {
                  const busy = b.co_khach || b.ma_don_hang;
                  return (
                    <button
                      key={b.ma_ban}
                      type="button"
                      disabled={busy}
                      onClick={() => handleMoveBan(b)}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${
                        busy
                          ? "border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed"
                          : "border-stone-200 bg-white hover:border-primary hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      <p className="font-bold text-sm">{b.ten_ban}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {busy ? `${fmtMoney(b.tong_tien_hien_tai)}` : "🟢 Trống"}
                      </p>
                    </button>
                  );
                })}
            </div>
            <button
              type="button"
              onClick={() => setShowMoveModal(false)}
              className="w-full mt-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-500 hover:bg-stone-50 transition-all"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}
    </>
  );
}
