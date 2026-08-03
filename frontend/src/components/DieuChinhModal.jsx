/* =====  DieuChinhModal  =====
 * Modal quản lý các khoản Thưởng / Khấu trừ / Tạm ứng của một nhân viên
 * trong một kỳ lương. Mỗi khoản là một dòng riêng (số tiền + ngày + lý do),
 * hệ thống tự cộng tổng thay vì bắt người dùng nhẩm trước khi nhập.
 *
 * Kỳ đã chốt: vẫn mở được để xem lịch sử, nhưng không thêm/xóa.
 * ============================================================ */
import { useEffect, useMemo, useRef, useState } from "react";
import ModalPortal from "./ModalPortal";
import ModalOverlay from "./ModalOverlay";
import PriceInput from "./PriceInput";
import { getDieuChinh, addDieuChinh, deleteDieuChinh } from "../services/payrollService";
import { useConfirm } from "../context/ConfirmContext";

const LOAI_META = {
  thuong: { nhan: "Thưởng", mau: "text-success", dau: "+", viDu: "VD: Thưởng doanh thu" },
  khau_tru: { nhan: "Khấu trừ", mau: "text-error", dau: "−", viDu: "VD: Đi trễ" },
  tam_ung: { nhan: "Tạm ứng", mau: "text-error", dau: "−", viDu: "VD: Ứng lương" },
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatMoney(n) {
  return `${Number(n || 0).toLocaleString("vi-VN")}đ`;
}

function fmtNgay(ymd) {
  const [y, m, d] = String(ymd).split("-");
  return `${d}/${m}/${y}`;
}

// Mặc định là hôm nay nếu hôm nay thuộc kỳ đang xem, ngược lại là ngày đầu tháng đó
function ngayMacDinh(thang, nam) {
  const now = new Date();
  if (now.getMonth() + 1 === thang && now.getFullYear() === nam) {
    return `${nam}-${pad2(thang)}-${pad2(now.getDate())}`;
  }
  return `${nam}-${pad2(thang)}-01`;
}

export default function DieuChinhModal({ loai, employee, thang, nam, readOnly, onClose, onRowUpdated, onError }) {
  const { confirm } = useConfirm();
  const meta = LOAI_META[loai] || LOAI_META.thuong;
  const soTienRef = useRef(null);

  const [items, setItems] = useState([]);
  const [row, setRow] = useState(employee);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [soTien, setSoTien] = useState("");
  const [ngay, setNgay] = useState(() => ngayMacDinh(thang, nam));
  const [lyDo, setLyDo] = useState("");

  const maNhanVien = employee?.ma_nhan_vien;
  const tongKhoan = useMemo(() => items.reduce((s, it) => s + Number(it.so_tien || 0), 0), [items]);
  const luongAm = Number(row?.luong_thuc_nhan || 0) < 0;

  const soNgayTrongThang = new Date(nam, thang, 0).getDate();
  const minNgay = `${nam}-${pad2(thang)}-01`;
  const maxNgay = `${nam}-${pad2(thang)}-${pad2(soNgayTrongThang)}`;

  useEffect(() => {
    let huy = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getDieuChinh({ thang, nam, ma_nhan_vien: maNhanVien, loai });
        if (!huy) setItems(res.items || []);
      } catch (err) {
        if (!huy) {
          setItems([]);
          onError?.(err.response?.data?.message || err.message || "Không tải được danh sách khoản");
        }
      } finally {
        if (!huy) setLoading(false);
      }
    })();
    return () => {
      huy = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maNhanVien, loai, thang, nam]);

  const apDungKetQua = (res) => {
    setItems(res.items || []);
    if (res.row) {
      setRow(res.row);
      onRowUpdated?.(res.row);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (saving || readOnly) return;

    const n = Number(soTien);
    if (!Number.isFinite(n) || n <= 0) {
      onError?.("Số tiền phải lớn hơn 0");
      soTienRef.current?.focus();
      return;
    }

    setSaving(true);
    try {
      const res = await addDieuChinh({
        thang,
        nam,
        ma_nhan_vien: maNhanVien,
        loai,
        so_tien: n,
        ly_do: lyDo,
        ngay,
      });
      apDungKetQua(res);
      // Giữ modal mở để nhập tiếp khoản kế tiếp
      setSoTien("");
      setLyDo("");
      soTienRef.current?.focus();
    } catch (err) {
      onError?.(err.response?.data?.message || err.message || "Không thể thêm khoản");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (deletingId || readOnly) return;
    const ok = await confirm(
      `Xóa khoản ${meta.nhan.toLowerCase()} ${formatMoney(item.so_tien)} ngày ${fmtNgay(item.ngay)}?`,
      { danger: true, confirmLabel: "Xóa" }
    );
    if (!ok) return;

    setDeletingId(item.id);
    try {
      const res = await deleteDieuChinh({ id: item.id, thang, nam });
      apDungKetQua(res);
    } catch (err) {
      onError?.(err.response?.data?.message || err.message || "Không thể xóa khoản");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ModalPortal>
      <ModalOverlay onClick={onClose}>
        <div
          className="modal-panel max-w-2xl w-full max-h-[90vh] flex flex-col min-h-0 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="shrink-0 p-5 md:p-6 pb-4 border-b border-outline flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-primary">
                {meta.nhan} — {employee?.ten || ""}
              </h2>
              <p className="text-muted text-sm mt-1">
                Kỳ {pad2(thang)}/{nam}
                {readOnly && " · Kỳ đã chốt, chỉ xem"}
              </p>
            </div>
            <button type="button" className="btn-ghost !p-2 shrink-0" onClick={onClose} aria-label="Đóng">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Form thêm khoản */}
          {!readOnly && (
            <form onSubmit={handleAdd} className="shrink-0 px-5 md:px-6 py-4 border-b border-outline space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">
                    Số tiền
                  </label>
                  <PriceInput
                    ref={soTienRef}
                    className="input-field !text-right tabular-nums w-full"
                    value={soTien}
                    onChange={setSoTien}
                    placeholder="0"
                    autoFocus
                  />
                </div>
                <div className="sm:w-[10.5rem] shrink-0">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">
                    Ngày
                  </label>
                  <input
                    type="date"
                    className="input-field w-full"
                    value={ngay}
                    min={minNgay}
                    max={maxNgay}
                    onChange={(e) => setNgay(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">
                    Lý do <span className="normal-case font-normal">(không bắt buộc)</span>
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={lyDo}
                    maxLength={255}
                    placeholder={meta.viDu}
                    onChange={(e) => setLyDo(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary !py-2.5 !px-5 !text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  {saving ? "Đang thêm..." : "Thêm"}
                </button>
              </div>
            </form>
          )}

          {/* Lịch sử */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-5 md:px-6 py-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-primary border-dashed rounded-full animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center text-muted py-10">
                <span className="material-symbols-outlined text-4xl opacity-40">receipt_long</span>
                <p className="mt-2 text-sm">Chưa có khoản {meta.nhan.toLowerCase()} nào trong kỳ này.</p>
              </div>
            ) : (
              <ul className="divide-y divide-outline/60">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 py-2.5">
                    <div className="w-[6.25rem] shrink-0 text-sm text-muted tabular-nums whitespace-nowrap">
                      {fmtNgay(it.ngay)}
                    </div>
                    <div className="flex-1 min-w-0 text-sm">
                      {it.ly_do ? (
                        <span className="break-words">{it.ly_do}</span>
                      ) : (
                        <span className="text-muted italic">Không ghi lý do</span>
                      )}
                    </div>
                    <div className={`shrink-0 font-bold tabular-nums ${meta.mau}`}>{formatMoney(it.so_tien)}</div>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleDelete(it)}
                        disabled={deletingId === it.id}
                        className="shrink-0 w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all hover:bg-error/10 disabled:opacity-40"
                        style={{ color: "var(--color-error)" }}
                        title="Xóa khoản này"
                        aria-label={`Xóa khoản ${formatMoney(it.so_tien)} ngày ${fmtNgay(it.ngay)}`}
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tổng kết */}
          <div className="shrink-0 border-t border-outline px-5 md:px-6 py-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold uppercase tracking-wide">
                Tổng {meta.nhan.toLowerCase()}
                {items.length > 0 && <span className="text-muted font-normal normal-case"> · {items.length} khoản</span>}
              </span>
              <span className={`text-lg font-bold tabular-nums ${meta.mau}`}>
                {meta.dau}
                {formatMoney(tongKhoan)}
              </span>
            </div>
            {luongAm && (
              <p className="text-xs text-error flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">warning</span>
                Tổng khấu trừ và tạm ứng đang vượt quá lương của nhân viên này.
              </p>
            )}
          </div>
        </div>
      </ModalOverlay>
    </ModalPortal>
  );
}
