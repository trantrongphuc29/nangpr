/* ===== 🧾 BÁN HÀNG - ĐƠN HÀNG - SERVICE =====
 * Xử lý nghiệp vụ: mở đơn, thêm món, gửi bar, thanh toán, chuyển bàn
 * Liên kết: donHangController → donHangService → donHangRepository
 * ============================================ */
const DonHangRepository = require("../repositories/donHangRepository");
const MonRepository = require("../repositories/monRepository");

const DonHangService = {
  getBanPosList: async () => DonHangRepository.getBanPosList(),

  openOrder: async ({ ma_ban, loai_don, ma_don_hang }) => {
    // Nếu có ma_don_hang → cập nhật trực tiếp (dùng cho takeaway/delivery không bàn)
    if (ma_don_hang) {
      if (loai_don) {
        await DonHangRepository.updateOrderType(ma_don_hang, loai_don);
      }
      return DonHangRepository.getOrderDetail(ma_don_hang);
    }
    if (ma_ban) {
      // Kiểm tra bàn có tồn tại không
      const banRow = await DonHangRepository.getBanById(ma_ban);
      if (!banRow) {
        throw { status: 400, message: `Bàn #${ma_ban} không tồn tại trong hệ thống` };
      }

      const existing = await DonHangRepository.findActiveByBan(ma_ban);
      if (existing) {
        // Cập nhật loại đơn nếu có thay đổi
        if (loai_don && loai_don !== existing.loai_don) {
          await DonHangRepository.updateOrderType(existing.ma_don_hang, loai_don);
        }
        return DonHangRepository.getOrderDetail(existing.ma_don_hang);
      }
    }
    const id = await DonHangRepository.create(ma_ban || null, loai_don);
    return DonHangRepository.getOrderDetail(id);
  },

  getOrder: async (id) => {
    const d = await DonHangRepository.getOrderDetail(id);
    if (!d) throw { status: 404, message: "Không tìm thấy đơn" };
    return d;
  },

  addItem: async (id, { ma_mon, so_luong = 1, ghi_chu_mon }) => {
    if (!ma_mon) throw { status: 400, message: "Thiếu mã món" };
    await DonHangRepository.addOrUpdateItem(id, parseInt(ma_mon, 10), parseInt(so_luong, 10), ghi_chu_mon);
    return DonHangRepository.getOrderDetail(id);
  },

  updateItem: async (id, ma_mon, so_luong) => {
    await DonHangRepository.updateItemQty(id, parseInt(ma_mon, 10), parseInt(so_luong, 10));
    return DonHangRepository.getOrderDetail(id);
  },

  sendToBar: async (id) => {
    const order = await DonHangRepository.getOrderDetail(id);
    if (!order) throw { status: 404, message: "Không tìm thấy đơn" };

    // Kiểm tra tồn kho + trừ kho cho từng món chưa gửi bar
    for (const item of order.items) {
      const soLuongChoBar = Number(item.so_luong) - Number(item.so_luong_da_gui_bar || 0);
      if (soLuongChoBar > 0) {
        await MonRepository.assertCanSell(item.ma_mon, soLuongChoBar);
        await MonRepository.deductStockByOrder(item.ma_mon, soLuongChoBar);
      }
    }

    const n = await DonHangRepository.sendToBar(id);
    if (!n) throw { status: 400, message: "Không có món mới để gửi bar" };
    return DonHangRepository.getOrderDetail(id);
  },

  getBarQueue: async () => DonHangRepository.getBarQueue(),

  getCancelHistory: async (id) => DonHangRepository.getCancelHistory(id),

  getAllCancelHistory: async (limit, offset) => DonHangRepository.getAllCancelHistory(limit, offset),

  getCompletedOrders: async (limit, offset) => DonHangRepository.getCompletedOrders(limit, offset),

  getRevenueReport: async (filters) => DonHangRepository.getRevenueReport(filters),

  updateItemNote: async (id, ma_mon, ghi_chu_mon) => {
    await DonHangRepository.updateItemNote(id, parseInt(ma_mon, 10), ghi_chu_mon);
    return DonHangRepository.getOrderDetail(id);
  },

  cancel: async (id) => {
    await DonHangRepository.cancelOrder(id);
    return { message: "Đã hủy đơn" };
  },

  updatePhiGiaoHang: async (id, phi_giao_hang) => {
    await DonHangRepository.updatePhiGiaoHang(id, phi_giao_hang);
    return DonHangRepository.getOrderDetail(id);
  },

  updateDeliveryInfo: async (id, data) => {
    await DonHangRepository.updateDeliveryInfo(id, data);
    return DonHangRepository.getOrderDetail(id);
  },

  moveOrder: async (id, { ma_ban_moi }) => {
    if (!ma_ban_moi) throw { status: 400, message: "Thiếu bàn đích" };
    const order = await DonHangRepository.getById(id);
    if (!order) throw { status: 404, message: "Không tìm thấy đơn" };
    if (order.ma_ban === parseInt(ma_ban_moi, 10)) throw { status: 400, message: "Bàn đích trùng với bàn hiện tại" };
    return DonHangRepository.moveOrder(parseInt(id, 10), parseInt(ma_ban_moi, 10));
  },

  checkout: async (id, hinh_thuc_thanh_toan) =>
    DonHangRepository.checkout(id, hinh_thuc_thanh_toan),
};

module.exports = DonHangService;
