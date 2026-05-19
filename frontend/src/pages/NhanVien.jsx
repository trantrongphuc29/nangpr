import React, { useState, useEffect, useCallback } from 'react';
import {
  createNhanVien,
  createPhanCong,
  deleteNhanVien,
  deletePhanCong,
  getLichPhanCong,
  getNhanVienList,
  updateNhanVien,
  updateNhanVienStatus, 
} from "../services/nhanVienService";
import { useTheme } from "../context/ThemeContext";

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

const NhanVien = () => {
  // eslint-disable-next-line no-unused-vars
const { isDark } = useTheme();
  // =====================================================================
  // NOTE 2: KHAI BÁO TRẠNG THÁI (STATES)
  // =====================================================================
  const [staffList, setStaffList] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staffListModal, setStaffListModal] = useState(false);
  const [staffDetailModal, setStaffDetailModal] = useState({ isOpen: false, data: null, isEditing: false });
  
  const [formData, setFormData] = useState({ ten: '', ngay_sinh: '', so_dien_thoai: '', dia_chi: '' });
  
  const today = getLocalDateString(new Date());
  const [assignForm, setAssignForm] = useState({ ma_nhan_vien: '', ma_ca: '', ngay: today });
  
  const [filterDate, setFilterDate] = useState(today);
  const [viewMode, setViewMode] = useState('week');

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(getStartOfWeek(filterDate));
    d.setDate(d.getDate() + i);
    return d;
  });

  // =====================================================================
  // NOTE 3: GỌI API TẢI DỮ LIỆU
  // =====================================================================
  const fetchData = useCallback(async () => {
    try {
      const { startStr, endStr } = getWeekRange(filterDate);
      const [staffRes, assignRes] = await Promise.all([
        getNhanVienList(),
        getLichPhanCong({ startDate: startStr, endDate: endStr }),
      ]);
      setStaffList(staffRes);
      setAssignments(assignRes);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  }, [filterDate]); 

  useEffect(() => {
    fetchData();
  }, [fetchData]); 

  // =====================================================================
  // NOTE 4: CÁC HÀM XỬ LÝ SỰ KIỆN (THÊM CHỨC NĂNG ẨN/HIỆN)
  // =====================================================================
  const toggleStaffStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const actionText = newStatus === 1 ? "hiện" : "ẩn";
    
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} nhân viên này?`)) {
      try {
        await updateNhanVienStatus(id, newStatus);
        await fetchData(); 
        if (staffDetailModal.isOpen && staffDetailModal.data.ma_nhan_vien === id) {
          setStaffDetailModal({
            ...staffDetailModal,
            data: { ...staffDetailModal.data, trang_thai: newStatus }
          });
        }
      } catch (error) {
        alert("Lỗi khi cập nhật trạng thái");
      }
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

  const deleteStaff = async (id) => {
    if (window.confirm("Xóa nhân viên này sẽ xóa luôn lịch trực liên quan. Tiếp tục?")) {
      try {
        await deleteNhanVien(id);
        setStaffDetailModal({ isOpen: false, data: null, isEditing: false });
        fetchData();
      } catch (error) {
        alert("Lỗi khi xóa nhân viên");
      }
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
    if(staff) setStaffDetailModal({ isOpen: true, data: staff, isEditing: false });
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

  // =====================================================================
  // NOTE 5: GIAO DIỆN HIỂN THỊ
  // =====================================================================
  return (
    <div className="font-body animate-in fade-in duration-500 w-full text-on-surface transition-colors duration-500 print:bg-white print:m-0 print:p-0">
      
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

      /* 5. Ép tên nhân viên hiện rõ, không bị mờ do opacity của Dark Mode */
      .group/pill {
        border: 1px solid black !important;
        color: black !important;
        opacity: 1 !important;
        background: white !important;
      }

      /* 6. Loại bỏ hoàn toàn các hiệu ứng màu mè/mờ ảo của chế độ tối */
      .dark, .bg-card, .bg-surface-container-low {
        background-color: white !important;
      }

      /* 7. Đảm bảo icon in ra không bị nhòe */
      .material-symbols-outlined {
        color: black !important;
      }

      /* 8. Ẩn nút và các thành phần thừa */
      .print:hidden, button, .no-print {
        display: none !important;
      }
    }
  `}
