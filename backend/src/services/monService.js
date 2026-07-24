/* ===== MÓN CÔNG THỨC  =====
 * Xử lý nghiệp vụ: thêm/sửa/xóa món, POS menu, công thức, trừ kho
 * Liên kết: monController → monService → monRepository
 * ========================================== */
const MonRepository = require('../repositories/monRepository');

const MonService = {
  getDanhSachMon: async () => MonRepository.getAllWithEstimation(),

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

  /** POS: lấy danh sách món với trạng thái hết hàng & hết hạn */
  getMenuPos: async () => {
    const all = await MonRepository.getAllWithEstimation();
    return all.map((m) => {
      const het_han = Number(m.co_nguyen_lieu_het_han || 0) === 1;
      const het_hang = Number(m.so_luong_nguyen_lieu) > 0 && Number(m.so_luong_co_the_lam) <= 0;
      return {
        ...m,
        so_luong_nguyen_lieu: Number(m.so_luong_nguyen_lieu || 0),
        so_luong_co_the_lam: Number(m.so_luong_co_the_lam || 0),
        het_hang,
        het_han,
        bi_khoa: het_hang || het_han,
      };
    });
  },

  /* ───── Công thức ───── */
  getCongThuc: async (ma_mon) => MonRepository.getFormulas(ma_mon),

  saveCongThuc: async (ma_mon, formulas) => MonRepository.saveFormulas(ma_mon, formulas),
};

module.exports = MonService;