import React, { useState, useEffect, useMemo } from 'react';
import * as nlService from '../services/nguyenlieuService';

// ĐÃ FIX SCOPE: Đưa hàm chuẩn hóa chữ ra ngoài cùng để toàn bộ file dùng chung tự do
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

export default function NguyenLieu() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCrudModal, setShowCrudModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [timeTab, setTimeTab] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sortConfig, setSortConfig] = useState({ key: 'ten_nguyen_lieu', direction: 'asc' });
  const [formData, setFormData] = useState({ ma_nguyen_lieu: '', so_luong: '', gia_nhap: '', nha_cung_cap: '' });
  
  // State quản lý form: sử dụng don_vi_nhap và dung_tich_san_pham
  const [crudData, setCrudData] = useState({ ma_nguyen_lieu: null, ten_nguyen_lieu: '', don_vi_nhap: 'kg', dung_tich_san_pham: 1000, nguong_canh_bao: 1000 });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await nlService.getNguyenLieu();
      const histData = await nlService.getImportHistory();
      setList(data);
      setHistory(histData);
    } catch (err) { 
      console.error("Lỗi khi tải dữ liệu:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadData(); }, []);

  const openHistoryModal = async () => {
    try {
      const data = await nlService.getImportHistory();
      setHistory(data);
      setShowHistory(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Tính toán gộp chi phí động theo bảng lịch chọn ngày
  const dynamicFilteredCost = useMemo(() => {
    if (!history.length) return 0;
    
    return history.reduce((sum, record) => {
      const recordDateStr = new Date(record.ngay_nhap).toISOString().split('T')[0];
      const recordDate = new Date(record.ngay_nhap);
      const targetDate = new Date(selectedDate);

      if (timeTab === 'day') {
        return recordDateStr === selectedDate ? sum + Number(record.tong_tien) : sum;
      }
      if (timeTab === 'month') {
        return (recordDate.getMonth() === targetDate.getMonth() && recordDate.getFullYear() === targetDate.getFullYear()) 
          ? sum + Number(record.tong_tien) : sum;
      }
      if (timeTab === 'year') {
        return recordDate.getFullYear() === targetDate.getFullYear() ? sum + Number(record.tong_tien) : sum;
      }
      
      const getWeekNumber = (d) => {
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
      };
      
      return (getWeekNumber(recordDate) === getWeekNumber(targetDate) && recordDate.getFullYear() === targetDate.getFullYear())
        ? sum + Number(record.tong_tien) : sum;
    }, 0);
  }, [history, timeTab, selectedDate]);

  // Cảnh báo dựa trên ml_thuc_te_ton (tổng kho gốc) và nguong_canh_bao
  const listWithWarning = useMemo(() => {
    return list.map(item => ({
      ...item,
      isWarningNow: Number(item.ml_thuc_te_ton || item.so_luong_ton || 0) <= Number(item.nguong_canh_bao)
    }));
  }, [list]);

  const warningList = listWithWarning.filter(item => item.isWarningNow);

  // --- LOGIC TÌM KIẾM ĐA NĂNG DANH SÁCH CHÍNH ---
  const filteredList = useMemo(() => {
    const searchClean = removeVietnameseTones(searchTerm);
    return listWithWarning.filter(item => {
      const tenNguyenLieuClean = removeVietnameseTones(item.ten_nguyen_lieu);
      return tenNguyenLieuClean.includes(searchClean);
    });
  }, [listWithWarning, searchTerm]);

  const sortedList = useMemo(() => {
    let sortableItems = [...filteredList];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const keyMap = sortConfig.key === 'so_luong_ton' ? (a.ml_thuc_te_ton ? 'ml_thuc_te_ton' : 'so_luong_ton') : sortConfig.key;
        let aValue = a[keyMap];
        let bValue = b[keyMap];
        if (keyMap === 'ml_thuc_te_ton' || keyMap === 'so_luong_ton' || keyMap === 'nguong_canh_bao') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        aValue = aValue?.toString().toLowerCase();
        bValue = bValue?.toString().toLowerCase();
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredList, sortConfig]);

  // Hàm hiển thị phân rã số chai/lon/hộp lẻ thông minh từ ml tồn gốc
  const renderThucTeTon = (ml_ton, dung_tich, dv_nhap) => {
    const ton = parseFloat(ml_ton || 0);
    const dt = parseFloat(dung_tich || 1);
    if (dv_nhap === 'kg') {
      return `${(ton / 1000).toFixed(2)} kg`;
    }
    const so_nguyen = Math.floor(ton / dt);
    const so_du = ton % dt;
    if (so_nguyen === 0) return `${so_du} ml`;
    return `${so_nguyen} ${dv_nhap} ${so_du > 0 ? `& ${so_du} ml` : ''}`;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return 'unfold_more';
    return sortConfig.direction === 'asc' ? 'expand_less' : 'expand_more';
  };

  const totalCost = (Number(formData.so_luong) || 0) * (Number(formData.gia_nhap) || 0);

  const handleConfirmImport = async (e) => {
    e.preventDefault();
    try {
      await nlService.importStock({
        items: [{ ma_nguyen_lieu: parseInt(formData.ma_nguyen_lieu), so_luong: parseFloat(formData.so_luong), gia_nhap: parseFloat(formData.gia_nhap) }],
        nha_cung_cap: formData.nha_cung_cap || 'Đại lý tự do',
        ghi_chu: `Nhập kho hệ thống`
      });
      alert("✅ Nhập kho thành công!");
      setFormData({ ma_nguyen_lieu: '', so_luong: '', gia_nhap: '', nha_cung_cap: '' });
      loadData();
    } catch (err) { 
      alert("Lỗi nhập hàng: " + err.message); 
    }
  };

  const handleSaveCategory = async () => {
    if (!crudData.ten_nguyen_lieu) return alert("Vui lòng điền tên nguyên liệu!");
    try {
      const payload = { 
        ten_nguyen_lieu: crudData.ten_nguyen_lieu,
        don_vi_nhap: crudData.don_vi_nhap,
        dung_tich_san_pham: parseFloat(crudData.dung_tich_san_pham || 1),
        nguong_canh_bao: parseFloat(crudData.nguong_canh_bao || 0)
      };

      if (crudData.ma_nguyen_lieu) {
        const cleanId = parseInt(crudData.ma_nguyen_lieu);
        await nlService.updateNguyenLieu(cleanId, payload);
        alert("✨ Cập nhật thành công!");
      } else {
        await nlService.createNguyenLieu(payload);
        alert("✅ Thêm nguyên liệu thành công!");
      }
      
      setShowCrudModal(false);
      await loadData();
    } catch (err) { 
      console.error(err);
      alert("❌ Lỗi lưu dữ liệu! Kiểm tra cấu trúc API."); 
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm("Xóa mặt hàng này khỏi danh mục?")) {
      try {
        await nlService.deleteNguyenLieu(id);
        await loadData();
        alert("✅ Đã xóa mặt hàng!");
      } catch (err) { 
        alert("Lỗi khi xóa: " + err.message); 
      }
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-primary animate-pulse tracking-widest uppercase text-xs">Đang đồng bộ dữ liệu kho Nắng PR...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen text-slate-800 dark:text-zinc-100 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* 📊 KHỐI TỔNG HỢP CHI PHÍ THÔNG MINH */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 p-6 rounded-[2.5rem] shadow-xl flex flex-col lg:flex-row gap-6 justify-between items-stretch lg:items-center transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1 max-w-3xl">
          <div className="space-y-2 w-full sm:w-auto min-w-[240px]">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-wider text-[10px] opacity-80">
              <span className="material-symbols-outlined text-sm">filter_alt</span> Tiêu chí gộp chi phí
            </div>
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200/20 shadow-inner">
              {[
                { id: 'day', text: 'Ngày' },
                { id: 'week', text: 'Tuần' },
                { id: 'month', text: 'Tháng' },
                { id: 'year', text: 'Năm' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  type="button"
                  onClick={() => setTimeTab(tab.id)} 
                  className={`flex-1 py-2 px-3 text-center rounded-xl font-black text-[11px] uppercase transition-all duration-200 ${
                    timeTab === tab.id 
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105' 
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  {tab.text}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 w-full sm:w-auto flex-1 max-w-xs">
            <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 font-black uppercase tracking-wider text-[10px]">
              <span className="material-symbols-outlined text-sm">calendar_month</span> Mốc thời gian tra cứu
            </div>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800/80 text-sm font-bold p-3 rounded-2xl border border-slate-200/60 dark:border-zinc-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="relative overflow-hidden p-6 rounded-[2rem] border bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border-primary/20 text-primary min-w-[280px] lg:w-80 flex flex-col justify-center shadow-inner group hover:border-primary/40 transition-all duration-300">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all duration-300"></div>
          
          <p className="text-[10px] uppercase font-black tracking-widest opacity-80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Tổng chi tiêu theo {timeTab === 'day' ? 'Ngày' : timeTab === 'week' ? 'Tuần' : timeTab === 'month' ? 'Tháng' : 'Năm'}
          </p>
          
          <p className="text-3xl md:text-4xl font-black mt-2 tracking-tighter text-primary flex items-baseline gap-0.5 animate-in fade-in zoom-in-95 duration-300">
            {dynamicFilteredCost.toLocaleString('vi-VN')}
            <span className="text-sm font-black opacity-70 ml-0.5">đ</span>
          </p>
        </div>
      </section>

      {/* ⚠️ BANNER THÔNG BÁO TỔNG QUAN */}
      {warningList.length > 0 && (
        <div className="bg-gradient-to-r from-red-500/10 via-red-500/[0.04] to-transparent border border-red-500/30 text-red-600 dark:text-red-400 p-5 md:p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-red-500 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-red-500/20">
              <span className="material-symbols-outlined text-xl animate-pulse">warning</span>
            </div>
            <div>
              <h4 className="font-black uppercase text-sm md:text-base tracking-tight">
                Tồn kho thấp!
              </h4>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest hidden md:block">
                Cần nhập kho gấp
              </p>
            </div>
          </div>
          <div className="hidden md:block w-[1px] h-8 bg-red-500/20 self-center shrink-0 mx-2"></div>
          <div className="flex-1 w-full">
            <div className="flex flex-wrap gap-2 items-center">
              {warningList.map((item, idx) => {
                const totalVolume = item.ml_thuc_te_ton || item.so_luong_ton || 0;
                return (
                  <div 
                    key={item.ma_nguyen_lieu || idx} 
                    className="flex items-center gap-2 bg-white dark:bg-zinc-900/80 border border-red-500/20 hover:border-red-500/40 p-1.5 pl-3 pr-2.5 rounded-xl shadow-sm transition-all duration-200 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 group-hover:scale-125 transition-transform"></span>
                    <p className="font-black text-xs text-slate-700 dark:text-zinc-200 uppercase tracking-tight">
                      {item.ten_nguyen_lieu}
                    </p>
                    <span className="text-[10px] font-black tracking-tighter bg-red-500/10 text-red-600 px-2 py-0.5 rounded-lg shrink-0">
                      Còn: {totalVolume} {item.don_vi_nhap === 'kg' ? 'g' : 'ml'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. TIỆN ÍCH TÌM KIẾM ĐA NĂNG & HÀNH ĐỘNG */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-200/50 dark:border-zinc-800 shadow-sm transition-all duration-300">
        <div className="relative flex-1 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm không dấu hoặc có dấu (VD: 'ca phe rob', 'sua dac')..." 
            className="w-full bg-slate-100 dark:bg-zinc-800 text-sm py-4 pl-12 pr-4 rounded-2xl border-none font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/40 shadow-inner transition-all"
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            type="button"
            onClick={() => { setCrudData({ ma_nguyen_lieu: null, ten_nguyen_lieu: '', don_vi_nhap: 'kg', dung_tich_san_pham: 1000, nguong_canh_bao: 1000 }); setShowCrudModal(true); }} 
            className="bg-primary text-white py-4 px-6 rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-md shadow-primary/10 hover:opacity-90 active:scale-95 transition-all flex-1 sm:flex-none"
          >
            Thêm mặt hàng
          </button>
          <button 
            type="button"
            onClick={openHistoryModal} 
            className="bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 py-4 px-6 rounded-2xl font-black text-[11px] uppercase tracking-wider hover:opacity-80 transition-all border border-slate-300/40 dark:border-zinc-700 flex-1 sm:flex-none"
          >
            Xem lịch sử
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 4. BẢNG DANH SÁCH */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/40 rounded-[2.5rem] shadow-xl border border-slate-200/60 dark:border-zinc-800/80 overflow-hidden backdrop-blur-lg">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-zinc-800/40 text-primary text-[10px] font-black uppercase border-b border-slate-200/60 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-6 cursor-pointer hover:text-primary transition-colors" onClick={() => requestSort('ten_nguyen_lieu')}>
                  <div className="flex items-center gap-2">Nguyên liệu <span className="material-symbols-outlined text-lg">{getSortIcon('ten_nguyen_lieu')}</span></div>
                </th>
                {/* ĐÃ TÁCH CỘT 1: Hiện số lượng bao bì đóng gói lẻ */}
                <th className="px-4 py-6 text-center cursor-pointer hover:text-primary transition-colors" onClick={() => requestSort('so_luong_ton')}>
                   <div className="flex items-center justify-center gap-2">Tồn bao bì thực tế <span className="material-symbols-outlined text-lg">{getSortIcon('so_luong_ton')}</span></div>
                </th>
                {/* ĐÃ THÊM CỘT 2: Hiện nguyên số tồn gốc ml hoặc g */}
                <th className="px-4 py-6 text-center text-primary bg-primary/5 dark:bg-primary/10 border-x border-slate-200/40 dark:border-zinc-800">
                   <div className="flex items-center justify-center gap-2">Tổng dung tích (ml/g)</div>
                </th>
                <th className="px-4 py-6 text-center cursor-pointer text-red-500" onClick={() => requestSort('nguong_canh_bao')}>
                   <div className="flex items-center justify-center gap-2">Ngưỡng tối thiểu (ml/g) <span className="material-symbols-outlined text-lg">{getSortIcon('nguong_canh_bao')}</span></div>
                </th>
                <th className="px-4 py-6 text-center text-slate-400 dark:text-zinc-500">Đơn vị đóng gói</th>
                <th className="px-6 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {sortedList.map((item) => {
                const totalVolume = item.ml_thuc_te_ton || item.so_luong_ton || 0;
                const packagingUnit = item.don_vi_nhap || item.don_vi_tinh || 'kg';
                const capacity = item.dung_tich_san_pham || 1000;

                return (
                  <tr key={item.ma_nguyen_lieu} className={`group transition-all ${item.isWarningNow ? 'bg-red-500/5 dark:bg-red-950/20' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/20'}`}>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        {item.isWarningNow && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0"></span>}
                        <div>
                          <p className={`font-bold text-sm uppercase ${item.isWarningNow ? 'text-red-500 font-black' : 'text-slate-700 dark:text-zinc-200'}`}>{item.ten_nguyen_lieu}</p>
                          {/* HIỂN THỊ DUNG TÍCH GỐC DƯỚI TÊN MÓN THEO YÊU CẦU */}
                          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 mt-0.5">
                            Dung tích 1 {packagingUnit}: {capacity} {packagingUnit === 'kg' ? 'g' : 'ml'}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Cột 1: Hiển thị số chai/lon nguyên lẻ */}
                    <td className={`px-4 py-6 text-center font-black text-sm tracking-tighter ${item.isWarningNow ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-zinc-300'}`}>
                      {renderThucTeTon(totalVolume, capacity, packagingUnit)}
                    </td>
                    {/* Cột 2: Đã bổ sung - Hiển thị thuần số ml tồn gốc để đối chiếu công thức */}
                    <td className="px-4 py-6 text-center font-black text-sm text-primary bg-primary/5 dark:bg-primary/10 border-x border-slate-200/40 dark:border-zinc-800">
                      {totalVolume} {packagingUnit === 'kg' ? 'g' : 'ml'}
                    </td>
                    <td className="px-4 py-6 text-center font-black text-sm text-red-500/80 dark:text-red-400">
                      {item.nguong_canh_bao}
                    </td>
                    <td className="px-4 py-6 text-center text-[11px] font-black opacity-50 uppercase text-slate-500 dark:text-zinc-400">{packagingUnit}</td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setCrudData({ ...item, don_vi_nhap: packagingUnit, dung_tich_san_pham: capacity }); setShowCrudModal(true); }} className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white"><span className="material-symbols-outlined text-base">edit</span></button>
                        <button onClick={() => deleteItem(item.ma_nguyen_lieu)} className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 dark:hover:bg-red-500 hover:text-white"><span className="material-symbols-outlined text-base">delete</span></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5. FORM NHẬP KHO */}
        <div className="bg-white dark:bg-zinc-900/60 rounded-[2.5rem] p-8 shadow-xl border border-slate-200/60 dark:border-zinc-800 h-fit sticky top-8 backdrop-blur-xl">
          <h4 className="text-xl font-black text-primary uppercase italic mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined">add_shopping_cart</span> Nhập hàng
          </h4>
          <form onSubmit={handleConfirmImport} className="space-y-5">
            <div>
              <select className="w-full bg-slate-100 dark:bg-zinc-800 border-none text-slate-800 dark:text-white p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 appearance-none" value={formData.ma_nguyen_lieu || ''} onChange={(e) => setFormData({...formData, ma_nguyen_lieu: e.target.value})} required>
                <option value="">-- Chọn mặt hàng nhập --</option>
                {list.map(nl => <option key={nl.ma_nguyen_lieu} value={nl.ma_nguyen_lieu}>{nl.ten_nguyen_lieu} (Đóng gói: {nl.don_vi_nhap || nl.don_vi_tinh || 'kg'})</option>)}
              </select>
            </div>
            <div>
              <input className="w-full bg-slate-100 dark:bg-zinc-800 border-none text-slate-800 dark:text-white p-4 rounded-2xl text-sm font-bold" placeholder="Nhà cung cấp phiếu này" type="text" value={formData.nha_cung_cap || ''} onChange={(e) => setFormData({...formData, nha_cung_cap: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input className="w-full bg-slate-100 dark:bg-zinc-800 border-none text-slate-800 dark:text-white p-4 rounded-2xl text-sm font-bold" placeholder="Số lượng" type="number" step="0.01" value={formData.so_luong || ''} onChange={(e) => setFormData({...formData, so_luong: e.target.value})} required />
              <input className="w-full bg-slate-100 dark:bg-zinc-800 border-none text-slate-800 dark:text-white p-4 rounded-2xl text-sm font-bold" placeholder="Giá nhập" type="number" value={formData.gia_nhap || ''} onChange={(e) => setFormData({...formData, gia_nhap: e.target.value})} required />
            </div>
            <div className="p-6 bg-slate-50 dark:bg-zinc-800/40 rounded-[2rem] flex justify-between items-center text-primary border border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase opacity-50 text-slate-500 dark:text-zinc-400">Thành tiền</span>
              <span className="text-2xl font-black tracking-tighter">{totalCost.toLocaleString('vi-VN')}đ</span>
            </div>
            <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase text-[11px] shadow-xl">Xác nhận nhập kho</button>
          </form>
        </div>
      </div>

      {/* --- DIALOG MODAL THÊM / SỬA --- */}
      {showCrudModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-zinc-800">
             <h4 className="text-2xl font-black text-primary uppercase italic mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl">inventory_2</span>
                {crudData.ma_nguyen_lieu ? 'Sửa mặt hàng' : 'Thêm hàng mới'}
             </h4>
             <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black opacity-40 uppercase ml-1 text-slate-500 dark:text-zinc-400">Tên nguyên liệu</label>
                  <input className="w-full bg-slate-100 dark:bg-zinc-800 border-none text-slate-800 dark:text-white p-4 rounded-2xl font-bold" value={crudData.ten_nguyen_lieu || ''} onChange={e => setCrudData({...crudData, ten_nguyen_lieu: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black opacity-40 uppercase ml-1 text-slate-500 dark:text-zinc-400">Đơn vị nhập</label>
                  <select className="w-full bg-slate-100 dark:bg-zinc-800 border-none text-slate-800 dark:text-white p-4 rounded-2xl font-bold appearance-none" value={crudData.don_vi_nhap || crudData.don_vi_tinh || 'kg'} onChange={e => {
                    const dv = e.target.value;
                    setCrudData({...crudData, don_vi_nhap: dv, don_vi_tinh: dv, dung_tich_san_pham: dv === 'kg' ? 1000 : 1000});
                  }}>
                    <option value="kg">kg (Kí lô gam)</option>
                    <option value="hộp">hộp </option>
                    <option value="chai">chai </option>
                    <option value="gói">gói</option>
                    <option value="lon">lon</option>
                  </select>
                </div>
                {(crudData.don_vi_nhap !== 'kg' && crudData.don_vi_tinh !== 'kg') ? (
                  <div className="animate-in fade-in duration-200">
                    <label className="text-[10px] font-black opacity-40 uppercase ml-1 text-primary">Dung tích của 1 đơn vị đóng gói (ml)</label>
                    <input type="number" placeholder="Ví dụ: 320, 500, 1000..." className="w-full bg-slate-100 dark:bg-zinc-800 border-none text-slate-800 dark:text-white p-4 rounded-2xl font-black text-lg" value={crudData.dung_tich_san_pham || ''} onChange={e => setCrudData({...crudData, dung_tich_san_pham: parseFloat(e.target.value)})} />
                  </div>
                ) : (
                  <div className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-zinc-800 p-3 rounded-xl border border-dashed">Hệ thống tự động đặt tỷ lệ quy đổi mặc định: 1 kg = 1000 g</div>
                )}
                <div>
                  <label className="text-[10px] font-black opacity-40 uppercase ml-1 text-red-500 dark:text-red-400">Ngưỡng cảnh báo tối thiểu (ml hoặc g)</label>
                  <input className="w-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-2xl font-black text-lg" type="number" value={crudData.nguong_canh_bao || ''} onChange={e => setCrudData({...crudData, nguong_canh_bao: parseFloat(e.target.value)})} />
                </div>
                <div className="flex gap-4 pt-6">
                  <button onClick={() => setShowCrudModal(false)} className="flex-1 font-bold opacity-50 uppercase text-[10px] text-slate-400 dark:text-zinc-500">Hủy bỏ</button>
                  <button onClick={handleSaveCategory} className="flex-1 bg-primary text-white py-5 rounded-2xl font-black uppercase text-[11px] shadow-lg">Xác nhận Lưu</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL XEM LỊCH SỬ CHỨNG TỪ --- */}
      {showHistory && (() => {
        const filteredHistory = history.filter(h => {
          const searchClean = removeVietnameseTones(historySearch);
          const nhaCungCapClean = removeVietnameseTones(h.nha_cung_cap);
          const matchNhaCungCap = nhaCungCapClean.includes(searchClean);
          
          const itemsList = Array.isArray(h.chi_tiet_hang) ? h.chi_tiet_hang : JSON.parse(h.chi_tiet_hang || '[]');
          const matchTenMon = itemsList.some(item => {
            const tenMonClean = removeVietnameseTones(item.ten_nguyen_lieu);
            return tenMonClean.includes(searchClean);
          });
          
          return matchNhaCungCap || matchTenMon;
        });

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-zinc-800/80">
              
              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
                <div>
                  <h4 className="text-xl md:text-2xl font-black text-primary uppercase italic tracking-tighter">Lịch sử chi tiết chứng từ nhập kho</h4>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Hệ thống tổng hợp và phân rã hóa đơn vật tư Nắng PR</p>
                </div>
                <button 
                  onClick={() => { setShowHistory(false); setHistorySearch(''); }} 
                  className="w-11 h-11 bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white shadow-sm hover:scale-105 active:scale-95 transition-all self-end sm:self-auto shrink-0"
                >
                  <span className="material-symbols-outlined text-xl font-bold">close</span>
                </button>
              </div>

              <div className="px-6 md:px-8 py-3.5 bg-slate-50/20 dark:bg-zinc-900/10 border-b border-slate-100 dark:border-zinc-800 shrink-0">
                <div className="relative w-full max-w-sm group">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base group-focus-within:text-primary transition-colors">search</span>
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-zinc-800/80 text-xs py-3 pl-10 pr-4 rounded-xl border-none font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/40 shadow-inner transition-all"
                  />
                </div>
              </div>

              <div className="overflow-y-auto p-6 md:p-8 flex-1 bg-white dark:bg-zinc-950 text-xs space-y-6">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((h, idx) => {
                    const itemsList = Array.isArray(h.chi_tiet_hang) ? h.chi_tiet_hang : JSON.parse(h.chi_tiet_hang || '[]');
                    
                    return (
                      <div key={idx} className="border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 md:p-6 bg-slate-50/30 dark:bg-zinc-900/5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-dashed border-slate-200 dark:border-zinc-800 pb-4 mb-4 gap-3">
                          <div className="space-y-0.5">
                            <p className="font-black text-primary uppercase text-[11px] tracking-wider bg-primary/5 dark:bg-primary/10 px-3 py-1 rounded-lg w-fit">Mã nhập hàng: #{h.ma_phieu}</p>
                            <p className="text-slate-400 dark:text-zinc-500 font-bold text-[11px]">Thời gian: {new Date(h.ngay_nhap).toLocaleString('vi-VN')}</p>
                          </div>
                          <div className="text-left sm:text-right w-full sm:w-auto">
                            <p className="font-bold text-slate-700 dark:text-zinc-300 text-xs">
                              Nhà cung cấp: <span className="text-primary font-black uppercase bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded-md ml-0.5">{h.nha_cung_cap}</span>
                            </p>
                            <p className="font-black text-xl tracking-tight text-red-500 mt-1">
                              Tổng chi: {Number(h.tong_tien).toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>
                        
                        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-zinc-800/60">
                          <table className="w-full text-left min-w-[650px]">
                            <thead className="bg-slate-100/50 dark:bg-zinc-900/50 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 border-b border-slate-200 dark:border-zinc-800">
                              <tr>
                                <th className="p-3 px-4">Tên Nguyên Liệu</th>
                                <th className="p-3 text-center">Số lượng nhập</th>
                                <th className="p-4 text-center">Đơn vị</th>
                                <th className="p-3 text-right">Đơn giá thực tế</th>
                                <th className="p-3 px-4 text-right">Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-900/40 font-medium">
                              {itemsList.map((item, index) => (
                                <tr key={index} className="text-slate-700 dark:text-zinc-300 hover:bg-slate-100/40 dark:hover:bg-zinc-800/10 transition-colors duration-150">
                                  <td className="p-3 px-4 text-slate-900 dark:text-white font-black uppercase text-[12px] tracking-tight">{item.ten_nguyen_lieu}</td>
                                  <td className="p-3 text-center font-black text-primary text-sm">{item.so_luong}</td>
                                  <td className="p-3 text-center text-slate-400 dark:text-zinc-500 uppercase font-black text-[10px]">{item.don_vi_tinh}</td>
                                  <td className="p-3 text-right font-bold">{Number(item.gia_nhap).toLocaleString('vi-VN')}đ</td>
                                  <td className="p-3 px-4 text-right font-black text-slate-900 dark:text-zinc-100 text-sm">{(Number(item.so_luong) * Number(item.gia_nhap)).toLocaleString('vi-VN')}đ</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center text-slate-400 dark:text-zinc-600 font-black uppercase tracking-widest text-xs animate-pulse">
                    Không tìm thấy chứng từ nào khớp với từ khóa...
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}