</style>

      <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto print:max-w-none print:p-0 print:m-0 print:space-y-0 print:w-full">
        
        {/* --- KHỐI THỐNG KÊ & TÌM KIẾM --- */}
        <section className="print:hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="lg:col-span-3 bg-primary/10 p-6 rounded-2xl flex justify-between items-center relative overflow-hidden border border-outline/10">
            <div className="relative z-10">
              <h2 className="text-2xl font-headline font-extrabold text-primary mb-2">Quản lý Nhân sự</h2>
              <p className="text-on-surface opacity-80 text-sm font-medium max-w-md leading-relaxed">
                Có tổng cộng {staffList.length} nhân sự. Quản lý hồ sơ và lịch làm việc trực quan.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {/* Nút Thêm nhân viên - Nút hành động chính */}
                <button onClick={() => setIsModalOpen(true)} className="btn-primary !py-2.5 !px-5 !text-xs md:!text-sm">
                  <span className="material-symbols-outlined !text-lg">person_add</span> 
                  <span className="hidden sm:inline">Thêm nhân viên</span>
                  <span className="sm:hidden">Thêm NV</span>
                </button>

                {/* Nút Hồ sơ NV - Nút hành động phụ */}
                <button onClick={() => setStaffListModal(true)} className="btn-outline !py-2.5 !px-5 !text-xs md:!text-sm bg-card">
                  <span className="material-symbols-outlined !text-lg">badge</span> 
                  <span>Hồ sơ NV</span>
                </button>
              </div>
            </div>
            <div className="hidden md:block opacity-10 absolute -right-8 -bottom-10">
              <span className="material-symbols-outlined text-[140px] text-primary">groups</span>
            </div>
          </div>
          
          <div className="card p-6 flex flex-col justify-center border-none shadow-sm">
            <p className="text-on-surface opacity-50 font-bold text-[11px] uppercase mb-2 tracking-widest">Tra cứu lịch</p>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="mb-3"
            />
            <div className="flex bg-primary/5 p-1 rounded-lg">
              <button onClick={() => setViewMode('day')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'day' ? 'bg-card text-primary shadow-sm' : 'opacity-40'}`}>Ngày</button>
              <button onClick={() => setViewMode('week')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'week' ? 'bg-card text-primary shadow-sm' : 'opacity-40'}`}>Tuần</button>
            </div>
          </div>
        </section>

        {/* --- KHỐI BẢNG PHÂN CÔNG --- */}
