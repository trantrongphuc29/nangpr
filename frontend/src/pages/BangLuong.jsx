import { useEffect, useMemo, useState } from "react";
import {
  getBangLuong,
  getBangCongChiTiet,
  updateBangLuongEmployee,
  lockKyLuong,
  unlockKyLuong,
  markKyLuongPaid,
} from "../services/payrollService";
import { exportBangLuongExcel, exportBangLuongPDF } from "../utils/bangLuongExport";
import ModalPortal from "../components/ModalPortal";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatMoney(n) {
  return `${Number(n || 0).toLocaleString("vi-VN")}đ`;
}

function formatNumber(n) {
  return Number(n || 0).toLocaleString("vi-VN");
}

function toInt(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(v);
}

function parseMoneyInput(str) {
  const digits = String(str ?? "").replace(/[^\d]/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10);
}

function formatMoneyInput(n) {
  return formatMoney(n);
}

const EDIT_FIELDS = ["phu_cap", "thuong", "khau_tru", "tam_ung"];

function mapRowsFromApi(list) {
  return (list || []).map((r) => ({
    ...r,
    phu_cap: toInt(r.phu_cap),
    thuong: toInt(r.thuong),
    khau_tru: toInt(r.khau_tru),
    tam_ung: toInt(r.tam_ung),
  }));
}

function snapshotRows(list) {
  return list.map((r) => ({
    ma_nhan_vien: r.ma_nhan_vien,
    phu_cap: toInt(r.phu_cap),
    thuong: toInt(r.thuong),
    khau_tru: toInt(r.khau_tru),
    tam_ung: toInt(r.tam_ung),
  }));
}

function countDirtyChanges(rows, savedRows) {
  let n = 0;
  for (const r of rows) {
    const base = savedRows.find((b) => b.ma_nhan_vien === r.ma_nhan_vien);
    if (!base) continue;
    for (const f of EDIT_FIELDS) {
      if (toInt(r[f]) !== toInt(base[f])) n += 1;
    }
  }
  return n;
}

function MoneyEditInput({ ma_nhan_vien, field, value, disabled, editingField, setEditingField, onValueChange }) {
  const editKey = `${ma_nhan_vien}-${field}`;
  const isEditing = editingField === editKey;
  const displayValue = isEditing ? String(toInt(value)) : formatMoneyInput(value);

  return (
    <input
      className="input-field !p-2 !text-right tabular-nums"
      style={{ maxWidth: 160 }}
      type="text"
      inputMode="numeric"
      value={displayValue}
      disabled={disabled}
      onFocus={() => setEditingField(editKey)}
      onBlur={() => setEditingField(null)}
      onChange={(e) => onValueChange(parseMoneyInput(e.target.value))}
    />
  );
}

