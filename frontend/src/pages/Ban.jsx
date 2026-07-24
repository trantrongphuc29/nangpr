import { useCallback, useEffect, useMemo, useState } from "react";
import { createBan, deleteBanById, getBanList, updateBanById } from "../services/banService";
import { ToastContainer, useToast } from "../components/Toast";
import { useConfirm } from "../context/ConfirmContext";
import ModalPortal from "../components/ModalPortal";

// Tên bàn chỉ cho phép chữ (kể cả tiếng Việt có dấu), số và khoảng trắng
const INVALID_CHARS = /[^\p{L}\p{N} ]/gu;

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
};

/* ────────────── Modal thêm / sửa bàn ────────────── */
function BanFormModal({ open, editBan, onClose, onSave, loading }) {
  const [tenBan, setTenBan] = useState("");
  const [error, setError] = useState("");

  // Reset form khi mở modal
  useEffect(() => {
    if (open) {
      setTenBan(editBan ? editBan.ten_ban : "");
      setError("");
    }
  }, [open, editBan]);

  // Khi sửa: chỉ bật nút Cập nhật nếu tên đã thực sự thay đổi
  const isDirty = !editBan || tenBan.trim() !== (editBan.ten_ban || "").trim();
  const canSubmit = tenBan.trim().length > 0 && isDirty;

  const validateName = (name) => {
    if (!name || name.trim() === "") return "Vui lòng nhập tên bàn";
    // Chuẩn hóa NFC trước để dấu thanh tiếng Việt dạng decomposed không bị báo lỗi
    if (INVALID_CHARS.test(name.normalize('NFC'))) return "Tên bàn không được chứa ký tự đặc biệt";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ten = tenBan.trim();
    const validationError = validateName(ten);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!isDirty) return;
    setError("");
    await onSave(ten);
  };

  if (!open) return null;

  const title = editBan ? "Sửa tên bàn" : "Thêm bàn mới";

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-panel max-w-sm w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-primary">
                {editBan ? "edit" : "add"}
              </span>
              <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                         text-muted hover:text-on-surface hover:bg-surface/60
                         transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Tên bàn
              </label>
              <input
                value={tenBan}
                onChange={(e) => {
                  setTenBan(e.target.value);
                  if (error) setError("");
                }}
                placeholder="VD: Bàn 01, Bàn 02..."
                className="input-field w-full"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") onClose();
                }}
              />
              {error && (
                <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline flex-1"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-dashed rounded-full animate-spin" />
                    Đang xử lý...
                  </span>
                ) : editBan ? (
                  <>
                    <span className="material-symbols-outlined text-lg">check</span>
                    Cập nhật
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">add</span>
                    Thêm bàn
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ────────────── Component chính ────────────── */
export default function Ban() {
  const { toasts, show: toast, dismiss } = useToast();
  const { confirm } = useConfirm();
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editBan, setEditBan] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBanList("asc");
      setList(data);
    } catch (err) {
      toast("Không load được dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sắp xếp tăng dần theo tên bàn — dùng so sánh tự nhiên (numeric) để "Bàn 2" đứng trước "Bàn 10"
  const sortedList = useMemo(() => {
    return [...list].sort((a, b) =>
      (a.ten_ban || '').localeCompare(b.ten_ban || '', 'vi', { numeric: true, sensitivity: 'base' })
    );
  }, [list]);

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return sortedList;
    const q = removeVietnameseTones(searchTerm);
    return sortedList.filter((b) => removeVietnameseTones(b.ten_ban || '').includes(q));
  }, [sortedList, searchTerm]);

  /* ─── Mở modal thêm ─── */
  const openAddModal = () => {
    setEditBan(null);
    setModalOpen(true);
  };

  /* ─── Mở modal sửa ─── */
  const openEditModal = (ban) => {
    setEditBan(ban);
    setModalOpen(true);
  };

  /* ─── Đóng modal ─── */
  const closeModal = () => {
    setModalOpen(false);
    setEditBan(null);
  };

  /* Chuẩn hóa tên bàn: trim + gộp nhiều space thành 1 */
  const normalizeName = (str) => str.trim().replace(/\s+/g, ' ');

  /* ─── Thêm bàn ─── */
  const addBan = async (ten) => {
    const tenNorm = normalizeName(ten);
    // Kiểm tra trùng tên trên client (không phân biệt hoa/thường, ignore space thừa)
    if (list.some((b) => normalizeName(b.ten_ban).toLowerCase() === tenNorm.toLowerCase())) {
      return toast(`Tên bàn "${tenNorm}" đã tồn tại!`, "error");
    }

    try {
      setActionLoading(true);
      await createBan({ ten_ban: ten });
      toast(`Đã thêm bàn "${ten}"`);
      closeModal();
      loadData();
    } catch (err) {
      toast(err.response?.data?.message || "Lỗi khi thêm bàn", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ─── Sửa bàn ─── */
  const updateBan = async (ten) => {
    const tenNorm = normalizeName(ten);
    // Kiểm tra trùng tên trên client (loại trừ bàn hiện tại)
    const duplicate = list.some(
      (b) => b.ma_ban !== editBan.ma_ban && normalizeName(b.ten_ban).toLowerCase() === tenNorm.toLowerCase()
    );
    if (duplicate) {
      return toast(`Tên bàn "${tenNorm}" đã tồn tại!`, "error");
    }

    try {
      setActionLoading(true);
      await updateBanById(editBan.ma_ban, { ten_ban: ten });
      toast(`Đã cập nhật bàn thành "${ten}"`);
      closeModal();
      loadData();
    } catch (err) {
      toast(err.response?.data?.message || "Lỗi khi cập nhật bàn", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ─── Xóa bàn ─── */
  const deleteBan = async (ban) => {
    if (ban.dang_phuc_vu) {
      return toast("Bàn đang phục vụ, không thể xóa!", "error");
    }
    if (!(await confirm(`Xóa bàn "${ban.ten_ban}"?\nHành động này không thể hoàn tác.`, { danger: true, confirmLabel: "Xóa" }))) return;
    try {
      await deleteBanById(ban.ma_ban);
      toast(`Đã xóa bàn "${ban.ten_ban}"`);
      loadData();
    } catch (err) {
      toast(err.response?.data?.message || "Không thể xóa bàn", "error");
      loadData(); // đồng bộ lại trạng thái nếu server từ chối
    }
  };

  return (
    <div className="space-y-5 text-on-surface pb-8">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Quản lý bàn</h2>
          <p className="text-sm text-muted mt-0.5">
            Quản lý danh sách bàn phục vụ tại quán
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary shrink-0">
          <span className="material-symbols-outlined text-lg">add</span>
          Thêm bàn mới
        </button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xl pointer-events-none">
          search
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm bàn..."
          className="input-field !pl-10 !py-2.5"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center
                       text-muted hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* Danh sách bàn */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-primary border-dashed rounded-full animate-spin" />
            <p className="text-sm text-muted">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : list.length === 0 ? (
        <div className="card flex flex-col items-center py-20 text-muted">
          <span className="material-symbols-outlined text-5xl text-muted/20 mb-3">
            table_restaurant
          </span>
          <p className="text-sm font-medium">Chưa có bàn nào</p>
          <p className="text-xs text-muted/60 mt-1">Nhấn "Thêm bàn mới" để bắt đầu</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="card flex flex-col items-center py-20 text-muted">
          <span className="material-symbols-outlined text-4xl text-muted/20 mb-2">
            search_off
          </span>
          <p className="text-sm font-medium">Không tìm thấy bàn</p>
          <p className="text-xs text-muted/60 mt-1">
            Thử tìm kiếm với từ khác khác
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredList.map((ban) => (
            <div
              key={ban.ma_ban}
              className="card p-4 group hover:shadow-md transition-shadow duration-200"
            >
              {/* Thông tin bàn */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl text-primary">
                      table_restaurant
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface leading-tight">
                      {ban.ten_ban}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium mt-0.5 ${
                        ban.dang_phuc_vu ? "text-error" : "text-success"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          ban.dang_phuc_vu ? "bg-error" : "bg-success"
                        }`}
                      />
                      {ban.dang_phuc_vu ? "Đang phục vụ" : "Trống"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nút thao tác */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(ban)}
                  className="flex-1 btn-outline !py-1.5 !text-xs flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                  Sửa
                </button>
                <button
                  onClick={() => deleteBan(ban)}
                  disabled={ban.dang_phuc_vu}
                  title={ban.dang_phuc_vu ? "Bàn đang phục vụ, không thể xóa" : "Xóa bàn"}
                  className="flex-1 btn-outline !py-1.5 !text-xs flex items-center justify-center gap-1
                             !border-error/30 !text-error hover:!bg-error/5
                             disabled:opacity-40 disabled:cursor-not-allowed
                             disabled:hover:!bg-transparent disabled:active:scale-100"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal thêm / sửa */}
      <BanFormModal
        open={modalOpen}
        editBan={editBan}
        onClose={closeModal}
        onSave={editBan ? updateBan : addBan}
        loading={actionLoading}
      />
    </div>
  );
}
