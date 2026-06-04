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

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatMoney(n) {
  return `${Number(n || 0).toLocaleString("vi-VN")}đ`;
}

function formatNumber(n) {
  return Number(n || 0).toLocaleString("vi-VN");
}

function shiftHoursInput(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(v);
}

function toInt(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(v);
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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRows, setDetailRows] = useState([]);
  const [detailEmployee, setDetailEmployee] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const kyTrangThai = ky?.trang_thai;
  const isChuaChot = kyTrangThai === "chua_chot";

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
      setRows(
        (res.rows || []).map((r) => ({
          ...r,
          phu_cap: toInt(r.phu_cap),
          thuong: toInt(r.thuong),
          khau_tru: toInt(r.khau_tru),
          tam_ung: toInt(r.tam_ung),
        }))
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không tải được bảng lương");
      setKy(null);
      setTotals(null);
      setRows([]);
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
    if (!isChuaChot) return;
    setSaving(true);
    try {
      // Cập nhật lần lượt từng nhân viên
      for (const r of rows) {
        await updateBangLuongEmployee({
          thang,
          nam,
          ma_nhan_vien: r.ma_nhan_vien,
          phu_cap: shiftHoursInput(r.phu_cap),
          thuong: shiftHoursInput(r.thuong),
          khau_tru: shiftHoursInput(r.khau_tru),
          tam_ung: shiftHoursInput(r.tam_ung),
        });
      }
      await load();
      alert("Đã lưu chỉnh sửa bảng lương");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Không thể lưu");
    } finally {
      setSaving(false);
    }
  };

  const handleLock = async () => {
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
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Bảng lương</h1>
        <p className="text-muted text-sm mt-1">
          Tự động tính lương khi kỳ ở trạng thái “Chưa chốt”. Khi đã chốt/đã thanh toán sẽ không tự động thay đổi dữ liệu.
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 md:p-5 border-none space-y-4">
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
                <button className="btn-primary !py-2 !px-4 !text-sm" onClick={handleSaveEdits} disabled={saving}>
                  <span className="material-symbols-outlined text-lg">save</span>
                  {saving ? "Đang lưu..." : "Lưu chỉnh sửa"}
                </button>
                <button className="btn-outline !py-2 !px-4 !text-sm border-2 border-primary" onClick={handleLock}>
                  <span className="material-symbols-outlined text-lg">lock</span>
                  Chốt lương
                </button>
              </>
            ) : (
              <>
                <div className="text-muted text-xs uppercase tracking-widest font-semibold">
                  Kỳ đã {kyLabel}. Dữ liệu đã khóa.
                </div>
                <button className="btn-outline !py-2 !px-4 !text-sm border-2 border-primary" onClick={handleExportExcel}>
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
                      Mở chốt (admin)
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
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 md:gap-4">
        <div className="card p-4 md:p-5 border-none shadow-none bg-primary/5">
          <p className="text-[10px] font-black uppercase text-muted opacity-70 tracking-widest">Tổng nhân viên</p>
          <p className="text-xl md:text-2xl font-bold text-primary tabular-nums mt-1">{totals?.tong_nhan_vien || 0}</p>
        </div>
        <div className="card p-4 md:p-5 border-none shadow-none bg-primary/5">
          <p className="text-[10px] font-black uppercase text-muted opacity-70 tracking-widest">Tổng giờ làm</p>
          <p className="text-xl md:text-2xl font-bold text-primary tabular-nums mt-1">{formatNumber(totals?.tong_gio || 0)}</p>
        </div>
        <div className="card p-4 md:p-5 border-none shadow-none bg-primary/5">
          <p className="text-[10px] font-black uppercase text-muted opacity-70 tracking-widest">Tổng lương cơ bản</p>
          <p className="text-xl md:text-2xl font-bold text-primary tabular-nums mt-1">{formatMoney(totals?.tong_luong_co_ban || 0)}</p>
        </div>
        <div className="card p-4 md:p-5 border-none shadow-none bg-primary/5">
          <p className="text-[10px] font-black uppercase text-muted opacity-70 tracking-widest">Tổng phụ cấp</p>
          <p className="text-xl md:text-2xl font-bold text-primary tabular-nums mt-1">{formatMoney(totals?.tong_phu_cap || 0)}</p>
        </div>
        <div className="card p-4 md:p-5 border-none shadow-none bg-primary/5">
          <p className="text-[10px] font-black uppercase text-muted opacity-70 tracking-widest">Tổng thưởng</p>
          <p className="text-xl md:text-2xl font-bold text-primary tabular-nums mt-1">{formatMoney(totals?.tong_thuong || 0)}</p>
        </div>
        <div className="card p-4 md:p-5 border-none shadow-none bg-primary/5">
          <p className="text-[10px] font-black uppercase text-muted opacity-70 tracking-widest">Tổng khấu trừ</p>
          <p className="text-xl md:text-2xl font-bold text-primary tabular-nums mt-1">{formatMoney(totals?.tong_khau_tru || 0)}</p>
        </div>
        <div className="card p-4 md:p-5 border-none shadow-none bg-primary/5">
          <p className="text-[10px] font-black uppercase text-muted opacity-70 tracking-widest">Tổng tiền phải trả</p>
          <p className="text-xl md:text-2xl font-bold text-primary tabular-nums mt-1">{formatMoney(totals?.tong_tien_phai_tra || 0)}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="w-12 h-12 border-4 border-primary border-dashed rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="alert-error text-error bg-error-container/20 border border-error/20 rounded-xl p-4">{error}</div>
      ) : (
        <div className="card border-none overflow-hidden">
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
                        <input
                          className="input-field !p-2 !text-right"
                          style={{ maxWidth: 160 }}
                          type="number"
                          step="1"
                          min="0"
                          value={r.phu_cap}
                          disabled={!isChuaChot}
                          onChange={(e) => handleChangeField(r.ma_nhan_vien, "phu_cap", e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-3 text-right">
                        <input
                          className="input-field !p-2 !text-right"
                          style={{ maxWidth: 160 }}
                          type="number"
                          step="1"
                          min="0"
                          value={r.thuong}
                          disabled={!isChuaChot}
                          onChange={(e) => handleChangeField(r.ma_nhan_vien, "thuong", e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-3 text-right">
                        <input
                          className="input-field !p-2 !text-right"
                          style={{ maxWidth: 160 }}
                          type="number"
                          step="1"
                          min="0"
                          value={r.khau_tru}
                          disabled={!isChuaChot}
                          onChange={(e) => handleChangeField(r.ma_nhan_vien, "khau_tru", e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-3 text-right">
                        <input
                          className="input-field !p-2 !text-right"
                          style={{ maxWidth: 160 }}
                          type="number"
                          step="1"
                          min="0"
                          value={r.tam_ung}
                          disabled={!isChuaChot}
                          onChange={(e) => handleChangeField(r.ma_nhan_vien, "tam_ung", e.target.value)}
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
        <div className="modal-overlay print:hidden" onClick={() => setDetailOpen(false)}>
          <div className="modal-panel max-w-5xl p-5 md:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-outline">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-primary">Chi tiết công - {detailEmployee?.ten || ""}</h2>
                <p className="text-muted text-sm mt-1">
                  {pad2(thang)}/{nam}
                </p>
              </div>
              <button className="btn-ghost !p-2" onClick={() => setDetailOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-primary border-dashed rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar mt-4">
                <table className="w-full text-left text-sm min-w-[750px]">
                  <thead className="table-head">
                    <tr>
                      <th className="px-4 py-3">Ngày làm việc</th>
                      <th className="px-4 py-3">Tên ca</th>
                      <th className="px-4 py-3">Thời gian ca</th>
                      <th className="px-4 py-3 text-right">Số giờ được tính</th>
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
                          <td className="px-4 py-3 text-right font-bold">
                            {Number(r.so_gio || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}{" "}
                            <span className="text-muted text-xs">giờ</span>
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
      )}
    </div>
  );
}

