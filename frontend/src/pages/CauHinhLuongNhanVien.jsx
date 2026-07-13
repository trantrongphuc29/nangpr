import { useEffect, useMemo, useState } from "react";
import { getLuongNhanVien, upsertLuongNhanVienBulk } from "../services/payrollService";

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

export default function CauHinhLuongNhanVien() {
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

      const res = await upsertLuongNhanVienBulk({ items });
      await load();
      const dongBo = res?.bang_luong_dong_bo ?? 0;
      alert(
        `Đã lưu ${changeCount} thay đổi` +
          (dongBo ? ` (đồng bộ ${dongBo} dòng bảng lương kỳ chưa chốt)` : "")
      );
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Không thể lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 md:space-y-6 text-on-surface pb-8">
      <div>
        <h2 className="text-xl font-bold text-on-surface">Cấu hình lương nhân viên</h2>
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
    </div>
  );
}
