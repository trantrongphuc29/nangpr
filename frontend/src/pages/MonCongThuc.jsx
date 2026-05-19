import React, { useState, useEffect, useMemo } from 'react';
import * as monService from '../services/monService';
import * as nguyenlieuService from '../services/nguyenlieuService';

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'a')
    .replace(/È|É|Ẹ|Ẻ|Ã|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'e')
    .replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'i')
    .replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'o')
    .replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'u')
    .replace(/Ỳ|Ý|Y|Ỷ|Ỹ/g, 'y')
    .trim();
};

export default function MonCongThuc() {
  const [monList, setMonList] = useState([]);
  const [nguyenLieuList, setNguyenLieuList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  
  // Phân trang danh sách thực đơn
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State điều khiển ẩn/hiện Modal quản lý Món và Modal quản lý Công thức độc lập
  const [showMonModal, setShowMonModal] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  
  // Món hiện hành được chọn để nạp công thức
  const [activeMon, setActiveMon] = useState(null);

  // Khung Form lưu trữ thông tin cơ bản của món uống
  const [monForm, setMonForm] = useState({ ma_mon: null, ten_mon: '', gia_ban: '', ma_danh_muc: '', trang_thai_ban: 1, hinh_anh: null });
  
  // Khối đệm thêm nhanh nguyên liệu vào công thức
  const [tempIngredient, setTempIngredient] = useState({ ma_nguyen_lieu: '', dinh_luong: '' });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [dataMon, dataNL, dataCate] = await Promise.all([
        monService.getDanhSachMon(),
        nguyenlieuService.getNguyenLieu(),
        monService.getDanhMucMenu()
      ]);
      
      // ĐN ĐỒNG BỘ: Chuẩn hóa bọc an toàn mảng tránh lỗi null từ API
      setMonList(dataMon || []);
      setNguyenLieuList(dataNL || []);
      setCategories(dataCate || []);

      if (activeMon) {
        const updated = (dataMon || []).find(m => m.ma_mon === activeMon.ma_mon);
        if (updated) setActiveMon(updated);
      }
    } catch (err) {
      console.error("Lỗi đồng bộ kho dữ liệu thực đơn Nắng PR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAllData(); }, []);

  // ========================================================
  // 🍎 QUẢN LÝ MÓN (THÊM - SỬA - XÓA)
  // ========================================================
  const handleOpenCreateModal = () => {
    setMonForm({ ma_mon: null, ten_mon: '', gia_ban: '', ma_danh_muc: '', trang_thai_ban: 1, hinh_anh: null });
    setShowMonModal(true);
  };

  const handleOpenEditModal = (mon) => {
    setMonForm({
      ma_mon: mon.ma_mon,
      ten_mon: mon.ten_mon,
      gia_ban: mon.gia_ban ? parseInt(mon.gia_ban) : '',
      ma_danh_muc: mon.ma_danh_muc || '',
      trang_thai_ban: mon.trang_thai_ban,
      hinh_anh: mon.hinh_anh
    });
    setShowMonModal(true);
  };

  const handleSaveMon = async (e) => {
    e.preventDefault();
    try {
      if (monForm.ma_mon) {
        await monService.updateMonCu(monForm.ma_mon, monForm);
        alert("✨ Cập nhật thông tin món nước thành công!");
      } else {
        await monService.createMonMoi(monForm);
        alert("✅ Thêm món mới vào danh mục thành công!");
      }
      setShowMonModal(false);
      loadAllData();
    } catch (err) {
      alert("❌ Lỗi hệ thống khi lưu trữ món!");
    }
  };

  const handleDeleteMon = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn loại bỏ món nước này khỏi thực đơn?")) {
      try {
        await monService.deleteMonCu(id);
        alert("✅ Đã xóa món nước thành công!");
        if (activeMon && activeMon.ma_mon === id) {
          setActiveMon(null);
          setShowFormulaModal(false);
        }
        loadAllData();
      } catch (err) {
        alert("Lỗi khi xóa món!");
      }
    }
  };

  // ========================================================
  // 🧪 QUẢN LÝ CÔNG THỨC (LIÊN KẾT KHO VẬT TƯ)
  // ========================================================
  const handleOpenFormulaModal = (mon) => {
    setActiveMon(mon);
    setShowFormulaModal(true);
  };

  const handleAddIngredientToFormula = async () => {
    if (!tempIngredient.ma_nguyen_lieu || !tempIngredient.dinh_luong) {
      return alert("Vui lòng lựa chọn nguyên liệu và định lượng cần dùng!");
    }

    let formulaItems = [];
    if (activeMon && activeMon.chi_tiet_cong_thuc) {
      try {
        const rawFormula = typeof activeMon.chi_tiet_cong_thuc === 'string'
          ? JSON.parse(activeMon.chi_tiet_cong_thuc)
          : activeMon.chi_tiet_cong_thuc;
        formulaItems = Array.isArray(rawFormula) ? rawFormula.filter(item => item && item.ma_nguyen_lieu !== null) : [];
      } catch (e) {
        formulaItems = [];
      }
    }

    const selectedNL = nguyenLieuList.find(n => n.ma_nguyen_lieu === parseInt(tempIngredient.ma_nguyen_lieu));
    if (formulaItems.some(c => c.ma_nguyen_lieu === selectedNL.ma_nguyen_lieu)) {
      return alert("Nguyên liệu này đã được cấu hình trong công thức của món!");
    }

    const newFormula = [
      ...formulaItems,
      {
        ma_nguyen_lieu: selectedNL.ma_nguyen_lieu,
        dinh_luong: parseFloat(tempIngredient.dinh_luong),
        don_vi_tinh_chi_tiet: selectedNL.don_vi_nhap === 'kg' ? 'g' : 'ml'
      }
    ];

    try {
      await monService.updateMonCu(activeMon.ma_mon, {
        ten_mon: activeMon.ten_mon,
        gia_ban: activeMon.gia_ban,
        ma_danh_muc: activeMon.ma_danh_muc,
        trang_thai_ban: activeMon.trang_thai_ban,
        cong_thuc: newFormula
      });
      alert("✅ Đã cập nhật công thức thành công!");
      setTempIngredient({ ma_nguyen_lieu: '', dinh_luong: '' });
      await loadAllData();
    } catch (err) {
      alert("Lỗi hệ thống khi cập nhật công thức!");
    }
  };

  const handleRemoveIngredientFromFormula = async (maNL) => {
    if (!window.confirm("Xóa nguyên liệu này khỏi công thức món?")) return;

    let formulaItems = [];
    try {
      const rawFormula = typeof activeMon.chi_tiet_cong_thuc === 'string'
        ? JSON.parse(activeMon.chi_tiet_cong_thuc)
        : activeMon.chi_tiet_cong_thuc;
      formulaItems = Array.isArray(rawFormula) ? rawFormula.filter(item => item && item.ma_nguyen_lieu !== null) : [];
    } catch (e) {
      formulaItems = [];
    }

    const newFormula = formulaItems.filter(c => c.ma_nguyen_lieu !== maNL);

    try {
      await monService.updateMonCu(activeMon.ma_mon, {
        ten_mon: activeMon.ten_mon,
        gia_ban: activeMon.gia_ban,
        ma_danh_muc: activeMon.ma_danh_muc,
        trang_thai_ban: activeMon.trang_thai_ban,
        cong_thuc: newFormula
      });
      alert("🗑️ Đã gỡ bỏ thành phần khỏi công thức!");
      await loadAllData();
    } catch (err) {
      alert("Gặp lỗi khi lưu công thức mới!");
    }
  };

  // --- BỘ LỌC TÌM KIẾM THEO DANH MỤC TABS VÀ TÊN KHÔNG DẤU ---
  const filteredMonList = useMemo(() => {
    if (!Array.isArray(monList)) return [];
    let result = [...monList];

    // Lọc theo Tabs danh mục món ăn
    if (selectedCategory !== 'Tất cả') {
      result = result.filter(m => m && m.ten_danh_muc === selectedCategory);
    }

    // Lọc theo ký tự tìm kiếm không dấu
    if (searchTerm.trim() !== '') {
      const searchClean = removeVietnameseTones(searchTerm);
      result = result.filter(m => m && removeVietnameseTones(m.ten_mon || '').includes(searchClean));
    }

    return result;
  }, [monList, selectedCategory, searchTerm]);

  // ĐÃ SỬA VÁ LỖI AN TOÀN: Bọc kiểm tra mảng tránh sập giao diện khi đếm số ly Hero Banner
  const statsCounters = useMemo(() => {
    const counts = { total: filteredMonList.length, cafe: 0, tra: 0, nuocngot: 0 };
    filteredMonList.forEach(m => {
      if (m && m.ten_danh_muc) {
        const textLower = m.ten_danh_muc.toLowerCase();
        if (textLower.includes('café') || textLower.includes('cafe')) counts.cafe += 1;
        else if (textLower.includes('trà') || textLower.includes('sữa chua') || textLower.includes('latte')) counts.tra += 1;
        else counts.nuocngot += 1;
      }
    });
    return counts;
  }, [filteredMonList]);

  const paginatedMonList = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return filteredMonList.slice(offset, offset + itemsPerPage);
  }, [filteredMonList, currentPage]);

  const totalPages = Math.ceil(filteredMonList.length / itemsPerPage) || 1;

  if (loading) return <div className="p-20 text-center font-bold text-primary animate-pulse tracking-widest uppercase text-xs">Đang đồng bộ thực đơn Nắng PR...</div>;

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER BANNER TOP APP BAR */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full pb-6 border-b gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Thực đơn Atelier</h2>
          <p className="text-on-surface-variant text-sm font-medium">Quản lý danh sách món ăn và đồ uống của Atelier Nắng PR</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none group">
            <span className="absolute inset-y-0 left-3 flex items-center text-muted">
              <span className="material-symbols-outlined text-xl">search</span>
            </span>
            <input 
              className="pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary/40 transition-all" 
              placeholder="Tìm kiếm món nước uống..." 
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button onClick={handleOpenCreateModal} className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all">
            <span className="material-symbols-outlined">add</span>
            <span>Thêm món mới</span>
          </button>
        </div>
      </header>

      {/* HERO BANNER TÓM TẮT TRỰC QUAN THEO MẪU MỚI */}
      <div className="p-8 rounded-xl bg-tertiary-container/20 flex flex-col md:flex-row items-start md:items-center justify-between border border-tertiary-container/20 gap-6">
        <div className="space-y-1">
          <p className="text-on-tertiary-container font-bold uppercase tracking-widest text-[10px]">Tóm tắt thực đơn</p>
          <h3 className="text-3xl font-extrabold text-on-tertiary-container">{statsCounters.total} Món Khả Dụng</h3>
          <p className="text-on-tertiary-container/80 text-sm">Hệ thống phân rã định lượng kho tự động</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="stat-chip min-w-[110px] flex-1 sm:flex-none">
            <span className="block text-xs font-bold text-on-surface-variant mb-1">CAFÉ</span>
            <span className="text-2xl font-extrabold text-primary">{statsCounters.cafe}</span>
          </div>
          <div className="stat-chip min-w-[110px] flex-1 sm:flex-none">
            <span className="block text-xs font-bold text-on-surface-variant mb-1">TRÀ/LATTE</span>
            <span className="text-2xl font-extrabold text-primary">{statsCounters.tra}</span>
          </div>
          <div className="stat-chip min-w-[110px] flex-1 sm:flex-none">
            <span className="block text-xs font-bold text-on-surface-variant mb-1">NƯỚC NGỌT/SODA</span>
            <span className="text-2xl font-extrabold text-primary">{statsCounters.nuocngot}</span>
          </div>
        </div>
      </div>

      {/* TRÌNH CUỘN DANH MỤC TABS ASYMMETRIC */}
      <div className="flex items-center gap-6 overflow-x-auto pb-2 border-b border-outline whitespace-nowrap custom-scrollbar">
        {['Tất cả', ...categories.map(c => c.ten_danh_muc)].map((tabName) => (
          <button 
            key={tabName}
            onClick={() => { setSelectedCategory(tabName); setCurrentPage(1); }}
            className={`pb-2 px-1 font-headline text-sm transition-all duration-200 ${selectedCategory === tabName ? 'text-primary font-bold border-b-2 border-primary scale-105' : 'text-on-surface-variant font-medium hover:text-primary'}`}
          >
            {tabName}
          </button>
        ))}
      </div>

      {/* DANH SÁCH CÁC DÒNG SẢN PHẨM HÀNG NGANG CHUYÊN NGHIỆP */}
      <div className="grid grid-cols-1 gap-3">
        {paginatedMonList.map((mon) => {
          if (!mon) return null;
          
          // Kiểm tra số lượng công thức an toàn
          let formulaCount = 0;
          try {
            const rawFormula = typeof mon.chi_tiet_cong_thuc === 'string'
              ? JSON.parse(mon.chi_tiet_cong_thuc)
              : mon.chi_tiet_cong_thuc;
            if (Array.isArray(rawFormula)) {
              formulaCount = rawFormula.filter(item => item && item.ma_nguyen_lieu !== null).length;
            }
          } catch (e) {
            formulaCount = 0;
          }

          const hasFormula = formulaCount > 0;

          return (
            <div key={mon.ma_mon} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-surface-container-low border border-outline transition-all duration-300 shadow-sm hover:shadow-md gap-4">
              <div className="flex items-center gap-5 flex-1">
                <div className="w-16 h-16 rounded-lg bg-surface-container border flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {mon.ten_danh_muc?.includes('Café') ? '☕' : mon.ten_danh_muc?.includes('Soda') ? '🍹' : '🥤'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">{mon.ten_danh_muc || 'Chưa phân nhóm'}</span>
                    
                    {/* KHỐI HIỂN THỊ TRẠNG THÁI ẨN/HIỆN ĐỘNG BẢO VỆ ĐƠN HÀNG */}
                    {!hasFormula && (
                      <span className="badge-error">Ẩn - Thiếu công thức</span>
                    )}
                  </div>
                  <h4 className="text-lg font-extrabold text-primary group-hover:text-secondary transition-colors uppercase tracking-tight mt-1">{mon.ten_mon}</h4>
                  
                  <p className="text-xs font-bold text-muted mt-0.5 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${hasFormula && mon.so_luong_co_the_lam > 0 ? 'bg-success' : 'bg-warning'}`}></span>
                    {hasFormula ? `Quầy bar ước lượng làm được: ${mon.so_luong_co_the_lam} ly` : 'Cần bổ sung cấu hình vật tư trước khi mở bán'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-8 border-t sm:border-none pt-3 sm:pt-0 border-dashed">
                <div className="text-left sm:text-right">
                  <span className="block text-[10px] font-black text-muted uppercase tracking-wider">Đơn giá</span>
                  <span className="text-lg font-black text-primary tracking-tight">{Number(mon.gia_ban).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenFormulaModal(mon)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${hasFormula ? 'bg-[var(--color-input-bg)] text-primary hover:bg-primary hover:text-on-primary' : 'badge-error hover:bg-error hover:text-white border-0'}`}>
                    <span className="material-symbols-outlined text-base">menu_book</span>
                    <span>Công thức</span>
                  </button>
                  <button onClick={() => handleOpenEditModal(mon)} className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-primary bg-surface-container-high border border-outline rounded-lg hover:bg-primary hover:text-on-primary transition-all">
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button onClick={() => handleDeleteMon(mon.ma_mon)} className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-error bg-error-container rounded-lg hover:bg-error hover:text-on-error transition-all">
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMonList.length === 0 && (
          <div className="py-16 text-center text-muted font-black uppercase tracking-widest text-xs animate-pulse">Không tìm thấy món nước uống nào khớp tiêu chí...</div>
        )}
      </div>

      {/* KHỐI ĐIỀU HƯỚNG PHÂN TRANG ĐỒNG BỘ */}
      {filteredMonList.length > itemsPerPage && (
        <div className="px-6 py-4 flex justify-between items-center text-xs font-bold text-muted">
          <span>Trang {currentPage} / {totalPages} ({filteredMonList.length} món)</span>
          <div className="flex gap-1">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-input-bg)] text-primary disabled:opacity-30"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${currentPage === i + 1 ? 'bg-primary text-white font-black shadow-sm' : 'hover:bg-[var(--color-input-bg)] text-stone-600'}`}>{i + 1}</button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-input-bg)] text-primary disabled:opacity-30"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </div>
      )}

      {/* Popup 1: MODAL DIALOG THÊM / SỬA THÔNG TIN MÓN */}
      {showMonModal && (
        <div className="modal-overlay animate-in fade-in duration-200">
          <div className="modal-panel max-w-md p-8 rounded-[2.5rem]">
            <h4 className="text-xl font-black text-primary uppercase italic mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">local_cafe</span>
              {monForm.ma_mon ? 'Cập nhật thông tin món' : 'Khai báo món nước mới'}
            </h4>
            <form onSubmit={handleSaveMon} className="space-y-4 text-xs text-slate-700 dark:text-zinc-300">
              <div className="space-y-1">
                <label className="block font-bold uppercase text-muted">Tên món uống</label>
                <input type="text" className="w-full bg-[var(--color-input-bg)] border-none p-3.5 rounded-xl font-bold text-sm text-on-surface" value={monForm.ten_mon} onChange={e => setMonForm({ ...monForm, ten_mon: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold uppercase text-muted">Giá bán lẻ (đ)</label>
                  <input type="number" className="w-full bg-[var(--color-input-bg)] border-none p-3.5 rounded-xl font-bold text-sm text-on-surface" value={monForm.gia_ban} onChange={e => setMonForm({ ...monForm, gia_ban: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold uppercase text-muted">Nhóm danh mục</label>
                  <select className="w-full bg-[var(--color-input-bg)] border-none p-3.5 rounded-xl font-bold text-sm text-on-surface appearance-none" value={monForm.ma_danh_muc} onChange={e => setMonForm({ ...monForm, ma_danh_muc: e.target.value })} required>
                    <option value="">-- Lựa chọn --</option>
                    {categories.map(c => <option key={c.ma_danh_muc} value={c.ma_danh_muc}>{c.ten_danh_muc}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block font-bold uppercase text-muted">Trạng thái phục vụ</label>
                <select className="w-full bg-[var(--color-input-bg)] border-none p-3.5 rounded-xl font-bold text-sm text-on-surface appearance-none" value={monForm.trang_thai_ban} onChange={e => setMonForm({ ...monForm, trang_thai_ban: parseInt(e.target.value) })}>
                  <option value={1}>Đang bán</option>
                  <option value={0}>Tạm ngưng</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setShowMonModal(false)} className="flex-1 font-bold uppercase text-[10px] text-muted">Hủy bỏ</button>
                <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-xl font-black uppercase text-[11px] shadow-lg">Xác nhận Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup 2: MODAL POPUP CẤU HÌNH CÔNG THỨC */}
      {showFormulaModal && activeMon && (
        <div className="modal-overlay animate-in fade-in duration-200">
          <div className="modal-panel max-w-xl p-8 rounded-[2.5rem] flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-start border-b pb-4 mb-4 shrink-0">
              <div>
                <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">ID món: #{activeMon.ma_mon}</span>
                <h4 className="text-xl font-black text-stone-800 dark:text-zinc-100 uppercase tracking-tight mt-1">Định mức công thức: {activeMon.ten_mon}</h4>
              </div>
              <button onClick={() => { setShowFormulaModal(false); setActiveMon(null); }} className="w-8 h-8 rounded-full bg-[var(--color-input-bg)] dark:bg-zinc-800 flex items-center justify-center text-muted hover:text-stone-600"><span className="material-symbols-outlined text-base">close</span></button>
            </div>

            {/* Ô thêm nguyên liệu liên kết động */}
            <div className="flex gap-2 items-end text-xs mb-4 bg-[var(--color-input-bg)]/40 p-3 rounded-xl border border-dashed shrink-0">
              <div className="flex-1">
                <label className="text-[9px] font-black uppercase text-muted dark:text-zinc-500 ml-0.5">Chọn vật tư nguyên liệu</label>
                <select className="w-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg p-2.5 font-bold text-sm text-on-surface mt-1" value={tempIngredient.ma_nguyen_lieu} onChange={e => setTempIngredient({...tempIngredient, ma_nguyen_lieu: e.target.value})}>
                  <option value="">-- Chọn mặt hàng kho --</option>
                  {nguyenLieuList.map(n => <option key={n.ma_nguyen_lieu} value={n.ma_nguyen_lieu}>{n.ten_nguyen_lieu} ({n.don_vi_nhap === 'kg' ? 'g' : 'ml'})</option>)}
                </select>
              </div>
              <div className="w-28">
                <label className="text-[9px] font-black uppercase text-muted dark:text-zinc-500 ml-0.5">Định lượng cần</label>
                <input type="number" placeholder="Số ml/g..." className="w-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg p-2.5 font-bold text-sm text-on-surface mt-1" value={tempIngredient.dinh_luong} onChange={e => setTempIngredient({...tempIngredient, dinh_luong: e.target.value})}/>
              </div>
              <button type="button" onClick={handleAddIngredientToFormula} className="bg-primary text-white py-2.5 px-4 rounded-lg font-black uppercase text-[10px] tracking-wider h-[40px] shadow-sm">Gắn vào</button>
            </div>

            {/* Bảng liệt kê thành phần công thức con */}
            <div className="overflow-y-auto flex-1 border rounded-xl shadow-inner bg-white dark:bg-zinc-950">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[var(--color-input-bg)] text-stone-500 font-black uppercase border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-3 pl-4">Thành phần chi tiết</th>
                    <th className="p-3 text-center">Định lượng tiêu hao</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-bold text-stone-700 dark:text-zinc-300">
                  {(() => {
                    let formulaItems = [];
                    if (activeMon && activeMon.chi_tiet_cong_thuc) {
                      try {
                        const rawFormula = typeof activeMon.chi_tiet_cong_thuc === 'string'
                          ? JSON.parse(activeMon.chi_tiet_cong_thuc)
                          : activeMon.chi_tiet_cong_thuc;
                        formulaItems = Array.isArray(rawFormula) ? rawFormula.filter(item => item && item.ma_nguyen_lieu !== null) : [];
                      } catch (e) { formulaItems = []; }
                    }
                    
                    if (formulaItems.length === 0) {
                      return <tr><td colSpan="3" className="p-6 text-center text-muted font-bold uppercase tracking-widest text-[10px] py-12 animate-pulse">Món nước này chưa cấu hình công thức pha chế!</td></tr>;
                    }

                    return formulaItems.map((item, index) => (
                      <tr key={index} className="hover:bg-stone-50/40 transition-colors">
                        <td className="p-3 pl-4 uppercase text-stone-600 dark:text-zinc-400">{item.ten_nguyen_lieu}</td>
                        {/* ĐGroup SỬA ĐỒNG BỘ: Đổi sang don_vi_tinh_chi_tiet cho khớp khít câu SELECT Backend */}
                        <td className="p-3 text-center text-primary font-black text-sm">{item.dinh_luong} {item.don_vi_tinh_chi_tiet}</td>
                        <td className="p-3 text-right pr-4"><button type="button" onClick={() => handleRemoveIngredientFromFormula(item.ma_nguyen_lieu)} className="text-red-500 hover:underline font-black uppercase text-[10px]">Gỡ bỏ</button></td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}