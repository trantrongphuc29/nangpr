const MonRepository = require('../repositories/monRepository');

const MonService = {
  getDanhSachMon: async () => {
    return await MonRepository.getAllWithEstimation();
  },
  
  themMonMoi: async (data) => {
    if (!data.ten_mon || data.gia_ban < 0) {
      throw new Error("Thông tin tên món và giá bán không hợp lệ!");
    }
    return await MonRepository.createWithFormula(data);
  },
  
  capNhatMon: async (id, data) => {
    if (!id || !data.ten_mon || data.gia_ban < 0) {
      throw new Error("Dữ liệu cập nhật món nước không hợp lệ!");
    }
    return await MonRepository.updateWithFormula(id, data);
  },
  
  xoaMon: async (id) => {
    return await MonRepository.delete(id);
  },

  getDanhMucMenu: async () => {
    return await MonRepository.getCategories();
  },

  truKhoKhiBanHang: async (ma_mon, so_luong) => {
    if (!ma_mon || so_luong <= 0) {
      throw new Error("Mã món nước hoặc số lượng đơn hàng không hợp lệ!");
    }
    return await MonRepository.deductStockByOrder(ma_mon, so_luong);
  }
};

module.exports = MonService;