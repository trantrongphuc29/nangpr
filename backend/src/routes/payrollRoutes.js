const express = require("express");
const payrollController = require("../controllers/payrollController");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/bang-cong", requireAdmin, payrollController.getBangCong);
router.get("/bang-cong/chi-tiet", requireAdmin, payrollController.getBangCongChiTiet);
router.get("/bang-luong", requireAdmin, payrollController.getBangLuong);

// Cập nhật trường thủ công (chỉ khi "Chưa chốt")
router.put("/bang-luong/nhan-vien", requireAdmin, payrollController.updateBangLuongEmployee);

// Chốt / Mở chốt / Đã thanh toán
router.post("/ky-luong/chot", requireAdmin, payrollController.lockKyLuong);
router.post("/ky-luong/mo-chot", requireAdmin, payrollController.unlockKyLuong);
router.post("/ky-luong/danh-dau-da-thanh-toan", requireAdmin, payrollController.markKyLuongPaid);
router.post("/ky-luong/hoan-tac-thanh-toan", requireAdmin, payrollController.revertKyLuongPaid);

// Cấu hình lương nhân viên
router.get("/luong-nhan-vien", requireAdmin, payrollController.getLuongNhanVien);
router.put("/luong-nhan-vien/bulk", requireAdmin, payrollController.upsertLuongNhanVienBulk);

// Ngày lễ / hệ số lương
router.get("/ngay-le", requireAdmin, payrollController.getNgayLe);
router.post("/ngay-le", requireAdmin, payrollController.upsertNgayLe);
router.delete("/ngay-le/:ngay", requireAdmin, payrollController.deleteNgayLe);

module.exports = router;

