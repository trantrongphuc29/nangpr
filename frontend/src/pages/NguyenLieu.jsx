/* ===== 🥬 NGUYÊN LIỆU - TRANG CHÍNH =====
 * Quản lý danh sách nguyên liệu, nhập kho, lịch sử, thống kê
 * ========================================= */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as nlService from '../services/nguyenlieuService';
import { ToastContainer, useToast } from '../components/Toast';
import ModalPortal from '../components/ModalPortal';

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
};

const DANH_MUC_OPTIONS = [
  'Nước uống đóng chai',
  'Nguyên liệu hết trong ngày',
  'Dụng cụ đóng gói',
  'Nguyên liệu pha chế'
];


const DON_VI_NHAP_OPTIONS = ['kg', 'hộp', 'chai', 'gói', 'lon'];
const DON_VI_DO_UONG_OPTIONS = ['chai', 'lon'];

const EMPTY_CRUD = {
  ma_nguyen_lieu: null,
  ten_nguyen_lieu: '',
  danh_muc: 'Nguyên liệu pha chế',
  don_vi_tinh: 'g',
  don_vi_nhap: 'kg',
  don_vi_dong_goi: '',
  dung_tich_san_pham: 1000,
  nguong_canh_bao: 1000,
  ghi_chu: '',
};

const EMPTY_IMPORT = {
  ma_nguyen_lieu: '',
  nha_cung_cap: '',
  ngay_nhap: new Date().toISOString().split('T')[0],
  so_luong: '',
  gia_nhap: '',
  ghi_chu: '',
};

const parseChiTietHang = (raw) => {
  try {
    return Array.isArray(raw) ? raw : JSON.parse(raw || '[]');
  } catch {
    return [];
  }
};

function StockStatusBadge({ status }) {
  if (status === 'het_hang') return <span className="badge-error">Hết hàng</span>;
  if (status === 'sap_het') return <span className="badge-warning">Sắp hết</span>;
  return <span className="badge-success">Còn hàng</span>;
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="card p-4 md:p-5 flex items-center gap-4 border-none">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent || 'bg-primary/10 text-primary'}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wide">{label}</p>
        <p className="text-xl md:text-2xl font-bold text-on-surface truncate">{value}</p>
      </div>
    </div>
  );
}

export default function NguyenLieu() {
  const { toasts, show: toast, dismiss } = useToast();
  const [list, setList] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ month: 0 });

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'ten_nguyen_lieu', direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showCrudModal, setShowCrudModal] = useState(false);
  const [showImportDrawer, setShowImportDrawer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [timeTab, setTimeTab] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [crudData, setCrudData] = useState(EMPTY_CRUD);
  const [importData, setImportData] = useState(EMPTY_IMPORT);
  const [importPresetId, setImportPresetId] = useState(null);

  const enrichItem = (item) => {
    const ton = Number(item.ml_thuc_te_ton || 0);
    const nguong = Number(item.nguong_canh_bao || 0);
    let trang_thai_ton = 'con_hang';
    if (ton <= 0) trang_thai_ton = 'het_hang';
    else if (ton <= nguong) trang_thai_ton = 'sap_het';
    return { ...item, so_luong_ton: ton, trang_thai_ton };
  };

  const loadData = useCallback(async () => {
  try {
    setLoading(true);
    const [data, histData, statsData] = await Promise.all([
      nlService.getNguyenLieu(),
      nlService.getImportHistory(),
      nlService.getCostStats(),
    ]);
    setList((data || []).map(enrichItem));
    setHistory(histData || []);
    setStats(statsData || { month: 0 });
  } catch (err) {
    toast(err.response?.data?.message || 'Không tải được dữ liệu kho.', 'error');
  } finally {
    setLoading(false);
  }
}, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, categoryFilter]);

  /* Form động: tự động cập nhật đơn vị theo danh mục */
  const handleDanhMucFormChange = (targetCat) => {
    let updateFields = { danh_muc: targetCat };

    switch (targetCat) {
      case 'Nước uống đóng chai':
        updateFields.don_vi_nhap = 'chai'; // Hoặc 'lon' tùy mặc định
        updateFields.don_vi_tinh = 'chai'; // Sẽ dùng combobox để đổi sau
        updateFields.dung_tich_san_pham = 1;
        break;

      case 'Dụng cụ đóng gói':
        updateFields.don_vi_nhap = 'cái';
        updateFields.don_vi_tinh = 'cái';
        updateFields.dung_tich_san_pham = 1;
        break;

      case 'Nguyên liệu hết trong ngày':
        updateFields.don_vi_nhap = 'kg';
        updateFields.don_vi_tinh = 'g';
        updateFields.dung_tich_san_pham = 1000;
        break;

      case 'Nguyên liệu pha chế':
      default:
        updateFields.don_vi_nhap = 'kg';
        updateFields.don_vi_tinh = 'g';
        updateFields.dung_tich_san_pham = 1000;
        break;
    }

    setCrudData(prev => ({ ...prev, ...updateFields }));
  };

  const handleDonViNhapChange = (val) => {
    if (crudData.danh_muc !== 'Nguyên liệu pha chế' && crudData.danh_muc !== 'Nguyên liệu hết trong ngày') return;
    let autoTinh = 'g';
    let autoDungTich = crudData.dung_tich_san_pham;

    if (val === 'lon' || val === 'chai') {
      autoTinh = 'ml';
    } else if (val === 'gói' || val === 'hộp' || val === 'kg') {
      autoTinh = 'g';
      if (val === 'kg') autoDungTich = 1000;
    }

    setCrudData(prev => ({
      ...prev,
      don_vi_nhap: val,
      don_vi_tinh: autoTinh,
      dung_tich_san_pham: autoDungTich
    }));
  };

