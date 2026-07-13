const express = require("express");
const nhanVienController = require("../controllers/nhanVienController");
const caLinhHoatController = require("../controllers/caLinhHoatController");

const router = express.Router();

router.get("/", nhanVienController.getList);
router.get("/lich-phan-cong", nhanVienController.getAssignments);
router.post("/", nhanVienController.createStaff);

// MỚI: Route để cập nhật ẩn hiện (Sử dụng PATCH hoặc PUT đều được)
router.patch("/:id/status", nhanVienController.toggleStatus);

router.post("/phan-cong", nhanVienController.createAssignment);
router.delete("/phan-cong", nhanVienController.removeAssignment);

// Ca linh hoạt (giờ tùy chỉnh) — các route tĩnh phải đặt trước /:id
router.get("/lich-phan-cong-linh-hoat", caLinhHoatController.getAssignments);
router.post("/phan-cong-linh-hoat", caLinhHoatController.createAssignment);
router.put("/phan-cong-linh-hoat/:id", caLinhHoatController.updateAssignment);
router.delete("/phan-cong-linh-hoat/:id", caLinhHoatController.removeAssignment);

router.put("/:id", nhanVienController.updateStaff);
router.delete("/:id", nhanVienController.removeStaff);

module.exports = router;