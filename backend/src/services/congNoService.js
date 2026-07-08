/* =====  CÔNG NỢ  =====
 * Xử lý nghiệp vụ công nợ nhà cung cấp
 * Liên kết: congNoController → congNoService → congNoRepository
 * ================================ */
const CongNoRepository = require("../repositories/congNoRepository");

const CongNoService = {
  getDanhSach: async (filters = {}) => {
    const { trang_thai, nha_cung_cap, search, from_date, to_date, limit, offset } = filters;
    return await CongNoRepository.getAll({
      trang_thai,
      nha_cung_cap,
      search,
      from_date,
      to_date,
      limit: parseInt(limit, 10) || 50,
      offset: parseInt(offset, 10) || 0,
    });
  },

  getThongKe: async ({ from_date, to_date } = {}) => CongNoRepository.getStats({ from_date, to_date }),

  thanhToan: async (ma_phieu, so_tien) => {
    if (!ma_phieu) throw new Error("Thiếu mã phiếu nhập");
    if (!so_tien || Number(so_tien) <= 0) throw new Error("Số tiền thanh toán phải lớn hơn 0");
    return await CongNoRepository.pay(parseInt(ma_phieu, 10), parseFloat(so_tien));
  },

  thanhToanTatCa: async () => CongNoRepository.payAll(),

  getLichSuThanhToan: async ({ from_date, to_date, search, limit, offset } = {}) => {
    return await CongNoRepository.getPayments({
      from_date,
      to_date,
      search,
      limit: parseInt(limit, 10) || 50,
      offset: parseInt(offset, 10) || 0,
    });
  },
};

module.exports = CongNoService;
