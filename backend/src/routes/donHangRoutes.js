const express = require("express");
const DonHangController = require("../controllers/donHangController");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAdmin);

router.get("/ban", DonHangController.banList);
router.get("/bar/queue", DonHangController.barQueue);
router.post("/open", DonHangController.openOrder);
router.get("/:id", DonHangController.getOrder);
router.post("/:id/gui-bar", DonHangController.sendToBar);
router.post("/:id/items", DonHangController.addItem);
router.put("/:id/items/:ma_mon", DonHangController.updateItem);
router.delete("/:id/items/:ma_mon", DonHangController.removeItem);
router.post("/:id/cancel", DonHangController.cancel);
router.post("/:id/checkout", DonHangController.checkout);
router.post("/:id/move-ban", DonHangController.moveBan);
router.put("/:id/phi-giao-hang", DonHangController.updatePhiGiaoHang);
router.put("/:id/delivery-info", DonHangController.updateDeliveryInfo);

module.exports = router;
