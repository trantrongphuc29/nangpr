import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  createNhanVien,
  createPhanCong,
  deletePhanCong,
  getDanhSachCa,
  getLichPhanCong,
  getNhanVienList,
  updateNhanVien,
  updateNhanVienStatus,
} from "../services/nhanVienService";
import {
  TRANG_THAI_LABELS,
  normalizeTrangThai,
  isDangLam,
  canSelectInAssignModal,
  shouldShowAssignmentOnSchedule,
} from "../utils/nhanVienStatus";
import { getNgayLe } from "../services/payrollService";
import { formatPhoneDisplay } from "../utils/formatPhone";
import { ToastContainer, useToast } from "../components/Toast";
import { useConfirm } from "../context/ConfirmContext";

// =====================================================================
// NOTE 1: KHU VỰC XỬ LÝ NGÀY THÁNG (GIỮ NGUYÊN)
// =====================================================================
const getLocalDateString = (dateObj) => {
  const d = dateObj ? new Date(dateObj) : new Date();
  if (isNaN(d.getTime())) return null;
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().substring(0, 10);
};

const formatDateString = (val) => {
  if (!val) return "";
  if (typeof val === 'string') return val.substring(0, 10); 
  return getLocalDateString(val);
};

/** Chuẩn hóa ngày — xử lý cả chuỗi YYYY-MM-DD và ISO UTC từ MySQL */
const toYmd = (val) => {
  if (!val) return "";
  if (typeof val === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    if (val.includes("T")) return formatDateString(new Date(val)) || val.substring(0, 10);
    return val.substring(0, 10);
  }
  return formatDateString(val) || "";
};

/* ── Validate & định dạng SĐT / ngày sinh ── */
const onlyDigits = (v) => (v || "").replace(/\D/g, "");
// SĐT hợp lệ: đúng 10 số, bắt đầu bằng 0
const isValidPhone = (v) => /^0\d{9}$/.test(v || "");
// Che ngày sinh khi gõ: chỉ số, tự chèn dấu / -> dd/MM/yyyy
const maskDateInput = (v) => {
  const d = onlyDigits(v).slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join("/");
};
// dd/MM/yyyy -> yyyy-MM-dd (null nếu không phải ngày thật)
const dmyToYmd = (dmy) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((dmy || "").trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const day = +dd, mon = +mm, yr = +yyyy;
  const dt = new Date(yr, mon - 1, day);
  if (dt.getFullYear() !== yr || dt.getMonth() !== mon - 1 || dt.getDate() !== day) return null;
  return `${yyyy}-${mm}-${dd}`;
};
// yyyy-MM-dd (hoặc ISO) -> dd/MM/yyyy để hiển thị trong ô nhập
const ymdToDmy = (val) => {
  const s = toYmd(val);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "";
  const [y, mo, d] = s.split("-");
  return `${d}/${mo}/${y}`;
};

const normalizeAssignments = (rows) =>
  (Array.isArray(rows) ? rows : []).map((a) => ({
    ...a,
    ma_nhan_vien: Number(a.ma_nhan_vien),
    ma_ca: Number(a.ma_ca),
    ngay: toYmd(a.ngay),
  }));

const getStartOfWeek = (dateString) => {
  const dateStrSafe = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
  const date = new Date(dateStrSafe);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const getWeekRange = (dateString) => {
  const start = getStartOfWeek(dateString);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    startStr: getLocalDateString(start),
    endStr: getLocalDateString(end),
  };
};

// Trình bày ca (icon + màu theo buổi) — chỉ là phần hiển thị, dữ liệu ca lấy từ DB
const shiftPresentation = (buoi) => {
  const b = (buoi || "").toLowerCase();
  if (b.includes("sáng")) return { icon: "sunny", color: "var(--color-warning)" };
  if (b.includes("chiều")) return { icon: "partly_cloudy_day", color: "var(--color-secondary)" };
  if (b.includes("tối")) return { icon: "nights_stay", color: "var(--color-primary)" };
  return { icon: "schedule", color: "var(--color-primary)" };
};

// Dùng tạm khi chưa tải được ca từ DB (để bảng lịch không trống)
const DEFAULT_SHIFTS = [
  { ma_ca: 1, buoi: "Ca Sáng 1", gio_bat_dau: "06:00", gio_ket_thuc: "09:00" },
  { ma_ca: 2, buoi: "Ca Sáng 2", gio_bat_dau: "09:00", gio_ket_thuc: "12:00" },
  { ma_ca: 3, buoi: "Ca Chiều 1", gio_bat_dau: "12:00", gio_ket_thuc: "15:00" },
  { ma_ca: 4, buoi: "Ca Chiều 2", gio_bat_dau: "15:00", gio_ket_thuc: "18:00" },
  { ma_ca: 5, buoi: "Ca Tối 1", gio_bat_dau: "18:00", gio_ket_thuc: "20:30" },
  { ma_ca: 6, buoi: "Ca Tối 2", gio_bat_dau: "20:30", gio_ket_thuc: "23:00" },
];

