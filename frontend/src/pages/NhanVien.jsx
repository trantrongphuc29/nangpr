import React, { useState, useEffect, useCallback } from 'react';
import {
  createNhanVien,
  createPhanCong,
  deleteNhanVien,
  deletePhanCong,
  getLichPhanCong,
  getNhanVienList,
  updateNhanVien,
} from "../services/nhanVienService";

// =====================================================================
// NOTE 1: KHU VỰC XỬ LÝ NGÀY THÁNG (ĐÃ FIX CHUẨN 100%)
// Giúp đồng bộ múi giờ giữa Database (UTC) và Trình duyệt (GMT+7)
// Đảm bảo không bao giờ bị lùi ngày khi gán ca.
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
  // =====================================================================
  // NOTE 2: KHAI BÁO TRẠNG THÁI (STATES)
  // Quản lý danh sách nhân sự, dữ liệu phân ca và việc đóng/mở Modal
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
  // NOTE 3: GỌI API TẢI DỮ LIỆU TỪ NODE.JS
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
  // NOTE 4: CÁC HÀM XỬ LÝ SỰ KIỆN (THÊM, SỬA, XÓA, PHÂN CA)
  // =====================================================================
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
    <div className="font-body animate-in fade-in duration-500 w-full text-on-background print:bg-white print:m-0 print:p-0">
      
      {/* =====================================================================
          NOTE 6: CSS BẢO VỆ VIỀN BẢNG KHI IN ẤN (QUAN TRỌNG)
          - Ép buộc trình duyệt vẽ đủ 100% 4 cạnh của bảng và của từng ô (td, th).
          - Ngăn chặn việc cắt trang (break-inside: avoid) làm đứt ngang hàng.
          - -webkit-print-color-adjust giữ lại màu nền xám (bg-stone-50) khi in.
      ===================================================================== */}
      <style>
        {`
          @media print {
            @page { margin: 10mm; }
            body { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
            .print-container {
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            .print-table { 
              border-collapse: collapse !important; 
              width: 100% !important; 
              border: 2px solid black !important; 
            }
            .print-table th, .print-table td { 
              border: 1px solid black !important; 
            }
          }
        `}
      </style>

      <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto print:max-w-none print:p-0 print:m-0 print:space-y-0 print:w-full">
        
        {/* --- KHỐI THỐNG KÊ & TÌM KIẾM (ẨN HOÀN TOÀN KHI IN BẰNG print:hidden) --- */}
        <section className="print:hidden grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3 bg-tertiary-container/30 p-6 rounded-2xl flex justify-between items-center relative overflow-hidden border border-tertiary-container/10">
            <div className="relative z-10">
              <h2 className="text-2xl font-headline font-extrabold text-primary mb-2">Quản lý Nhân sự</h2>
              <p className="text-on-surface-variant text-sm font-medium max-w-md leading-relaxed">
                Có tổng cộng {staffList.length} nhân sự. Quản lý hồ sơ và lịch làm việc trực quan.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-br from-[#553722] to-[#6f4e37] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">person_add</span> Thêm nhân viên
                </button>
                <button onClick={() => setStaffListModal(true)} className="bg-white text-primary border border-primary/10 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-stone-50 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">badge</span> Hồ sơ NV
                </button>
              </div>
            </div>
            <div className="hidden md:block opacity-10 absolute -right-8 -bottom-10">
              <span className="material-symbols-outlined text-[140px]">groups</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col justify-center">
            <p className="text-stone-500 font-bold text-[11px] uppercase mb-2">Tra cứu lịch</p>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-sm font-medium text-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all mb-3"
            />
            <div className="flex bg-stone-100 p-1 rounded-lg">
              <button onClick={() => setViewMode('day')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'day' ? 'bg-white text-primary shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>Ngày</button>
              <button onClick={() => setViewMode('week')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'week' ? 'bg-white text-primary shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>Tuần</button>
            </div>
          </div>
        </section>

        {/* --- KHỐI BẢNG PHÂN CÔNG (HIỂN THỊ KHI IN) --- */}
        {/* Lớp print-container giúp dọn dẹp các bo góc, bóng đổ khi in */}
        <section className="bg-white rounded-xl shadow-sm border border-stone-300 overflow-hidden print-container">
          
          {/* Header Bảng: Ẩn nút "In Bảng" khi đang in */}
          <div className="print:hidden p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-b border-stone-200">
            <div>
              <h3 className="text-xl font-headline font-extrabold text-primary">
                Bảng Phân Công {viewMode === 'week' ? 'Tuần' : 'Ngày'}
              </h3>
              <p className="text-sm text-stone-500 font-medium mt-1">
                {viewMode === 'day' ? formatDateString(filterDate).split('-').reverse().join('/') : `Từ ${getWeekRange(filterDate).startStr.split('-').reverse().join('/')} đến ${getWeekRange(filterDate).endStr.split('-').reverse().join('/')}`}
              </p>
            </div>
            <div className="flex items-center">
              <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg font-bold text-xs transition-all border border-stone-200 shadow-sm">
                <span className="material-symbols-outlined text-sm">print</span> In Bảng
              </button>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            
            {/* Lớp print-table kết nối với thẻ <style> ở trên để ép nét đen đều */}
            <table className="w-full border-collapse text-left border-hidden print-table">
              <thead>
                <tr className="bg-stone-50">
                  {/* NOTE: Cố định border border-stone-300 (hoặc black) cho mọi thẻ th, td để lưới liền mạch */}
                  <th className="p-3 border border-stone-300 font-headline font-extrabold text-black text-[11px] uppercase tracking-widest w-36 text-center">
                    CA / THỜI GIAN
                  </th>
                  {viewMode === 'week' ? (
                    weekDays.map((d, index) => {
                      const isToday = formatDateString(d) === today;
                      return (
                        <th key={index} className={`p-3 text-center border border-stone-300 min-w-[140px] ${isToday ? 'bg-primary/5' : ''}`}>
                          <p className={`text-[10px] font-bold text-black uppercase`}>
                            {index === 6 ? 'Chủ Nhật' : `Thứ ${index + 2}`}
                          </p>
                          <p className={`font-black text-base mt-1 text-black`}>
                            {d.getDate()}/{d.getMonth() + 1}
                          </p>
                        </th>
                      )
                    })
                  ) : (
                    <th className="p-3 text-center border border-stone-300 min-w-[300px]">
                      <p className="text-[11px] font-bold text-black uppercase">Danh sách nhân sự</p>
                    </th>
                  )}
                </tr>
              </thead>
              
              <tbody>
                {shiftsConfig.map((shift) => {
                  return (
                    <tr key={shift.id} className="hover:bg-stone-50/50 transition-colors print:break-inside-avoid">
                      <td className="p-3 border border-stone-300 align-middle">
                        <div className="flex flex-col gap-1 items-start px-2">
                          <div className={`print:hidden w-6 h-6 rounded flex items-center justify-center`}>
                            <span className={`material-symbols-outlined text-[14px] text-stone-600`}>{shift.icon}</span>
                          </div>
                          <p className={`font-extrabold text-black text-[12px] uppercase mt-1`}>{shift.label}</p>
                          <p className="text-[10px] font-medium text-stone-600">{shift.time}</p>
                        </div>
                      </td>

                      {viewMode === 'week' ? (
                        weekDays.map((day, idx) => {
                          const dayStr = formatDateString(day);
                          const assignedStaff = assignments.filter(a => formatDateString(a.ngay) === dayStr && (String(a.ma_ca) === String(shift.id) || a.buoi?.includes(shift.label.split(' ')[1])));
                          
                          return (
                            <td key={idx} className={`p-2 border border-stone-300 align-top ${dayStr === today ? 'bg-primary/5' : ''}`}>
                              <div className="flex flex-wrap gap-1.5 p-1">
                                {assignedStaff.map((assign, assignIdx) => {
                                  const staffName = assign.ten || staffList.find(s => String(s.ma_nhan_vien) === String(assign.ma_nhan_vien))?.ten || `NV #${assign.ma_nhan_vien}`;
                                  return (
                                    <div key={`${assign.ma_nhan_vien}-${assignIdx}`} className="group/pill flex items-center gap-1 px-2 py-1 rounded bg-stone-100 border border-stone-200 transition-all print:border-none print:bg-transparent print:p-0 print:block">
                                      <div onClick={() => openStaffDetails(assign.ma_nhan_vien)} className="cursor-pointer flex-1 flex items-center text-stone-800 print:text-black">
                                        <span className="text-[11px] font-bold uppercase print:text-[13px] print:font-bold">
                                          • {staffName}
                                        </span>
                                      </div>
                                      <button onClick={(e) => handleDeleteAssignment(assign.ma_nhan_vien, shift.id, dayStr, e)} className="print:hidden w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/pill:opacity-100">
                                        <span className="material-symbols-outlined text-[10px] font-bold">close</span>
                                      </button>
                                    </div>
                                  )
                                })}
                                <button onClick={() => openAssignModalForDay(shift.id, dayStr)} className="print:hidden w-[24px] h-[24px] rounded border border-dashed border-stone-300 text-stone-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[14px]">add</span>
                                </button>
                              </div>
                            </td>
                          )
                        })
                      ) : (
                        // CHẾ ĐỘ XEM NGÀY
                        <td className="p-3 border border-stone-300 align-top">
                           {(() => {
                              const assignedStaff = assignments.filter(a => formatDateString(a.ngay) === filterDate && (String(a.ma_ca) === String(shift.id) || a.buoi?.includes(shift.label.split(' ')[1])));
                              return (
                                <div className="flex flex-wrap gap-2 p-1">
                                  {assignedStaff.map((assign, assignIdx) => {
                                    const staffName = assign.ten || staffList.find(s => String(s.ma_nhan_vien) === String(assign.ma_nhan_vien))?.ten || `NV #${assign.ma_nhan_vien}`;
                                    return (
                                      <div key={`${assign.ma_nhan_vien}-${assignIdx}`} className="group/pill flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-100 border border-stone-200 transition-all print:border-none print:bg-transparent print:p-0">
                                        <div onClick={() => openStaffDetails(assign.ma_nhan_vien)} className="cursor-pointer flex items-center gap-1.5 text-stone-800 print:text-black">
                                          <span className="material-symbols-outlined text-[14px] print:hidden">person</span>
                                          <span className="text-xs font-bold uppercase print:text-[13px] print:font-bold">• {staffName}</span>
                                        </div>
                                        <button onClick={(e) => handleDeleteAssignment(assign.ma_nhan_vien, shift.id, filterDate, e)} className="print:hidden w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/pill:opacity-100 ml-1">
                                          <span className="material-symbols-outlined text-[12px] font-bold">close</span>
                                        </button>
                                      </div>
                                    )
                                  })}
                                  <button onClick={() => openAssignModalForDay(shift.id, filterDate)} className="print:hidden px-3 py-1.5 rounded border border-dashed border-stone-300 text-stone-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">add</span> <span className="text-[11px] font-bold uppercase">Thêm nhân viên</span>
                                  </button>
                                </div>
                              )
                           })()}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* =====================================================================
          NOTE 7: CÁC MODALS (HỘP THOẠI POPUP)
          Mọi modal đều được gắn class 'print:hidden' để ẩn hoàn toàn khi in.
      ===================================================================== */}
      
      {/* Modal Xem Danh Sách NV */}
      {staffListModal && (
        <div className="print:hidden fixed inset-0 bg-stone-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl relative max-h-[80vh] flex flex-col">
            <button onClick={() => setStaffListModal(false)} className="absolute top-5 right-5 text-stone-400 hover:text-stone-800"><span className="material-symbols-outlined">close</span></button>
            <h3 className="text-lg font-black text-primary mb-4 font-headline uppercase">Hồ sơ nhân sự</h3>
            <div className="overflow-y-auto pr-1 flex-1 space-y-2 custom-scrollbar">
              {staffList.map(nv => (
                <div key={nv.ma_nhan_vien} className="bg-stone-50 p-3 rounded-lg border border-stone-100 flex items-center justify-between hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary font-black uppercase">{nv.ten.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-sm text-stone-800">{nv.ten}</p>
                      <p className="text-[10px] text-stone-500">{nv.so_dien_thoai}</p>
                    </div>
                  </div>
                  <button onClick={() => openStaffDetails(nv.ma_nhan_vien)} className="px-3 py-1.5 bg-white border border-stone-200 text-primary text-[10px] font-bold rounded hover:bg-stone-100 transition-all">Chi tiết</button>
                </div>
              ))}
              {staffList.length === 0 && <p className="text-center text-stone-400 py-4 text-sm">Chưa có dữ liệu</p>}
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết / Sửa Nhân Viên */}
      {staffDetailModal.isOpen && (
        <div className="print:hidden fixed inset-0 bg-stone-900/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setStaffDetailModal({ isOpen: false, data: null, isEditing: false })} className="absolute top-5 right-5 text-stone-400 hover:text-stone-800"><span className="material-symbols-outlined">close</span></button>
            <h3 className="text-lg font-headline font-black text-primary mb-4 uppercase">{staffDetailModal.isEditing ? "Sửa hồ sơ" : "Thông tin chi tiết"}</h3>

            {staffDetailModal.isEditing ? (
              <form onSubmit={handleUpdateStaff} className="space-y-3">
                <div><label className="text-[9px] font-black uppercase text-stone-500 ml-1">Họ và tên</label><input required type="text" value={staffDetailModal.data.ten} className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-1 focus:ring-primary outline-none" onChange={e => setStaffDetailModal({...staffDetailModal, data: {...staffDetailModal.data, ten: e.target.value}})} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[9px] font-black uppercase text-stone-500 ml-1">Ngày sinh</label><input type="date" value={formatDateString(staffDetailModal.data.ngay_sinh) || ''} className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-1 focus:ring-primary outline-none" onChange={e => setStaffDetailModal({...staffDetailModal, data: {...staffDetailModal.data, ngay_sinh: e.target.value}})} /></div>
                  <div><label className="text-[9px] font-black uppercase text-stone-500 ml-1">SĐT</label><input required type="text" value={staffDetailModal.data.so_dien_thoai} className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-1 focus:ring-primary outline-none" onChange={e => setStaffDetailModal({...staffDetailModal, data: {...staffDetailModal.data, so_dien_thoai: e.target.value}})} /></div>
                </div>
                <div><label className="text-[9px] font-black uppercase text-stone-500 ml-1">Địa chỉ</label><input type="text" value={staffDetailModal.data.dia_chi || ''} className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-1 focus:ring-primary outline-none" onChange={e => setStaffDetailModal({...staffDetailModal, data: {...staffDetailModal.data, dia_chi: e.target.value}})} /></div>
                <div className="flex gap-2 mt-5">
                  <button type="button" onClick={() => setStaffDetailModal({...staffDetailModal, isEditing: false})} className="flex-1 py-2 font-bold text-xs text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg">HỦY</button>
                  <button type="submit" className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-md">LƯU CẬP NHẬT</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 border-b border-stone-100 pb-4">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-2xl uppercase">{staffDetailModal.data.ten.charAt(0)}</div>
                  <div><p className="font-bold text-stone-900">{staffDetailModal.data.ten}</p><p className="text-xs text-stone-500">Mã NV: #{staffDetailModal.data.ma_nhan_vien}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-y-3">
                  <div><p className="text-[9px] font-black uppercase text-stone-400">Số điện thoại</p><p className="text-sm font-medium text-stone-800 mt-0.5">{staffDetailModal.data.so_dien_thoai}</p></div>
                  <div><p className="text-[9px] font-black uppercase text-stone-400">Ngày sinh</p><p className="text-sm font-medium text-stone-800 mt-0.5">{formatDateString(staffDetailModal.data.ngay_sinh) ? formatDateString(staffDetailModal.data.ngay_sinh).split('-').reverse().join('/') : '---'}</p></div>
                  <div className="col-span-2"><p className="text-[9px] font-black uppercase text-stone-400">Địa chỉ</p><p className="text-sm font-medium text-stone-800 mt-0.5">{staffDetailModal.data.dia_chi || '---'}</p></div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button onClick={() => deleteStaff(staffDetailModal.data.ma_nhan_vien)} className="flex-1 py-2 text-xs font-bold text-error bg-error-container/30 hover:bg-error-container/60 rounded-lg transition-all flex justify-center items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">delete</span> XÓA NV</button>
                  <button onClick={() => setStaffDetailModal({...staffDetailModal, isEditing: true})} className="flex-1 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all flex justify-center items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">edit</span> SỬA</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Thêm Nhân Viên */}
      {isModalOpen && (
         <div className="print:hidden fixed inset-0 bg-stone-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
         <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
           <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-stone-400"><span className="material-symbols-outlined">close</span></button>
           <h3 className="text-lg font-headline font-black text-primary mb-4 uppercase">Thêm nhân viên mới</h3>
           <form onSubmit={handleAddStaff} className="space-y-3">
              <div><label className="text-[9px] font-black uppercase text-stone-500 ml-1">Họ và tên</label><input required type="text" value={formData.ten} className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-1 focus:ring-primary outline-none" onChange={e => setFormData({...formData, ten: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[9px] font-black uppercase text-stone-500 ml-1">Ngày sinh</label><input type="date" value={formData.ngay_sinh} className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-1 focus:ring-primary outline-none" onChange={e => setFormData({...formData, ngay_sinh: e.target.value})} /></div>
                <div><label className="text-[9px] font-black uppercase text-stone-500 ml-1">SĐT</label><input required type="text" value={formData.so_dien_thoai} className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-1 focus:ring-primary outline-none" onChange={e => setFormData({...formData, so_dien_thoai: e.target.value})} /></div>
              </div>
              <div><label className="text-[9px] font-black uppercase text-stone-500 ml-1">Địa chỉ</label><input type="text" value={formData.dia_chi} className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-1 focus:ring-primary outline-none" onChange={e => setFormData({...formData, dia_chi: e.target.value})} /></div>
              <button type="submit" className="w-full mt-5 py-2.5 bg-gradient-to-br from-[#553722] to-[#6f4e37] text-white text-xs font-bold rounded-lg shadow-md">LƯU HỒ SƠ</button>
           </form>
         </div>
       </div>
      )}

      {/* Modal Phân Ca */}
      {isAssignModalOpen && (
        <div className="print:hidden fixed inset-0 bg-stone-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
          <button onClick={() => setIsAssignModalOpen(false)} className="absolute top-5 right-5 text-stone-400"><span className="material-symbols-outlined">close</span></button>
          <h3 className="text-lg font-headline font-black text-primary mb-4 uppercase">Xếp ca làm việc</h3>
          <form onSubmit={handleAssignStaff} className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase text-stone-500 ml-1">Ngày làm việc</label>
              <input type="date" required className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-1 focus:ring-primary outline-none" value={assignForm.ngay} onChange={e => setAssignForm({...assignForm, ngay: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-stone-500 ml-1">Ca làm</label>
              <select required className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-1 focus:ring-primary outline-none" value={assignForm.ma_ca} onChange={e => setAssignForm({...assignForm, ma_ca: e.target.value})}>
                <option value="" disabled>-- Chọn ca --</option>
                {shiftsConfig.map(shift => (
                   <option key={shift.id} value={shift.id}>{shift.label} ({shift.time})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-stone-500 ml-1">Nhân viên</label>
              <select required className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-1 focus:ring-primary outline-none" value={assignForm.ma_nhan_vien} onChange={e => setAssignForm({...assignForm, ma_nhan_vien: e.target.value})}>
                <option value="" disabled>-- Chọn nhân viên --</option>
                {staffList.map(nv => <option key={nv.ma_nhan_vien} value={nv.ma_nhan_vien}>{nv.ten}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full mt-5 py-2.5 bg-gradient-to-br from-[#553722] to-[#6f4e37] text-white text-xs font-bold rounded-lg shadow-md">GÁN CA</button>
          </form>
        </div>
      </div>
      )}
    </div>
  );
};

export default NhanVien;