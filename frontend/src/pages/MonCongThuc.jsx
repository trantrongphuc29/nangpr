/* ===== 🍽️ MÓN & CÔNG THỨC - TRANG CHÍNH =====
 * Quản lý danh sách món, thêm/sửa/xóa, gán công thức nguyên liệu
 * Components: MonFormModal, FormulaModal
 * ============================================== */
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import * as monService from "../services/monService";
import * as nguyenlieuService from "../services/nguyenlieuService";
import * as congThucService from "../services/congThucService";
import { dishImage } from "../utils/shared";
import { ToastContainer, useToast } from "../components/Toast";
import PriceInput from "../components/PriceInput";

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

/* ──────── Modal: Thêm / Sửa món ──────── */
/* ──────── Modal: Thêm / Sửa món ──────── */
function MonFormModal({ mon, categories, onClose, onSaved }) {
  const isEdit = Boolean(mon?.ma_mon);

  const [form, setForm] = useState({
    ma_mon: mon?.ma_mon || null,
    ten_mon: mon?.ten_mon || "",
    gia_ban: mon?.gia_ban ? parseInt(mon.gia_ban) : "",
    ma_danh_muc: mon?.ma_danh_muc || "",
    trang_thai_ban: mon?.trang_thai_ban ?? 1,
    hinh_anh: (mon?.hinh_anh && mon.hinh_anh !== "{}") ? mon.hinh_anh : "",
    hinh_anh_file: null,
    mo_ta: mon?.mo_ta || "",
  });

  const [preview, setPreview] = useState(
    mon?.hinh_anh && mon.hinh_anh !== "{}" ? dishImage(mon.hinh_anh) : ""
  );

  const [busy, setBusy] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      hinh_anh_file: file,
      hinh_anh: file.name,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.ten_mon.trim()) {
      alert("Vui lòng nhập tên món");
      return;
    }

    if (!form.gia_ban || Number(form.gia_ban) < 0) {
      alert("Giá bán không hợp lệ");
      return;
    }

    setBusy(true);

    try {
      const payload = new FormData();

      payload.append("ten_mon", form.ten_mon);
      payload.append("gia_ban", form.gia_ban);
      payload.append("ma_danh_muc", form.ma_danh_muc);
      payload.append("trang_thai_ban", form.trang_thai_ban);
      payload.append("mo_ta", form.mo_ta || "");

      if (form.hinh_anh_file) {
        payload.append("hinh_anh", form.hinh_anh_file);
      }

      if (isEdit && form.hinh_anh && form.hinh_anh !== "{}") {
        payload.append("hinh_anh_cu", form.hinh_anh);
      }

      if (isEdit) {
        await monService.updateMonCu(form.ma_mon, payload);
      } else {
        await monService.createMonMoi(payload);
      }

      onSaved?.(isEdit ? "Cập nhật món thành công!" : "Thêm món mới thành công!");
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Lỗi lưu món");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block mb-2">
              Solaris Atelier
            </span>
            <h2 className="font-headline text-2xl font-black text-primary tracking-tight">
              {isEdit ? "Cập nhật món" : "Thêm món mới"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="p-2 hover:bg-surface-container-low rounded-full transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block font-label text-sm font-semibold text-on-surface-variant mb-2">
                Tên món
              </label>
              <input
                type="text"
                className="w-full input-field"
                placeholder="VD: Latte Hạnh Nhân"
                value={form.ten_mon}
                onChange={(e) => setForm({ ...form, ten_mon: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block font-label text-sm font-semibold text-on-surface-variant mb-2">
                Phân loại
              </label>

              <div className="relative">
                <select
                  className="w-full input-field appearance-none"
                  value={form.ma_danh_muc}
                  onChange={(e) =>
                    setForm({ ...form, ma_danh_muc: e.target.value })
                  }
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.ma_danh_muc} value={c.ma_danh_muc}>
                      {c.ten_danh_muc}
                    </option>
                  ))}
                </select>

                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  expand_more
                </span>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">                    <label className="block font-label text-sm font-semibold text-on-surface-variant mb-2">
                Giá bán
              </label>

              <div className="relative">
                <PriceInput
                  className="w-full input-field pr-16"
                  placeholder="0"
                  value={form.gia_ban}
                  onChange={(val) =>
                    setForm({ ...form, gia_ban: val })
                  }
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-primary">
                  VNĐ
                </span>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block font-label text-sm font-semibold text-on-surface-variant mb-2">
                Hình ảnh
              </label>

              <div className="group relative h-[160px] border-2 border-dashed border-primary/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden">
                {preview ? (
                  <img
                  src={preview}
                  alt="Xem trước món"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                ) : (
                  <div className="flex items-center gap-2 text-on-surface-variant/60 group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">
                      cloud_upload
                    </span>
                    <span className="text-sm font-medium">Tải ảnh lên</span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block font-label text-sm font-semibold text-on-surface-variant mb-2">
                Trạng thái phục vụ
              </label>

              <div className="relative">
                <select
                  className="w-full input-field appearance-none"
                  value={form.trang_thai_ban}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      trang_thai_ban: parseInt(e.target.value),
                    })
                  }
                >
                  <option value={1}>Đang bán</option>
                  <option value={0}>Tạm ngưng</option>
                </select>

                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  expand_more
                </span>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block font-label text-sm font-semibold text-on-surface-variant mb-2">
                Mô tả ngắn
              </label>

              <textarea
                className="w-full input-field resize-none"
                placeholder="Nhập vài dòng giới thiệu về hương vị của món..."
                rows="3"
                value={form.mo_ta}
                onChange={(e) => setForm({ ...form, mo_ta: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col md:flex-row gap-4 items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="w-full md:w-auto px-6 py-3 text-on-surface-variant font-semibold hover:bg-primary/5 rounded-lg transition-all active:scale-95"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={busy}
              className="btn-primary !px-6 !py-2.5 !text-sm"
            >
              {busy
                ? "Đang lưu..."
                : isEdit
                ? "Lưu thay đổi"
                : "Lưu & Tiếp tục tạo Công thức"}
            </button>
          </div>
        </form>

        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-primary to-secondary" />
      </div>
    </div>
  );
}

/* ──────── Modal: Quản lý công thức nguyên liệu ──────── */
function FormulaModal({ mon, nguyenLieuList, onClose, onSaved }) {
  const [busy, setBusy] = useState(false);
  const [selectedNL, setSelectedNL] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("ml");
  const [error, setError] = useState("");

  const [formulaItems, setFormulaItems] = useState(
    Array.isArray(mon.chi_tiet_cong_thuc) ? mon.chi_tiet_cong_thuc : []
  );

  const selectedIngredient = nguyenLieuList.find(
    (nl) => Number(nl.ma_nguyen_lieu) === Number(selectedNL)
  );

  const handleAdd = () => {
    if (!selectedIngredient) {
      setError("Vui lòng chọn nguyên liệu.");
      return;
    }

    if (!qty || Number(qty) <= 0) {
      setError("Vui lòng nhập số lượng hợp lệ.");
      return;
    }

    const existed = formulaItems.some(
      (item) => Number(item.ma_nguyen_lieu) === Number(selectedIngredient.ma_nguyen_lieu)
    );

    if (existed) {
      setError("Nguyên liệu này đã có trong công thức.");
      return;
    }

    setFormulaItems((prev) => [
      ...prev,
      {
        ma_nguyen_lieu: Number(selectedIngredient.ma_nguyen_lieu),
        ten_nguyen_lieu: selectedIngredient.ten_nguyen_lieu,
        dinh_luong: Number(qty),
        don_vi_tinh_chi_tiet: unit,
      },
    ]);

    setSelectedNL("");
    setQty("");
    setUnit("ml");
    setError("");
  };

  const handleRemove = (maNL) => {
    setFormulaItems((prev) =>
      prev.filter((item) => Number(item.ma_nguyen_lieu) !== Number(maNL))
    );
  };

  const handleSave = async () => {
    if (formulaItems.length === 0) {
      setError("Món phải có ít nhất 1 nguyên liệu.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await congThucService.saveCongThuc(mon.ma_mon, formulaItems);
      onSaved?.("Cập nhật công thức thành công!");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi lưu công thức");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 flex items-center justify-between border-b border-outline">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">assignment</span>
            </div>

            <h3 className="font-display text-xl font-extrabold text-primary truncate">
              Gán Công thức:{" "}
              <span className="text-secondary">{mon.ten_mon}</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10 text-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-error-container text-error text-xs font-bold">
              {error}
            </div>
          )}

          <section className="mb-8">
            <label className="block text-sm font-semibold text-on-surface-variant mb-3">
              Chọn Nguyên liệu từ Kho
            </label>

            <div className="flex items-center bg-primary/5 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20">
              <span className="material-symbols-outlined text-muted mr-3">
                inventory
              </span>

              <select
                className="w-full bg-transparent border-none focus:ring-0 text-on-surface font-medium appearance-none cursor-pointer"
                value={selectedNL}
                onChange={(e) => {
                  setSelectedNL(e.target.value);
                  setError("");
                }}
              >
                <option value="">Tìm nguyên liệu...</option>
                {nguyenLieuList.map((nl) => (
                  <option key={nl.ma_nguyen_lieu} value={nl.ma_nguyen_lieu}>
                    {nl.ten_nguyen_lieu}
                  </option>
                ))}
              </select>

              <span className="material-symbols-outlined text-muted">
                arrow_drop_down
              </span>
            </div>
          </section>

          <section className="mb-10 p-6 bg-primary/5 rounded-xl border border-primary/10">
            <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">
              Định lượng thành phần
            </h4>

            <div className="flex flex-wrap md:flex-nowrap gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-muted uppercase mb-1 px-1">
                  Số lượng
                </label>

                <input
                  className="w-full input-field font-semibold text-primary"
                  placeholder="25"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>

              <div className="w-32">
                <label className="block text-[10px] font-bold text-muted uppercase mb-1 px-1">
                  Đơn vị
                </label>

                <select
                  className="w-full input-field font-medium appearance-none"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                  <option value="lon">lon</option>
                  <option value="chai">chai</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={busy}
                  className="bg-primary text-white h-[48px] px-6 rounded-lg font-bold shadow-sm flex items-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">add</span>
                  Thêm
                </button>
              </div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4 px-2">
              <h4 className="text-sm font-bold text-on-surface">
                Thành phần đã thêm
              </h4>

              <span className="text-xs font-medium text-muted">
                Tổng cộng: {formulaItems.length} nguyên liệu
              </span>
            </div>

            <div className="space-y-1">
              {formulaItems.length === 0 ? (
                <div className="p-8 text-center bg-primary/5 rounded-lg border border-dashed border-primary/20 text-muted text-sm font-bold">
                  Chưa có nguyên liệu nào
                </div>
              ) : (
                formulaItems.map((item) => (
                  <div
                    key={item.ma_nguyen_lieu}
                    className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg group hover:bg-primary/5 transition-colors border border-outline/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-primary/30" />

                      <div>
                        <p className="font-bold text-primary text-sm">
                          {item.ten_nguyen_lieu}
                        </p>
                        <p className="text-[10px] text-muted font-medium">
                          Nguyên liệu trong kho
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <span className="font-display font-extrabold text-primary">
                        {item.dinh_luong} {item.don_vi_tinh_chi_tiet}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.ma_nguyen_lieu)}
                        disabled={busy}
                        className="text-muted hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined">
                          delete_outline
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="px-8 py-6 bg-primary/5 flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-6 py-2.5 rounded-lg font-bold text-on-surface-variant hover:bg-primary/10 transition-colors"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="bg-primary text-white px-8 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {busy ? "Đang lưu..." : "Lưu Công thức"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────── Trang chính: Quản lý món & công thức ──────── */
export default function MonCongThuc() {
  const { toasts, show: toast, dismiss } = useToast();
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

  const [editMon, setEditMon] = useState(null);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [dataMon, dataNL, dataCate] = await Promise.all([
        monService.getDanhSachMon(),
        nguyenlieuService.getNguyenLieu(),
        monService.getDanhMucMenu(),
      ]);
      setMonList(dataMon || []);
      setNguyenLieuList(dataNL || []);
      setCategories(dataCate || []);
    } catch (err) {
      toast(err.response?.data?.message || "Không tải được dữ liệu thực đơn.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ─── Handlers ───
  const handleOpenCreate = () => {
    setEditMon(null);
    setShowMonModal(true);
  };

  const handleOpenEdit = (mon) => {
    setEditMon(mon);
    setShowMonModal(true);
  };

  const handleOpenFormula = (mon) => {
    setActiveMon(mon);
    setShowFormulaModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa món "${name}"?`)) return;
    try {
      await monService.deleteMonCu(id);
      toast(`Đã xóa món "${name}"`);
      if (activeMon?.ma_mon === id) {
        setActiveMon(null);
        setShowFormulaModal(false);
      }
      await loadAllData();
    } catch (err) {
      toast(err.response?.data?.message || "Không thể xóa món.", "error");
    }
  };

  const handleMonSaved = (msg) => {
    toast(msg);
    loadAllData();
  };

  // --- BỘ LỌC TÌM KIẾM THEO DANH MỤC TABS VÀ TÊN KHÔNG DẤU ---
  const filteredMonList = useMemo(() => {
    if (!Array.isArray(monList)) return [];
    let result = [...monList];

    // Lọc theo Tabs danh mục món ăn
    if (selectedCategory !== 'Tất cả') {
      result = result.filter(m => m && m.ten_danh_muc === selectedCategory);
    }

    // Lọc theo ký tự tìm kiếm không dấu (tên, mã, danh mục, giá)
    if (searchTerm.trim() !== '') {
      const searchClean = removeVietnameseTones(searchTerm);
      result = result.filter(m => m && (
        removeVietnameseTones(m.ten_mon || '').includes(searchClean) ||
        String(m.ma_mon).includes(searchClean) ||
        removeVietnameseTones(m.ten_danh_muc || '').includes(searchClean) ||
        String(m.gia_ban || '').includes(searchClean)
      ));
    }

    return result;
  }, [monList, selectedCategory, searchTerm]);

  /* Thống kê số lượng món theo danh mục */
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-dashed rounded-full animate-spin" />
        </div>
    );
  }

  return (
    <div className="space-y-3 text-on-surface pb-8">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full pb-6 border-b gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Quản lý món & công thức</h2>
          <p className="text-sm text-muted">Danh sách món ăn và đồ uống</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">            <div className="relative w-full sm:w-auto group">
            <input 
              className="peer pl-4 pr-10 py-2.5 bg-surface-container-low border-none rounded-lg text-sm w-full focus:ring-2 focus:ring-primary/40 transition-all" 
              placeholder="Tìm kiếm..." 
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-muted pointer-events-none peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0 transition-opacity">
              <span className="material-symbols-outlined text-xl">search</span>
            </span>
          </div>
          <button onClick={handleOpenCreate} className="btn-primary !py-2.5 !px-4 !text-sm">
            <span className="material-symbols-outlined text-lg">add</span>
            Thêm món mới
          </button>
        </div>
      </header>

     

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
          
          // Formula items — backend đã parse JSON_ARRAYAGG thành array
          const formulaItems = Array.isArray(mon.chi_tiet_cong_thuc) ? mon.chi_tiet_cong_thuc : [];
          const hasFormula = formulaItems.length > 0;

          return (
            <div key={mon.ma_mon} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-surface-container-low border border-outline transition-all duration-300 shadow-sm hover:shadow-md gap-4">
              <div className="flex items-center gap-5 flex-1">
                <div className="w-16 h-16 rounded-lg bg-surface-container border flex items-center justify-center text-2xl shadow-inner shrink-0 overflow-hidden">
                  {mon.hinh_anh ? (
                    <img
                      src={dishImage(mon.hinh_anh)}
                      alt={mon.ten_mon}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <span className={`${mon.hinh_anh ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                    {mon.ten_danh_muc?.includes('Café') ? <span className="material-symbols-outlined">coffee</span> : mon.ten_danh_muc?.includes('Soda') ? <span className="material-symbols-outlined">local_bar</span> : <span className="material-symbols-outlined">local_cafe</span>}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">{mon.ten_danh_muc || 'Chưa phân nhóm'}</span>
                    
                    {/* KHỐI HIỂN THỊ TRẠNG THÁI ẨN/HIỆN ĐỘNG BẢO VỆ ĐƠN HÀNG */}
                    {!hasFormula && (
                      <span className="badge-error">Vui lòng tạo công thức</span>
                    )}
                  </div>
                  <h4 className="text-lg font-extrabold text-primary group-hover:text-secondary transition-colors uppercase tracking-tight mt-1">{mon.ten_mon}</h4>
                  
                  <p className="text-xs font-bold text-muted mt-0.5 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${hasFormula && mon.so_luong_co_the_lam > 0 ? 'bg-success' : 'bg-warning'}`}></span>
                    {hasFormula ? `Quầy bar ước lượng làm được: ${mon.so_luong_co_the_lam} phần` : 'Chưa có công thức — vui lòng gán nguyên liệu'}
                  </p>

                  {/* Danh sách công thức hiển thị ngay trong card */}
                  {hasFormula && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {formulaItems.map((item, idx) => (
                        <span
                          key={item.ma_nguyen_lieu ?? idx}
                          className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/5 text-primary/80 px-2.5 py-1 rounded-full border border-primary/10"
                          title={`${item.ten_nguyen_lieu}: ${item.dinh_luong} ${item.don_vi_tinh_chi_tiet}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                          {item.ten_nguyen_lieu}
                          <span className="font-black text-primary">{item.dinh_luong}{item.don_vi_tinh_chi_tiet}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-8 border-t sm:border-none pt-3 sm:pt-0 border-dashed">
                <div className="text-left sm:text-right">
                  <span className="block text-[10px] font-black text-muted uppercase tracking-wider">Đơn giá</span>
                  <span className="text-lg font-black text-primary tracking-tight">{Number(mon.gia_ban).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenFormula(mon)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${hasFormula ? 'bg-[var(--color-input-bg)] text-primary hover:bg-primary hover:text-on-primary' : 'badge-error hover:bg-error hover:text-white border-0'}`}>
                    <span className="material-symbols-outlined text-base">menu_book</span>
                    <span>Công thức</span>
                  </button>                    <button onClick={() => handleOpenEdit(mon)} className="btn-icon-edit !w-8 !h-8 !p-0">
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>                    <button onClick={() => handleDelete(mon.ma_mon, mon.ten_mon)} className="btn-icon-delete !w-8 !h-8 !p-0">
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

      {/* Modal: Add/Edit dish */}
      {showMonModal && (
        <MonFormModal
          mon={editMon}
          categories={categories}
          onClose={() => {
            setShowMonModal(false);
            setEditMon(null);
          }}
          onSaved={handleMonSaved}
        />
      )}

      {/* Modal: Formula management — search + add ingredients + current formula */}
      {showFormulaModal && activeMon && (
        <FormulaModal
          mon={activeMon}
          nguyenLieuList={nguyenLieuList}
          onClose={() => {
            setShowFormulaModal(false);
            setActiveMon(null);
          }}
          onSaved={handleMonSaved}
        />
      )}
    </div>
  );
}