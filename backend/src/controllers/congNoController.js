/* =====  CÔNG NỢ  =====
 * Tiếp nhận request HTTP, gọi Service, trả response
 * ================================== */
const CongNoService = require("../services/congNoService");

const CongNoController = {
  /** Lấy danh sách công nợ */
  getAll: async (req, res) => {
    try {
      const { trang_thai, nha_cung_cap, search, from_date, to_date, limit, offset } = req.query;
      const data = await CongNoService.getDanhSach({
        trang_thai,
        nha_cung_cap,
        search,
        from_date,
        to_date,
        limit: parseInt(limit, 10) || 50,
        offset: parseInt(offset, 10) || 0,
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /** Lấy thống kê công nợ */
  getStats: async (req, res) => {
    try {
      const { from_date, to_date } = req.query;
      const data = await CongNoService.getThongKe({ from_date, to_date });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /** Thanh toán công nợ */
  pay: async (req, res) => {
    try {
      const { id } = req.params;
      const { so_tien } = req.body;
      const result = await CongNoService.thanhToan(id, so_tien);
      res.json({ message: "Thanh toán thành công!", data: result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  /** Thanh toán tất cả công nợ */
  payAll: async (req, res) => {
    try {
      const result = await CongNoService.thanhToanTatCa();
      res.json({ message: `Đã thanh toán ${result.so_phieu} phiếu với tổng ${result.tong_tien.toLocaleString('vi-VN')}đ`, data: result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  /** Lấy lịch sử thanh toán */
  getPayments: async (req, res) => {
    try {
      const { from_date, to_date, search, limit, offset } = req.query;
      const data = await CongNoService.getLichSuThanhToan({
        from_date,
        to_date,
        search,
        limit: parseInt(limit, 10) || 50,
        offset: parseInt(offset, 10) || 0,
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = CongNoController;
