/* ===== 🧾 BÁN HÀNG - ĐƠN HÀNG - ROUTES =====
 * Endpoint API cho Đơn hàng POS (mở đơn, thêm món, thanh toán...)
 * Prefix: /api/pos
 * ========================================== */
const express = require("express");
const DonHangController = require("../controllers/donHangController");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAdmin);

router.get("/ban", DonHangController.banList);
router.get("/bar/queue", DonHangController.barQueue);
router.post("/open", DonHangController.openOrder);
// ⚠️ Các route tĩnh PHẢI đặt trước route /:id — nếu không Express sẽ hiểu "completed-orders"
//    hoặc "cancel-history" là tham số :id và chạy sai controller!
router.get("/revenue", DonHangController.revenueReport);
router.get("/completed-orders", DonHangController.completedOrders);
router.get("/cancel-history", DonHangController.allCancelHistory);
router.get("/:id/cancel-history", DonHangController.cancelHistory);
router.get("/:id", DonHangController.getOrder);
router.post("/:id/gui-bar", DonHangController.sendToBar);
router.post("/:id/items", DonHangController.addItem);
router.put("/:id/items/:ma_mon", DonHangController.updateItem);
router.put("/:id/items/:ma_mon/note", DonHangController.updateItemNote);
router.post("/:id/cancel", DonHangController.cancel);
router.post("/:id/checkout", DonHangController.checkout);
router.post("/:id/move-ban", DonHangController.moveBan);
router.put("/:id/phi-giao-hang", DonHangController.updatePhiGiaoHang);
router.put("/:id/delivery-info", DonHangController.updateDeliveryInfo);

module.exports = router;
