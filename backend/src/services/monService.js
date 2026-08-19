/* ===== MÓN CÔNG THỨC  =====
 * Xử lý nghiệp vụ: thêm/sửa/xóa món, POS menu, công thức, trừ kho
 * Liên kết: monController → monService → monRepository
 * ========================================== */
const MonRepository = require('../repositories/monRepository');

/** Gán trạng thái cho từng nguyên liệu trong công thức */
function enrichIngredientStatus(formulaItems) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (formulaItems || []).map((item) => {
    const tonKho = Number(item.ton_kho ?? 0);
    const dinhLuong = Number(item.dinh_luong || 1);
    let het_han = false;
    if (item.han_su_dung) {
      const hsd = new Date(item.han_su_dung);
      hsd.setHours(0, 0, 0, 0);
      het_han = hsd < today;
    }
    const het_hang = tonKho <= 0 || tonKho < dinhLuong;
    return {
      ...item,
      ton_kho: tonKho,
      het_han,
      het_hang,
    };
  });
}

/** Enrich món với trạng thái khóa */
function enrichMonStatus(m) {
  const formulaItems = Array.isArray(m.chi_tiet_cong_thuc) ? m.chi_tiet_cong_thuc : [];
  const enrichedFormula = enrichIngredientStatus(formulaItems);
  const het_han = enrichedFormula.some((i) => i.het_han);
  const het_hang =
    Number(m.so_luong_nguyen_lieu) > 0 && Number(m.so_luong_co_the_lam) <= 0;
  return {
    ...m,
    chi_tiet_cong_thuc: enrichedFormula,
    so_luong_nguyen_lieu: Number(m.so_luong_nguyen_lieu || 0),
    so_luong_co_the_lam: Number(m.so_luong_co_the_lam || 0),
    het_hang,
    het_han,
    bi_khoa: het_hang || het_han,
  };
}

const MonService = {
  getDanhSachMon: async () => {
    const all = await MonRepository.getAllWithEstimation();
    return all.map(enrichMonStatus);
  },

  getMenuPos: async () => {
    const all = await MonRepository.getAllWithEstimation();
    return all.map(enrichMonStatus).filter((m) => Number(m.trang_thai_ban) === 1);
  },

  themMonMoi: async (data) => {
    if (!data.ten_mon || data.gia_ban == null || data.gia_ban < 0) {
      throw new Error("Thông tin tên món và giá bán không hợp lệ!");
    }
    
    const name = String(data.ten_mon).trim();
    const existing = await MonRepository.findByName(name);
    if (existing) throw new Error(`Tên món "${name}" đã tồn tại!`);
    
    return await MonRepository.create(data);
  },

  capNhatMon: async (id, data) => {
    if (!id || !data.ten_mon || data.gia_ban == null || data.gia_ban < 0) {
      throw new Error("Dữ liệu cập nhật món nước không hợp lệ!");
    }
    
    const name = String(data.ten_mon).trim();
    const existing = await MonRepository.findByName(name, id);
    if (existing) throw new Error(`Tên món "${name}" đã tồn tại!`);
    
    return await MonRepository.update(id, data);
  },

  xoaMon: async (id) => MonRepository.delete(id),

  getMonById: async (id) => MonRepository.getById(id),

  getDanhMucMenu: async () => MonRepository.getCategories(),

  truKhoKhiBanHang: async (ma_mon, so_luong) => {
    if (!ma_mon || so_luong <= 0) {
      throw new Error("Mã món nước hoặc số lượng đơn hàng không hợp lệ!");
    }
    return await MonRepository.deductStockByOrder(ma_mon, so_luong);
  },

  /* ───── Công thức ───── */
  getCongThuc: async (ma_mon) => MonRepository.getFormulas(ma_mon),

  saveCongThuc: async (ma_mon, formulas) => MonRepository.saveFormulas(ma_mon, formulas),
};

module.exports = MonService;