export default function BangLuong() {
  const today = new Date();
  const [thang, setThang] = useState(today.getMonth() + 1);
  const [nam, setNam] = useState(today.getFullYear());
  const [maNhanVien, setMaNhanVien] = useState("");

  const [loading, setLoading] = useState(false);
  const [ky, setKy] = useState(null);
  const [totals, setTotals] = useState(null);
  const [rows, setRows] = useState([]);
  const [savedRows, setSavedRows] = useState([]);
  const [editingField, setEditingField] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRows, setDetailRows] = useState([]);
  const [detailEmployee, setDetailEmployee] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const kyTrangThai = ky?.trang_thai;
  const isChuaChot = kyTrangThai === "chua_chot";

  const changeCount = useMemo(() => countDirtyChanges(rows, savedRows), [rows, savedRows]);
  const hasUnsavedChanges = changeCount > 0;

  const employeeOptions = useMemo(() => {
    return rows.map((r) => ({ ma_nhan_vien: r.ma_nhan_vien, ten: r.ten }));
  }, [rows]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await getBangLuong({
        thang,
        nam,
        ma_nhan_vien: maNhanVien ? Number(maNhanVien) : null,
      });
      setKy(res.ky);
      setTotals(res.totals);
      const mapped = mapRowsFromApi(res.rows);
      setRows(mapped);
      setSavedRows(snapshotRows(mapped));
      setEditingField(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không tải được bảng lương");
      setKy(null);
      setTotals(null);
      setRows([]);
      setSavedRows([]);
      setEditingField(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thang, nam, maNhanVien]);

  const handleChangeField = (ma_nhan_vien, field, value) => {
    const n = Number(value);
    const normalized = Number.isFinite(n) ? Math.round(n) : 0;
    setRows((prev) =>
      prev.map((r) => {
        if (r.ma_nhan_vien !== ma_nhan_vien) return r;
        const updated = { ...r, [field]: normalized };
        updated.luong_thuc_nhan =
          Number(updated.luong_co_ban || 0) +
          Number(updated.phu_cap || 0) +
          Number(updated.thuong || 0) -
          Number(updated.khau_tru || 0) -
          Number(updated.tam_ung || 0);
        return updated;
      })
    );
  };

  const handleSaveEdits = async () => {
    if (!isChuaChot || !hasUnsavedChanges) return;
    setSaving(true);
    try {
      const changedIds = new Set();
      for (const r of rows) {
        const base = savedRows.find((b) => b.ma_nhan_vien === r.ma_nhan_vien);
        if (!base) continue;
        if (EDIT_FIELDS.some((f) => toInt(r[f]) !== toInt(base[f]))) {
          changedIds.add(r.ma_nhan_vien);
        }
      }
      for (const r of rows.filter((row) => changedIds.has(row.ma_nhan_vien))) {
        await updateBangLuongEmployee({
          thang,
          nam,
          ma_nhan_vien: r.ma_nhan_vien,
          phu_cap: toInt(r.phu_cap),
          thuong: toInt(r.thuong),
          khau_tru: toInt(r.khau_tru),
          tam_ung: toInt(r.tam_ung),
        });
      }
      await load();
      alert(`Đã lưu ${changeCount} thay đổi`);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Không thể lưu");
    } finally {
      setSaving(false);
    }
  };

  const handleLock = async () => {
    if (hasUnsavedChanges) {
      alert("Vui lòng lưu chỉnh sửa trước khi chốt lương.");
      return;
    }
    const ok = window.confirm(
      `Chốt lương tháng ${pad2(thang)}/${nam}?\n\nSau khi chốt, bảng lương sẽ khóa chỉnh sửa cho đến khi mở chốt`
    );
    if (!ok) return;
    try {
      await lockKyLuong({ thang, nam });
      await load();
      alert("Đã chốt lương");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Không thể chốt lương");
    }
  };

  const handleUnlock = async () => {
    try {
      await unlockKyLuong({ thang, nam });
      await load();
      alert("Đã mở chốt lương");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Không thể mở chốt");
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markKyLuongPaid({ thang, nam });
      await load();
      alert("Đã đánh dấu thanh toán");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Không thể đánh dấu thanh toán");
    }
  };

  const exportPayload = () => ({
    rows,
    totals,
    thang,
    nam,
    kyLabel:
      kyTrangThai === "chua_chot" ? "Chưa chốt" : kyTrangThai === "da_chot" ? "Đã chốt" : "Đã thanh toán",
  });

  const handleExportExcel = () => {
    try {
      exportBangLuongExcel(exportPayload());
    } catch (err) {
      alert(err.message || "Không thể xuất Excel");
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportBangLuongPDF(exportPayload());
    } catch (err) {
      alert(err.message || "Không thể xuất PDF");
    }
  };

  const handleViewDetail = async (row) => {
    setDetailEmployee(row);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await getBangCongChiTiet({
        thang,
        nam,
        ma_nhan_vien: row.ma_nhan_vien,
      });
      setDetailRows(res.rows || []);
    } catch (err) {
      setDetailRows([]);
      alert(err.response?.data?.message || err.message || "Không tải được chi tiết");
    } finally {
      setDetailLoading(false);
    }
  };

  const kyLabel =
    kyTrangThai === "chua_chot" ? "Chưa chốt" : kyTrangThai === "da_chot" ? "Đã chốt" : "Đã thanh toán";

  return (
    <div className="space-y-5 md:space-y-6 text-on-surface pb-8">
      <div>
        <h2 className="text-xl font-bold text-on-surface">Bảng lương</h2>
        <p className="text-sm text-muted">Tự động tính lương khi kỳ ở trạng thái Chưa chốt</p>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap shrink-0">
                Tháng
              </label>
              <select
                className="input-field !w-[4.5rem] !min-w-[4.5rem] !py-2 !px-2 !pr-7 text-sm"
                value={thang}
                onChange={(e) => setThang(Number(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {pad2(i + 1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap shrink-0">
                Năm
              </label>
              <select
                className="input-field !w-[5.25rem] !min-w-[5.25rem] !py-2 !px-2 !pr-7 text-sm"
                value={nam}
                onChange={(e) => setNam(Number(e.target.value))}
              >
                {[today.getFullYear() - 2, today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 min-w-0 max-w-full sm:max-w-[16rem]">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap shrink-0">
                Nhân viên
              </label>
              <select
                className="input-field !w-[12rem] sm:!w-[14rem] !min-w-0 !py-2 !px-2 !pr-7 text-sm"
                value={maNhanVien}
                onChange={(e) => setMaNhanVien(e.target.value)}
              >
                <option value="">Tất cả nhân viên</option>
                {employeeOptions.map((opt) => (
                  <option key={opt.ma_nhan_vien} value={opt.ma_nhan_vien}>
                    {opt.ten}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-left lg:text-right">
            <p className="text-xs text-muted uppercase tracking-widest font-semibold">Trạng thái kỳ</p>
            <p className="text-lg font-bold text-primary tabular-nums mt-1">{kyLabel}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 justify-between pt-2 border-t border-outline">
          <div className="flex flex-wrap items-center gap-2">
            {isChuaChot ? (
              <>
                <button
                  type="button"
                  className={
                    hasUnsavedChanges
                      ? "btn-primary !py-2 !px-4 !text-sm"
                      : "btn-outline !py-2 !px-4 !text-sm opacity-50 cursor-not-allowed"
                  }
                  onClick={handleSaveEdits}
                  disabled={saving || !hasUnsavedChanges}
                  title={hasUnsavedChanges ? "Lưu các ô đã chỉnh" : "Chưa có thay đổi cần lưu"}
                >
                  <span className="material-symbols-outlined text-lg">save</span>
                  {saving
                    ? "Đang lưu..."
                    : hasUnsavedChanges
                      ? `Lưu ${changeCount} thay đổi`
                      : "Lưu chỉnh sửa"}
                </button>
                <button className="btn-outline !py-2 !px-4 !text-sm border-2 border-primary" onClick={handleLock}>
                  <span className="material-symbols-outlined text-lg">lock</span>
                  Chốt lương
                </button>
              </>
            ) : (
              <>
                <div className="text-muted text-xs uppercase tracking-widest font-semibold">
                  Kỳ {kyLabel}. Dữ liệu đã khóa.
                </div>
                <button className="btn-outline !py-2 !px-4 !text-sm" onClick={handleExportExcel}>
                  <span className="material-symbols-outlined text-lg">download</span>
                  Xuất Excel
                </button>
                <button className="btn-outline !py-2 !px-4 !text-sm" onClick={handleExportPDF}>
                  <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                  Xuất PDF
                </button>
                {kyTrangThai === "da_chot" && (
                  <>
                    <button className="btn-primary !py-2 !px-4 !text-sm" onClick={handleMarkPaid}>
                      <span className="material-symbols-outlined text-lg">payments</span>
                      Đánh dấu đã thanh toán
                    </button>
                    <button className="btn-ghost !py-2 !px-4 !text-sm border border-outline" onClick={handleUnlock}>
                      <span className="material-symbols-outlined text-lg">lock_open</span>
                      Mở chốt
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* For chua_chot also allow exports */}
          {isChuaChot && (
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn-outline !py-2 !px-4 !text-sm border-2 border-primary" onClick={handleExportExcel}>
                <span className="material-symbols-outlined text-lg">download</span>
                Xuất Excel
              </button>
              <button className="btn-outline !py-2 !px-4 !text-sm" onClick={handleExportPDF}>
                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                Xuất PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ backgroundColor: "var(--color-primary)" }} />
          <div className="pl-2">
            <p className="text-xs font-medium text-muted">Tổng nhân viên</p>
            <p className="text-lg font-bold text-on-surface tabular-nums mt-0.5">{totals?.tong_nhan_vien || 0}</p>
          </div>
        </div>
        <div className="card p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ backgroundColor: "var(--color-success)" }} />
          <div className="pl-2">
            <p className="text-xs font-medium text-muted">Tổng giờ làm</p>
            <p className="text-lg font-bold text-on-surface tabular-nums mt-0.5">{formatNumber(totals?.tong_gio || 0)}</p>
          </div>
        </div>
        <div className="card p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ backgroundColor: "var(--color-warning)" }} />
          <div className="pl-2">
            <p className="text-xs font-medium text-muted">Tổng lương cơ bản</p>
            <p className="text-lg font-bold text-on-surface tabular-nums mt-0.5">{formatMoney(totals?.tong_luong_co_ban || 0)}</p>
            <p className="text-[11px] text-muted mt-0.5">Chưa gồm phụ cấp/thưởng/khấu trừ</p>
          </div>
        </div>
        <div className="card p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ backgroundColor: "var(--color-error)" }} />
          <div className="pl-2">
            <p className="text-xs font-medium text-muted">Tổng tiền phải trả</p>
            <p className="text-lg font-bold text-on-surface tabular-nums mt-0.5">{formatMoney(totals?.tong_tien_phai_tra || 0)}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="w-12 h-12 border-4 border-primary border-dashed rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="alert-error text-error bg-error-container/20 border border-error/20 rounded-xl p-4">{error}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm min-w-[1100px]">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Nhân viên</th>
                  <th className="px-4 py-3 text-center">Tổng ca</th>
                  <th className="px-4 py-3 text-center">Tổng giờ</th>
                  <th className="px-4 py-3 text-center">Lương/giờ</th>
                  <th className="px-4 py-3 text-center">Lương cơ bản</th>
                  <th className="px-4 py-3 text-center">Phụ cấp</th>
                  <th className="px-4 py-3 text-center">Thưởng</th>
                  <th className="px-4 py-3 text-center">Khấu trừ</th>
                  <th className="px-4 py-3 text-center">Tạm ứng</th>
                  <th className="px-4 py-3 text-center">Lương thực nhận</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-muted">
                      Không có dữ liệu cho bộ lọc này.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.ma_nhan_vien} className="hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 font-semibold">{r.ten}</td>
                      <td className="px-4 py-3 text-center text-muted">{r.tong_ca}</td>
                      <td className="px-4 py-3 text-right font-bold">{Number(r.tong_gio || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatMoney(r.luong_gio)}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatMoney(r.luong_co_ban)}</td>

                      <td className="px-1 py-3 text-right">
                        <MoneyEditInput
                          ma_nhan_vien={r.ma_nhan_vien}
                          field="phu_cap"
                          value={r.phu_cap}
                          disabled={!isChuaChot}
                          editingField={editingField}
                          setEditingField={setEditingField}
                          onValueChange={(v) => handleChangeField(r.ma_nhan_vien, "phu_cap", v)}
                        />
                      </td>
                      <td className="px-2 py-3 text-right">
                        <MoneyEditInput
                          ma_nhan_vien={r.ma_nhan_vien}
                          field="thuong"
                          value={r.thuong}
                          disabled={!isChuaChot}
                          editingField={editingField}
                          setEditingField={setEditingField}
                          onValueChange={(v) => handleChangeField(r.ma_nhan_vien, "thuong", v)}
                        />
                      </td>
                      <td className="px-2 py-3 text-right">
                        <MoneyEditInput
                          ma_nhan_vien={r.ma_nhan_vien}
                          field="khau_tru"
                          value={r.khau_tru}
                          disabled={!isChuaChot}
                          editingField={editingField}
                          setEditingField={setEditingField}
                          onValueChange={(v) => handleChangeField(r.ma_nhan_vien, "khau_tru", v)}
                        />
                      </td>
                      <td className="px-2 py-3 text-right">
                        <MoneyEditInput
                          ma_nhan_vien={r.ma_nhan_vien}
                          field="tam_ung"
                          value={r.tam_ung}
                          disabled={!isChuaChot}
                          editingField={editingField}
                          setEditingField={setEditingField}
                          onValueChange={(v) => handleChangeField(r.ma_nhan_vien, "tam_ung", v)}
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-bold">{formatMoney(r.luong_thuc_nhan)}</td>

                      <td className="px-4 py-3 text-left text-muted">
                        {kyLabel}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          className="btn-outline !py-2 !px-3 !text-xs"
                          onClick={() => handleViewDetail(r)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailOpen && (
        <ModalPortal>
          <div className="modal-overlay print:hidden" onClick={() => setDetailOpen(false)}>
            <div
              className="modal-panel max-w-5xl w-full max-h-[90vh] flex flex-col min-h-0 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 p-5 md:p-6 pb-4 border-b border-outline flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-primary">Chi tiết lương - {detailEmployee?.ten || ""}</h2>
                  <p className="text-muted text-sm mt-1">
                    {pad2(thang)}/{nam}
                  </p>
                </div>
                <button type="button" className="btn-ghost !p-2 shrink-0" onClick={() => setDetailOpen(false)} aria-label="Đóng">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {detailEmployee && (
                <div className="shrink-0 px-5 md:px-6 py-4 border-b border-outline grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-primary/5 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase text-muted tracking-wide">Lương/giờ</p>
                    <p className="text-base font-bold text-primary tabular-nums mt-0.5">{formatMoney(detailEmployee.luong_gio)}</p>
                  </div>
                  <div className="rounded-xl bg-primary/5 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase text-muted tracking-wide">Lương cơ bản</p>
                    <p className="text-base font-bold text-primary tabular-nums mt-0.5">{formatMoney(detailEmployee.luong_co_ban)}</p>
                  </div>
                  <div className="rounded-xl bg-primary/5 px-3 py-2.5 col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-semibold uppercase text-muted tracking-wide">Lương thực nhận</p>
                    <p className="text-base font-bold text-primary tabular-nums mt-0.5">{formatMoney(detailEmployee.luong_thuc_nhan)}</p>
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5 md:p-6 pt-4">
                {detailLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-10 h-10 border-4 border-primary border-dashed rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm min-w-[750px]">
                      <thead className="table-head">
                        <tr>
                          <th className="px-4 py-3">Ngày làm việc</th>
                          <th className="px-4 py-3">Tên ca</th>
                          <th className="px-4 py-3">Thời gian ca</th>
                          <th className="px-4 py-3 text-right">Số giờ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline">
                        {detailRows.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-12 text-center text-muted">
                              Không có dữ liệu.
                            </td>
                          </tr>
                        ) : (
                          detailRows.map((r, idx) => (
                            <tr key={`${r.ngay}-${r.ma_ca}-${idx}`} className="hover:bg-primary/5 transition-colors">
                              <td className="px-4 py-3">{new Date(r.ngay).toLocaleDateString("vi-VN")}</td>
                              <td className="px-4 py-3 font-semibold text-primary">{r.ten_ca}</td>
                              <td className="px-4 py-3 text-muted">{r.thoi_gian_ca}</td>
                              <td className="px-4 py-3 text-right font-bold tabular-nums">
                                {Number(r.so_gio || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

