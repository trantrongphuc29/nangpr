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
  han_su_dung: '',
  ghi_chu: '',
};



function StockStatusBadge({ status }) {
  if (status === 'het_hang') return <span className="badge-error">Hết hàng</span>;
  if (status === 'sap_het') return <span className="badge-warning">Sắp hết</span>;
  return <span className="badge-success">Còn hàng</span>;
}

function ExpiryStatusBadge({ status, daysLeft }) {
  if (status === 'het_han') return <span className="badge-error" title={`Quá hạn ${Math.abs(daysLeft)} ngày`}><span className="material-symbols-outlined text-[10px]">block</span> Hết hạn</span>;
  if (status === 'sap_het_han') return <span className="badge-warning" title={`Còn ${daysLeft} ngày`}><span className="material-symbols-outlined text-[10px]">warning</span> Sắp hết hạn</span>;
  if (status === 'con_han') return <span className="badge-success">Còn hạn</span>;
  return <span className="badge-neutral">—</span>;
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
  const [stats, setStats] = useState({ month: 0 });

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'ten_nguyen_lieu', direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showCrudModal, setShowCrudModal] = useState(false);
  const [showImportDrawer, setShowImportDrawer] = useState(false);
  const [crudData, setCrudData] = useState(EMPTY_CRUD);
  const [importData, setImportData] = useState(EMPTY_IMPORT);
  const [importPresetId, setImportPresetId] = useState(null);
  const [showExpiredHistory, setShowExpiredHistory] = useState(false);
  const [expiredHistory, setExpiredHistory] = useState([]);
  const [expiredLoading, setExpiredLoading] = useState(false);

  const enrichItem = (item) => {
    const ton = Number(item.ton_kho ?? 0);
    const nguong = Number(item.nguong_canh_bao || 0);
    let trang_thai_ton = 'con_hang';
    if (ton <= 0) trang_thai_ton = 'het_hang';
    else if (ton <= nguong) trang_thai_ton = 'sap_het';

    // Tính trạng thái hạn sử dụng
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let trang_thai_han = 'khong_co_han';
    let so_ngay_con_lai = null;
    if (item.han_su_dung) {
      const hanDate = new Date(item.han_su_dung);
      const diffTime = hanDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      so_ngay_con_lai = diffDays;
      if (diffDays < 0) trang_thai_han = 'het_han';
      else if (diffDays <= 7) trang_thai_han = 'sap_het_han';
      else trang_thai_han = 'con_han';
    }

    return { ...item, so_luong_ton: ton, trang_thai_ton, trang_thai_han, so_ngay_con_lai };
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [data, statsData] = await Promise.all([
        nlService.getNguyenLieu(),
        nlService.getCostStats(),
      ]);
      setList((data || []).map(enrichItem));
      setStats(statsData || { month: 0 });
    } catch (err) {
      toast(err.response?.data?.message || 'Không tải được dữ liệu kho.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, categoryFilter, expiryFilter]);

  /* Form động: tự động cập nhật đơn vị theo danh mục */
  const handleDanhMucFormChange = (targetCat) => {
    let updateFields = { danh_muc: targetCat };

    switch (targetCat) {
      case 'Nước uống đóng chai':
        updateFields.don_vi_nhap = 'chai';
        updateFields.don_vi_tinh = 'chai';
        updateFields.dung_tich_san_pham = 1;
        break;

      case 'Dụng cụ đóng gói':
        updateFields.don_vi_nhap = 'cái';
        updateFields.don_vi_tinh = 'cái';
        updateFields.dung_tich_san_pham = 1;
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
    if (crudData.danh_muc === 'Dụng cụ đóng gói') return;

    // Nước uống đóng chai: đồng bộ don_vi_tinh theo don_vi_nhap (chai ↔ chai, lon ↔ lon)
    if (crudData.danh_muc === 'Nước uống đóng chai') {
      setCrudData(prev => ({
        ...prev,
        don_vi_nhap: val,
        don_vi_tinh: val,
        dung_tich_san_pham: 1
      }));
      return;
    }

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
      sapHetHan: active.filter((i) => i.trang_thai_han === 'sap_het_han').length,
      hetHan: active.filter((i) => i.trang_thai_han === 'het_han').length,
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

  const filteredList = useMemo(() => {
    const searchClean = removeVietnameseTones(searchTerm);
    return list.filter((item) => {
      const matchSearch = !searchTerm.trim() ||
        removeVietnameseTones(item.ten_nguyen_lieu || '').includes(searchClean) ||
        String(item.ma_nguyen_lieu).includes(searchClean) ||
        removeVietnameseTones(item.danh_muc || '').includes(searchClean) ||
        removeVietnameseTones(item.don_vi_nhap || '').includes(searchClean) ||
        removeVietnameseTones(item.don_vi_tinh || '').includes(searchClean) ||
        removeVietnameseTones(item.ghi_chu || '').includes(searchClean);
      const matchCat = categoryFilter === 'all' || item.danh_muc === categoryFilter;
      const matchStatus = statusFilter === 'all' || item.trang_thai_ton === statusFilter;
      const matchExpiry = expiryFilter === 'all' || item.trang_thai_han === expiryFilter;
      return matchSearch && matchCat && matchStatus && matchExpiry;
    });
  }, [list, searchTerm, categoryFilter, statusFilter, expiryFilter]);

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
    const ton = Number(item.so_luong_ton ?? item.ton_kho ?? 0);
    const isVolumeSystem = item.danh_muc === 'Nguyên liệu pha chế';
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
    
    // Tách riêng logic ép dung tích
    let finalCapacity = 1.00;
    if (crudData.danh_muc === 'Nguyên liệu pha chế') {
      finalCapacity = crudData.don_vi_nhap === 'kg' ? 1000 : (parseFloat(crudData.dung_tich_san_pham) || 0);
    } else if (crudData.danh_muc === 'Nước uống đóng chai') {
      finalCapacity = parseFloat(crudData.dung_tich_san_pham) || 1;
    }

    if (finalCapacity <= 0) return toast('Dung tích sản phẩm quy đổi phải lớn hơn 0.', 'error');

    const isVolumeSystem = crudData.danh_muc === 'Nguyên liệu pha chế';
    const isBottledDrink = crudData.danh_muc === 'Nước uống đóng chai';

    try {
      const payload = {
        ten_nguyen_lieu: crudData.ten_nguyen_lieu.trim(),
        danh_muc: crudData.danh_muc,
        don_vi_tinh: isVolumeSystem ? (crudData.don_vi_nhap === 'kg' ? 'g' : crudData.don_vi_tinh) : (isBottledDrink ? crudData.don_vi_tinh : crudData.don_vi_nhap),
        don_vi_nhap: crudData.don_vi_nhap,
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
        items: [{ 
          ma_nguyen_lieu: parseInt(importData.ma_nguyen_lieu, 10), 
          so_luong: parseFloat(importData.so_luong), 
          gia_nhap: parseFloat(importData.gia_nhap),
          han_su_dung: importData.han_su_dung || null,
        }],
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

  const handleOpenExpiredHistory = async () => {
    setExpiredLoading(true);
    setShowExpiredHistory(true);
    try {
      const data = await nlService.getExpiredHistory();
      setExpiredHistory(data || []);
    } catch (err) {
      toast(err.response?.data?.message || 'Không tải được lịch sử hết hạn.', 'error');
      setExpiredHistory([]);
    } finally {
      setExpiredLoading(false);
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

  if (loading) return <div className="p-16 text-center text-muted font-medium animate-pulse">Đang tải dữ liệu nguyên liệu...</div>;

  return (
    <div className="space-y-3 text-on-surface pb-8">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }}>inventory_2</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-primary)" }}>Quản lý nguyên liệu</h2>
            <p className="text-xs text-muted">Khai báo nguyên liệu, theo dõi tồn kho và nhập hàng</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 self-start">
          <button type="button" onClick={handleOpenExpiredHistory} className="btn-outline !py-2.5 !px-4 !text-sm"><span className="material-symbols-outlined text-lg">history</span>Lịch sử hết hạn</button>
          <button type="button" onClick={openCreateModal} className="btn-primary !py-2.5 !px-4 !text-sm"><span className="material-symbols-outlined text-lg">add</span>Thêm nguyên liệu</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard label="Tổng nguyên liệu" value={statsSummary.total} icon="inventory_2" />
        <StatCard label="Sắp hết" value={statsSummary.sapHet} icon="warning" accent="bg-warning-bg text-warning" />
        <StatCard label="Hết hàng" value={statsSummary.hetHang} icon="error" accent="bg-error-container text-error" />
        <StatCard label="Sắp hết hạn" value={statsSummary.sapHetHan} icon="hourglass_top" accent="bg-warning-bg text-warning" />
        <StatCard label="Hết hạn" value={statsSummary.hetHan} icon="event_busy" accent="bg-error-container text-error" />
      </div>

      {/* Toolbar */}
      <div className="card p-4 md:p-5 border-none space-y-4">          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <input type="text" placeholder="Tìm kiếm..." className="peer input-field !pr-10 !py-2.5" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xl pointer-events-none peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0 transition-opacity">search</span>
            </div>
            <select className="input-field !w-auto lg:min-w-[140px] !py-2.5" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tất cả tồn kho</option>
              <option value="con_hang">Còn hàng</option>
              <option value="sap_het">Sắp hết</option>
              <option value="het_hang">Hết hàng</option>
            </select>
            <select className="input-field !w-auto lg:min-w-[160px] !py-2.5" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map((c) => (<option key={c} value={c}>{c === 'all' ? 'Tất cả danh mục' : c}</option>))}
            </select>
            <select className="input-field !w-auto lg:min-w-[140px] !py-2.5" value={expiryFilter} onChange={(e) => setExpiryFilter(e.target.value)}>
              <option value="all">Tất cả hạn</option>
              <option value="con_han">Còn hạn</option>
              <option value="sap_het_han">Sắp hết hạn</option>
              <option value="het_han">Hết hạn</option>
              <option value="khong_co_han">Không có hạn</option>
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
                  <span className="inline-flex items-center gap-1">Tồn kho<span className="material-symbols-outlined text-base">{getSortIcon('so_luong_ton')}</span></span>
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('nguong_canh_bao')}>
                  <span className="inline-flex items-center gap-1">Ngưỡng cảnh báo<span className="material-symbols-outlined text-base">{getSortIcon('nguong_canh_bao')}</span></span>
                </th>
                <th className="px-4 py-3">Đơn vị nhập</th>
                <th className="px-4 py-3">Trạng thái Và Hạn sử dụng</th>
                <th className="px-4 py-3 ">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {paginatedList.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted">Không có nguyên liệu phù hợp bộ lọc.</td></tr>
              ) : (
                paginatedList.map((item) => (
                  <tr key={item.ma_nguyen_lieu} className={`hover:bg-primary/5 transition-colors ${Number(item.trang_thai) === 0 ? 'opacity-50' : ''} ${item.trang_thai_han === 'het_han' ? 'bg-error-container/10' : item.trang_thai_han === 'sap_het_han' ? 'bg-warning-bg/10' : ''}`}>
                    <td className="px-4 py-3 font-semibold">{item.ten_nguyen_lieu}</td>
                    <td className="px-4 py-3 text-muted">{item.danh_muc || '—'}</td>
                    <td className="px-4 py-3">
                      {item.danh_muc === 'Nguyên liệu pha chế' ? item.don_vi_tinh : item.don_vi_nhap}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatTonKho(item)}</td>
                    <td className="px-4 py-3 text-muted">
                      {Number(item.nguong_canh_bao).toLocaleString('vi-VN')} {item.danh_muc === 'Nguyên liệu pha chế' ? item.don_vi_tinh : item.don_vi_nhap}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {item.don_vi_nhap || '—'}
                    </td>
                    {/* Cột gộp: Ngày lên trên, 2 trạng thái ở dưới */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {/* Dòng 1: Ngày hết hạn */}
                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                          {item.han_su_dung ? (
                            <span className={`font-medium ${item.trang_thai_han === 'het_han' ? 'text-error' : item.trang_thai_han === 'sap_het_han' ? 'text-warning' : 'text-on-surface'}`}>
                              {new Date(item.han_su_dung).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          ) : (
                            <span className="text-muted">Chưa có hạn sử dụng</span>
                          )}
                        </div>
                        {/* Dòng 2: Trạng thái tồn kho + Hạn sử dụng */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <StockStatusBadge status={item.trang_thai_ton} />
                          {item.han_su_dung && <ExpiryStatusBadge status={item.trang_thai_han} daysLeft={item.so_ngay_con_lai} />}
                          {Number(item.trang_thai) === 0 && <span className="badge-warning">Ngưng dùng</span>}
                        </div>
                      </div>
                    </td>
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
                      ? 'bg-primary text-white shadow-sm'
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

          {/* Phần nhập kho/quy đổi — hiển thị cho tất cả danh mục có quy đổi */}
          {(crudData.danh_muc === 'Nguyên liệu pha chế' || crudData.danh_muc === 'Nước uống đóng chai') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Đơn vị nhập kho</label>
                <select className="input-field" value={crudData.don_vi_nhap} onChange={(e) => handleDonViNhapChange(e.target.value)}>{(crudData.danh_muc === 'Nước uống đóng chai' ? DON_VI_DO_UONG_OPTIONS : DON_VI_NHAP_OPTIONS).map((d) => (<option key={d} value={d}>{d}</option>))}</select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Dung tích / quy đổi</label>
                <input type="number" className="input-field disabled:opacity-60 disabled:bg-slate-100 font-bold" value={crudData.don_vi_nhap === 'kg' ? 1000 : crudData.dung_tich_san_pham} onChange={(e) => setCrudData({ ...crudData, dung_tich_san_pham: e.target.value })} placeholder="1000" disabled={crudData.don_vi_nhap === 'kg'} />
                {crudData.danh_muc === 'Nước uống đóng chai' && (
                  <p className="text-xs text-muted mt-1">1 {crudData.don_vi_nhap} = {crudData.dung_tich_san_pham} đơn vị</p>
                )}
              </div>
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
      {/* Modal: Lịch sử nguyên liệu hết hạn */}
      {showExpiredHistory && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowExpiredHistory(false)}>
            <div className="modal-panel max-w-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2"><span className="material-symbols-outlined">history</span>Lịch sử nguyên liệu hết hạn</h2>
                <button type="button" onClick={() => setShowExpiredHistory(false)} className="btn-ghost !p-2" aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
              </div>

              {expiredLoading ? (
                <div className="text-center py-12 text-muted animate-pulse">Đang tải dữ liệu...</div>
              ) : expiredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-muted/40 block mb-3">check_circle</span>
                  <p className="text-muted font-medium">Không có nguyên liệu nào hết hạn.</p>
                  <p className="text-xs text-muted/60 mt-1">Hệ thống sẽ tự động ghi nhận khi nguyên liệu hết hạn.</p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-sm">
                    <thead className="table-head">
                      <tr>
                        <th className="px-3 py-2.5">Nguyên liệu</th>
                        <th className="px-3 py-2.5">Hạn SD</th>
                        <th className="px-3 py-2.5">Tồn kho hủy</th>
                        <th className="px-3 py-2.5">Ngày xử lý</th>
                        <th className="px-3 py-2.5">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline">
                      {expiredHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                          <td className="px-3 py-2.5 font-medium">{item.ten_nguyen_lieu}</td>
                          <td className="px-3 py-2.5 text-error text-xs">
                            {item.han_su_dung ? new Date(item.han_su_dung).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                          </td>
                          <td className="px-3 py-2.5 font-medium text-error">
                            {Number(item.ton_kho_con_lai).toLocaleString('vi-VN')} {item.don_vi || ''}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted">
                            {item.ngay_xu_ly ? new Date(item.ngay_xu_ly).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted max-w-[200px] truncate" title={item.ghi_chu}>{item.ghi_chu || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setShowExpiredHistory(false)} className="btn-outline">Đóng</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal: Nhập kho */}
      {showImportDrawer && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowImportDrawer(false)}>
            <div className="modal-panel max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2"><span className="material-symbols-outlined">add_shopping_cart</span>Nhập kho</h2>
                <button type="button" onClick={() => setShowImportDrawer(false)} className="btn-ghost !p-2" aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
              </div>
              <form id="form-nhap-kho" onSubmit={handleImport} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nguyên liệu *</label>
                  <select className="input-field" value={importData.ma_nguyen_lieu} onChange={(e) => setImportData({ ...importData, ma_nguyen_lieu: e.target.value })} required disabled={!!importPresetId}>
                    <option value="">— Chọn nguyên liệu —</option>
                    {list.filter((nl) => Number(nl.trang_thai) !== 0).map((nl) => (<option key={nl.ma_nguyen_lieu} value={nl.ma_nguyen_lieu}>{nl.ten_nguyen_lieu}</option>))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Nhà cung cấp</label>
                    <input className="input-field" value={importData.nha_cung_cap} onChange={(e) => setImportData({ ...importData, nha_cung_cap: e.target.value })} placeholder="Tên nhà cung cấp" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Ngày nhập</label>
                    <input type="date" className="input-field" value={importData.ngay_nhap} onChange={(e) => setImportData({ ...importData, ngay_nhap: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* Hạn sử dụng */}
                {selectedImportItemDetails && (
                  <div>
                    <label className="block text-sm font-semibold mb-1">Hạn sử dụng</label>
                    <input type="date" className="input-field" value={importData.han_su_dung} onChange={(e) => setImportData({ ...importData, han_su_dung: e.target.value })} />
                    <p className="text-xs text-muted mt-1">Nếu không nhập, hạn sử dụng cũ của nguyên liệu sẽ được giữ nguyên.</p>
                  </div>
                )}

                {/* Thông số định mức quy đổi */}
                {selectedImportItemDetails && (
                  <div className="p-3.5 rounded-xl bg-primary-container border border-primary/20 text-xs text-primary space-y-1">
                    <p className="font-medium">
                      Tỷ lệ nhập: 1 {selectedImportItemDetails.don_vi_nhap} = {Number(selectedImportItemDetails.dung_tich_san_pham).toLocaleString('vi-VN')} {selectedImportItemDetails.danh_muc === 'Nguyên liệu pha chế' ? selectedImportItemDetails.don_vi_tinh : selectedImportItemDetails.don_vi_nhap}
                    </p>
                    <p className="font-bold text-sm mt-1">
                      Tổng cộng thêm: <span className="underline font-black text-base">{actualVolumeToImport.toLocaleString('vi-VN')}</span> {selectedImportItemDetails.danh_muc === 'Nguyên liệu pha chế' ? selectedImportItemDetails.don_vi_tinh : selectedImportItemDetails.don_vi_nhap} vào tổng tồn kho gốc.
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
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowImportDrawer(false)} className="btn-outline flex-1">Hủy</button>
                  <button type="submit" className="btn-primary flex-1">Xác nhận nhập kho</button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

    </div>
  );
}