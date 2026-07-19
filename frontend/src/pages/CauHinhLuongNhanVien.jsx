import { useEffect, useMemo, useState } from "react";
import {
  getLuongNhanVien,
  upsertLuongNhanVienBulk,
  getNgayLe,
  upsertNgayLe,
  deleteNgayLe,
} from "../services/payrollService";
import { ToastContainer, useToast } from "../components/Toast";
import { useConfirm } from "../context/ConfirmContext";

function toInteger(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function formatMoney(n) {
  return `${Number(n || 0).toLocaleString("vi-VN")}đ`;
}

function parseMoneyInput(str) {
  const digits = String(str ?? "").replace(/[^\d]/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10);
}

const CONFIG_FIELDS = ["luong_gio", "phu_cap_mac_dinh", "trang_thai"];

function normalizeRow(r) {
  return {
    ...r,
    luong_gio: toInteger(r.luong_gio),
    phu_cap_mac_dinh: toInteger(r.phu_cap_mac_dinh),
    trang_thai: r.trang_thai || "dang_lam",
  };
}

function snapshotRows(list) {
  return list.map((r) => ({
    ma_nhan_vien: r.ma_nhan_vien,
    luong_gio: toInteger(r.luong_gio),
    phu_cap_mac_dinh: toInteger(r.phu_cap_mac_dinh),
    trang_thai: r.trang_thai || "dang_lam",
  }));
}

function countDirtyChanges(rows, savedRows) {
  let n = 0;
  for (const r of rows) {
    const base = savedRows.find((b) => b.ma_nhan_vien === r.ma_nhan_vien);
    if (!base) continue;
    for (const f of CONFIG_FIELDS) {
      if (f === "trang_thai") {
        if ((r.trang_thai || "dang_lam") !== (base.trang_thai || "dang_lam")) n += 1;
      } else if (toInteger(r[f]) !== toInteger(base[f])) {
        n += 1;
      }
    }
  }
  return n;
}

function MoneyEditInput({ ma_nhan_vien, field, value, editingField, setEditingField, onValueChange }) {
  const editKey = `${ma_nhan_vien}-${field}`;
  const isEditing = editingField === editKey;
  const displayValue = isEditing ? String(toInteger(value)) : formatMoney(value);

  return (
    <input
      className="input-field !p-2 !text-right tabular-nums w-full max-w-[200px]"
      type="text"
      inputMode="numeric"
      value={displayValue}
      onFocus={() => setEditingField(editKey)}
      onBlur={() => setEditingField(null)}
      onChange={(e) => onValueChange(parseMoneyInput(e.target.value))}
    />
  );
}

function NgayLeSection({ toast }) {
  const { confirm } = useConfirm();
  const [list, setList] = useState([]);
  const [loadingLe, setLoadingLe] = useState(false);
  const [savingLe, setSavingLe] = useState(false);
  const [form, setForm] = useState({ ngay: "", ten: "", he_so: "2" });

  const loadLe = async () => {
    setLoadingLe(true);
    try {
      setList(await getNgayLe());
    } catch {
      setList([]);
    } finally {
      setLoadingLe(false);
    }
  };

  useEffect(() => {
    loadLe();
  }, []);

  const fmtDate = (ymd) => {
    const [y, m, d] = String(ymd).split("-");
    return `${d}/${m}/${y}`;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (savingLe) return;
    const heSo = Number(form.he_so);
    if (!form.ngay) return toast("Vui lòng chọn ngày", "error");
    if (!Number.isFinite(heSo) || heSo <= 0) return toast("Hệ số phải là số lớn hơn 0", "error");
    setSavingLe(true);
    try {
      await upsertNgayLe({ ngay: form.ngay, ten: form.ten, he_so: heSo });
      toast("Đã lưu ngày lễ");
      setForm({ ngay: "", ten: "", he_so: "2" });
      await loadLe();
    } catch (err) {
      toast(err.response?.data?.message || err.message || "Không thể lưu ngày lễ", "error");
    } finally {
      setSavingLe(false);
    }
  };

  const handleDelete = async (le) => {
    if (!(await confirm(`Xóa ngày lễ ${fmtDate(le.ngay)}${le.ten ? ` (${le.ten})` : ""}?`, { danger: true, confirmLabel: "Xóa" }))) return;
    try {
      await deleteNgayLe(le.ngay);
      toast("Đã xóa ngày lễ");
      await loadLe();
    } catch (err) {
      toast(err.response?.data?.message || err.message || "Không thể xóa", "error");
    }
  };

  return (
    <div className="card p-4">
      <h3 className="font-bold text-primary">Ngày lễ / hệ số lương</h3>
      <p className="text-xs text-muted mt-1 mb-4">
        Đánh dấu ngày lễ để nhân lương giờ (hệ số 2 = ×2, 3 = ×3…). Chỉ áp dụng cho kỳ lương <b>chưa chốt</b>; kỳ đã chốt giữ nguyên.
      </p>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Ngày</label>
          <input
            type="date"
            className="input-field !py-2 !w-auto"
            value={form.ngay}
            onChange={(e) => setForm({ ...form, ngay: e.target.value })}
          />
        </div>
        <div className="flex-1 min-w-[10rem]">
          <label className="text-xs font-semibold text-muted block mb-1">Tên (tùy chọn)</label>
          <input
            type="text"
            className="input-field !py-2"
            placeholder="VD: Giỗ Tổ, 30/4…"
            value={form.ten}
            onChange={(e) => setForm({ ...form, ten: e.target.value })}
          />
        </div>
        <div className="w-24">
          <label className="text-xs font-semibold text-muted block mb-1">Hệ số</label>
          <input
            type="text"
            inputMode="decimal"
            className="input-field !py-2 !text-right"
            value={form.he_so}
            onChange={(e) => setForm({ ...form, he_so: e.target.value.replace(/[^\d.]/g, "") })}
          />
        </div>
        <button type="submit" disabled={savingLe} className="btn-primary !py-2 !px-4 !text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          <span className="material-symbols-outlined text-lg">add</span>
          {savingLe ? "Đang lưu..." : "Thêm"}
        </button>
      </form>

      {loadingLe ? (
        <p className="text-sm text-muted">Đang tải…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted">Chưa có ngày lễ nào.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {list.map((le) => (
            <div
              key={le.ngay}
              className="inline-flex items-center gap-2 rounded-lg border border-outline/50 pl-3 pr-1 py-1.5 text-sm"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-warning) 8%, transparent)" }}
            >
              <span className="font-semibold">{fmtDate(le.ngay)}</span>
              {le.ten && <span className="text-muted truncate max-w-[10rem]">· {le.ten}</span>}
              <span className="font-bold text-warning">×{le.he_so}</span>
              <button
                type="button"
                onClick={() => handleDelete(le)}
                className="w-6 h-6 flex items-center justify-center rounded-md text-error hover:bg-error/15"
                aria-label="Xóa"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CauHinhLuongNhanVien() {
  const { toasts, show: toast, dismiss } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingField, setEditingField] = useState(null);

  const [rows, setRows] = useState([]);
  const [savedRows, setSavedRows] = useState([]);

  const changeCount = useMemo(() => countDirtyChanges(rows, savedRows), [rows, savedRows]);
  const hasUnsavedChanges = changeCount > 0;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getLuongNhanVien();
      const mapped = (res || []).map(normalizeRow);
      setRows(mapped);
      setSavedRows(snapshotRows(mapped));
      setEditingField(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không tải được cấu hình lương");
      setRows([]);
      setSavedRows([]);
      setEditingField(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMoneyChange = (ma_nhan_vien, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r.ma_nhan_vien === ma_nhan_vien ? { ...r, [field]: toInteger(value) } : r))
    );
  };

  const handleStatusChange = (ma_nhan_vien, value) => {
    setRows((prev) =>
      prev.map((r) => (r.ma_nhan_vien === ma_nhan_vien ? { ...r, trang_thai: value } : r))
    );
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;
    setSaving(true);
    try {
      const changedRows = rows.filter((r) => {
        const base = savedRows.find((b) => b.ma_nhan_vien === r.ma_nhan_vien);
        if (!base) return true;
        return CONFIG_FIELDS.some((f) => {
          if (f === "trang_thai") {
            return (r.trang_thai || "dang_lam") !== (base.trang_thai || "dang_lam");
          }
          return toInteger(r[f]) !== toInteger(base[f]);
        });
      });

      const items = changedRows.map((r) => ({
        ma_nhan_vien: r.ma_nhan_vien,
        luong_gio: toInteger(r.luong_gio),
        phu_cap_mac_dinh: toInteger(r.phu_cap_mac_dinh),
        trang_thai: r.trang_thai || "dang_lam",
      }));

      await upsertLuongNhanVienBulk({ items });
      await load();
      toast("Đã lưu thay đổi");
    } catch (err) {
      toast(err.response?.data?.message || err.message || "Không thể lưu cấu hình", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 md:space-y-6 text-on-surface pb-8">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <div>
        <h2 className="text-3xl font-bold text-on-surface">Cấu hình lương nhân viên</h2>
        <p className="text-sm text-muted">Thiết lập lương giờ và phụ cấp mặc định</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-12 h-12 border-4 border-primary border-dashed rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="alert-error text-error bg-error-container/20 border border-error/20 rounded-xl p-4">{error}</div>
      ) : (
        <div className="card p-4 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-4">
            <div>
              <p className="text-muted text-xs uppercase tracking-widest font-semibold">
                Danh sách nhân viên
              </p>
              <p className="text-sm mt-1 font-bold">
                {rows.length} nhân viên
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={
                  hasUnsavedChanges
                    ? "btn-primary !py-2 !px-4 !text-sm"
                    : "btn-outline !py-2 !px-4 !text-sm opacity-50 cursor-not-allowed"
                }
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                title={hasUnsavedChanges ? "Lưu các thay đổi cấu hình" : "Chưa có thay đổi cần lưu"}
              >
                <span className="material-symbols-outlined text-lg">save</span>
                {saving
                  ? "Đang lưu..."
                  : hasUnsavedChanges
                    ? `Lưu ${changeCount} thay đổi`
                    : "Lưu cấu hình"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm min-w-[900px]">
              <thead className="table-head">
                <tr className="text-sm">
                  <th className="px-4 py-3">Nhân viên</th>
                  <th className="px-4 py-3 text-center">Lương/giờ</th>
                  <th className="px-4 py-3 text-center">Phụ cấp/tháng</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted">
                      Chưa có nhân viên.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.ma_nhan_vien} className="hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 font-semibold">{r.ten}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <MoneyEditInput
                            ma_nhan_vien={r.ma_nhan_vien}
                            field="luong_gio"
                            value={r.luong_gio}
                            editingField={editingField}
                            setEditingField={setEditingField}
                            onValueChange={(v) => handleMoneyChange(r.ma_nhan_vien, "luong_gio", v)}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <MoneyEditInput
                            ma_nhan_vien={r.ma_nhan_vien}
                            field="phu_cap_mac_dinh"
                            value={r.phu_cap_mac_dinh}
                            editingField={editingField}
                            setEditingField={setEditingField}
                            onValueChange={(v) => handleMoneyChange(r.ma_nhan_vien, "phu_cap_mac_dinh", v)}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <select
                            className="input-field !py-2 !pr-9 w-full max-w-[200px]"
                            value={r.trang_thai || "dang_lam"}
                            onChange={(e) => handleStatusChange(r.ma_nhan_vien, e.target.value)}
                          >
                            <option value="dang_lam">đang làm</option>
                            <option value="tam_nghi">tạm nghỉ</option>
                            <option value="da_nghi">đã nghỉ</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <NgayLeSection toast={toast} />
    </div>
  );
}
