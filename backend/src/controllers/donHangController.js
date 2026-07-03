/* ===== 🧾 BÁN HÀNG - ĐƠN HÀNG - CONTROLLER =====
 * Tiếp nhận request HTTP cho module Đơn hàng POS
 * ============================================== */
const DonHangService = require("../services/donHangService");

const DonHangController = {
  /** Lấy danh sách bàn cho POS */
  banList: async (req, res) => {
    try {
      const data = await DonHangService.getBanPosList();
      res.json(data);
    } catch (e) {
      res.status(500).json({ message: e.message || "Lỗi danh sách bàn" });
    }
  },

  openOrder: async (req, res) => {
    try {
      const data = await DonHangService.openOrder(req.body);
      res.status(201).json(data);
    } catch (e) {
      res.status(e.status || 400).json({ message: e.message || "Lỗi mở đơn" });
    }
  },

  getOrder: async (req, res) => {
    try {
      const data = await DonHangService.getOrder(parseInt(req.params.id, 10));
      res.json(data);
    } catch (e) {
      res.status(e.status || 500).json({ message: e.message });
    }
  },

  addItem: async (req, res) => {
    try {
      const data = await DonHangService.addItem(parseInt(req.params.id, 10), req.body);
      res.json(data);
    } catch (e) {
      res.status(400).json({ message: e.message || "Không thêm được món" });
    }
  },

  updateItem: async (req, res) => {
    try {
      const data = await DonHangService.updateItem(
        parseInt(req.params.id, 10),
        req.params.ma_mon,
        req.body.so_luong
      );
      res.json(data);
    } catch (e) {
      res.status(400).json({ message: e.message || "Lỗi cập nhật" });
    }
  },

  cancel: async (req, res) => {
    try {
      const data = await DonHangService.cancel(parseInt(req.params.id, 10));
      res.json(data);
    } catch (e) {
      res.status(400).json({ message: e.message || "Không hủy được đơn" });
    }
  },

  checkout: async (req, res) => {
    try {
      const data = await DonHangService.checkout(
        parseInt(req.params.id, 10),
        req.body.hinh_thuc_thanh_toan
      );
      res.json({ message: "Thanh toán thành công!", data });
    } catch (e) {
      res.status(400).json({ message: e.message || "Thanh toán thất bại" });
    }
  },

  sendToBar: async (req, res) => {
    try {
      const data = await DonHangService.sendToBar(parseInt(req.params.id, 10));
      res.json({ message: "Đã gửi món xuống bar", data });
    } catch (e) {
      res.status(e.status || 400).json({ message: e.message });
    }
  },

  moveBan: async (req, res) => {
    try {
      const data = await DonHangService.moveOrder(parseInt(req.params.id, 10), req.body);
      res.json({ message: "Đã chuyển bàn thành công", data });
    } catch (e) {
      res.status(e.status || 400).json({ message: e.message || "Không thể chuyển bàn" });
    }
  },

  barQueue: async (req, res) => {
    try {
      res.json(await DonHangService.getBarQueue());
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  /** Lấy lịch sử huỷ món của một đơn */
  cancelHistory: async (req, res) => {
    try {
      const data = await DonHangService.getCancelHistory(parseInt(req.params.id, 10));
      res.json(data);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  /** Lấy danh sách đơn đã hoàn thành */
  completedOrders: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const offset = parseInt(req.query.offset, 10) || 0;
      const data = await DonHangService.getCompletedOrders(limit, offset);
      res.json(data);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  /** Lấy báo cáo doanh thu với bộ lọc + phân trang */
  revenueReport: async (req, res) => {
    try {
      const { period, date, from_date, to_date, loai_don, hinh_thuc_thanh_toan, limit, offset } = req.query;
      const data = await DonHangService.getRevenueReport({
        period,
        date,
        from_date,
        to_date,
        loai_don,
        hinh_thuc_thanh_toan,
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0,
      });
      res.json(data);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  /** Lấy tất cả lịch sử huỷ */
  allCancelHistory: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const offset = parseInt(req.query.offset, 10) || 0;
      const data = await DonHangService.getAllCancelHistory(limit, offset);
      res.json(data);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  updatePhiGiaoHang: async (req, res) => {
    try {
      const data = await DonHangService.updatePhiGiaoHang(
        parseInt(req.params.id, 10),
        req.body.phi_giao_hang
      );
      res.json({ message: "Đã cập nhật phí giao hàng", data });
    } catch (e) {
      res.status(e.status || 400).json({ message: e.message || "Lỗi cập nhật phí giao hàng" });
    }
  },

  updateItemNote: async (req, res) => {
    try {
      const data = await DonHangService.updateItemNote(
        parseInt(req.params.id, 10),
        req.params.ma_mon,
        req.body.ghi_chu_mon
      );
      res.json(data);
    } catch (e) {
      res.status(400).json({ message: e.message || "Lỗi cập nhật ghi chú" });
    }
  },

  updateDeliveryInfo: async (req, res) => {
    try {
      const data = await DonHangService.updateDeliveryInfo(
        parseInt(req.params.id, 10),
        req.body
      );
      res.json({ message: "Đã cập nhật thông tin giao hàng", data });
    } catch (e) {
      res.status(400).json({ message: e.message || "Lỗi cập nhật thông tin giao hàng" });
    }
  },
};

module.exports = DonHangController;
