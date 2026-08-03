const express = require("express");
const payrollController = require("../controllers/payrollController");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/bang-cong", requireAdmin, payrollController.getBangCong);
router.get("/bang-cong/chi-tiet", requireAdmin, payrollController.getBangCongChiTiet);
router.get("/bang-luong", requireAdmin, payrollController.getBangLuong);

// Khoản điều chỉnh: thưởng / khấu trừ / tạm ứng (thêm-xóa chỉ khi "Chưa chốt")
router.get("/bang-luong/dieu-chinh", requireAdmin, payrollController.getDieuChinh);
router.post("/bang-luong/dieu-chinh", requireAdmin, payrollController.addDieuChinh);
router.delete("/bang-luong/dieu-chinh/:id", requireAdmin, payrollController.deleteDieuChinh);

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

