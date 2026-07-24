import { useEffect, useMemo, useState } from "react";
import { getBangCong, getBangCongChiTiet } from "../services/payrollService";
import { getNhanVienList } from "../services/nhanVienService";
import ModalPortal from "../components/ModalPortal";
import { ToastContainer, useToast } from "../components/Toast";

function pad2(n) {
  return String(n).padStart(2, "0");
}

/* ── In phiếu công cá nhân ── */
function buildCongPrintHTML({ employee, rows, thang, nam }) {
  const now = new Date().toLocaleString("vi-VN");
  const list = rows || [];
  const tongCa = list.length;
  const tongGio = list.reduce((s, r) => s + Number(r.so_gio_quy_doi ?? r.so_gio ?? 0), 0);
  const soNgay = new Set(list.map((r) => String(r.ngay).slice(0, 10))).size;
  const gio = (n) => Number(n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
  const body = list
    .map(
      (r) => `
      <tr>
        <td>${new Date(r.ngay).toLocaleDateString("vi-VN")}</td>
        <td>${r.ten_ca || ""}</td>
        <td>${r.thoi_gian_ca || ""}</td>
        <td class="right">${gio(r.so_gio)}${Number(r.he_so || 1) > 1 ? `<br><span style="font-size:10px;color:#b45309">=${gio(r.so_gio_quy_doi)} quy đổi</span>` : ""}</td>
      </tr>`
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Phiếu công</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Times New Roman',serif;color:#000;font-size:13px;padding:24px}
    h1{font-size:18px;text-align:center;text-transform:uppercase;letter-spacing:1px}
    .sub{text-align:center;font-size:12px;margin-top:2px}
    .info{margin:14px 0;line-height:1.7}
    table{width:100%;border-collapse:collapse;margin-top:6px}
    th,td{border:1px solid #000;padding:6px 8px;font-size:12px}
    th{background:#f0f0f0;text-transform:uppercase;font-size:11px}
    .right{text-align:right}
    tfoot td{font-weight:bold;background:#f7f7f7}
    .foot{margin-top:18px;text-align:right;font-size:11px}
  </style></head><body>
    <h1>Phiếu công nhân viên</h1>
    <div class="sub">Tháng ${pad2(thang)}/${nam}</div>
    <div class="info">
      <div><b>Nhân viên:</b> ${employee?.ten || ""}</div>
      <div><b>Số ngày làm:</b> ${soNgay}&nbsp;&nbsp;|&nbsp;&nbsp;<b>Tổng ca:</b> ${tongCa}&nbsp;&nbsp;|&nbsp;&nbsp;<b>Tổng giờ:</b> ${gio(tongGio)} giờ</div>
    </div>
    <table>
      <thead><tr><th>Ngày</th><th>Ca</th><th>Thời gian</th><th class="right">Số giờ</th></tr></thead>
      <tbody>${body || '<tr><td colspan="4" style="text-align:center;padding:16px">Không có dữ liệu</td></tr>'}</tbody>
      <tfoot><tr><td colspan="3" class="right">TỔNG CỘNG</td><td class="right">${gio(tongGio)} giờ</td></tr></tfoot>
    </table>
    <div class="foot">Ngày in: ${now}</div>
  </body></html>`;
}

const CAC_BUOI = [
  { key: "so_ca_sang", label: "Sáng" },
  { key: "so_ca_chieu", label: "Chiều" },
  { key: "so_ca_toi", label: "Tối" },
];

export default function BangCong() {
  const { toasts, show: toast, dismiss } = useToast();
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
      toast(err.response?.data?.message || err.message || "Không tải được chi tiết", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const detailTotals = useMemo(() => {
    const rows = detailRows || [];
    return {
      tongCa: rows.length,
      tongGio: rows.reduce((s, r) => s + Number(r.so_gio_quy_doi ?? r.so_gio ?? 0), 0),
      soNgay: new Set(rows.map((r) => String(r.ngay).slice(0, 10))).size,
    };
  }, [detailRows]);

  const handlePrintCong = () => {
    if (!detailEmployee) return;
    const html = buildCongPrintHTML({ employee: detailEmployee, rows: detailRows || [], thang, nam });
    const w = window.open("", "_blank", "width=820,height=640,menubar=no,toolbar=no,scrollbars=yes");
    if (!w) {
      toast("Trình duyệt đã chặn popup. Hãy cho phép popup và thử lại.", "error");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const kyTrangThai = data?.ky?.trang_thai;

  return (
    <div className="space-y-5 md:space-y-6 text-on-surface pb-8">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <div>
        <h2 className="text-3xl font-bold text-on-surface">Bảng công</h2>
        <p className="text-sm text-muted">Tổng hợp giờ làm từ lịch phân công ca</p>
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
            <p className="text-xs text-muted uppercase tracking-widest font-semibold">Trạng thái kỳ lương</p>
            <p className="text-lg font-bold text-primary tabular-nums mt-1">
              {kyTrangThai === "chua_chot" ? "Chưa chốt" : kyTrangThai === "da_chot" ? "Đã chốt" : "Đã thanh toán"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ backgroundColor: "var(--color-primary)" }} />
          <div className="pl-2">
            <p className="text-xs font-medium text-muted">Nhân viên có công</p>
            <p className="text-lg font-bold text-on-surface tabular-nums mt-0.5">{totals.tong_nhan_vien_co_cong || 0}</p>
          </div>
        </div>
        <div className="card p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ backgroundColor: "var(--color-success)" }} />
          <div className="pl-2">
            <p className="text-xs font-medium text-muted">Tổng ca đã làm</p>
            <p className="text-lg font-bold text-on-surface tabular-nums mt-0.5">{totals.tong_ca_da_lam || 0}</p>
          </div>
        </div>
        <div className="card p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ backgroundColor: "var(--color-warning)" }} />
          <div className="pl-2">
            <p className="text-xs font-medium text-muted">Tổng giờ làm</p>
            <p className="text-lg font-bold text-on-surface tabular-nums mt-0.5">{hours(totals.tong_gio_lam || 0).replace(" giờ", "")}</p>
          </div>
        </div>
        <div className="card p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ backgroundColor: "var(--color-secondary)" }} />
          <div className="pl-2">
            <p className="text-xs font-medium text-muted">Ca sáng / chiều / tối</p>
            <p className="text-lg font-bold text-on-surface tabular-nums mt-0.5">
              {(totals.tong_ca_sang || 0)} / {(totals.tong_ca_chieu || 0)} / {(totals.tong_ca_toi || 0)}
            </p>
          </div>
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
        <div className="card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm min-w-[760px]">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Tên nhân viên</th>
                  <th className="px-4 py-3 text-center">Ngày làm</th>
                  {CAC_BUOI.map((buoi) => (
                    <th key={buoi.key} className="px-3 py-3 text-center">{buoi.label}</th>
                  ))}
                  <th className="px-4 py-3 text-center">Tổng số ca</th>
                  <th className="px-4 py-3 text-center">Tổng giờ làm</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={5 + CAC_BUOI.length} className="px-4 py-12 text-center text-muted">
                      Không có dữ liệu cho bộ lọc này.
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row) => (
                    <tr key={row.ma_nhan_vien} className="hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 font-semibold">{row.ten}</td>
                      <td className="px-4 py-3 text-center font-bold tabular-nums">{row.so_ngay_lam ?? 0}</td>
                      {CAC_BUOI.map((buoi) => {
                        const n = Number(row[buoi.key] ?? 0);
                        return (
                          <td key={buoi.key} className={`px-3 py-3 text-center tabular-nums ${n > 0 ? "font-semibold text-on-surface" : "text-muted/30"}`}>
                            {n}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center font-bold">{row.tong_ca}</td>
                      <td className="px-4 py-3 text-center font-bold">
                        {Number(row.tong_gio || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}{" "}
                        <span className="text-muted text-xs">giờ</span>
                        {Number(row.tong_gio_quy_doi ?? row.tong_gio ?? 0) > Number(row.tong_gio || 0) && (
                          <span className="block text-[10px] font-medium text-warning">
                            ={Number(row.tong_gio_quy_doi || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} giờ quy đổi
                          </span>
                        )}
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
        <ModalPortal>
          <div className="modal-overlay print:hidden" onClick={() => setDetailOpen(false)}>
            <div
              className="modal-panel max-w-5xl w-full max-h-[90vh] flex flex-col min-h-0 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 p-5 md:p-6 pb-4 border-b border-outline flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-primary">
                    Chi tiết công - {detailEmployee?.ten || ""}
                  </h2>
                  <p className="text-muted text-sm mt-1">
                    {pad2(thang)}/{nam} · {detailTotals.soNgay} ngày · {detailTotals.tongCa} ca ·{" "}
                    <span className="font-semibold text-on-surface">
                      {detailTotals.tongGio.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} giờ
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    className="btn-outline !py-2 !px-3 !text-xs"
                    onClick={handlePrintCong}
                    disabled={detailLoading || (detailRows || []).length === 0}
                  >
                    <span className="material-symbols-outlined text-base">print</span>
                    In phiếu công
                  </button>
                  <button type="button" className="btn-ghost !p-2" onClick={() => setDetailOpen(false)} aria-label="Đóng">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

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
                        {(detailRows || []).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-12 text-center text-muted">
                              Không có ca nào được tính cho nhân viên này.
                            </td>
                          </tr>
                        ) : (
                          (detailRows || []).map((r, idx) => (
                            <tr key={`${r.ngay}-${r.ma_ca}-${idx}`} className="hover:bg-primary/5 transition-colors">
                              <td className="px-4 py-3">
                                {new Date(r.ngay).toLocaleDateString("vi-VN")}
                                {Number(r.he_so || 1) > 1 && (
                                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold text-warning" style={{ backgroundColor: "color-mix(in srgb, var(--color-warning) 15%, transparent)" }}>
                                    Lễ ×{Number(r.he_so)}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-semibold text-primary">{r.ten_ca}</td>
                              <td className="px-4 py-3 text-muted">{r.thoi_gian_ca}</td>
                              <td className="px-4 py-3 text-right font-bold">
                                {Number(r.so_gio || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}{" "}
                                <span className="text-muted text-xs">giờ</span>
                                {Number(r.he_so || 1) > 1 && (
                                  <span className="block text-[10px] font-medium text-warning">
                                    ={Number(r.so_gio_quy_doi || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} giờ quy đổi
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      {(detailRows || []).length > 0 && (
                        <tfoot>
                          <tr className="border-t-2 border-outline bg-primary/5 font-bold">
                            <td className="px-4 py-3" colSpan={3}>
                              TỔNG CỘNG · {detailTotals.soNgay} ngày · {detailTotals.tongCa} ca
                            </td>
                            <td className="px-4 py-3 text-right text-primary">
                              {detailTotals.tongGio.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} giờ
                            </td>
                          </tr>
                        </tfoot>
                      )}
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

