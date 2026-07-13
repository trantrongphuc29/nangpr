/* =====  BÁN HÀNG (POS) - TRANG CHÍNH =====
 * Giao diện bán hàng POS: sơ đồ bàn, thực đơn, giỏ hàng, thanh toán
 * Components: BanHangCart, BanHangTables, BanHang (chính)
 * Hook: useBanHang
 * Utils: fmtMoney, buildPrintHTML
 * =========================================== */
import { useCallback, useEffect, useMemo, useState } from "react";
import { getBanPosList } from "../services/banService";
import { getMenuPos } from "../services/monService";
import * as donHangApi from "../services/donHangService";
import PosMenu from "../components/PosMenu";
import PriceInput from "../components/PriceInput";

/* ───── banhangUtils ───── */
const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

/* ── In phiếu chế biến (Bar) / hủy món / hóa đơn ── */

const isTableBusy = (ban) => Boolean(ban.co_khach);

function baseHTML(body) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>In</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Courier New',monospace;color:#000;background:#fff;font-size:13px;line-height:1.4}
  @media print{body{background:#fff}}
  table{width:100%;border-collapse:collapse}
  td,th{padding:4px 6px;font-size:13px}
  .line{border-top:1px solid #000;margin:8px 0}
  .line-dashed{border-top:1px dashed #000;margin:6px 0}
  .center{text-align:center}
  .right{text-align:right}
  .bold{font-weight:700}
  .small{font-size:11px}
  .xsmall{font-size:10px}
  .mt8{margin-top:8px}
  .mt4{margin-top:4px}
  .mb8{margin-bottom:8px}
  .mb4{margin-bottom:4px}
  .pb4{padding-bottom:4px}
</style>
</head>
<body>${body}</body>
</html>`;
}

function buildPrintHTML(mode, { table, order, newItems, tenKhach, soDienThoaiGiao, diaChiGiao, phiGiaoHang }) {
  const now = new Date().toLocaleString("vi-VN");
  const items = order?.items || [];
  const loaiDon = order?.loai_don;
  const tenBan = table?.ten_ban || (loaiDon === "mang_ve" ? "Mang về" : loaiDon === "giao_hang" ? "Giao hàng" : "—");
  const maDon = order?.ma_don_hang || "";
  const deliveryOrder = loaiDon === "giao_hang";

  if (mode === "mon") {
    const monItems =
      newItems?.length > 0
        ? newItems
        : items.filter((i) => (i.so_luong_cho_bar || 0) > 0);

    const rows = monItems
      .map(
        (i) => `
        <tr>
          <td style="padding:6px 6px;font-weight:700">
            ${i.ten_mon}
            ${i.ghi_chu_mon ? `<br><span class="small">(Ghi chú: ${i.ghi_chu_mon})</span>` : ''}
          </td>
          <td class="right" style="width:40px;font-weight:900;font-size:16px">${i.so_luong_cho_bar || i.so_luong}</td>
        </tr>`
      )
      .join("");

    return baseHTML(`
      <div style="padding:16px;max-width:320px;margin:0 auto">
        <div class="center mb8">
          <div style="font-size:20px;font-weight:900;letter-spacing:2px;text-transform:uppercase">NẮNG PR</div>
          <div class="xsmall mt4">PHIẾU CHẾ BIẾN</div>
        </div>
        <div class="line"></div>
        <div class="center bold" style="font-size:24px;padding:8px 0">${tenBan}</div>
        <div class="line"></div>
        <table>
          <thead>
            <tr style="border-bottom:1px solid #000">
              <th style="padding:4px 6px;text-align:left;font-size:10px;text-transform:uppercase">Món</th>
              <th style="padding:4px 6px;text-align:right;width:40px;font-size:10px;text-transform:uppercase">SL</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="2" class="center small" style="padding:20px 0">Không có món</td></tr>'}
          </tbody>
        </table>
        <div class="center xsmall mt8">${now}</div>
      </div>
    `);
  }

  /* ══ In phiếu hủy món (đã in Bar nhưng hủy) ══ */
  if (mode === "cancel") {
    const cancelItems = newItems || [];
    const rows = cancelItems
      .map(
        (i) => `
        <tr>
          <td style="padding:6px 6px;font-weight:700">${i.ten_mon}</td>
          <td class="right" style="width:40px;font-weight:900;font-size:16px">-${i.so_luong_huy}</td>
        </tr>`
      )
      .join("");

    return baseHTML(`
      <div style="padding:16px;max-width:320px;margin:0 auto">
        <div class="center mb8">
          <div style="font-size:20px;font-weight:900;letter-spacing:2px;text-transform:uppercase">NẮNG PR</div>
          <div class="small mt4 bold">PHIẾU HỦY MÓN</div>
        </div>
        <div class="line"></div>
        <div class="center bold" style="font-size:24px;padding:8px 0">${tenBan}</div>
        <div class="center small">Đơn #${maDon}</div>
        <div class="line"></div>
        <table>
          <thead>
            <tr style="border-bottom:1px solid #000">
              <th style="padding:4px 6px;text-align:left;font-size:10px;text-transform:uppercase">Món hủy</th>
              <th style="padding:4px 6px;text-align:right;width:40px;font-size:10px;text-transform:uppercase">SL</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="2" class="center small" style="padding:20px 0">Không có món</td></tr>'}
          </tbody>
        </table>
        <div class="line-dashed mt8"></div>
        <div class="center small bold mt4">Vui lòng hủy các món trên</div>
        <div class="center xsmall mt8">${now}</div>
      </div>
    `);
  }

  /* ══ In hóa đơn thanh toán ══ */
  // mode === "bill"
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:4px 6px">
          ${i.ten_mon}
          ${i.ghi_chu_mon ? `<br><span class="xsmall">(Ghi chú: ${i.ghi_chu_mon})</span>` : ''}
        </td>
        <td class="center" style="width:30px">${i.so_luong}</td>
        <td class="right" style="width:70px">${fmtMoney(i.so_luong * i.don_gia)}</td>
      </tr>`
    )
    .join("");

  const tongTienMon = Number(order?.tong_tien || 0);
  const phiGiao = Number(phiGiaoHang || 0);
  const tongCong = tongTienMon + phiGiao;

  return baseHTML(`
    <div style="padding:16px;max-width:360px;margin:0 auto">
      <div class="center mb8">          <div style="font-size:20px;font-weight:900;letter-spacing:2px;text-transform:uppercase">NẮNG PR</div>
          <div class="xsmall mt4">HÓA ĐƠN THANH TOÁN</div>
      </div>
      <div class="line"></div>
      <div class="center bold" style="padding:4px 0">${tenBan}</div>
      ${maDon ? `<div class="center small mb4">Đơn #${maDon}</div>` : ''}
      ${deliveryOrder ? `
      <div class="line-dashed"></div>
      <div class="small bold mb4">THÔNG TIN GIAO HÀNG</div>
      ${tenKhach ? `<div class="small">Khách hàng: ${tenKhach}</div>` : ''}
      ${soDienThoaiGiao ? `<div class="small">SĐT: ${soDienThoaiGiao}</div>` : ''}
      ${diaChiGiao ? `<div class="small">Địa chỉ: ${diaChiGiao}</div>` : ''}
      ` : ''}
      <div class="line"></div>
      <table>
        <thead>
          <tr style="border-bottom:2px solid #000;font-size:10px;text-transform:uppercase">
            <th style="padding:4px 6px;text-align:left">Món</th>
            <th style="padding:4px 6px;text-align:center;width:28px">SL</th>
            <th style="padding:4px 6px;text-align:right;width:68px">Tiền</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="3" class="center small" style="padding:20px 0">Trống</td></tr>'}
        </tbody>
      </table>
      <div class="line"></div>
      ${deliveryOrder ? `
      <div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 6px">
        <span>Tiền món:</span><span>${fmtMoney(tongTienMon)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 6px">
        <span>Phí giao hàng:</span><span>${fmtMoney(phiGiao)}</span>
      </div>
      <div class="line-dashed"></div>
      <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:900;padding:4px 6px">
        <span>TỔNG CỘNG:</span><span>${fmtMoney(tongCong)}</span>
      </div>
      ` : `
      <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:900;padding:4px 6px">
        <span>TỔNG CỘNG:</span><span>${fmtMoney(order?.tong_tien || 0)}</span>
      </div>
      `}
      <div class="line"></div>
      <div class="center small mt8">${now}</div>
      <div class="center small">Cảm ơn quý khách!</div>
    </div>
  `);
}

/* ══ In gộp: phiếu chế biến + hóa đơn thanh toán (cho Mang về / Giao hàng) ══ */
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
  onCancelAndQty,
  onUpdateNote,
}) {
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-2">shopping_cart</span>
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
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-outline/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-lg">receipt</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-on-surface">
              {order.ma_don_hang
                ? (table?.ten_ban ? `#${order.ma_don_hang} · ${table.ten_ban}` : `#${order.ma_don_hang}`)
                : (table?.ten_ban || 'Đơn mới')}
            </h3>
            <p className="text-[10px] text-muted">{items.length} món</p>
          </div>
        </div>
        {hasNewItems && (
          <span className="text-[10px] text-error font-semibold px-2.5 py-0.5 rounded-full animate-pulse" style={{ backgroundColor: "color-mix(in srgb, var(--color-error) 12%, transparent)" }}>
            +{items.reduce((s, i) => s + (i.so_luong_cho_bar || 0), 0)} mới
          </span>
        )}
      </div>

      {/* Items list */}
      <ul className="flex-1 overflow-y-auto space-y-1.5 min-h-[120px] max-h-[calc(100vh-340px)] lg:max-h-[calc(100vh-360px)]">
        {items.map((item) => {
          const daGui = Number(item.so_luong_da_gui_bar || 0);
          const choBar = Number(item.so_luong_cho_bar || 0);
          const daInHet = choBar <= 0 && daGui > 0;
          return (
          <li key={item.ma_mon} className="flex items-start gap-2 p-2.5 rounded-xl text-sm transition-all bg-surface-container-lowest border border-outline/10 hover:border-outline/30">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-on-surface truncate">{item.ten_mon}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {daGui > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "color-mix(in srgb, var(--color-secondary) 12%, transparent)", color: "var(--color-secondary)" }}>
                    🖨 {daGui} đã in
                  </span>
                )}
                {choBar > 0 && (
                  <span className="text-[10px] font-semibold text-error">+{choBar} mới</span>
                )}
              </div>
              {/* Ghi chú món */}
              <input
                type="text"
                placeholder="Ghi chú (ít đường, không đá...)"
                defaultValue={item.ghi_chu_mon || ""}
                disabled={busy}
                className="mt-1.5 w-full text-[10px] bg-transparent border-b border-dotted border-outline/20 text-on-surface-variant placeholder:text-outline/30 focus:border-primary/40 focus:outline-none px-0 py-0.5 transition-colors"
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val !== (item.ghi_chu_mon || "")) {
                    if (onUpdateNote) onUpdateNote(item.ma_mon, val || null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.target.blur();
                }}
              />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={busy}
                title={daInHet ? `Món này đã in ${daGui} cái. Bấm để giảm (sẽ ghi nhận huỷ)` : 'Giảm số lượng'}
                className={`w-7 h-7 rounded-lg font-bold transition-all flex items-center justify-center text-sm ${
                  busy
                    ? 'opacity-40 cursor-not-allowed'
                    : daInHet
                      ? 'text-error hover:bg-error-container active:scale-90'
                      : 'text-on-surface-variant hover:bg-surface-container-high active:scale-90'
                }`}
                style={daInHet && !busy ? { backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)" } : {}}
                onClick={() => {
                  if (daInHet) {
                    const maxReduce = item.so_luong;
                    const input = prompt(`⚠️ Món "${item.ten_mon}" đã in ${daGui} cái xuống bếp.\nNhập số lượng muốn huỷ (1 → ${maxReduce}):`, "1");
                    if (input === null) return;
                    const soLuongHuy = parseInt(input, 10);
                    if (isNaN(soLuongHuy) || soLuongHuy < 1 || soLuongHuy > maxReduce) {
                      alert(`Số không hợp lệ! Vui lòng nhập từ 1 đến ${maxReduce}.`);
                      return;
                    }
                    if (onCancelAndQty) onCancelAndQty(item, soLuongHuy);
                  } else {
                    onQty(item.ma_mon, item.so_luong - 1);
                  }
                }}
              >−</button>
              <span className="w-5 text-center font-bold text-on-surface">{item.so_luong}</span>
              <button
                type="button"
                disabled={busy}
                className="w-7 h-7 rounded-lg font-bold flex items-center justify-center text-sm text-white active:scale-90 transition-all disabled:opacity-40"
                style={{ backgroundColor: "var(--color-primary)" }}
                onClick={() => onQty(item.ma_mon, item.so_luong + 1)}
              >+</button>
            </div>
            <span className="font-bold w-16 text-right shrink-0 text-primary">{fmtMoney(item.so_luong * item.don_gia)}</span>
          </li>
          );
        })}
        {!items.length && <li className="text-center text-muted py-8">Chưa có món nào</li>}
      </ul>

      {/* Delivery info form (only for Giao hàng) */}
      {loaiDon === "giao_hang" && (
        <div className="space-y-2 pt-3 mb-2 border-t border-outline/40">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Thông tin giao hàng</p>
          <div className="flex items-center gap-2 rounded-xl p-3" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)" }}>
            <span className="material-symbols-outlined text-primary text-lg shrink-0">person</span>
            <input
              type="text"
              className="flex-1 bg-transparent border-none text-sm font-medium placeholder:text-muted/60 focus:ring-0 p-0"
              placeholder="Tên khách hàng..."
              value={tenKhach || ""}
              onChange={(e) => onUpdateDeliveryInfo({ ten_khach: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl p-3" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)" }}>
            <span className="material-symbols-outlined text-primary text-lg shrink-0">phone</span>
            <input
              type="tel"
              className="flex-1 bg-transparent border-none text-sm font-medium placeholder:text-muted/60 focus:ring-0 p-0"
              placeholder="Số điện thoại người nhận..."
              value={soDienThoaiGiao || ""}
              onChange={(e) => onUpdateDeliveryInfo({ so_dien_thoai_giao: e.target.value })}
            />
          </div>
          <div className="flex items-start gap-2 rounded-xl p-3" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)" }}>
            <span className="material-symbols-outlined text-primary text-lg mt-0.5 shrink-0">location_on</span>
            <textarea
              className="flex-1 bg-transparent border-none text-sm font-medium placeholder:text-muted/60 focus:ring-0 p-0 resize-none min-h-[38px]"
              rows={2}
              placeholder="Địa chỉ giao hàng..."
              value={diaChiGiao || ""}
              onChange={(e) => onUpdateDeliveryInfo({ dia_chi_giao: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl p-3" style={{ backgroundColor: "color-mix(in srgb, var(--color-warning) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--color-warning) 20%, transparent)" }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-warning text-lg">delivery_dining</span>
              <span className="text-xs font-bold text-warning">Phí giao hàng</span>
            </div>
            <div className="flex items-center gap-2">
              <PriceInput
                className="w-24 text-right font-bold text-sm bg-surface-lowest border border-warning-border rounded-lg px-2 py-1.5 focus:ring-2"
                style={{ borderColor: "color-mix(in srgb, var(--color-warning) 30%, transparent)" }}
                placeholder="0"
                value={phiGiaoHang || ""}
                onChange={(val) => onUpdatePhiGiaoHang(val)}
              />
              <span className="text-xs font-bold text-warning">đ</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-outline/40 pt-3 mt-2 space-y-2">
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>Tạm tính</span>
            <span className="font-medium">{fmtMoney(order.tong_tien)}</span>
          </div>
          {loaiDon === "giao_hang" && (
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Phí giao hàng</span>
              <span className="font-medium">{fmtMoney(phiGiaoHang)}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between font-bold text-base border-t border-outline/40 pt-2" style={{ color: "var(--color-primary)" }}>
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
                className="py-2.5 rounded-xl font-bold text-xs uppercase transition-all disabled:opacity-40"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
              >
                 In món
              </button>
              <button
                type="button"
                disabled={busy || !items.length}
                onClick={onPrintBill}
                className="btn-outline !py-2.5 !px-4 !text-xs uppercase"
              >
                In bill
              </button>
            </div>
            <button
              type="button"
              disabled={busy || !items.length}
              onClick={onPay}
              className="btn-primary w-full !py-3 !text-sm uppercase"
            >
              Thanh toán
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={busy || !items.length}
            onClick={onPay}
            className="btn-primary w-full !py-4 !text-sm uppercase flex items-center justify-center gap-2"
          >
            <span>In bill & Thanh toán</span>
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
      if (isTableBusy(ban)) {
        alert("Bàn này đang có khách, không thể chuyển đến!");
        return;
      }
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
      if (!order?.ma_don_hang) return;
      setSwapMode(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-on-surface text-sm">Sơ đồ bàn</h3>
          <span className="text-[10px] text-muted px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--color-surface-container-high)" }}>
            {tables.length} bàn
          </span>
        </div>
        {order?.ma_don_hang && (
          <button
            type="button"
            onClick={handleSwapToggle}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              swapMode
                ? "text-white"
                : "text-on-surface-variant border"
            }`}
            style={swapMode ? { backgroundColor: "var(--color-primary)" } : { borderColor: "var(--color-border)" }}
          >
            {swapMode ? "✕ Huỷ" : "⇄ Đổi bàn"}
          </button>
        )}
      </div>

      {swapMode && (
        <div className="mb-3 px-3 py-2 rounded-lg text-[11px] font-semibold text-center" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)" }}>
           Chọn bàn muốn chuyển đến
        </div>
      )}

      {/* Tables grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
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
              className={`relative rounded-xl text-center transition-all duration-200 p-3 ${
                active && !isMoving
                  ? "ring-2 shadow-md scale-[1.02] z-10"
                  : isMoving
                    ? "ring-2 scale-[1.02] z-10"
                    : "hover:shadow-md hover:-translate-y-0.5"
              } ${swapMode && !active && busyTable ? "cursor-pointer" : ""}`}
              style={(() => {
                if (isMoving) {
                  return { backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)", borderColor: "var(--color-primary)", ringColor: "var(--color-primary)" };
                }
                if (active && !isMoving) {
                  return { backgroundColor: "var(--color-surface-lowest)", border: "2px solid var(--color-primary)", ringColor: "var(--color-primary)" };
                }
                if (busyTable && !swapMode) {
                  return { backgroundColor: "color-mix(in srgb, var(--color-error) 18%, var(--color-surface-lowest))", border: "2px solid var(--color-error)", boxShadow: "0 4px 12px rgba(220,38,38,0.25)" };
                }
                return { backgroundColor: "var(--color-surface-lowest)", border: "1px solid var(--color-border)" };
              })()}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all"
                style={busyTable && !swapMode && !isMoving ? { backgroundColor: "color-mix(in srgb, var(--color-error) 20%, transparent)" } : { backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)" }}
                >
                  {busyTable ? <span className="material-symbols-outlined text-lg">restaurant</span> : <span className="material-symbols-outlined text-lg">chair</span>}
                </div>
                <p className={`font-bold text-xs uppercase ${
                  busyTable && !swapMode && !isMoving ? "text-error" : "text-on-surface"
                }`}>{b.ten_ban}</p>
                <p className={`font-bold text-sm ${
                  busyTable && !swapMode && !isMoving
                    ? "text-error"
                    : "text-muted text-[9px] font-medium"
                }`}>
                  {busyTable ? fmtMoney(b.tong_tien_hien_tai) : "Trống"}
                </p>
              </div>
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

  /* ───── Local order helpers ───── */
  /** Tạo một order local (chưa lưu vào DB) */
  const createLocalOrder = (ban, type) => ({
    ma_don_hang: null,
    ma_ban: ban?.ma_ban || null,
    loai_don: type || 'tai_cho',
    items: [],
    tong_tien: 0,
    phi_giao_hang: 0,
    trang_thai_don: 'Dang phuc vu',
    trang_thai_thanh_toan: 'Chua thanh toan',
    co_mon_cho_bar: false,
    ten_khach: null,
    so_dien_thoai_giao: null,
    dia_chi_giao: null,
  });

  /** Persist order local vào DB (tạo đơn + thêm items) */
  const persistOrderToDb = async () => {
    if (!order) throw new Error('Không có đơn hàng');
    if (order.ma_don_hang) return order; // Đã persist rồi

    // Tạo đơn trong DB
    const data = await donHangApi.openOrder({
      ma_ban: table?.ma_ban || null,
      loai_don: loaiDon,
    });
    const maDonHang = data.ma_don_hang;

    // Thêm tất cả items vào DB
    for (const item of order.items) {
      await donHangApi.addItem(maDonHang, {
        ma_mon: item.ma_mon,
        so_luong: item.so_luong,
        ghi_chu_mon: item.ghi_chu_mon,
      });
    }

    // Cập nhật thông tin giao hàng nếu cần
    if (loaiDon === 'giao_hang') {
      if (phiGiaoHang > 0) {
        await donHangApi.updatePhiGiaoHang(maDonHang, phiGiaoHang);
      }
      if (tenKhach || soDienThoaiGiao || diaChiGiao) {
        await donHangApi.updateDeliveryInfo(maDonHang, {
          ten_khach: tenKhach,
          so_dien_thoai_giao: soDienThoaiGiao,
          dia_chi_giao: diaChiGiao,
        });
      }
    }

    // Lấy đơn đầy đủ từ DB
    const fullOrder = await donHangApi.getOrder(maDonHang);
    return fullOrder;
  };

  const selectTable = (ban) =>
    run(async () => {
      setTable(ban);
      // Nếu bàn đã có đơn active (đang phục vụ) → load từ DB
      if (ban.co_khach) {
        const data = await donHangApi.openOrder({ ma_ban: ban.ma_ban, loai_don: 'tai_cho' });
        setOrder(data);
        if (data?.loai_don) setLoaiDon(data.loai_don);
        if (data?.phi_giao_hang !== undefined) setPhiGiaoHang(Number(data.phi_giao_hang));
        if (data?.so_dien_thoai_giao) setSoDienThoaiGiao(data.so_dien_thoai_giao);
        if (data?.dia_chi_giao) setDiaChiGiao(data.dia_chi_giao);
        if (data?.ten_khach) setTenKhach(data.ten_khach);
      } else {
        // Bàn trống → tạo order local, chưa lưu vào DB
        setLoaiDon('tai_cho');
        setPhiGiaoHang(0);
        setSoDienThoaiGiao('');
        setDiaChiGiao('');
        setTenKhach('');
        setOrder(createLocalOrder(ban, 'tai_cho'));
      }
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
      // Chỉ tạo order local, chưa lưu vào DB
      setOrder(createLocalOrder(null, newType));
    });

  const addMon = (mon) => {
    if (!order) {
      setError("Vui lòng chọn bàn hoặc chọn loại đơn trước");
      return Promise.resolve();
    }
    if (mon.het_hang) {
      setError(`"${mon.ten_mon}" hết kho — tạm khóa`);
      return Promise.resolve();
    }
    // Nếu đã persist → thêm qua API
    if (order.ma_don_hang) {
      return run(async () => {
        const data = await donHangApi.addItem(order.ma_don_hang, { ma_mon: mon.ma_mon, so_luong: 1 });
        setOrder(data);
        await refreshTables();
      });
    }
    // Chưa persist → thêm vào local state
    setOrder((prev) => {
      if (!prev) return prev;
      const existingItem = prev.items.find((i) => i.ma_mon === mon.ma_mon);
      if (existingItem) {
        const newItems = prev.items.map((i) =>
          i.ma_mon === mon.ma_mon
            ? { ...i, so_luong: i.so_luong + 1, so_luong_cho_bar: (i.so_luong_cho_bar || 0) + 1 }
            : i
        );
        return {
          ...prev,
          items: newItems,
          tong_tien: newItems.reduce((s, i) => s + Number(i.so_luong) * Number(i.don_gia), 0),
          co_mon_cho_bar: newItems.some((i) => i.so_luong_cho_bar > 0),
        };
      }
      const newItem = {
        ma_mon: mon.ma_mon,
        ten_mon: mon.ten_mon,
        so_luong: 1,
        so_luong_da_gui_bar: 0,
        so_luong_cho_bar: 1,
        don_gia: mon.gia_ban,
        ghi_chu_mon: null,
        ten_danh_muc: mon.ten_danh_muc || "",
        trang_thai_mon: "Dang cho",
      };
      const newItems = [...prev.items, newItem];
      return {
        ...prev,
        items: newItems,
        tong_tien: newItems.reduce((s, i) => s + Number(i.so_luong) * Number(i.don_gia), 0),
        co_mon_cho_bar: true,
      };
    });
    return Promise.resolve();
  };

  const changeQty = (ma_mon, so_luong) =>
    run(async () => {
      // Nếu đã persist → cập nhật qua API
      if (order?.ma_don_hang) {
        const data = await donHangApi.updateItemQty(order.ma_don_hang, ma_mon, so_luong);
        setOrder(data);
        await Promise.all([refreshTables(), refreshMenu()]);
        return;
      }
      // Local state
      setOrder((prev) => {
        if (!prev) return prev;
        if (so_luong <= 0) {
          const newItems = prev.items.filter((i) => i.ma_mon !== ma_mon);
          return {
            ...prev,
            items: newItems,
            tong_tien: newItems.reduce((s, i) => s + Number(i.so_luong) * Number(i.don_gia), 0),
            co_mon_cho_bar: newItems.some((i) => i.so_luong_cho_bar > 0),
          };
        }
        const newItems = prev.items.map((i) =>
          i.ma_mon === ma_mon
            ? {
                ...i,
                so_luong,
                so_luong_cho_bar: Math.max(0, so_luong - Number(i.so_luong_da_gui_bar || 0)),
              }
            : i
        );
        return {
          ...prev,
          items: newItems,
          tong_tien: newItems.reduce((s, i) => s + Number(i.so_luong) * Number(i.don_gia), 0),
          co_mon_cho_bar: newItems.some((i) => i.so_luong_cho_bar > 0),
        };
      });
    });

  const updateNote = (ma_mon, ghi_chu) =>
    run(async () => {
      if (order?.ma_don_hang) {
        const data = await donHangApi.updateItemNote(order.ma_don_hang, ma_mon, ghi_chu);
        setOrder(data);
        return;
      }
      // Local state
      setOrder((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.ma_mon === ma_mon ? { ...i, ghi_chu_mon: ghi_chu } : i
          ),
        };
      });
    });

  const sendBar = () =>
    run(async () => {
      // Persist vào DB trước nếu chưa
      let currentOrder = order;
      if (!currentOrder?.ma_don_hang) {
        currentOrder = await persistOrderToDb();
        setOrder(currentOrder);
      }
      // Gửi bar
      const data = await donHangApi.sendToBar(currentOrder.ma_don_hang);
      setOrder(data);
      setError("");
      await Promise.all([refreshTables(), refreshMenu()]);
      return true;
    });

  const pay = (hinhThuc) =>
    run(async () => {
      // Persist vào DB trước nếu chưa
      let currentOrder = order;
      if (!currentOrder?.ma_don_hang) {
        currentOrder = await persistOrderToDb();
        setOrder(currentOrder);
      }
      // Checkout
      await donHangApi.checkout(currentOrder.ma_don_hang, hinhThuc);
      setOrder(null);
      setTable(null);
      await Promise.all([refreshTables(), refreshMenu()]);
      return true;
    });

  const moveBan = (targetMaBan) =>
    run(async () => {
      if (!order?.ma_don_hang) {
        setError("Đơn chưa được lưu, không thể chuyển bàn. Hãy in món hoặc thanh toán trước.");
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
    updateNote,
    pay, moveBan, clearSelection, refreshTables,
    persistOrder: async () => {
      // Chỉ persist vào DB, không gửi bar (dùng cho In bill)
      if (!order) throw new Error('Không có đơn hàng');
      if (order.ma_don_hang) return order;
      const result = await persistOrderToDb();
      setOrder(result);
      return result;
    },
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
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [hinhThucThanhToan, setHinhThucThanhToan] = useState("tien_mat");
  const bh = useBanHang();

  const cartItemCount = bh.order?.items?.reduce((s, i) => s + i.so_luong, 0) || 0;
  const cartTotalAmount = Number(bh.order?.tong_tien || 0) + Number(bh.phiGiaoHang || 0);

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
      const stay = window.confirm(" Đã in món! Bạn có muốn ở lại để thêm món tiếp không?");
      if (!stay) {
        bh.clearSelection();
      }
    } else {
      // In bill → persist trước để có mã đơn 
      if (!bh.order?.ma_don_hang) {
        try {
          await bh.persistOrder();
        } catch (e) {
          bh.setError('Không thể lưu đơn hàng để in bill');
          return;
        }
      }
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

  /* ── Mở popup và in (dùng chung cho in món, in bill, in hủy) ── */
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

  const handleCancelAndQty = async (item, soLuongHuy) => {
    const newQty = item.so_luong - soLuongHuy;
    const result = await bh.changeQty(item.ma_mon, newQty);
    if (result !== null) {
      const cancelData = [{
        ten_mon: item.ten_mon,
        so_luong_huy: soLuongHuy,
        da_gui: item.so_luong_da_gui_bar
      }];
      const html = buildPrintHTML("cancel", {
        table: bh.table,
        order: bh.order,
        newItems: cancelData
      });
      openAndPrint(html);
    }
  };

  const handleModalPay = async (hinhThuc) => {
    setShowPaymentModal(false);
    if (!bh.order?.items?.length) return;

    const hasNewItems = bh.order.items.some((i) => i.so_luong_cho_bar > 0);

    if (bh.loaiDon === "tai_cho") {
      if (hasNewItems) {
        await bh.sendBar();
      }
      const ok = await bh.pay(hinhThuc);
      if (ok) bh.setError(" Đã thanh toán thành công!");
      return;
    }

    const html = buildCombinedPrintHTML({
      table: bh.table,
      order: bh.order,
      tenKhach: bh.tenKhach,
      soDienThoaiGiao: bh.soDienThoaiGiao,
      diaChiGiao: bh.diaChiGiao,
      phiGiaoHang: bh.phiGiaoHang,
    });
    openAndPrint(html);
    if (hasNewItems) {
      await bh.sendBar();
    }
    const ok = await bh.pay(hinhThuc);
    if (ok) {
      bh.setError(" Đã thanh toán thành công!");
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
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent", borderRightColor: "transparent" }} />
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col min-h-0">
        {/* Error banner */}
        {bh.error && (
          <div className="mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in" style={{ backgroundColor: bh.error.includes("✅") ? "color-mix(in srgb, var(--color-success) 10%, transparent)" : "color-mix(in srgb, var(--color-error) 10%, transparent)", borderLeft: `4px solid ${bh.error.includes("✅") ? "var(--color-success)" : "var(--color-error)"}`, color: bh.error.includes("✅") ? "var(--color-success)" : "var(--color-error)" }}>
            <span className="material-symbols-outlined text-lg shrink-0">{bh.error.includes("✅") ? "check_circle" : "info"}</span>
            {bh.error}
          </div>
        )}

        {hasOrder ? (
          /* ──── VIEW: ĐANG BÁN ──── */
          <div className="flex flex-col flex-1 min-h-0">
            {/* Order header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
                <div>
                  <h2 className="text-lg font-bold text-on-surface">
                    {bh.table ? (
                      <span>{bh.table.ten_ban}</span>
                    ) : bh.loaiDon === "mang_ve" ? (
                      <span><span className="material-symbols-outlined text-lg">takeout_dining</span> Mang về</span>
                    ) : (
                      <span><span className="material-symbols-outlined text-lg">local_shipping</span> Giao hàng</span>
                    )}
                  </h2>
                  {bh.order.ma_don_hang ? (
                    <p className="text-xs text-muted">Đơn #{bh.order.ma_don_hang}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {bh.table && bh.order?.ma_don_hang && (
                  <button
                    type="button"
                    onClick={() => { setMoveBanErr(""); setShowMoveModal(true); }}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-on-surface-variant)" }}
                  >
                    ⇄ Đổi bàn
                  </button>
                )}
                <button
                  type="button"
                  onClick={bh.clearSelection}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  ← Về sơ đồ bàn
                </button>
              </div>
            </div>

            {/* Grid: Menu + Cart */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 flex-1 min-h-0">
              {/* Menu */}
              <section className="lg:col-span-7 card p-4 flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-3 shrink-0">
                 
                  <h3 className="font-bold text-on-surface text-sm">Thực đơn</h3>
                </div>
                <PosMenu menu={bh.menu} busy={bh.busy} onAdd={bh.addMon} />
              </section>

              {/* Cart - Desktop */}
              <section className="hidden lg:flex lg:col-span-3 flex-col min-h-0 card p-4">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">shopping_cart</span>
                    <h3 className="font-bold text-on-surface text-sm">Giỏ hàng</h3>
                  </div>
                  {cartItemCount > 0 && (
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                      {cartItemCount} món
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
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
                    onPay={() => { setHinhThucThanhToan("tien_mat"); setShowPaymentModal(true); }}
                    onCancelAndQty={handleCancelAndQty}
                    onUpdateNote={bh.updateNote}
                  />
                </div>
              </section>
            </div>
          </div>
        ) : (
          /* ──── VIEW: SƠ ĐỒ BÀN ──── */
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header + Actions */}
            <div className="shrink-0 mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface">Bán hàng</h2>
                    <p className="text-sm text-muted">Chọn bàn để gọi món</p>
                  </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-primary) 20%, transparent)", color: "var(--color-primary)" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
                    Trống
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border" style={{ backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-error) 20%, transparent)", color: "var(--color-error)" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-error)" }} />
                    Có khách
                  </span>
                </div>
              </div>

              {/* Mang về + Giao hàng */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={bh.busy}
                  onClick={() => bh.openKhongBan("mang_ve")}
                  className="card p-4 text-left transition-all duration-200 hover:border-primary/40 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)", color: "var(--color-primary)" }}>
                      <span className="material-symbols-outlined text-lg">takeout_dining</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">Mang về</p>
                      <p className="text-[10px] text-muted mt-0.5">Khách mua mang đi</p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  disabled={bh.busy}
                  onClick={() => bh.openKhongBan("giao_hang")}
                  className="card p-4 text-left transition-all duration-200 hover:border-primary/40 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--color-secondary) 15%, transparent)", color: "var(--color-secondary)" }}>
                      <span className="material-symbols-outlined text-lg">local_shipping</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">Giao hàng</p>
                      <p className="text-[10px] text-muted mt-0.5">Giao tận nơi</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Tables */}
            <div className="flex-1 overflow-y-auto min-h-0 card p-4">
              <BanHangTables
                tables={bh.tables}
                selected={bh.table}
                busy={bh.busy}
                order={bh.order}
                onSelect={bh.selectTable}
                onMoveBan={bh.moveBan}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button — mobile only */}
      {hasOrder && (
        <>
          <button
            type="button"
            onClick={() => setShowCartDrawer(true)}
            className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <span className="material-symbols-outlined text-2xl text-white">shopping_cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] rounded-full text-white text-[10px] font-black flex items-center justify-center px-1 border-2 border-white shadow-md" style={{ backgroundColor: "var(--color-error)" }}>
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </button>

          {cartItemCount > 0 && (
            <div className="lg:hidden fixed bottom-[5.5rem] right-7 z-30 bg-surface-container-lowest border border-outline rounded-xl px-3 py-2 shadow-lg text-right animate-fade-in">
              <p className="text-[10px] text-muted font-medium">Tổng cộng</p>
              <p className="text-xs font-bold text-primary">{fmtMoney(cartTotalAmount)}</p>
            </div>
          )}
        </>
      )}

      {/* Cart Drawer — mobile/tablet */}
      {showCartDrawer && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col animate-slide-up bg-surface-container-lowest">
          <div className="shrink-0 flex items-center justify-between px-4 pt-4 pb-3 border-b" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCartDrawer(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ backgroundColor: "var(--color-surface-container-high)" }}
              >
                <span className="material-symbols-outlined text-on-surface">arrow_back</span>
              </button>
              <h2 className="font-bold text-on-surface text-sm"><span className="material-symbols-outlined">shopping_cart</span> Giỏ hàng</h2>
            </div>
            {cartItemCount > 0 && (
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                {cartItemCount} món
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
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
              onPay={() => { setHinhThucThanhToan("tien_mat"); setShowPaymentModal(true); }}
              onCancelAndQty={handleCancelAndQty}
              onUpdateNote={bh.updateNote}
            />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div
            className="bg-card rounded-2xl shadow-2xl border border-outline p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined">credit_card</span> Xác nhận thanh toán
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{ backgroundColor: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)" }}
              >
                ✕
              </button>
            </div>

            <div className="mb-5">
              <p className="text-[11px] font-bold text-muted uppercase mb-2">Hình thức thanh toán</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHinhThucThanhToan("tien_mat")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    hinhThucThanhToan === "tien_mat"
                      ? "text-on-surface"
                      : "text-on-surface-variant hover:border-outline/60"
                  }`}
                  style={hinhThucThanhToan === "tien_mat" ? { borderColor: "var(--color-primary)", backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)" } : { borderColor: "var(--color-border)" }}
                >
                  <span className="material-symbols-outlined">payments</span> Tiền mặt
                </button>
                <button
                  type="button"
                  onClick={() => setHinhThucThanhToan("chuyen_khoan")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    hinhThucThanhToan === "chuyen_khoan"
                      ? "text-on-surface"
                      : "text-on-surface-variant hover:border-outline/60"
                  }`}
                  style={hinhThucThanhToan === "chuyen_khoan" ? { borderColor: "var(--color-primary)", backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)" } : { borderColor: "var(--color-border)" }}
                >
                  <span className="material-symbols-outlined">account_balance</span> Chuyển khoản
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={bh.busy}
              onClick={() => handleModalPay(hinhThucThanhToan)}
              className="btn-primary w-full !py-3.5 !text-sm uppercase flex items-center justify-center gap-2"
            >
              {bh.loaiDon === "tai_cho" ? (
                <><span className="material-symbols-outlined">check_circle</span> Xác nhận thanh toán</>
              ) : (
                <><span className="material-symbols-outlined">receipt</span> In bill & Thanh toán</>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="w-full mt-2 py-2.5 rounded-xl border text-xs font-bold transition-all"
              style={{ borderColor: "var(--color-border)", color: "var(--color-on-surface-variant)" }}
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Move Ban Modal */}
      {showMoveModal && (
        <div className="modal-overlay" onClick={() => setShowMoveModal(false)}>
          <div
            className="bg-card rounded-2xl shadow-2xl border border-outline p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-on-surface">⇄ Chọn bàn muốn chuyển</h3>
              <button
                type="button"
                onClick={() => setShowMoveModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{ backgroundColor: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)" }}
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-muted mb-4">
              Chuyển đơn <strong>#{bh.order?.ma_don_hang}</strong> từ <strong>{bh.table?.ten_ban}</strong> sang:
            </p>
            {moveBanErr && (
              <div className="mb-3 p-2 rounded-lg text-[11px] font-bold text-center" style={{ backgroundColor: "color-mix(in srgb, var(--color-error) 10%, transparent)", color: "var(--color-error)", border: "1px solid color-mix(in srgb, var(--color-error) 20%, transparent)" }}>
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
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:shadow-md hover:-translate-y-0.5"
                      }`}
                      style={{
                        borderColor: busy ? "var(--color-border)" : "var(--color-border)",
                        backgroundColor: busy ? "var(--color-surface-container-high)" : "var(--color-surface-lowest)"
                      }}
                    >
                      <p className="font-bold text-xs uppercase text-on-surface">{b.ten_ban}</p>
                      <p className="text-[9px] font-medium text-muted mt-0.5">
                        {busy ? `${fmtMoney(b.tong_tien_hien_tai)}` : "🟢 Trống"}
                      </p>
                    </button>
                  );
                })}
            </div>
            <button
              type="button"
              onClick={() => setShowMoveModal(false)}
              className="w-full mt-4 py-2 rounded-xl border text-xs font-bold transition-all"
              style={{ borderColor: "var(--color-border)", color: "var(--color-on-surface-variant)" }}
            >
              Huỷ
            </button>
          </div>
        </div>
      )}
    </>
  );
}