<section className="card overflow-hidden border-2 border-[var(--color-border)] shadow-lg print:shadow-none print:border-2 print:border-black transition-colors duration-500">
  <div className="print:hidden p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[var(--color-border)]">
    <div>
      <h3 className="text-xl font-headline font-extrabold text-primary">
        Bảng Phân Công {viewMode === 'week' ? 'Tuần' : 'Ngày'}
      </h3>
      <p className="text-sm text-on-surface opacity-70 font-medium mt-1 italic">
        {viewMode === 'day' ? formatDateString(filterDate).split('-').reverse().join('/') : `Từ ${getWeekRange(filterDate).startStr.split('-').reverse().join('/')} đến ${getWeekRange(filterDate).endStr.split('-').reverse().join('/')}`}
      </p>
    </div>
    <div className="flex items-center">
      <button onClick={handlePrint} className="btn-outline !py-2 !px-4 !text-xs flex items-center gap-1.5 bg-card border-2">
        <span className="material-symbols-outlined text-sm">print</span> In Bảng
      </button>
    </div>
  </div>

  <div className="overflow-x-auto w-full print:overflow-visible custom-scrollbar">
    {/* Thêm border-2 và border-collapse vào table để đảm bảo khi in viền không bị mất */}
    <table className="min-w-[1000px] lg:w-full border-collapse text-left print:border-2 print:border-black">
      <thead>
        <tr className="bg-primary/10 print:bg-gray-100">
          <th className="p-3 border-2 border-[var(--color-border)] print:border-black font-headline font-extrabold text-primary text-[11px] uppercase tracking-widest w-36 text-center">
            CA / THỜI GIAN
          </th>
          {viewMode === 'week' ? (
            weekDays.map((d, index) => {
              const isToday = formatDateString(d) === today;
              return (
                <th key={index} className={`p-3 text-center border-2 border-[var(--color-border)] print:border-black min-w-[140px] ${isToday ? 'bg-primary/10' : ''}`}>
                  <p className={`text-[10px] font-bold text-on-surface uppercase`}>
                    {index === 6 ? 'Chủ Nhật' : `Thứ ${index + 2}`}
                  </p>
                  <p className={`font-black text-base mt-1 text-on-surface`}>
                    {d.getDate()}/{d.getMonth() + 1}
                  </p>
                </th>
              )
            })
          ) : (
            <th className="p-3 text-center border-2 border-[var(--color-border)] print:border-black min-w-[300px]">
              <p className="text-[11px] font-bold text-on-surface uppercase tracking-widest">Danh sách nhân sự</p>
            </th>
          )}
        </tr>
      </thead>
      
      <tbody>
        {shiftsConfig.map((shift) => (
          <tr key={shift.id} className="hover:bg-primary/5 transition-colors print:break-inside-avoid">
            <td className="p-3 border-2 border-[var(--color-border)] print:border-black align-middle">
              <div className="flex flex-col gap-1 items-start px-2">
                <div className={`print:hidden w-6 h-6 rounded flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-[14px] text-primary`}>{shift.icon}</span>
                </div>
                <p className={`font-extrabold text-primary text-[12px] uppercase mt-1`}>{shift.label}</p>
                <p className="text-[10px] font-medium text-on-surface opacity-70 italic">{shift.time}</p>
              </div>
            </td>

            {viewMode === 'week' ? (
              weekDays.map((day, idx) => {
                const dayStr = formatDateString(day);
                const assignedStaff = assignments.filter(a => formatDateString(a.ngay) === dayStr && (String(a.ma_ca) === String(shift.id) || a.buoi?.includes(shift.label.split(' ')[1])));
                
                return (
                  <td key={idx} className={`p-2 border-2 border-[var(--color-border)] print:border-black align-top ${dayStr === today ? 'bg-primary/5' : ''}`}>
                    <div className="flex flex-wrap gap-1.5 p-1">
                      {assignedStaff.map((assign, assignIdx) => {
                        const staffName = assign.ten || staffList.find(s => String(s.ma_nhan_vien) === String(assign.ma_nhan_vien))?.ten || `NV #${assign.ma_nhan_vien}`;
                        return (
                          <div key={`${assign.ma_nhan_vien}-${assignIdx}`} className="group/pill flex items-center gap-1 px-2 py-1 rounded bg-primary/10 border border-[var(--color-border)] transition-all print:border-none print:bg-transparent print:p-0 print:block">
                            <div onClick={() => openStaffDetails(assign.ma_nhan_vien)} className="cursor-pointer flex-1 flex items-center text-on-surface">
                              <span className="text-[11px] font-bold uppercase print:text-[13px] print:font-bold">
                                • {staffName}
                              </span>
                            </div>
                            <button onClick={(e) => handleDeleteAssignment(assign.ma_nhan_vien, shift.id, dayStr, e)} className="print:hidden w-[18px] h-[18px] flex items-center justify-center rounded-full bg-error/20 text-error hover:bg-error hover:text-white opacity-0 group-hover/pill:opacity-100 ml-1">
                              <span className="material-symbols-outlined text-[10px] font-bold">close</span>
                            </button>
                          </div>
                        )
                      })}
                      <button onClick={() => openAssignModalForDay(shift.id, dayStr)} className="print:hidden w-[24px] h-[24px] rounded border-2 border-dashed border-[var(--color-border)] text-primary hover:bg-primary/10 transition-all flex items-center justify-center">+</button>
                    </div>
                  </td>
                )
              })
            ) : (
              <td className="p-3 border-2 border-[var(--color-border)] print:border-black align-top">
                <div className="flex flex-wrap gap-2 p-1">
                  {assignments.filter(a => formatDateString(a.ngay) === filterDate && (String(a.ma_ca) === String(shift.id))).map((assign, assignIdx) => (
                    <div key={assignIdx} className="group/pill flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary/10 border border-[var(--color-border)] print:border-none print:bg-transparent print:p-0">
                      <span className="text-xs font-bold uppercase print:text-[13px] print:font-bold">• {assign.ten}</span>
                      <button onClick={(e) => handleDeleteAssignment(assign.ma_nhan_vien, shift.id, filterDate, e)} className="print:hidden text-error ml-1 opacity-0 group-hover/pill:opacity-100">×</button>
                    </div>
                  ))}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>
      </div>

      {/* --- CÁC MODALS --- */}
      
      {/* Modal Xem Danh Sách NV */}
      {staffListModal && (
        <div className="print:hidden fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="card w-full max-w-xl p-6 shadow-2xl relative max-h-[80vh] flex flex-col border-none">
            <button onClick={() => setStaffListModal(false)} className="absolute top-5 right-5 text-on-surface opacity-40 hover:opacity-100"><span className="material-symbols-outlined">close</span></button>
            <h3 className="text-lg font-black text-primary mb-4 font-headline uppercase tracking-widest">Hồ sơ nhân sự</h3>
            <div className="overflow-y-auto pr-1 flex-1 space-y-2 custom-scrollbar">
              {staffList.map(nv => (
                <div key={nv.ma_nhan_vien} className={`p-3 rounded-lg border flex items-center justify-between transition-all ${nv.trang_thai === 0 ? 'bg-on-surface/5 opacity-50' : 'bg-primary/5 border-outline/10 hover:border-primary/30'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded flex items-center justify-center font-black uppercase ${nv.trang_thai === 0 ? 'bg-on-surface/20 text-on-surface' : 'bg-primary/20 text-primary'}`}>
                      {nv.ten.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface uppercase">
                        {nv.ten} 
                        {nv.trang_thai === 0 && <span className="ml-2 text-[9px] bg-on-surface/50 text-card px-1.5 py-0.5 rounded uppercase font-black tracking-widest">Đã ẩn</span>}
                      </p>
                      <p className="text-[10px] text-on-surface opacity-50 tracking-widest">{nv.so_dien_thoai}</p>
                    </div>
                  </div>
                 <button 
                      onClick={() => openStaffDetails(nv.ma_nhan_vien)} 
                      className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-card text-[10px] font-black rounded-lg transition-all uppercase tracking-widest" >
                      Chi tiết
                    </button>
                </div>
              ))}
              {staffList.length === 0 && <p className="text-center text-on-surface opacity-40 py-4 text-sm uppercase">Chưa có dữ liệu</p>}
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết / Sửa Nhân Viên */}
      {staffDetailModal.isOpen && (
        <div className="print:hidden fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 shadow-2xl relative border-none">
            <button onClick={() => setStaffDetailModal({ isOpen: false, data: null, isEditing: false })} className="absolute top-5 right-5 text-on-surface opacity-40 hover:opacity-100"><span className="material-symbols-outlined">close</span></button>
            <h3 className="text-lg font-headline font-black text-primary mb-4 uppercase tracking-widest">{staffDetailModal.isEditing ? "Sửa hồ sơ" : "Thông tin chi tiết"}</h3>

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
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-black uppercase ${staffDetailModal.data.trang_thai === 0 ? 'bg-on-surface/10 text-on-surface' : 'bg-primary/20 text-primary'}`}>
                    {staffDetailModal.data.ten.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-on-surface uppercase">{staffDetailModal.data.ten}</p>
                    <p className="text-xs text-on-surface opacity-50 tracking-widest">Mã NV: #{staffDetailModal.data.ma_nhan_vien}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-3">
                  <div><p className="text-[9px] font-black uppercase text-on-surface opacity-40 tracking-widest">Số điện thoại</p><p className="text-sm font-medium mt-0.5">{staffDetailModal.data.so_dien_thoai}</p></div>
                  <div><p className="text-[9px] font-black uppercase text-on-surface opacity-40 tracking-widest">Ngày sinh</p><p className="text-sm font-medium mt-0.5">{formatDateString(staffDetailModal.data.ngay_sinh) ? formatDateString(staffDetailModal.data.ngay_sinh).split('-').reverse().join('/') : '---'}</p></div>
                  <div className="col-span-1"><p className="text-[9px] font-black uppercase text-on-surface opacity-40 tracking-widest">Trạng thái</p><p className={`text-[10px] font-black mt-0.5 px-2 py-0.5 rounded inline-block ${staffDetailModal.data.trang_thai === 1 ? 'bg-primary/20 text-primary' : 'bg-on-surface/10 text-on-surface'}`}>{staffDetailModal.data.trang_thai === 1 ? 'ĐANG HIỆN' : 'ĐANG ẨN'}</p></div>
                  <div className="col-span-2"><p className="text-[9px] font-black uppercase text-on-surface opacity-40 tracking-widest">Địa chỉ</p><p className="text-sm font-medium mt-0.5">{staffDetailModal.data.dia_chi || '---'}</p></div>
                </div>
                
                <div className="flex flex-col gap-2 mt-6">
                  <div className="flex gap-2">
                    {/* Nút Ẩn/Hiện: Dùng màu trung tính để không quá chói */}
                    <button 
                      onClick={() => toggleStaffStatus(staffDetailModal.data.ma_nhan_vien, staffDetailModal.data.trang_thai)} 
                      className={`flex-1 py-3 text-[11px] font-black rounded-xl uppercase transition-all border-2 ${
                        staffDetailModal.data.trang_thai === 1 
                        ? 'border-amber-500/50 text-amber-600 bg-amber-50/50 dark:bg-amber-500/10' 
                        : 'border-green-500/50 text-green-600 bg-green-50/50 dark:bg-green-500/10'
                      }`}
                    >
                      {staffDetailModal.data.trang_thai === 1 ? 'ẨN NHÂN VIÊN' : 'HIỆN NHÂN VIÊN'}
                    </button>

                    {/* Nút Sửa: Dùng btn-primary nhưng thu nhỏ lại */}
                    <button 
                      onClick={() => setStaffDetailModal({...staffDetailModal, isEditing: true})} 
                      className="btn-primary flex-1 !py-3 !text-[11px] !rounded-xl"
                    >
                      SỬA HỒ SƠ
                    </button>
                  </div>

                  {/* Nút Xóa: Dùng btn-error định nghĩa sẵn */}
                  <button 
                    onClick={() => deleteStaff(staffDetailModal.data.ma_nhan_vien)} 
                    className="btn-error w-full !py-2.5 !text-[10px] !rounded-xl opacity-80 hover:opacity-100"
                  >
                    XÓA VĨNH VIỄN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Thêm Nhân Viên */}
      {isModalOpen && (
         <div className="print:hidden fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
         <div className="card w-full max-w-sm p-6 shadow-2xl relative border-none">
           <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-on-surface opacity-40 hover:opacity-100"><span className="material-symbols-outlined">close</span></button>
           <h3 className="text-lg font-headline font-black text-primary mb-4 uppercase tracking-widest text-center italic">Thêm nhân viên mới</h3>
           <form onSubmit={handleAddStaff} className="space-y-3">
             <div><label className="text-[9px] font-black uppercase text-on-surface opacity-50 ml-1 tracking-widest">Họ và tên</label><input required type="text" value={formData.ten} onChange={e => setFormData({...formData, ten: e.target.value})} /></div>
             <div className="grid grid-cols-2 gap-3">
               <div><label className="text-[9px] font-black uppercase text-on-surface opacity-50 ml-1 tracking-widest">Ngày sinh</label><input type="date" value={formData.ngay_sinh} onChange={e => setFormData({...formData, ngay_sinh: e.target.value})} /></div>
               <div><label className="text-[9px] font-black uppercase text-on-surface opacity-50 ml-1 tracking-widest">SĐT</label><input required type="text" value={formData.so_dien_thoai} onChange={e => setFormData({...formData, so_dien_thoai: e.target.value})} /></div>
             </div>
             <div><label className="text-[9px] font-black uppercase text-on-surface opacity-50 ml-1 tracking-widest">Địa chỉ</label><input type="text" value={formData.dia_chi} onChange={e => setFormData({...formData, dia_chi: e.target.value})} /></div>
             <button type="submit" className="btn-primary w-full mt-5 uppercase tracking-widest text-xs py-4 shadow-xl">LƯU HỒ SƠ</button>
           </form>
         </div>
       </div>
      )}

      {/* Modal Phân Ca */}
      {isAssignModalOpen && (
        <div className="print:hidden fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="card w-full max-w-sm p-6 shadow-2xl relative border-none">
          <button onClick={() => setIsAssignModalOpen(false)} className="absolute top-5 right-5 text-on-surface opacity-40 hover:opacity-100"><span className="material-symbols-outlined">close</span></button>
          <h3 className="text-lg font-headline font-black text-primary mb-4 uppercase tracking-widest text-center italic">Xếp ca làm việc</h3>
          <form onSubmit={handleAssignStaff} className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase text-on-surface opacity-50 ml-1 tracking-widest">Ngày làm việc</label>
              <input type="date" required value={assignForm.ngay} onChange={e => setAssignForm({...assignForm, ngay: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-on-surface opacity-50 ml-1 tracking-widest">Ca làm</label>
              <select required className="w-full bg-surface-container-low border border-outline/30 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none" value={assignForm.ma_ca} onChange={e => setAssignForm({...assignForm, ma_ca: e.target.value})}>
                <option value="" disabled>-- Chọn ca --</option>
                {shiftsConfig.map(shift => (
                   <option key={shift.id} value={shift.id}>{shift.label} ({shift.time})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-on-surface opacity-50 ml-1 tracking-widest">Nhân viên</label>
              <select required className="w-full bg-surface-container-low border border-outline/30 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none" value={assignForm.ma_nhan_vien} onChange={e => setAssignForm({...assignForm, ma_nhan_vien: e.target.value})}>
                <option value="" disabled>-- Chọn nhân viên --</option>
                {staffList.filter(nv => nv.trang_thai === 1).map(nv => (
                  <option key={nv.ma_nhan_vien} value={nv.ma_nhan_vien}>{nv.ten}</option>
                ))}
              </select>
            </div>
            {/* Dành cho Modal Thêm NV, Modal Sửa NV, Modal Gán Ca */}
            <button 
              type="submit" 
              className="btn-primary w-full mt-6 !py-4 !text-xs uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px]">
              Xác nhận hoàn tất
            </button>
          </form>
        </div>
      </div>
      )}
    </div>
  );
};

export default NhanVien;