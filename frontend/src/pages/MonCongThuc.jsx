/* ===== 🍽️ MÓN & CÔNG THỨC - TRANG CHÍNH =====
 * Quản lý danh sách món, thêm/sửa/xóa, gán công thức nguyên liệu
 * Components: MonFormModal, FormulaModal
 * ============================================== */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import * as monService from "../services/monService";
import * as nguyenlieuService from "../services/nguyenlieuService";
import * as congThucService from "../services/congThucService";
import { dishImage } from "../utils/shared";
import { ToastContainer, useToast } from "../components/Toast";
import { useConfirm } from "../context/ConfirmContext";
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
function MonFormModal({ mon, categories, onClose, onSaved, toast }) {
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
      toast("Vui lòng nhập tên món", "error");
      return;
    }

    if (!form.gia_ban || Number(form.gia_ban) < 0) {
      toast("Giá bán không hợp lệ", "error");
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
      toast(err.response?.data?.message || err.message || "Lỗi lưu món", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">restaurant_menu</span>
            {isEdit ? "Cập nhật món" : "Thêm món mới"}
          </h2>

          <button type="button" onClick={onClose} disabled={busy} className="btn-ghost !p-2">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 md:px-8 pb-6 md:pb-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Tên món
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="VD: Latte Hạnh Nhân"
                value={form.ten_mon}
                onChange={(e) => setForm({ ...form, ten_mon: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Phân loại
              </label>
              <select
                className="input-field"
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
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Giá bán
              </label>
              <div className="relative">
                <PriceInput
                  className="input-field pr-14"
                  placeholder="0"
                  value={form.gia_ban}
                  onChange={(val) =>
                    setForm({ ...form, gia_ban: val })
                  }
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
                  VNĐ
                </span>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Hình ảnh
              </label>

              <div className="group relative h-[120px] border-2 border-dashed border-outline rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="Xem trước món"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-muted group-hover:text-primary transition-colors">
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
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Trạng thái phục vụ
              </label>
              <select
                className="input-field"
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
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Mô tả ngắn
              </label>
              <textarea
                className="input-field resize-none"
                placeholder="Nhập vài dòng giới thiệu về hương vị của món..."
                rows="3"
                value={form.mo_ta}
                onChange={(e) => setForm({ ...form, mo_ta: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={busy} className="btn-outline flex-1">
              Hủy
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy
                ? "Đang lưu..."
                : isEdit
                ? "Lưu thay đổi"
                : "Lưu & tiếp tục tạo công thức"}
            </button>
          </div>
        </form>
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
          <h2 className="text-xl font-bold text-primary flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined">menu_book</span>
            <span className="truncate">
              Công thức: <span className="text-secondary">{mon.ten_mon}</span>
            </span>
          </h2>

          <button type="button" onClick={onClose} className="btn-ghost !p-2 shrink-0">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6">
          {error && (
            <div className="alert-error text-error bg-error-container/20 border border-error/20 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">
              Nguyên liệu
            </label>
            <select
              className="input-field"
              value={selectedNL}
              onChange={(e) => {
                setSelectedNL(e.target.value);
                setError("");
              }}
            >
              <option value="">-- Chọn nguyên liệu --</option>
              {nguyenLieuList.map((nl) => (
                <option key={nl.ma_nguyen_lieu} value={nl.ma_nguyen_lieu}>
                  {nl.ten_nguyen_lieu}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl border border-outline bg-surface-container-low/60">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
              Định lượng
            </p>
            <div className="flex flex-wrap md:flex-nowrap gap-3">
              <div className="flex-1 min-w-[100px]">
                <label className="block text-xs font-semibold text-muted mb-1">
                  Số lượng
                </label>
                <input
                  className="input-field"
                  placeholder="25"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>

              <div className="w-28">
                <label className="block text-xs font-semibold text-muted mb-1">
                  Đơn vị
                </label>
                <select
                  className="input-field"
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
                  className="btn-primary !h-[42px] !px-5"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Thêm
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-on-surface">
                Thành phần đã thêm
              </h3>
              <span className="text-xs text-muted">
                {formulaItems.length} nguyên liệu
              </span>
            </div>

            {formulaItems.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-outline text-muted text-sm">
                Chưa có nguyên liệu nào
              </div>
            ) : (
              <div className="space-y-2">
                {formulaItems.map((item) => (
                  <div
                    key={item.ma_nguyen_lieu}
                    className="flex items-center justify-between p-3 rounded-lg border border-outline bg-surface-container-lowest"
                  >
                    <span className="text-sm font-medium text-on-surface truncate">
                      {item.ten_nguyen_lieu}
                    </span>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold text-primary tabular-nums">
                        {item.dinh_luong} {item.don_vi_tinh_chi_tiet}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.ma_nguyen_lieu)}
                        disabled={busy}
                        className="btn-icon-delete !w-8 !h-8 !p-0"
                      >
                        <span className="material-symbols-outlined text-base">
                          delete_outline
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-outline flex gap-3">
          <button type="button" onClick={onClose} disabled={busy} className="btn-outline flex-1">
            Hủy
          </button>
          <button type="button" onClick={handleSave} disabled={busy} className="btn-primary flex-1">
            {busy ? "Đang lưu..." : "Lưu công thức"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────── Trang chính: Quản lý món & công thức ──────── */
export default function MonCongThuc() {
  const { toasts, show: toast, dismiss } = useToast();
  const { confirm } = useConfirm();
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
    if (!(await confirm(`Xóa món "${name}"?`, { danger: true, confirmLabel: "Xóa" }))) return;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Quản lý món & công thức</h2>
          <p className="text-sm text-muted">Danh sách món ăn và đồ uống</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="input-field !pr-10 !py-2.5 w-full sm:w-56"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xl pointer-events-none">
              search
            </span>
          </div>
          <button onClick={handleOpenCreate} className="btn-primary !py-2.5 !px-4 !text-sm shrink-0">
            <span className="material-symbols-outlined text-lg">add</span>
            Thêm món mới
          </button>
        </div>
      </div>

      {/* Danh mục */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-outline whitespace-nowrap custom-scrollbar">
        {['Tất cả', ...categories.map(c => c.ten_danh_muc)].map((tabName) => (
          <button
            key={tabName}
            onClick={() => { setSelectedCategory(tabName); setCurrentPage(1); }}
            className="px-3 py-2.5 text-xs font-bold transition-all border-b-2 shrink-0"
            style={{
              color: selectedCategory === tabName ? "var(--color-primary)" : "var(--color-on-surface-variant)",
              borderBottomColor: selectedCategory === tabName ? "var(--color-primary)" : "transparent",
            }}
          >
            {tabName}
          </button>
        ))}
      </div>

      {/* Danh sách món */}
      <div className="grid grid-cols-1 gap-3">
        {paginatedMonList.map((mon) => {
          if (!mon) return null;

          // Formula items — backend đã parse JSON_ARRAYAGG thành array
          const formulaItems = Array.isArray(mon.chi_tiet_cong_thuc) ? mon.chi_tiet_cong_thuc : [];
          const hasFormula = formulaItems.length > 0;

          return (
            <div key={mon.ma_mon} className="card group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center text-muted shrink-0 overflow-hidden">
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
                    <span className="badge-primary">{mon.ten_danh_muc || 'Chưa phân nhóm'}</span>
                    {!hasFormula && (
                      <span className="badge-error">Chưa có công thức</span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors mt-1 truncate">{mon.ten_mon}</h4>

                  <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hasFormula && mon.so_luong_co_the_lam > 0 ? 'bg-success' : 'bg-warning'}`}></span>
                    {hasFormula ? `Ước lượng làm được: ${mon.so_luong_co_the_lam} phần` : 'Vui lòng gán nguyên liệu cho món này'}
                  </p>

                  {hasFormula && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {formulaItems.map((item, idx) => (
                        <span
                          key={item.ma_nguyen_lieu ?? idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted px-2 py-0.5 rounded-md bg-surface-container-high"
                          title={`${item.ten_nguyen_lieu}: ${item.dinh_luong} ${item.don_vi_tinh_chi_tiet}`}
                        >
                          {item.ten_nguyen_lieu}
                          <span className="font-semibold text-on-surface-variant">{item.dinh_luong}{item.don_vi_tinh_chi_tiet}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-none pt-3 sm:pt-0 border-outline/40">
                <div className="text-left sm:text-right shrink-0">
                  <span className="block text-[11px] text-muted">Đơn giá</span>
                  <span className="text-lg font-bold text-primary tabular-nums">{Number(mon.gia_ban).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenFormula(mon)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all"
                    style={{
                      color: hasFormula ? "var(--color-primary)" : "var(--color-error)",
                      backgroundColor: hasFormula
                        ? "color-mix(in srgb, var(--color-primary) 8%, transparent)"
                        : "color-mix(in srgb, var(--color-error) 8%, transparent)",
                    }}
                  >
                    <span className="material-symbols-outlined text-base">menu_book</span>
                    Công thức
                  </button>
                  <button onClick={() => handleOpenEdit(mon)} className="btn-icon-edit !w-8 !h-8 !p-0">
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button onClick={() => handleDelete(mon.ma_mon, mon.ten_mon)} className="btn-icon-delete !w-8 !h-8 !p-0">
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMonList.length === 0 && (
          <div className="flex flex-col items-center py-16 text-muted">
            <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
            <p className="font-medium">Không tìm thấy món phù hợp</p>
          </div>
        )}
      </div>

      {/* Phân trang */}
      {filteredMonList.length > itemsPerPage && (
        <div className="px-2 py-2 flex justify-between items-center text-xs text-muted">
          <span>Trang {currentPage} / {totalPages} ({filteredMonList.length} món)</span>
          <div className="flex gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-surface-container-high"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  currentPage === i + 1 ? "text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
                style={currentPage === i + 1 ? { backgroundColor: "var(--color-primary)" } : {}}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-surface-container-high"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit dish */}
      {showMonModal && (
        <MonFormModal
          mon={editMon}
          categories={categories}
          toast={toast}
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