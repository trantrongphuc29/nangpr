/* =====   BÀN  =====
 * Endpoint API cho Quản lý Bàn + POS
 * Prefix: /api/ban
 * ===================================== */
const express = require("express");
const banController = require("../controllers/banController");

const router = express.Router();

router.get("/", banController.getList);
router.post("/", banController.create);
router.put("/:id", banController.update);
router.delete("/:id", banController.remove);

/** POS: lấy danh sách bàn kèm trạng thái đơn — không yêu cầu auth */
router.get("/pos", banController.getPosList);

module.exports = router;