function StaffStatusBadge({ status }) {
  const s = normalizeTrangThai(status);
  const label = TRANG_THAI_LABELS[s] || s;
  if (s === "dang_lam") return <span className="badge-success">{label}</span>;
  if (s === "tam_nghi") return <span className="badge-warning">{label}</span>;
  return (
    <span className="badge bg-on-surface/10 text-on-surface border border-outline/50">
      {label}
    </span>
  );
}

const NhanVien = () => {
  const { toasts, show: toast, dismiss } = useToast();
  const { confirm } = useConfirm();
  // =====================================================================
  // NOTE 2: KHAI BÁO TRẠNG THÁI (STATES)
  // =====================================================================
  const [staffList, setStaffList] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [shifts, setShifts] = useState(DEFAULT_SHIFTS);
  const [holidays, setHolidays] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staffDetailModal, setStaffDetailModal] = useState({ isOpen: false, data: null, isEditing: false });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({ ten: '', ngay_sinh: '', so_dien_thoai: '', dia_chi: '' });
  const [editBirth, setEditBirth] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  const today = getLocalDateString(new Date());
  const [assignForm, setAssignForm] = useState({ ma_ca: '', ngay: today });
  const [assignStaffIds, setAssignStaffIds] = useState([]);
  const [assignSaving, setAssignSaving] = useState(false);

  const [filterDate, setFilterDate] = useState(today);
  const [viewMode, setViewMode] = useState('week');
  const [loadError, setLoadError] = useState("");
  const [statusDraft, setStatusDraft] = useState("dang_lam");
  const [statusSaving, setStatusSaving] = useState(false);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(getStartOfWeek(filterDate));
    d.setDate(d.getDate() + i);
    return d;
  });

  // =====================================================================
  // NOTE 3: GỌI API TẢI DỮ LIỆU
  // =====================================================================
  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { startStr, endStr } = getWeekRange(filterDate);
      const [staffRes, assignRes] = await Promise.all([
        getNhanVienList(),
        getLichPhanCong({ startDate: startStr, endDate: endStr }),
      ]);
      setStaffList(Array.isArray(staffRes) ? staffRes : []);
      setAssignments(normalizeAssignments(assignRes));
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setLoadError(error.response?.data?.message || error.message || "Không tải được dữ liệu phân công");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Nạp danh sách ca từ DB (nguồn chân lý); nếu lỗi vẫn dùng DEFAULT_SHIFTS
  useEffect(() => {
    getDanhSachCa()
      .then((rows) => {
        if (Array.isArray(rows) && rows.length) setShifts(rows);
      })
      .catch(() => {});
    getNgayLe()
      .then((rows) => {
        const map = {};
        (rows || []).forEach((le) => { map[toYmd(le.ngay)] = le; });
        setHolidays(map);
      })
      .catch(() => {});
  }, []);

  // =====================================================================
  // NOTE 4: CÁC HÀM XỬ LÝ SỰ KIỆN (THÊM CHỨC NĂNG ẨN/HIỆN)
  // =====================================================================
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (addSaving) return;
    const dataToSend = { ...formData, ngay_sinh: dmyToYmd(formData.ngay_sinh) || null, dia_chi: formData.dia_chi || null };
    setAddSaving(true);
    try {
      await createNhanVien(dataToSend);
      setIsModalOpen(false);
      setFormData({ ten: '', ngay_sinh: '', so_dien_thoai: '', dia_chi: '' });
      toast("Đã thêm nhân viên mới");
      fetchData();
    } catch (error) {
      toast("Lỗi từ hệ thống: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setAddSaving(false);
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    const newStatus = normalizeTrangThai(statusDraft);
    const dataToSend = {
      ...staffDetailModal.data,
      ngay_sinh: dmyToYmd(editBirth) || null,
      trang_thai: newStatus,
    };
    setStatusSaving(true);
    try {
      await updateNhanVien(dataToSend.ma_nhan_vien, dataToSend);
      // Trạng thái có endpoint riêng — chỉ gọi khi thực sự đổi
      if (newStatus !== normalizeTrangThai(staffDetailModal.data.trang_thai)) {
        await updateNhanVienStatus(dataToSend.ma_nhan_vien, newStatus);
      }
      setStaffDetailModal({ ...staffDetailModal, isEditing: false, data: dataToSend });
      fetchData();
      toast("Cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi chi tiết:", error.response);
      toast("Lỗi khi cập nhật: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setStatusSaving(false);
    }
  };

  const toggleAssignStaff = (id) =>
    setAssignStaffIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!assignForm.ma_ca || assignStaffIds.length === 0) {
      toast("Vui lòng chọn ca và ít nhất một nhân viên", "error");
      return;
    }
    setAssignSaving(true);
    try {
      const results = await Promise.allSettled(
        assignStaffIds.map((id) =>
          createPhanCong({ ma_nhan_vien: id, ma_ca: assignForm.ma_ca, ngay: assignForm.ngay })
        )
      );
      const ok = results.filter((r) => r.status === "fulfilled").length;
      const fail = results.length - ok;
      if (ok) {
        toast(`Đã phân công ${ok} nhân viên vào ca`);
        setIsAssignModalOpen(false);
        setAssignForm({ ma_ca: '', ngay: assignForm.ngay });
        setAssignStaffIds([]);
        fetchData();
      }
      if (fail) {
        toast(`${fail} nhân viên chưa phân công được (có thể đã có trong ca)`, "error");
      }
    } finally {
      setAssignSaving(false);
    }
  };

  const handleDeleteAssignment = async (ma_nhan_vien, ma_ca, ngayStr, e) => {
    e.stopPropagation();
    if (await confirm("Bạn có chắc chắn muốn gỡ nhân viên này khỏi ca làm?", { danger: true, confirmLabel: "Gỡ ca" })) {
      try {
        await deletePhanCong({ ma_nhan_vien, ma_ca, ngay: ngayStr });
        toast("Đã gỡ phân công");
        fetchData();
      } catch (error) {
        toast("Lỗi khi xóa phân công: " + (error.response?.data?.message || error.message), "error");
      }
    }
  };

  const handlePrint = () => window.print(); /* ── In lịch phân công (toàn trang) ── */

  const openStaffDetails = (staffId) => {
    const staff = staffList.find(s => String(s.ma_nhan_vien) === String(staffId));
    if (staff) {
      setStatusDraft(normalizeTrangThai(staff.trang_thai));
      setStaffDetailModal({ isOpen: true, data: staff, isEditing: false });
    }
  };

  const openAssignModalForDay = (shiftId, dayStr) => {
    setAssignForm({ ma_ca: String(shiftId), ngay: dayStr });
    setAssignStaffIds([]);
    setIsAssignModalOpen(true);
  };

  // Màu theo buổi: Sáng = ấm (amber), Chiều = trung tính (secondary), Tối = xanh đậm (primary)
  // Ca lấy từ DB; icon/màu là phần trình bày suy ra theo buổi
  const shiftsConfig = useMemo(
    () =>
      shifts.map((c) => {
        const p = shiftPresentation(c.buoi);
        return {
          id: Number(c.ma_ca),
          label: c.buoi,
          time: c.gio_bat_dau && c.gio_ket_thuc ? `${c.gio_bat_dau}-${c.gio_ket_thuc}` : "",
          icon: p.icon,
          color: p.color,
        };
      }),
    [shifts]
  );

  const weekRange = useMemo(() => getWeekRange(filterDate), [filterDate]);

  const getStaffStatus = useCallback(
    (maNhanVien) => {
      const staff = staffList.find((s) => String(s.ma_nhan_vien) === String(maNhanVien));
      return normalizeTrangThai(staff?.trang_thai);
    },
    [staffList]
  );

  
  const getAssignmentsForCell = useCallback(
    (shiftId, dayStr) => {
      const ngay = toYmd(dayStr);
      const ca = Number(shiftId);
      if (!ngay || !Number.isFinite(ca)) return [];
      return assignments.filter((a) => {
        if (toYmd(a.ngay) !== ngay || Number(a.ma_ca) !== ca) return false;
        return shouldShowAssignmentOnSchedule({
          assignmentDate: a.ngay,
          cellDate: ngay,
          today,
          currentStatus: getStaffStatus(a.ma_nhan_vien),
        });
      });
    },
    [assignments, getStaffStatus, today]
  );

  const shiftPeriod = (delta) => {
    const base = new Date(`${filterDate}T12:00:00`);
    if (Number.isNaN(base.getTime())) return;
    base.setDate(base.getDate() + delta * (viewMode === "week" ? 7 : 1));
    setFilterDate(getLocalDateString(base));
  };

  const renderAssigneeList = (shiftId, dayStr) => {
    const assignedStaff = getAssignmentsForCell(shiftId, dayStr);
    return (
      <>
        {assignedStaff.map((assign, assignIdx) => {
          const staffName =
            assign.ten ||
            staffList.find((s) => String(s.ma_nhan_vien) === String(assign.ma_nhan_vien))?.ten ||
            `#${assign.ma_nhan_vien}`;
          return (
            <div
              key={`${assign.ma_nhan_vien}-${assignIdx}`}
              className="assignee-pill inline-flex items-center gap-0.5 pl-2 pr-0.5 py-0.5 rounded-lg bg-primary/10 border border-outline/40 text-sm font-medium w-max max-w-full min-h-[1.75rem]"
            >
              <span className="assignee-name hidden print:inline text-left leading-snug">{staffName}</span>
              <button
                type="button"
                onClick={() => openStaffDetails(assign.ma_nhan_vien)}
                className="assignee-name text-left leading-snug hover:text-primary print:hidden py-0.5"
              >
                {staffName}
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteAssignment(assign.ma_nhan_vien, shiftId, dayStr, e)}
                className="print:hidden opacity-70 hover:opacity-100 active:opacity-100 inline-flex items-center justify-center w-6 h-6 shrink-0 ml-auto text-error hover:bg-error/15 rounded-md transition-opacity"
                aria-label="Gỡ ca"
              >
                <span className="material-symbols-outlined text-[18px] leading-none">close</span>
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => openAssignModalForDay(shiftId, dayStr)}
          className="print:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-outline text-primary text-sm hover:bg-primary/10 shrink-0"
          title="Thêm phân công"
        >
          <span className="material-symbols-outlined text-base">add</span>
        </button>
      </>
    );
  };

  const formatDisplayDate = (ymd) => {
    if (!ymd) return "";
    const [y, m, d] = ymd.split("-");
    return `${d}/${m}/${y}`;
  };

  // Ngày sinh hợp lệ: trống (tùy chọn) hoặc là ngày thật và không ở tương lai
  const isValidBirth = (dmy) => {
    if (!dmy) return true;
    const ymd = dmyToYmd(dmy);
    return !!ymd && ymd <= today;
  };

  // Nhân viên có thể phân vào ca đang chọn: hợp lệ theo trạng thái và chưa có trong ca đó
  const assignedIdsInCell = new Set(
    assignForm.ma_ca
      ? getAssignmentsForCell(Number(assignForm.ma_ca), assignForm.ngay).map((a) => String(a.ma_nhan_vien))
      : []
  );
  const assignCandidates = staffList.filter(
    (nv) =>
      canSelectInAssignModal(nv.trang_thai, assignForm.ngay, today) &&
      !assignedIdsInCell.has(String(nv.ma_nhan_vien))
  );

  // =====================================================================
  // NOTE 5: GIAO DIỆN HIỂN THỊ
  // =====================================================================
  return (
    <div className="w-full text-on-surface pb-8 print:bg-white print:m-0 print:p-0">
      <div className="print:hidden">
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </div>

      <style>
  {`
    @media print {
      /* 1. Ép trình duyệt bỏ qua mọi màu sắc của Dark Mode và dùng màu in chuẩn */
      :root {
        --color-main-bg: #ffffff !important;
        --color-text: #000000 !important;
        --color-border: #000000 !important;
        --color-primary: #000000 !important;
      }

      /* 2. Cấu hình màu sắc in ấn trung thực */
      * {
        -webkit-print-color-adjust: economy !important;
        print-color-adjust: economy !important;
        color: black !important;
        background-color: transparent !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }

      /* 3. Làm cho viền bảng đen đậm và sắc nét */
      .print-table, 
      .print-table th, 
      .print-table td {
        border: 1.5pt solid black !important; /* Dùng đơn vị pt để máy in hiểu chính xác độ dày */
        border-collapse: collapse !important;
        opacity: 1 !important;
      }

      /* 4. Tiêu đề bảng phải rõ ràng */
      .print-table th {
        background-color: #f0f0f0 !important;
        font-weight: 900 !important;
      }

      /* 5. Tên nhân viên in đủ, không ba chấm */
      .assignee-pill,
      .group\\/pill {
        display: block !important;
        max-width: none !important;
        width: 100% !important;
        border: 1px solid black !important;
        color: black !important;
        opacity: 1 !important;
        background: white !important;
        white-space: normal !important;
        word-break: break-word !important;
        overflow: visible !important;
      }
      .assignee-name {
        overflow: visible !important;
        text-overflow: clip !important;
        white-space: normal !important;
        max-width: none !important;
        width: auto !important;
        display: inline !important;
      }
      .schedule-board {
        height: auto !important;
        grid-template-rows: auto repeat(6, auto) !important;
      }
      .schedule-board .schedule-body,
      .schedule-board .schedule-cell {
        overflow: visible !important;
        min-height: auto !important;
      }
      .schedule-board .schedule-assignees {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 2pt !important;
        height: auto !important;
        overflow: visible !important;
      }

      /* 6. Loại bỏ hoàn toàn các hiệu ứng màu mè/mờ ảo của chế độ tối */
      .dark, .bg-card, .bg-surface-container-low {
        background-color: white !important;
      }

      /* 7. Đảm bảo icon in ra không bị nhòe */
      .material-symbols-outlined {
        color: black !important;
      }

      /* 8. Ẩn nút thao tác (giữ span.assignee-name hiển thị đủ tên) */
      .print\\:hidden,
      button:not(.assignee-name),
      .no-print {
        display: none !important;
      }
    }

    .schedule-board {
      display: grid;
      width: 100%;
      height: 100%;
      min-height: 0;
      border: 1px solid color-mix(in srgb, var(--color-outline, #ccc) 40%, transparent);
    }
    .schedule-board .schedule-cell {
      min-width: 0;
      min-height: 0;
      border-right: 1px solid color-mix(in srgb, var(--color-outline, #ccc) 35%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--color-outline, #ccc) 35%, transparent);
    }
    .schedule-board .schedule-head {
      background: color-mix(in srgb, var(--color-primary, #2d5a3d) 8%, transparent);
      font-size: clamp(0.625rem, 1.1vw, 0.75rem);
    }
    .schedule-board .schedule-shift {
      background: color-mix(in srgb, var(--color-primary, #2d5a3d) 6%, transparent);
      font-size: clamp(0.625rem, 1vw, 0.75rem);
    }
    .schedule-board .schedule-body {
      overflow: auto;
    }
    .schedule-day-card {
      transition: border-color 0.15s ease;
    }
    .schedule-day-card:hover {
      border-color: color-mix(in srgb, var(--color-primary, #2d5a3d) 35%, transparent);
    }
    @media print {
      .schedule-board,
      .schedule-day-board {
        border: none !important;
        height: auto !important;
      }
      .schedule-board {
        border: 1.5pt solid black !important;
      }
      .schedule-board .schedule-cell,
      .schedule-day-card {
        border: 1pt solid black !important;
        break-inside: avoid;
      }
      .schedule-day-board {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
      }
      @page {
        size: landscape;
        margin: 12mm;
      }
    }
  `}
</style>

      <div className="w-full min-w-0 flex flex-col gap-4 md:gap-5 min-h-[calc(100dvh-7.5rem)] print:min-h-0 print:block print:space-y-4">
        {/* Tiêu đề trang */}
        <div className="print:hidden shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-on-surface">Quản lý nhân sự</h2>
            <p className="text-sm text-muted">Thông tin nhân viên và lịch phân công ca</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button type="button" onClick={() => setIsModalOpen(true)} className="btn-primary !py-2 !px-3 !text-sm">
              <span className="material-symbols-outlined text-base">person_add</span>
              Thêm nhân viên
            </button>
            <button type="button" onClick={handlePrint} className="btn-outline !py-2 !px-3 !text-sm">
              <span className="material-symbols-outlined text-base">print</span>
              In lịch
            </button>
          </div>
        </div>

        {/* Lịch phân công — co giãn theo kích thước màn hình */}
        <section className="card overflow-hidden print:border print:border-black w-full min-w-0 flex-1 flex flex-col min-h-0 print:flex-none">
          <div className="print:hidden p-3 md:p-4 border-b border-outline shrink-0">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-primary">
                  Lịch phân công {viewMode === "week" ? "theo tuần" : "theo ngày"}
                </h2>
                <p className="text-sm text-muted mt-0.5 truncate">
                  {viewMode === "week"
                    ? `${formatDisplayDate(weekRange.startStr)} – ${formatDisplayDate(weekRange.endStr)}`
                    : formatDisplayDate(filterDate)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-primary/5 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setViewMode("week")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === "week" ? "bg-card text-primary shadow-sm" : "text-muted"}`}
                  >
                    Tuần
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("day")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === "day" ? "bg-card text-primary shadow-sm" : "text-muted"}`}
                  >
                    Ngày
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => shiftPeriod(-1)}
                  className="btn-ghost !p-2"
                  title={viewMode === "week" ? "Tuần trước" : "Ngày trước"}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="input-field !py-2 !w-auto !min-w-[10.5rem]"
                />
                <button
                  type="button"
                  onClick={() => shiftPeriod(1)}
                  className="btn-ghost !p-2"
                  title={viewMode === "week" ? "Tuần sau" : "Ngày sau"}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button type="button" onClick={() => setFilterDate(today)} className="btn-outline !py-2 !px-3 !text-xs">
                  Hôm nay
                </button>
              </div>
            </div>
            {loadError && <p className="text-sm text-error mt-2">{loadError}</p>}
          </div>

          {loading ? (
            <div className="flex flex-1 justify-center items-center py-16 print:hidden">
              <div className="w-10 h-10 border-4 border-primary border-dashed rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex-1 min-h-0 w-full p-2 md:p-3 print:p-0">
              {viewMode === "week" ? (
                <div className="h-full overflow-x-auto custom-scrollbar print:overflow-visible">
                <div
                  className="schedule-board print-table h-full min-w-[880px] print:min-w-0"
                  style={{
                    gridTemplateColumns: "minmax(3rem, 5%) repeat(7, minmax(0, 1fr))",
                    gridTemplateRows: `minmax(2.25rem, auto) repeat(${shiftsConfig.length}, minmax(0, 1fr))`,
                  }}
                >
                  <div className="schedule-cell schedule-head px-1 py-2 flex items-center justify-center font-semibold uppercase tracking-wide">
                    Ca
                  </div>
                  {weekDays.map((d, index) => {
                    const dayStr = formatDateString(d);
                    const isTodayCol = dayStr === today;
                    const le = holidays[toYmd(dayStr)];
                    return (
                      <div
                        key={index}
                        className={`schedule-cell schedule-head px-1 py-2 text-center ${isTodayCol ? "bg-primary/15" : ""}`}
                        style={le ? { backgroundColor: "color-mix(in srgb, var(--color-warning) 12%, transparent)" } : undefined}
                        title={le ? `Ngày lễ${le.ten ? `: ${le.ten}` : ""} (×${le.he_so})` : undefined}
                      >
                        <p className="font-semibold text-muted uppercase leading-tight">
                          {index === 6 ? "CN" : `T${index + 2}`}
                        </p>
                        <p className="font-bold text-on-surface leading-tight mt-0.5 text-[clamp(0.65rem,1.2vw,0.875rem)]">
                          {formatDisplayDate(dayStr)}
                        </p>
                        {le && (
                          <span className="inline-block mt-0.5 px-1 rounded text-[9px] font-bold text-warning leading-none" style={{ backgroundColor: "color-mix(in srgb, var(--color-warning) 22%, transparent)" }}>
                            Lễ ×{le.he_so}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {shiftsConfig.map((shift) => (
                    <React.Fragment key={shift.id}>
                      <div
                        className="schedule-cell schedule-shift px-1 py-2 flex flex-col items-center justify-center text-center gap-0.5 print:bg-gray-50"
                        style={{ background: `color-mix(in srgb, ${shift.color} 10%, transparent)` }}
                      >
                        <span className="material-symbols-outlined text-[clamp(1rem,2vw,1.25rem)] print:hidden" style={{ color: shift.color }}>{shift.icon}</span>
                        <span className="font-bold leading-tight" style={{ color: shift.color }}>{shift.label}</span>
                        <span className="text-muted leading-tight">{shift.time}</span>
                      </div>
                      {weekDays.map((day, idx) => {
                        const dayStr = formatDateString(day);
                        return (
                          <div
                            key={idx}
                            className={`schedule-cell schedule-body px-1.5 py-1.5 ${dayStr === today ? "bg-primary/5" : ""}`}
                          >
                            <div className="schedule-assignees flex flex-wrap gap-1 justify-start content-start h-full min-h-0 items-start text-left">
                              {renderAssigneeList(shift.id, dayStr)}
                            </div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
                </div>
              ) : (
                <div className="flex flex-col h-full min-h-0 gap-3">
                  {holidays[toYmd(filterDate)] && (
                    <div className="shrink-0 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-warning" style={{ backgroundColor: "color-mix(in srgb, var(--color-warning) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)" }}>
                      <span className="material-symbols-outlined text-lg">celebration</span>
                      Ngày lễ{holidays[toYmd(filterDate)].ten ? `: ${holidays[toYmd(filterDate)].ten}` : ""} — lương ×{holidays[toYmd(filterDate)].he_so}
                    </div>
                  )}
                <div className="schedule-day-board print-table flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 auto-rows-fr">
                  {shiftsConfig.map((shift) => {
                    const count = getAssignmentsForCell(shift.id, filterDate).length;
                    return (
                      <div
                        key={shift.id}
                        className="schedule-day-card flex flex-col rounded-xl border border-outline/40 overflow-hidden min-h-[10rem]"
                        style={{ borderLeft: `3px solid ${shift.color}`, background: `color-mix(in srgb, ${shift.color} 4%, transparent)` }}
                      >
                        <div className="px-3 py-3 border-b border-outline/30 flex items-center gap-3 shrink-0" style={{ background: `color-mix(in srgb, ${shift.color} 9%, transparent)` }}>
                          <span className="material-symbols-outlined text-2xl print:hidden" style={{ color: shift.color }}>{shift.icon}</span>
                          <div className="min-w-0">
                            <p className="font-bold" style={{ color: shift.color }}>{shift.label}</p>
                            <p className="text-xs text-muted">{shift.time}</p>
                          </div>
                          <span className="ml-auto text-xs font-semibold tabular-nums text-muted shrink-0">
                            {count} NV
                          </span>
                        </div>
                        <div className="flex-1 p-3 schedule-assignees flex flex-wrap gap-2 justify-start content-start items-start text-left min-h-[5rem]">
                          {count === 0 ? (
                            <p className="text-sm text-muted w-full py-2">Chưa phân ca</p>
                          ) : null}
                          {renderAssigneeList(shift.id, filterDate)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Danh sách nhân viên — dưới lịch */}
        <aside className="card overflow-hidden print:hidden shrink-0">
          <div className="p-3 md:p-4 border-b border-outline">
            <h2 className="font-bold text-primary text-lg">Danh sách nhân viên</h2>
          </div>
          <div className="p-3 md:p-4">
            {staffList.length === 0 ? (
              <p className="text-center text-muted text-sm py-6">Chưa có nhân viên</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5">
                {staffList.map((nv) => (
                  <button
                    key={nv.ma_nhan_vien}
                    type="button"
                    onClick={() => openStaffDetails(nv.ma_nhan_vien)}
                    className="text-left p-3 rounded-xl border border-outline/30 hover:border-primary/40 hover:bg-primary/5 transition-colors min-w-0"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 w-full">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${!isDangLam(nv.trang_thai) ? "bg-on-surface/10 text-on-surface" : "bg-primary/15 text-primary"}`}
                      >
                        {(nv.ten || "?").charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm leading-snug break-words">{nv.ten}</p>
                        <p className="text-[11px] text-muted tabular-nums mt-0.5 tracking-wide">
                          {formatPhoneDisplay(nv.so_dien_thoai)}
                        </p>
                      </div>
                      <div className="shrink-0 self-start">
                        <StaffStatusBadge status={nv.trang_thai} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* --- MODALS --- */}

      {/* Modal Chi tiết / Sửa nhân viên */}
      {staffDetailModal.isOpen && (
        <div className="print:hidden modal-overlay" onClick={() => setStaffDetailModal({ isOpen: false, data: null, isEditing: false })}>
          <div className="modal-panel max-w-md p-5 md:p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setStaffDetailModal({ isOpen: false, data: null, isEditing: false })} className="absolute top-4 right-4 btn-ghost !p-2">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-lg font-bold text-primary pr-8">{staffDetailModal.isEditing ? "Sửa hồ sơ" : "Chi tiết nhân viên"}</h3>

            {staffDetailModal.isEditing ? (
              <form onSubmit={handleUpdateStaff} className="space-y-3 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Họ và tên</label>
                  <input required type="text" className="input-field" value={staffDetailModal.data.ten} onChange={e => setStaffDetailModal({...staffDetailModal, data: {...staffDetailModal.data, ten: e.target.value}})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1">Ngày sinh</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="dd/MM/yyyy"
                      className="input-field"
                      style={editBirth && !isValidBirth(editBirth) ? { borderColor: "var(--color-error)" } : undefined}
                      value={editBirth}
                      onChange={e => setEditBirth(maskDateInput(e.target.value))}
                    />
                    {editBirth && !isValidBirth(editBirth) && (
                      <p className="text-xs text-error mt-1">Ngày sinh không hợp lệ</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1">SĐT</label>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="0xxxxxxxxx"
                      className="input-field"
                      style={staffDetailModal.data.so_dien_thoai && !isValidPhone(staffDetailModal.data.so_dien_thoai) ? { borderColor: "var(--color-error)" } : undefined}
                      value={staffDetailModal.data.so_dien_thoai}
                      onChange={e => setStaffDetailModal({...staffDetailModal, data: {...staffDetailModal.data, so_dien_thoai: onlyDigits(e.target.value).slice(0, 10)}})}
                    />
                    {staffDetailModal.data.so_dien_thoai && !isValidPhone(staffDetailModal.data.so_dien_thoai) && (
                      <p className="text-xs text-error mt-1">SĐT phải đủ 10 số và bắt đầu bằng 0</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Địa chỉ</label>
                  <input type="text" className="input-field" value={staffDetailModal.data.dia_chi || ''} onChange={e => setStaffDetailModal({...staffDetailModal, data: {...staffDetailModal.data, dia_chi: e.target.value}})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Trạng thái</label>
                  <select className="input-field" value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)}>
                    <option value="dang_lam">Đang làm</option>
                    <option value="tam_nghi">Tạm nghỉ</option>
                    <option value="da_nghi">Đã nghỉ</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStaffDetailModal({...staffDetailModal, isEditing: false})} className="btn-outline flex-1">Hủy</button>
                  <button
                    type="submit"
                    disabled={statusSaving || !staffDetailModal.data.ten?.trim() || !isValidPhone(staffDetailModal.data.so_dien_thoai) || !isValidBirth(editBirth)}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {statusSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4 border-b border-outline pb-4">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-bold ${!isDangLam(staffDetailModal.data.trang_thai) ? 'bg-on-surface/10 text-on-surface' : 'bg-primary/20 text-primary'}`}>
                    {staffDetailModal.data.ten.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-on-surface truncate">{staffDetailModal.data.ten}</p>
                    <p className="text-xs text-muted">Mã NV: #{staffDetailModal.data.ma_nhan_vien}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-3">
                  <div>
                    <p className="text-[11px] font-medium text-muted">Số điện thoại</p>
                    <p className="text-sm font-medium mt-0.5 tabular-nums">{formatPhoneDisplay(staffDetailModal.data.so_dien_thoai)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted">Ngày sinh</p>
                    <p className="text-sm font-medium mt-0.5">{formatDateString(staffDetailModal.data.ngay_sinh) ? formatDateString(staffDetailModal.data.ngay_sinh).split('-').reverse().join('/') : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted mb-1">Trạng thái</p>
                    <StaffStatusBadge status={staffDetailModal.data.trang_thai} />
                  </div>
                  <div className="col-span-2">
                    <p className="text-[11px] font-medium text-muted">Địa chỉ</p>
                    <p className="text-sm font-medium mt-0.5">{staffDetailModal.data.dia_chi || '—'}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditBirth(ymdToDmy(staffDetailModal.data.ngay_sinh));
                    setStatusDraft(normalizeTrangThai(staffDetailModal.data.trang_thai));
                    setStaffDetailModal({ ...staffDetailModal, isEditing: true });
                  }}
                  className="btn-primary w-full !py-3"
                >
                  Sửa hồ sơ
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal thêm nhân viên */}
      {isModalOpen && (
        <div className="print:hidden modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-panel max-w-md p-5 md:p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 btn-ghost !p-2">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-lg font-bold text-primary mb-4">Thêm nhân viên mới</h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted">Họ và tên</label>
                <input required type="text" className="input-field mt-1" value={formData.ten} onChange={(e) => setFormData({ ...formData, ten: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted">Ngày sinh</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/MM/yyyy"
                    className="input-field mt-1"
                    style={formData.ngay_sinh && !isValidBirth(formData.ngay_sinh) ? { borderColor: "var(--color-error)" } : undefined}
                    value={formData.ngay_sinh}
                    onChange={(e) => setFormData({ ...formData, ngay_sinh: maskDateInput(e.target.value) })}
                  />
                  {formData.ngay_sinh && !isValidBirth(formData.ngay_sinh) && (
                    <p className="text-xs text-error mt-1">Ngày sinh không hợp lệ</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted">Số điện thoại</label>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="0xxxxxxxxx"
                    className="input-field mt-1"
                    style={formData.so_dien_thoai && !isValidPhone(formData.so_dien_thoai) ? { borderColor: "var(--color-error)" } : undefined}
                    value={formData.so_dien_thoai}
                    onChange={(e) => setFormData({ ...formData, so_dien_thoai: onlyDigits(e.target.value).slice(0, 10) })}
                  />
                  {formData.so_dien_thoai && !isValidPhone(formData.so_dien_thoai) && (
                    <p className="text-xs text-error mt-1">SĐT phải đủ 10 số và bắt đầu bằng 0</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Địa chỉ</label>
                <input type="text" className="input-field mt-1" value={formData.dia_chi} onChange={(e) => setFormData({ ...formData, dia_chi: e.target.value })} />
              </div>
              <button
                type="submit"
                disabled={addSaving || !formData.ten.trim() || !isValidPhone(formData.so_dien_thoai) || !isValidBirth(formData.ngay_sinh)}
                className="btn-primary w-full !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addSaving ? "Đang lưu..." : "Lưu hồ sơ"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal phân ca */}
      {isAssignModalOpen && (
        <div className="print:hidden modal-overlay" onClick={() => setIsAssignModalOpen(false)}>
          <div className="modal-panel max-w-md p-5 md:p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setIsAssignModalOpen(false)} className="absolute top-4 right-4 btn-ghost !p-2">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-lg font-bold text-primary mb-1">Phân công ca</h3>
            <p className="text-sm text-muted mb-4">{formatDisplayDate(assignForm.ngay)}</p>
            <form onSubmit={handleAssignStaff} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted">Ngày làm việc</label>
                <input type="date" required className="input-field mt-1" value={assignForm.ngay} onChange={(e) => setAssignForm({ ...assignForm, ngay: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Ca làm</label>
                <select required className="input-field mt-1" value={assignForm.ma_ca} onChange={(e) => setAssignForm({ ...assignForm, ma_ca: e.target.value })}>
                  <option value="" disabled>Chọn ca</option>
                  {shiftsConfig.map((shift) => (
                    <option key={shift.id} value={shift.id}>{shift.label} ({shift.time})</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-muted">
                    Nhân viên{assignStaffIds.length > 0 ? ` — đã chọn ${assignStaffIds.length}` : ""}
                  </label>
                  {assignCandidates.length > 0 && (
                    <button
                      type="button"
                      className="text-xs font-semibold text-primary hover:underline"
                      onClick={() =>
                        setAssignStaffIds((prev) =>
                          prev.length === assignCandidates.length
                            ? []
                            : assignCandidates.map((nv) => String(nv.ma_nhan_vien))
                        )
                      }
                    >
                      {assignStaffIds.length === assignCandidates.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </button>
                  )}
                </div>
                <div className="max-h-56 overflow-y-auto rounded-lg border border-outline/40 divide-y divide-outline/20 custom-scrollbar">
                  {assignCandidates.length === 0 ? (
                    <p className="text-sm text-muted p-3 text-center">Không có nhân viên khả dụng cho ca này</p>
                  ) : (
                    assignCandidates.map((nv) => {
                      const id = String(nv.ma_nhan_vien);
                      const checked = assignStaffIds.includes(id);
                      return (
                        <label key={nv.ma_nhan_vien} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-primary/5">
                          <input
                            type="checkbox"
                            className="!w-4 !h-4 accent-primary"
                            checked={checked}
                            onChange={() => toggleAssignStaff(id)}
                          />
                          <span className="text-sm font-medium">{nv.ten}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={assignSaving || assignStaffIds.length === 0}
                className="btn-primary w-full !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignSaving ? "Đang phân công..." : "Xác nhận phân công"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NhanVien;