const categories = useMemo(() => {
  return ['all', ...DANH_MUC_OPTIONS];
}, []);

  const statsSummary = useMemo(() => {
    const active = list.filter((i) => Number(i.trang_thai) !== 0);
    return {
      total: active.length,
      sapHet: active.filter((i) => i.trang_thai_ton === 'sap_het').length,
      hetHang: active.filter((i) => i.trang_thai_ton === 'het_hang').length,
      chiThang: Number(stats.month || 0),
    };
  }, [list, stats]);

  const selectedImportItemDetails = useMemo(() => {
    if (!importData.ma_nguyen_lieu) return null;
    return list.find((item) => String(item.ma_nguyen_lieu) === String(importData.ma_nguyen_lieu));
  }, [list, importData.ma_nguyen_lieu]);

  const actualVolumeToImport = useMemo(() => {
    if (!selectedImportItemDetails) return 0;
    const capacity = Number(selectedImportItemDetails.dung_tich_san_pham || 1);
    return (Number(importData.so_luong) || 0) * capacity;
  }, [importData.so_luong, selectedImportItemDetails]);

  const dynamicFilteredCost = useMemo(() => {
    if (!history.length) return 0;
    return history.reduce((sum, record) => {
      const recordDateStr = new Date(record.ngay_nhap).toISOString().split('T')[0];
      const recordDate = new Date(record.ngay_nhap);
      const targetDate = new Date(selectedDate);

      if (timeTab === 'day') return recordDateStr === selectedDate ? sum + Number(record.tong_tien) : sum;
      if (timeTab === 'month') {
        return recordDate.getMonth() === targetDate.getMonth() && recordDate.getFullYear() === targetDate.getFullYear() ? sum + Number(record.tong_tien) : sum;
      }
      if (timeTab === 'year') return recordDate.getFullYear() === targetDate.getFullYear() ? sum + Number(record.tong_tien) : sum;
      
      const getWeekNumber = (d) => {
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
        const week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
      };
      return getWeekNumber(recordDate) === getWeekNumber(targetDate) && recordDate.getFullYear() === targetDate.getFullYear() ? sum + Number(record.tong_tien) : sum;
    }, 0);
  }, [history, timeTab, selectedDate]);

  const filteredList = useMemo(() => {
    const searchClean = removeVietnameseTones(searchTerm);
    return list.filter((item) => {
      const matchSearch = removeVietnameseTones(item.ten_nguyen_lieu || '').includes(searchClean);
      const matchCat = categoryFilter === 'all' || item.danh_muc === categoryFilter;
      const matchStatus = statusFilter === 'all' || item.trang_thai_ton === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [list, searchTerm, categoryFilter, statusFilter]);

  const sortedList = useMemo(() => {
    const items = [...filteredList];
    items.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'so_luong_ton' || sortConfig.key === 'nguong_canh_bao') {
        return sortConfig.direction === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
      }
      aVal = (aVal || '').toString().toLowerCase();
      bVal = (bVal || '').toString().toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [filteredList, sortConfig]);

  const totalPages = useMemo(() => Math.ceil(sortedList.length / itemsPerPage), [sortedList]);
  
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedList.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedList, currentPage]);

  const importTotal = useMemo(() => (Number(importData.so_luong) || 0) * (Number(importData.gia_nhap) || 0), [importData.so_luong, importData.gia_nhap]);

  const requestSort = (key) => {
    setSortConfig((prev) => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return 'unfold_more';
    return sortConfig.direction === 'asc' ? 'expand_less' : 'expand_more';
  };

  const formatTonKho = (item) => {
    const ton = Number(item.so_luong_ton ?? item.ml_thuc_te_ton ?? 0);
    const isVolumeSystem = item.danh_muc === 'Nguyên liệu pha chế' || item.danh_muc === 'Nguyên liệu hết trong ngày';
    const labelUnit = isVolumeSystem ? item.don_vi_tinh : item.don_vi_nhap;
    return `${ton.toLocaleString('vi-VN')} ${labelUnit}`;
  };

  const openCreateModal = () => { setCrudData(EMPTY_CRUD); setShowCrudModal(true); };

  const openEditModal = (item) => {
    setCrudData({
      ma_nguyen_lieu: item.ma_nguyen_lieu,
      ten_nguyen_lieu: item.ten_nguyen_lieu,
      danh_muc: item.danh_muc || 'Nguyên liệu pha chế',
      don_vi_tinh: item.don_vi_tinh || 'g',
      don_vi_nhap: item.don_vi_nhap || 'kg',
      don_vi_dong_goi: item.don_vi_dong_goi || '',
      dung_tich_san_pham: item.dung_tich_san_pham || 1,
      nguong_canh_bao: item.nguong_canh_bao ?? 0,
      ghi_chu: item.ghi_chu || '',
    });
    setShowCrudModal(true);
  };

  const openImportDrawer = (presetId = null) => {
    setImportData({ ...EMPTY_IMPORT, ma_nguyen_lieu: presetId ? String(presetId) : '', ngay_nhap: new Date().toISOString().split('T')[0] });
    setImportPresetId(presetId);
    setShowImportDrawer(true);
  };

  const handleSaveIngredient = async () => {
    if (!crudData.ten_nguyen_lieu?.trim()) return toast('Tên nguyên liệu không được trống.', 'error');
    if (Number(crudData.nguong_canh_bao) < 0) return toast('Ngưỡng cảnh báo tồn kho phải >= 0.', 'error');
    
    // Tách riêng logic ép dung tích: Nếu hệ lẻ (bao bì, chai lọ) hoặc dùng trong ngày (kg) thì đặt cứng
    let finalCapacity = 1.00;
    if (crudData.danh_muc === 'Nguyên liệu pha chế') {
      finalCapacity = crudData.don_vi_nhap === 'kg' ? 1000 : (parseFloat(crudData.dung_tich_san_pham) || 0);
    } else if (crudData.danh_muc === 'Nguyên liệu hết trong ngày') {
      finalCapacity = 1000.00;
    }

    if (finalCapacity <= 0) return toast('Dung tích sản phẩm quy đổi phải lớn hơn 0.', 'error');

    const isVolumeSystem = crudData.danh_muc === 'Nguyên liệu pha chế' || crudData.danh_muc === 'Nguyên liệu hết trong ngày';

    try {
      const payload = {
        ten_nguyen_lieu: crudData.ten_nguyen_lieu.trim(),
        danh_muc: crudData.danh_muc,
        don_vi_tinh: isVolumeSystem ? (crudData.don_vi_nhap === 'kg' ? 'g' : crudData.don_vi_tinh) : crudData.don_vi_nhap,
        don_vi_nhap: crudData.don_vi_nhap,
        don_vi_dong_goi: crudData.don_vi_dong_goi?.trim() || null,
        dung_tich_san_pham: finalCapacity,
        nguong_canh_bao: parseFloat(crudData.nguong_canh_bao) || 0,
        ghi_chu: crudData.ghi_chu?.trim() || null,
      };

      if (crudData.ma_nguyen_lieu) {
        await nlService.updateNguyenLieu(crudData.ma_nguyen_lieu, payload);
        toast('Cập nhật nguyên liệu thành công.');
      } else {
        await nlService.createNguyenLieu(payload);
        toast('Thêm nguyên liệu mới thành công.');
      }
      setShowCrudModal(false);
      await loadData();
    } catch (err) {
      toast(err.response?.data?.message || 'Lỗi lưu nguyên liệu.', 'error');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importData.ma_nguyen_lieu) return toast('Vui lòng chọn nguyên liệu nhập kho.', 'error');
    if (Number(importData.so_luong) <= 0) return toast('Số lượng nhập phải lớn hơn 0.', 'error');
    if (Number(importData.gia_nhap) < 0) return toast('Giá nhập phải >= 0.', 'error');
    try {
      await nlService.importStock({
        items: [{ ma_nguyen_lieu: parseInt(importData.ma_nguyen_lieu, 10), so_luong: parseFloat(importData.so_luong), gia_nhap: parseFloat(importData.gia_nhap) }],
        nha_cung_cap: importData.nha_cung_cap?.trim() || 'Đại lý tự do',
        ngay_nhap: importData.ngay_nhap,
        ghi_chu: importData.ghi_chu?.trim() || 'Nhập kho hệ thống',
      });
      toast('Nhập kho thành công.');
      setShowImportDrawer(false);
      setImportData(EMPTY_IMPORT);
      setImportPresetId(null);
      await loadData();
    } catch (err) {
      toast(err.response?.data?.message || 'Lỗi nhập kho.', 'error');
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = Number(item.trang_thai) === 0 ? 1 : 0;
    try {
      await nlService.setTrangThaiNguyenLieu(item.ma_nguyen_lieu, newStatus);
      toast(newStatus ? 'Đã kích hoạt nguyên liệu.' : 'Đã ngưng sử dụng nguyên liệu.');
      await loadData();
    } catch (err) {
      toast(err.response?.data?.message || 'Lỗi cập nhật trạng thái.', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa vĩnh viễn nguyên liệu "${name}"?`)) return;
    try {
      await nlService.deleteNguyenLieu(id);
      toast('Đã xóa nguyên liệu.');
      await loadData();
    } catch (err) {
      toast(err.response?.data?.message || 'Không thể xóa nguyên liệu.', 'error');
    }
  };

  const filteredHistory = useMemo(() => {
    const searchClean = removeVietnameseTones(historySearch);
    return history.filter((h) => {
      const matchSupplier = removeVietnameseTones(h.nha_cung_cap || '').includes(searchClean);
      const itemsList = parseChiTietHang(h.chi_tiet_hang);
      return matchSupplier || itemsList.some((item) => removeVietnameseTones(item.ten_nguyen_lieu || '').includes(searchClean));
    });
  }, [history, historySearch]);

  if (loading) return <div className="p-16 text-center text-muted font-medium animate-pulse">Đang tải dữ liệu nguyên liệu...</div>;

  return (
    <div className="space-y-5 md:space-y-6 text-on-surface pb-8">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Quản lý nguyên liệu</h1>
        <p className="text-muted text-sm mt-1">Khai báo nguyên liệu, theo dõi tồn kho và nhập hàng — tách biệt với món bán trên thực đơn.</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
          <button type="button" onClick={openCreateModal} className="btn-primary !py-2.5 !px-4 !text-sm"><span className="material-symbols-outlined text-lg">add</span>Thêm nguyên liệu</button>
          <button type="button" onClick={() => openImportDrawer()} className="btn-secondary !py-2.5 !px-4 !text-sm"><span className="material-symbols-outlined text-lg">inventory</span>Nhập kho</button>
          <button type="button" onClick={() => setShowHistory(true)} className="btn-outline !py-2.5 !px-4 !text-sm"><span className="material-symbols-outlined text-lg">history</span>Lịch sử nhập kho</button>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Tổng nguyên liệu" value={statsSummary.total} icon="inventory_2" />
        <StatCard label="Sắp hết" value={statsSummary.sapHet} icon="warning" accent="bg-warning-bg text-warning" />
        <StatCard label="Hết hàng" value={statsSummary.hetHang} icon="error" accent="bg-error-container text-error" />
        <StatCard label="Chi nhập tháng này" value={`${statsSummary.chiThang.toLocaleString('vi-VN')}đ`} icon="payments" accent="bg-primary/10 text-primary" />
      </div>

      {/* Toolbar */}
      <div className="card p-4 md:p-5 border-none space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <input type="text" placeholder="Tìm kiếm..." className="peer input-field !pr-10 !py-2.5" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xl pointer-events-none peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0 transition-opacity">search</span>
          </div>
          <select className="input-field !w-auto lg:min-w-[140px] !py-2.5" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="con_hang">Còn hàng</option>
            <option value="sap_het">Sắp hết</option>
            <option value="het_hang">Hết hàng</option>
          </select>
          <select className="input-field !w-auto lg:min-w-[160px] !py-2.5" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map((c) => (<option key={c} value={c}>{c === 'all' ? 'Tất cả danh mục' : c}</option>))}
          </select>
        </div>
        
      </div>

      {/* Table */}
      <div className="card border-none overflow-hidden space-y-4">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm min-w-[900px]">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('ten_nguyen_lieu')}>
                  <span className="inline-flex items-center gap-1">Tên nguyên liệu<span className="material-symbols-outlined text-base">{getSortIcon('ten_nguyen_lieu')}</span></span>
                </th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3">Đơn vị tính</th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('so_luong_ton')}>
                  <span className="inline-flex items-center gap-1">Tồn kho hiện tại<span className="material-symbols-outlined text-base">{getSortIcon('so_luong_ton')}</span></span>
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('nguong_canh_bao')}>
                  <span className="inline-flex items-center gap-1">Ngưỡng cảnh báo<span className="material-symbols-outlined text-base">{getSortIcon('nguong_canh_bao')}</span></span>
                </th>
                <th className="px-4 py-3">Đơn vị nhập</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 ">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {paginatedList.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted">Không có nguyên liệu phù hợp bộ lọc.</td></tr>
              ) : (
                paginatedList.map((item) => (
                  <tr key={item.ma_nguyen_lieu} className={`hover:bg-primary/5 transition-colors ${Number(item.trang_thai) === 0 ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-semibold">{item.ten_nguyen_lieu}</td>
                    <td className="px-4 py-3 text-muted">{item.danh_muc || '—'}</td>
                    <td className="px-4 py-3">{item.danh_muc === 'Nguyên liệu pha chế' || item.danh_muc === 'Nguyên liệu hết trong ngày' ? item.don_vi_tinh : item.don_vi_nhap}</td>
                    <td className="px-4 py-3 font-medium">{formatTonKho(item)}</td>
                    <td className="px-4 py-3 text-muted">
                      {Number(item.nguong_canh_bao).toLocaleString('vi-VN')} {item.danh_muc === 'Nguyên liệu pha chế' || item.danh_muc === 'Nguyên liệu hết trong ngày' ? item.don_vi_tinh : item.don_vi_nhap}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs max-w-[140px]">
                      {item.danh_muc === 'Nguyên liệu pha chế' ? (item.don_vi_dong_goi || `${Number(item.dung_tich_san_pham).toLocaleString('vi-VN')} ${item.don_vi_tinh}/${item.don_vi_nhap}`) : 'Tính lẻ trực tiếp'}
                    </td>
                    <td className="px-4 py-3"><StockStatusBadge status={item.trang_thai_ton} />{Number(item.trang_thai) === 0 && (<span className="badge-warning ml-1">Ngưng dùng</span>)}</td>
                   <td className="px-4 py-3">
                  {/* Flex giữ các nút trên một dòng, dùng gap nhỏ hơn trên mobile */}
                  <div className="flex justify-end gap-0.5 sm:gap-1">
                    <button title="Nhập kho" onClick={() => openImportDrawer(item.ma_nguyen_lieu)} className="btn-icon-edit p-1.5">
                      <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                    </button>
                    <button title="Sửa" onClick={() => openEditModal(item)} className="btn-icon-edit p-1.5">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    {/* Ẩn các nút ít dùng trên màn hình cực nhỏ (dưới 360px) nếu cần */}
                    <div className="hidden sm:flex gap-0.5">
                      <button title="Trạng thái" onClick={() => handleToggleStatus(item)} className="btn-ghost p-1.5">
                        <span className="material-symbols-outlined text-sm">
                          {Number(item.trang_thai) === 0 ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                      <button title="Xóa" onClick={() => handleDelete(item.ma_nguyen_lieu, item.ten_nguyen_lieu)} className="btn-icon-delete p-1.5">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh phân trang */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-outline shrink-0 bg-card select-none">
            <p className="text-xs text-muted tabular-nums">
              Đang hiển thị dòng <b>{((currentPage - 1) * itemsPerPage) + 1}</b> - <b>{Math.min(currentPage * itemsPerPage, sortedList.length)}</b> trên tổng số <b>{sortedList.length}</b> nguyên liệu.
            </p>
            <div className="flex items-center justify-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="w-8 h-8 rounded-lg border border-outline flex items-center justify-center text-muted hover:bg-primary/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'border border-outline text-on-surface hover:bg-primary/5'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="w-8 h-8 rounded-lg border border-outline flex items-center justify-center text-muted hover:bg-primary/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Thêm / Sửa nguyên liệu */}
     {showCrudModal && (
  <ModalPortal>
    <div className="modal-overlay" onClick={() => setShowCrudModal(false)}>
      <div className="modal-panel max-w-lg p-6 md:p-8 h-full w-full overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined">inventory_2</span>
          {crudData.ma_nguyen_lieu ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Tên nguyên liệu *</label>
            <input className="input-field" value={crudData.ten_nguyen_lieu} onChange={(e) => setCrudData({ ...crudData, ten_nguyen_lieu: e.target.value })} placeholder="" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Danh mục nguyên liệu</label>
              <select className="input-field" value={crudData.danh_muc} onChange={(e) => handleDanhMucFormChange(e.target.value)}>
                {DANH_MUC_OPTIONS.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Đơn vị tính gốc</label>
              {crudData.danh_muc === 'Nước uống đóng chai' ? (
                <select className="input-field font-bold" value={crudData.don_vi_tinh} onChange={(e) => setCrudData({ ...crudData, don_vi_tinh: e.target.value })}>
                  {DON_VI_DO_UONG_OPTIONS.map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
              ) : crudData.don_vi_nhap === 'hộp' ? (
                <select className="input-field font-bold" value={crudData.don_vi_tinh} onChange={(e) => setCrudData({ ...crudData, don_vi_tinh: e.target.value })}>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                </select>
              ) : (
                <input className="input-field bg-slate-100 font-bold uppercase" value={crudData.don_vi_tinh} disabled />
              )}
            </div>
          </div>

          {/* Chỉ hiển thị phần nhập kho/quy đổi nếu thuộc danh mục pha chế hoặc hết trong ngày */}
          {(crudData.danh_muc === 'Nguyên liệu pha chế' || crudData.danh_muc === 'Nguyên liệu hết trong ngày') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Đơn vị nhập kho</label>
                <select className="input-field" value={crudData.don_vi_nhap} onChange={(e) => handleDonViNhapChange(e.target.value)}>{DON_VI_NHAP_OPTIONS.map((d) => (<option key={d} value={d}>{d}</option>))}</select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Dung tích / quy đổi</label>
                <input type="number" className="input-field disabled:opacity-60 disabled:bg-slate-100 font-bold" value={crudData.don_vi_nhap === 'kg' ? 1000 : crudData.dung_tich_san_pham} onChange={(e) => setCrudData({ ...crudData, dung_tich_san_pham: e.target.value })} placeholder="1000" disabled={crudData.don_vi_nhap === 'kg'} />
              </div>
            </div>
          )}

          {crudData.danh_muc === 'Nguyên liệu pha chế' && (
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Đơn vị nhập (đóng gói)</label>
              <input className="input-field" value={crudData.don_vi_dong_goi} onChange={(e) => setCrudData({ ...crudData, don_vi_dong_goi: e.target.value })} placeholder="" />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Ngưỡng cảnh báo</label>
            <input type="number" min="0" className="input-field" value={crudData.nguong_canh_bao} onChange={(e) => setCrudData({ ...crudData, nguong_canh_bao: e.target.value })} />
            <p className="text-xs text-muted mt-1">Tính theo đơn vị: {crudData.don_vi_tinh}</p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCrudModal(false)} className="btn-outline flex-1">Hủy</button>
            <button type="button" onClick={handleSaveIngredient} className="btn-primary flex-1">Lưu nguyên liệu</button>
          </div>
        </div>
      </div>
    </div>
  </ModalPortal>
)}
      {/* Drawer: Nhập kho */}
      {showImportDrawer && (
        <ModalPortal>
        <>
          <div className="print:hidden fixed inset-0 z-[120] backdrop-blur-sm bg-[color-mix(in_srgb,var(--color-overlay)_75%,transparent)]" onClick={() => setShowImportDrawer(false)} />
          <aside className="print:hidden fixed top-0 right-0 z-[130] h-full w-full sm:max-w-md bg-card border-l border-outline shadow-2xl flex flex-col min-h-0">
            <div className="p-5 border-b border-outline flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2"><span className="material-symbols-outlined">add_shopping_cart</span>Nhập kho</h2>
              <button type="button" onClick={() => setShowImportDrawer(false)} className="btn-ghost !p-2" aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form id="form-nhap-kho" onSubmit={handleImport} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar min-h-0">
                <div>
                <label className="block text-sm font-semibold mb-1">Nguyên liệu *</label>
                <select className="input-field" value={importData.ma_nguyen_lieu} onChange={(e) => setImportData({ ...importData, ma_nguyen_lieu: e.target.value })} required disabled={!!importPresetId}>
                  <option value="">— Chọn nguyên liệu —</option>
                  {list.filter((nl) => Number(nl.trang_thai) !== 0).map((nl) => (<option key={nl.ma_nguyen_lieu} value={nl.ma_nguyen_lieu}>{nl.ten_nguyen_lieu}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Nhà cung cấp</label>
                <input className="input-field" value={importData.nha_cung_cap} onChange={(e) => setImportData({ ...importData, nha_cung_cap: e.target.value })} placeholder="Tên nhà cung cấp" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Ngày nhập</label>
                <input type="date" className="input-field" value={importData.ngay_nhap} onChange={(e) => setImportData({ ...importData, ngay_nhap: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Số lượng nhập *</label>
                  <input type="number" min="0.01" step="0.01" className="input-field" value={importData.so_luong} onChange={(e) => setImportData({ ...importData, so_luong: e.target.value })} placeholder="0" required />
                  <p className="text-xs text-muted mt-1">Theo đơn vị nhập ({selectedImportItemDetails?.don_vi_nhap || 'Cái, lon, chai, kg...' })</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Giá nhập *</label>
                  <input type="number" min="0" className="input-field" value={importData.gia_nhap} onChange={(e) => setImportData({ ...importData, gia_nhap: e.target.value })} placeholder="0" required />
                </div>
              </div>

              {/* DÒNG HIỂN THỊ THÔNG SỐ ĐỊNH MỨC QUY ĐỔI THỜI GIAN THỰC */}
              {selectedImportItemDetails && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-400 space-y-1 animate-in fade-in duration-150">
                
                  <p className="font-medium">
                    Tỷ lệ nhập: 1 {selectedImportItemDetails.don_vi_nhap} = {Number(selectedImportItemDetails.dung_tich_san_pham).toLocaleString('vi-VN')} {selectedImportItemDetails.danh_muc === 'Nguyên liệu pha chế' || selectedImportItemDetails.danh_muc === 'Nguyên liệu hết trong ngày' ? selectedImportItemDetails.don_vi_tinh : selectedImportItemDetails.don_vi_nhap}
                  </p>
                  <p className="font-bold text-sm mt-1">
                     Tổng cộng thêm: <span className="underline font-black text-primary text-base">{actualVolumeToImport.toLocaleString('vi-VN')}</span> {selectedImportItemDetails.danh_muc === 'Nguyên liệu pha chế' || selectedImportItemDetails.danh_muc === 'Nguyên liệu hết trong ngày' ? selectedImportItemDetails.don_vi_tinh : selectedImportItemDetails.don_vi_nhap} vào tổng tồn kho gốc.
                  </p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex justify-between items-center">
                <span className="text-sm font-semibold text-muted">Thành tiền</span>
                <span className="text-xl font-bold text-primary">{importTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Ghi chú</label>
                <textarea className="input-field min-h-[72px]" value={importData.ghi_chu} onChange={(e) => setImportData({ ...importData, ghi_chu: e.target.value })} placeholder="Ghi chú phiếu nhập" />
              </div>
              </div>
              <div className="p-5 border-t border-outline shrink-0 flex gap-3 bg-card">
                <button type="button" onClick={() => setShowImportDrawer(false)} className="btn-outline flex-1">Hủy</button>
                <button type="submit" className="btn-primary flex-1">Xác nhận nhập kho</button>
              </div>
            </form>
          </aside>
        </>
        </ModalPortal>
      )}

      {/* Modal: Lịch sử nhập kho */}
      {showHistory && (
  <ModalPortal>
    <div className="modal-overlay print:hidden" onClick={() => setShowHistory(false)}>
    <div className="modal-panel max-w-4xl w-full h-full flex flex-col min-h-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Modal */}
        <div className="p-5 border-b border-outline flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="text-xl font-bold text-primary">Lịch sử nhập kho</h2>
            <p className="text-sm text-muted">Báo cáo chi tiết chứng từ nhập và in phiếu kiểm đối hàng hóa</p>
          </div>
          <button type="button" onClick={() => setShowHistory(false)} className="btn-ghost !p-2 shrink-0" aria-label="Đóng">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Bộ lọc thời gian & tìm kiếm */}
        <div className="p-4 border-b border-outline shrink-0 bg-surface-container-low/50 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <div className="flex bg-[var(--color-input-bg)] p-1 rounded-xl shrink-0">
                {['day', 'week', 'month', 'year'].map((tab) => (
                  <button key={tab} type="button" onClick={() => setTimeTab(tab)} className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold uppercase whitespace-nowrap ${timeTab === tab ? 'bg-primary text-on-primary' : 'text-muted'}`}>
                    {tab === 'day' ? 'Ngày' : tab === 'week' ? 'Tuần' : tab === 'month' ? 'Tháng' : 'Năm'}
                  </button>
                ))}
              </div>
              <input type="date" className="input-field !w-full sm:!w-auto !py-2" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-xs text-muted">Tổng chi theo bộ lọc</p>
              <p className="text-lg font-bold text-primary tabular-nums">{dynamicFilteredCost.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
          <div className="relative w-full">
            <input className="peer input-field !pr-9 !py-2 text-sm w-full" placeholder="Tìm kiếm..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} />
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0 transition-opacity">search</span>
          </div>
        </div>

        {/* Danh sách phiếu nhập */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {filteredHistory.length === 0 ? (
            <p className="text-center text-muted py-12">Không có phiếu nhập phù hợp.</p>
          ) : (
            filteredHistory.map((h, idx) => {
              const itemsList = parseChiTietHang(h.chi_tiet_hang);
              const targetNCC = h.nha_cung_cap || 'Đại lý tự do';
              
              // Định dạng ngày giờ chuẩn Việt Nam (DD/MM/YYYY - HH:MM:SS)
               const date = new Date(h.ngay_nhap);
              date.setHours(date.getHours() + 7);

              const formattedDateTime = date.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              });

              // Hàm xử lý xuất bản và kích hoạt lệnh in phiếu tự động
              const handlePrintInvoice = () => {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                  <html>
                    <head>
                      <title>Phiếu Nhập Kho #${h.ma_phieu}</title>
                      <style>
                        body { font-family: 'Arial', sans-serif; color: #222; padding: 30px; line-height: 1.5; }
                        .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px; }
                        .title { font-size: 24px; font-weight: bold; text-transform: uppercase; color: #064e3b; margin: 0; }
                        .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
                        .info-table { w-full; margin-bottom: 20px; border-collapse: collapse; }
                        .info-table td { padding: 5px 0; font-size: 14px; }
                        .main-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        .main-table th { background-color: #f3f4f6; border: 1px solid #d1d5db; padding: 10px; font-size: 13px; text-transform: uppercase; }
                        .main-table td { border: 1px solid #d1d5db; padding: 10px; font-size: 13px; }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .total-row { font-size: 16px; font-weight: bold; color: #064e3b; }
                        .footer-sign { margin-top: 5px; display: flex; justify-content: space-between; text-align: center; }
                        .sign-box { width: 45%; margin-top: 40px; font-size: 14px; }
                      </style>
                    </head>
                    <body>
                      <div class="header">
                        <div class="title">NẮNG PR CAFE</div>
                        <div class="subtitle">Hệ Thống Quản Lý Kho & Định Mức Pha Chế</div>
                      </div>
                      
                      <table class="info-table">
                        <tr><td><strong>Mã phiếu nhập:</strong> #${h.ma_phieu}</td></tr>
                        <tr><td><strong>Thời gian chứng từ:</strong> ${formattedDateTime}</td></tr>
                        <tr><td><strong>Nhà cung cấp (NCC):</strong> ${targetNCC}</td></tr>
                        <tr><td><strong>Ghi chú nội bộ:</strong> ${h.ghi_chu || 'Nhập kho hệ thống'}</td></tr>
                      </table>

                      <table class="main-table">
                        <thead>
                          <tr>
                            <th>STT</th>
                            <th style="text-align: left;">Tên Nguyên Liệu</th>
                            <th>Số Lượng</th>
                            <th>Đơn Vị</th>
                            <th style="text-align: right;">Giá Lẻ</th>
                            <th style="text-align: right;">Thành Tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsList.map((item, i) => `
                            <tr>
                              <td class="text-center">${i + 1}</td>
                              <td><strong>${item.ten_nguyen_lieu}</strong></td>
                              <td class="text-center">${item.so_luong}</td>
                              <td class="text-center" style="text-transform: uppercase;">${item.don_vi_nhap || 'Đơn vị'}</td>
                              <td class="text-right">${Number(item.gia_nhap).toLocaleString('vi-VN')}đ</td>
                              <td class="text-right" style="font-weight: 600;">${(Number(item.so_luong) * Number(item.gia_nhap)).toLocaleString('vi-VN')}đ</td>
                            </tr>
                          `).join('')}
                          <tr class="total-row">
                            <td colspan="5" class="text-right" style="padding: 12px;">TỔNG THANH TOÁN ĐƠN HÀNG:</td>
                            <td class="text-right" style="padding: 12px; border-left: none;">${Number(h.tong_tien).toLocaleString('vi-VN')}đ</td>
                          </tr>
                        </tbody>
                      </table>

                      <div class="footer-sign">
                        <div class="sign-box">Nguời Lập Phiếu<br><br><br><br><i>(Ký và ghi rõ họ tên)</i></div>
                        <div class="sign-box">Đại Diện Giao Hàng<br><br><br><br><i>(Ký và ghi rõ họ tên)</i></div>
                      </div>

                      <script>
                        window.onload = function() { window.print(); window.close(); }
                      </script>
                    </body>
                  </html>
                `);
                printWindow.document.close();
              };

              return (
                <div key={h.ma_phieu ?? idx} className="card p-4 border border-outline hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 pb-3 border-b border-dashed border-outline">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="badge-primary">#{h.ma_phieu}</span>
                        {/* Nút bấm Kích hoạt in chứng từ */}
                        <button 
                          type="button" 
                          onClick={handlePrintInvoice}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary hover:text-white transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[12px]">print</span>
                          In phiếu nhập
                        </button>
                      </div>
                      <p className="text-xs text-muted mt-1 font-medium tabular-nums">
                        Thời gian: {formattedDateTime}
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-sm">NCC: <strong>{targetNCC}</strong></p>
                      <p className="font-bold text-primary tabular-nums text-base">{Number(h.tong_tien).toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto -mx-1 px-1">
                    <table className="w-full text-xs min-w-[280px]">
                      <thead>
                        <tr className="text-muted uppercase tracking-tight text-[10px]">
                          <th className="text-left py-1">Nguyên liệu</th>
                          <th className="text-center py-1">SL nhập</th>
                          <th className="text-center py-1">Đơn vị</th>
                          <th className="text-right py-1">Giá lẻ</th>
                          <th className="text-right py-1">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsList.map((item, i) => (
                          <tr key={i} className="border-t border-outline/50">
                            <td className="py-2 font-medium uppercase text-[11px] text-primary">{item.ten_nguyen_lieu}</td>
                            <td className="py-2 text-center font-bold">{item.so_luong}</td>
                            <td className="py-2 text-center text-muted uppercase text-[10px] font-bold">
                              {item.don_vi_nhap || 'Đơn vị'}
                            </td>
                            <td className="py-2 text-right">{Number(item.gia_nhap).toLocaleString('vi-VN')}đ</td>
                            <td className="py-2 text-right font-semibold">{(Number(item.so_luong) * Number(item.gia_nhap)).toLocaleString('vi-VN')}đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  </ModalPortal>
)}
    </div>
  );
}