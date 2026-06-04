import { useEffect, useState } from "react";
import { getLuongNhanVien, upsertLuongNhanVienBulk } from "../services/payrollService";

function toInteger(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function normalizeRow(r) {
  return {
    ...r,
    luong_gio: toInteger(r.luong_gio),
    phu_cap_mac_dinh: toInteger(r.phu_cap_mac_dinh),
  };
}

export default function CauHinhLuongNhanVien() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [rows, setRows] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getLuongNhanVien();
      setRows((res || []).map(normalizeRow));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không tải được cấu hình lương");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (ma_nhan_vien, field, value) => {
    let next = value;
    if (field === "luong_gio" || field === "phu_cap_mac_dinh") {
      if (value === "") {
        next = "";
      } else {
        const n = Number(value);
        next = Number.isFinite(n) ? Math.round(n) : value;
      }
    }
    setRows((prev) =>
      prev.map((r) => (r.ma_nhan_vien === ma_nhan_vien ? { ...r, [field]: next } : r))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = rows.map((r) => ({
        ma_nhan_vien: r.ma_nhan_vien,
        luong_gio: toInteger(r.luong_gio),
        phu_cap_mac_dinh: toInteger(r.phu_cap_mac_dinh),
        trang_thai: r.trang_thai || "dang_lam",
      }));
      const res = await upsertLuongNhanVienBulk({ items });
      await load();
      const dongBo = res?.bang_luong_dong_bo ?? 0;
      alert(
        res?.message
          ? `${res.message} (đã đồng bộ ${dongBo} dòng bảng lương kỳ chưa chốt)`
          : "Đã lưu cấu hình lương nhân viên"
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
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
          Cấu hình lương nhân viên
        </h1>
        <p className="text-muted text-sm mt-1">
          Nhập lương theo giờ và phụ cấp mặc định. Cập nhật trạng thái nhân viên để hệ thống dùng khi tính
          bảng công/bảng lương.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-12 h-12 border-4 border-primary border-dashed rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="alert-error text-error bg-error-container/20 border border-error/20 rounded-xl p-4">{error}</div>
      ) : (
        <div className="card p-4 md:p-5 border-none overflow-hidden">
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
              <button className="btn-primary !py-2 !px-4 !text-sm" onClick={handleSave} disabled={saving}>
                <span className="material-symbols-outlined text-lg">save</span>
                {saving ? "Đang lưu..." : "Lưu cấu hình"}
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
                          <input
                            className="input-field !p-2 w-full max-w-[180px]"
                            type="number"
                            min="0"
                            step="1000"
                            value={r.luong_gio}
                            onChange={(e) => handleChange(r.ma_nhan_vien, "luong_gio", e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <input
                            className="input-field !p-2 w-full max-w-[200px]"
                            type="number"
                            min="0"
                            step="1000"
                            value={r.phu_cap_mac_dinh}
                            onChange={(e) => handleChange(r.ma_nhan_vien, "phu_cap_mac_dinh", e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <select
                            className="input-field !py-2 !pr-9 w-full max-w-[200px]"
                            value={r.trang_thai || "dang_lam"}
                            onChange={(e) => handleChange(r.ma_nhan_vien, "trang_thai", e.target.value)}
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

