import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  createNhanVien,
  createPhanCong,
  deletePhanCong,
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
import { formatPhoneDisplay } from "../utils/formatPhone";

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
  // =====================================================================
  // NOTE 2: KHAI BÁO TRẠNG THÁI (STATES)
  // =====================================================================
  const [staffList, setStaffList] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staffDetailModal, setStaffDetailModal] = useState({ isOpen: false, data: null, isEditing: false });
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ ten: '', ngay_sinh: '', so_dien_thoai: '', dia_chi: '' });
  
  const today = getLocalDateString(new Date());
  const [assignForm, setAssignForm] = useState({ ma_nhan_vien: '', ma_ca: '', ngay: today });
  
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

  // =====================================================================
  // NOTE 4: CÁC HÀM XỬ LÝ SỰ KIỆN (THÊM CHỨC NĂNG ẨN/HIỆN)
  // =====================================================================
  const changeStaffStatus = async (id, newStatus) => {
    const normalized = normalizeTrangThai(newStatus);
    const label = TRANG_THAI_LABELS[normalized] || normalized;
    if (!window.confirm(`Đổi trạng thái nhân viên thành "${label}"?`)) return false;
    setStatusSaving(true);
    try {
      await updateNhanVienStatus(id, normalized);
      setStaffList((prev) =>
        prev.map((s) =>
          String(s.ma_nhan_vien) === String(id) ? { ...s, trang_thai: normalized } : s
        )
      );
      setStaffDetailModal((prev) =>
        prev.isOpen && String(prev.data?.ma_nhan_vien) === String(id)
          ? { ...prev, data: { ...prev.data, trang_thai: normalized } }
          : prev
      );
      setStatusDraft(normalized);
      const { startStr, endStr } = getWeekRange(filterDate);
      const assignRes = await getLichPhanCong({ startDate: startStr, endDate: endStr });
      setAssignments(normalizeAssignments(assignRes));
      return true;
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
      return false;
    } finally {
      setStatusSaving(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    const dataToSend = { ...formData, ngay_sinh: formData.ngay_sinh || null, dia_chi: formData.dia_chi || null };
    try {
      await createNhanVien(dataToSend);
      setIsModalOpen(false); 
      setFormData({ ten: '', ngay_sinh: '', so_dien_thoai: '', dia_chi: '' });
      fetchData();
    } catch (error) {
      alert("Lỗi từ hệ thống: " + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    const formattedNgaySinh = formatDateString(staffDetailModal.data.ngay_sinh);
    const dataToSend = { 
      ...staffDetailModal.data, 
      ngay_sinh: formattedNgaySinh || null 
    };

    try {
      await updateNhanVien(dataToSend.ma_nhan_vien, dataToSend);
      setStaffDetailModal({ ...staffDetailModal, isEditing: false });
      fetchData();
      alert("Cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi chi tiết:", error.response);
      alert("Lỗi khi cập nhật: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    try {
      await createPhanCong(assignForm);
      setIsAssignModalOpen(false);
      setAssignForm({ ma_nhan_vien: '', ma_ca: '', ngay: assignForm.ngay }); 
      fetchData();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Không thể phân công"));
    }
  };

  const handleDeleteAssignment = async (ma_nhan_vien, ma_ca, ngayStr, e) => {
    e.stopPropagation(); 
    if(window.confirm("Bạn có chắc chắn muốn gỡ nhân viên này khỏi ca làm?")) {
      try {
        await deletePhanCong({ ma_nhan_vien, ma_ca, ngay: ngayStr });
        fetchData(); 
      } catch (error) {
        alert("Lỗi khi xóa phân công: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handlePrint = () => window.print();

  const openStaffDetails = (staffId) => {
    const staff = staffList.find(s => String(s.ma_nhan_vien) === String(staffId));
    if (staff) {
      setStatusDraft(normalizeTrangThai(staff.trang_thai));
      setStaffDetailModal({ isOpen: true, data: staff, isEditing: false });
    }
  };

  const openAssignModalForDay = (shiftId, dayStr) => {
    setAssignForm({ ma_nhan_vien: '', ma_ca: String(shiftId), ngay: dayStr });
    setIsAssignModalOpen(true);
  };

  const shiftsConfig = [
    { id: 1, label: 'Ca Sáng', time: '06:00-12:00', icon: 'sunny', theme: 'secondary-fixed' },
    { id: 2, label: 'Ca Chiều', time: '12:00-18:00', icon: 'partly_cloudy_day', theme: 'tertiary-container' },
    { id: 3, label: 'Ca Tối', time: '18:00-23:00', icon: 'nights_stay', theme: 'primary-container' }
  ];

  const weekRange = useMemo(() => getWeekRange(filterDate), [filterDate]);

  const getStaffStatus = useCallback(
    (maNhanVien) => {
      const staff = staffList.find((s) => String(s.ma_nhan_vien) === String(maNhanVien));
      return normalizeTrangThai(staff?.trang_thai);
    },
    [staffList]
  );

  /**
   * Quá khứ & hôm nay: luôn hiện ca đã gán.
   * Tương lai: ẩn nếu NV tạm nghỉ / đã nghỉ.
   */
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
              className="assignee-pill group/pill inline-flex items-center gap-0.5 pl-2 pr-0.5 py-0.5 rounded-lg bg-primary/10 border border-outline/40 text-sm font-medium w-max max-w-full min-h-[1.75rem]"
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
                className="print:hidden opacity-0 group-hover/pill:opacity-100 inline-flex items-center justify-center w-6 h-6 shrink-0 ml-auto text-error hover:bg-error/15 rounded-md transition-opacity"
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

  // =====================================================================
  // NOTE 5: GIAO DIỆN HIỂN THỊ
  // =====================================================================
  return (
    <div className="font-body w-full text-on-surface pb-8 print:bg-white print:m-0 print:p-0">
      
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
        grid-template-rows: auto repeat(3, auto) !important;
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
        grid-template-columns: repeat(3, 1fr) !important;
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
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
              Quản lý nhân sự
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button type="button" onClick={() => setIsModalOpen(true)} className="btn-primary !py-2 !px-4 !text-sm">
              <span className="material-symbols-outlined text-lg">person_add</span>
              Thêm nhân viên
            </button>
            <button type="button" onClick={handlePrint} className="btn-outline !py-2 !px-4 !text-sm">
              <span className="material-symbols-outlined text-lg">print</span>
              In lịch
            </button>
          </div>
        </div>

        {/* Lịch phân công — co giãn theo kích thước màn hình */}
        <section className="card border-none overflow-hidden print:border print:border-black w-full min-w-0 flex-1 flex flex-col min-h-0 print:flex-none">
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
                <div
                  className="schedule-board print-table h-full"
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
                    return (
                      <div
                        key={index}
                        className={`schedule-cell schedule-head px-1 py-2 text-center ${isTodayCol ? "bg-primary/15" : ""}`}
                      >
                        <p className="font-semibold text-muted uppercase leading-tight">
                          {index === 6 ? "CN" : `T${index + 2}`}
                        </p>
                        <p className="font-bold text-on-surface leading-tight mt-0.5 text-[clamp(0.65rem,1.2vw,0.875rem)]">
                          {formatDisplayDate(dayStr)}
                        </p>
                      </div>
                    );
                  })}
                  {shiftsConfig.map((shift) => (
                    <React.Fragment key={shift.id}>
                      <div className="schedule-cell schedule-shift px-1 py-2 flex flex-col items-center justify-center text-center gap-0.5 print:bg-gray-50">
                        <span className="material-symbols-outlined text-primary text-[clamp(1rem,2vw,1.25rem)] print:hidden">{shift.icon}</span>
                        <span className="font-bold text-primary leading-tight">{shift.label}</span>
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
              ) : (
                <div className="schedule-day-board print-table h-full grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 auto-rows-fr">
                  {shiftsConfig.map((shift) => {
                    const count = getAssignmentsForCell(shift.id, filterDate).length;
                    return (
                      <div
                        key={shift.id}
                        className="schedule-day-card flex flex-col rounded-xl border border-outline/40 overflow-hidden min-h-[10rem] bg-primary/[0.03]"
                      >
                        <div className="px-3 py-3 border-b border-outline/30 bg-primary/5 flex items-center gap-3 shrink-0">
                          <span className="material-symbols-outlined text-primary text-2xl print:hidden">{shift.icon}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-primary">{shift.label}</p>
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
              )}
            </div>
          )}
        </section>

        {/* Danh sách nhân viên — dưới lịch */}
        <aside className="card border-none overflow-hidden print:hidden shrink-0">
          <div className="p-3 md:p-4 border-b border-outline">
            <h2 className="font-bold text-primary text-sm">Danh sách nhân viên</h2>
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
              <form onSubmit={handleUpdateStaff} className="space-y-3">
                <div><label className="text-[9px] font-black uppercase text-on-surface opacity-50 ml-1 tracking-widest">Họ và tên</label><input required type="text" value={staffDetailModal.data.ten} onChange={e => setStaffDetailModal({...staffDetailModal, data: {...staffDetailModal.data, ten: e.target.value}})} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[9px] font-black uppercase text-on-surface opacity-50 ml-1 tracking-widest">Ngày sinh</label><input type="date" value={formatDateString(staffDetailModal.data.ngay_sinh) || ''} onChange={e => setStaffDetailModal({...staffDetailModal, data: {...staffDetailModal.data, ngay_sinh: e.target.value}})} /></div>
                  <div><label className="text-[9px] font-black uppercase text-on-surface opacity-50 ml-1 tracking-widest">SĐT</label><input required type="text" value={staffDetailModal.data.so_dien_thoai} onChange={e => setStaffDetailModal({...staffDetailModal, data: {...staffDetailModal.data, so_dien_thoai: e.target.value}})} /></div>
                </div>
                <div><label className="text-[9px] font-black uppercase text-on-surface opacity-50 ml-1 tracking-widest">Địa chỉ</label><input type="text" value={staffDetailModal.data.dia_chi || ''} onChange={e => setStaffDetailModal({...staffDetailModal, data: {...staffDetailModal.data, dia_chi: e.target.value}})} /></div>
                <div className="flex gap-2 mt-5">
                  <button type="button" onClick={() => setStaffDetailModal({...staffDetailModal, isEditing: false})} className="flex-1 py-2 font-bold text-xs bg-primary/5 rounded-lg uppercase">HỦY</button>
                  <button type="submit" className="btn-primary flex-1 !py-2 !text-xs uppercase">LƯU CẬP NHẬT</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 border-b border-outline/10 pb-4">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-black uppercase ${!isDangLam(staffDetailModal.data.trang_thai) ? 'bg-on-surface/10 text-on-surface' : 'bg-primary/20 text-primary'}`}>
                    {staffDetailModal.data.ten.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-on-surface uppercase">{staffDetailModal.data.ten}</p>
                    <p className="text-xs text-on-surface opacity-50 tracking-widest">Mã NV: #{staffDetailModal.data.ma_nhan_vien}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-3">
                  <div><p className="text-[9px] font-black uppercase text-on-surface opacity-40 tracking-widest">Số điện thoại</p><p className="text-sm font-medium mt-0.5 tabular-nums tracking-wide">{formatPhoneDisplay(staffDetailModal.data.so_dien_thoai)}</p></div>
                  <div><p className="text-[9px] font-black uppercase text-on-surface opacity-40 tracking-widest">Ngày sinh</p><p className="text-sm font-medium mt-0.5">{formatDateString(staffDetailModal.data.ngay_sinh) ? formatDateString(staffDetailModal.data.ngay_sinh).split('-').reverse().join('/') : '---'}</p></div>
                  <div className="col-span-2">
                    <p className="text-[9px] font-black uppercase text-on-surface opacity-40 tracking-widest">Trạng thái</p>
                    <select
                      className="input-field !py-1.5 !text-[11px] mt-1 font-black uppercase w-full"
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value)}
                      disabled={statusSaving}
                    >
                      <option value="dang_lam">Đang làm</option>
                      <option value="tam_nghi">Tạm nghỉ</option>
                      <option value="da_nghi">Đã nghỉ</option>
                    </select>
                    <button
                      type="button"
                      disabled={
                        statusSaving ||
                        statusDraft === normalizeTrangThai(staffDetailModal.data.trang_thai)
                      }
                      onClick={async () => {
                        const ok = await changeStaffStatus(
                          staffDetailModal.data.ma_nhan_vien,
                          statusDraft
                        );
                        if (ok) alert("Đã cập nhật trạng thái nhân viên");
                      }}
                      className="btn-outline w-full mt-2 !py-2 !text-[10px] uppercase disabled:opacity-40"
                    >
                      {statusSaving ? "Đang lưu..." : "Lưu trạng thái"}
                    </button>
                  </div>
                  <div className="col-span-2"><p className="text-[9px] font-black uppercase text-on-surface opacity-40 tracking-widest">Địa chỉ</p><p className="text-sm font-medium mt-0.5">{staffDetailModal.data.dia_chi || '---'}</p></div>
                </div>
                
                <div className="flex flex-col gap-2 mt-6">
                  <button
                    onClick={() => setStaffDetailModal({ ...staffDetailModal, isEditing: true })}
                    className="btn-primary w-full !py-3 !text-[11px] !rounded-xl uppercase"
                  >
                    Sửa hồ sơ
                  </button>
                </div>
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
                <input required type="text" className="mt-1" value={formData.ten} onChange={(e) => setFormData({ ...formData, ten: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted">Ngày sinh</label>
                  <input type="date" className="mt-1" value={formData.ngay_sinh} onChange={(e) => setFormData({ ...formData, ngay_sinh: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted">Số điện thoại</label>
                  <input required type="text" className="mt-1" value={formData.so_dien_thoai} onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Địa chỉ</label>
                <input type="text" className="mt-1" value={formData.dia_chi} onChange={(e) => setFormData({ ...formData, dia_chi: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary w-full !py-3">Lưu hồ sơ</button>
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
                <input type="date" required className="mt-1" value={assignForm.ngay} onChange={(e) => setAssignForm({ ...assignForm, ngay: e.target.value })} />
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
                <label className="text-xs font-semibold text-muted">Nhân viên</label>
                <select required className="input-field mt-1" value={assignForm.ma_nhan_vien} onChange={(e) => setAssignForm({ ...assignForm, ma_nhan_vien: e.target.value })}>
                  <option value="" disabled>Chọn nhân viên</option>
                  {staffList.filter((nv) => canSelectInAssignModal(nv.trang_thai, assignForm.ngay, today)).map((nv) => (
                    <option key={nv.ma_nhan_vien} value={nv.ma_nhan_vien}>{nv.ten}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full !py-3">Xác nhận phân công</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NhanVien;