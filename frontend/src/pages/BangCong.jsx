import { useEffect, useMemo, useState } from "react";
import { getBangCong, getBangCongChiTiet } from "../services/payrollService";
import { getNhanVienList } from "../services/nhanVienService";

function pad2(n) {
  return String(n).padStart(2, "0");
}

export default function BangCong() {
  const today = new Date();
  const [thang, setThang] = useState(today.getMonth() + 1);
  const [nam, setNam] = useState(today.getFullYear());
  const [maNhanVien, setMaNhanVien] = useState("");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRows, setDetailRows] = useState([]);
  const [detailEmployee, setDetailEmployee] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);

  const employeeOptions = useMemo(() => {
    return [...staffList]
      .map((s) => ({ ma_nhan_vien: s.ma_nhan_vien, ten: s.ten }))
      .sort((a, b) => (a.ten || "").localeCompare(b.ten || "", "vi"));
  }, [staffList]);

  useEffect(() => {
    getNhanVienList()
      .then((res) => setStaffList(Array.isArray(res) ? res : []))
      .catch(() => setStaffList([]));
  }, []);

  const totals = data?.totals || {};

  const sortedRows = useMemo(() => {
    return [...(data?.rows || [])].sort((a, b) => {
      const caA = Number(a.tong_ca) || 0;
      const caB = Number(b.tong_ca) || 0;
      const hasA = caA > 0 ? 1 : 0;
      const hasB = caB > 0 ? 1 : 0;
      if (hasB !== hasA) return hasB - hasA;
      if (caB !== caA) return caB - caA;
      return (a.ten || "").localeCompare(b.ten || "", "vi");
    });
  }, [data?.rows]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getBangCong({
          thang,
          nam,
          ma_nhan_vien: maNhanVien ? Number(maNhanVien) : null,
        });
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Không tải được bảng công");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [thang, nam, maNhanVien]);

  const hours = (n) => `${Number(n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} giờ`;

  const handleViewDetail = async (row) => {
    setDetailOpen(true);
    setDetailEmployee(row);
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

  const kyTrangThai = data?.ky?.trang_thai;

  return (
    <div className="space-y-5 md:space-y-6 text-on-surface pb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
          Bảng công
        </h1>
        <p className="text-muted text-sm mt-1">
          Tự động tổng hợp giờ làm từ lịch phân công ca. Không tính ngày hiện tại và ngày tương lai.
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
            <p className="text-lg font-bold text-primary tabular-nums mt-1">
              {kyTrangThai === "chua_chot" ? "Chưa chốt" : kyTrangThai === "da_chot" ? "Đã chốt" : "Đã thanh toán"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="card p-4 md:p-5 border-none shadow-none bg-primary/5">
          <p className="text-[10px] font-black uppercase text-muted opacity-70 tracking-widest">Tổng nhân viên có công</p>
          <p className="text-xl md:text-2xl font-bold text-primary tabular-nums mt-1">{totals.tong_nhan_vien_co_cong || 0}</p>
        </div>
        <div className="card p-4 md:p-5 border-none shadow-none bg-primary/5">
          <p className="text-[10px] font-black uppercase text-muted opacity-70 tracking-widest">Tổng ca đã làm</p>
          <p className="text-xl md:text-2xl font-bold text-primary tabular-nums mt-1">{totals.tong_ca_da_lam || 0}</p>
        </div>
        <div className="card p-4 md:p-5 border-none shadow-none bg-primary/5">
          <p className="text-[10px] font-black uppercase text-muted opacity-70 tracking-widest">Tổng giờ làm</p>
          <p className="text-xl md:text-2xl font-bold text-primary tabular-nums mt-1">{hours(totals.tong_gio_lam || 0).replace(" giờ", "")}</p>
          <p className="text-xs text-muted mt-1">giờ</p>
        </div>
        <div className="card p-4 md:p-5 border-none shadow-none bg-primary/5">
          <p className="text-[10px] font-black uppercase text-muted opacity-70 tracking-widest">Tổng ca sáng/chiều/tối</p>
          <p className="text-lg font-bold text-on-surface tabular-nums mt-1">
            {(totals.tong_ca_sang || 0)} / {(totals.tong_ca_chieu || 0)} / {(totals.tong_ca_toi || 0)}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="w-12 h-12 border-4 border-primary border-dashed rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="alert-error text-error bg-error-container/20 border border-error/20 rounded-xl p-4">
          {error}
        </div>
      ) : (
        <div className="card border-none overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm min-w-[950px]">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Tên nhân viên</th>
                  <th className="px-4 py-3 text-center">Số ca sáng</th>
                  <th className="px-4 py-3 text-center">Số ca chiều</th>
                  <th className="px-4 py-3 text-center">Số ca tối</th>
                  <th className="px-4 py-3 text-center">Tổng số ca</th>
                  <th className="px-4 py-3 text-center">Tổng giờ làm</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted">
                      Không có dữ liệu cho bộ lọc này.
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row) => (
                    <tr key={row.ma_nhan_vien} className="hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 font-semibold">{row.ten}</td>
                      <td className="px-4 py-3 text-center text-muted">{row.so_ca_sang}</td>
                      <td className="px-4 py-3 text-center text-muted">{row.so_ca_chieu}</td>
                      <td className="px-4 py-3 text-center text-muted">{row.so_ca_toi}</td>
                      <td className="px-4 py-3 text-center font-bold">{row.tong_ca}</td>
                      <td className="px-4 py-3 text-center font-bold">
                        {Number(row.tong_gio || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}{" "}
                        <span className="text-muted text-xs">giờ</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <button
                            className="btn-outline !py-2 !px-3 !text-xs"
                            onClick={() => handleViewDetail(row)}
                          >
                            Xem chi tiết
                          </button>
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

      {/* Detail Modal */}
      {detailOpen && (
        <div className="modal-overlay print:hidden" onClick={() => setDetailOpen(false)}>
          <div
            className="modal-panel max-w-5xl p-5 md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-outline">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-primary">
                  Chi tiết công - {detailEmployee?.ten || ""}
                </h2>
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
                    {(detailRows || []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-muted">
                          Không có ca nào được tính cho nhân viên này.
                        </td>
                      </tr>
                    ) : (
                      (detailRows || []).map((r, idx) => (
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

