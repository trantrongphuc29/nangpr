const express = require("express");
const nhanVienController = require("../controllers/nhanVienController");

const router = express.Router();

router.get("/", nhanVienController.getList);
router.get("/lich-phan-cong", nhanVienController.getAssignments);
router.post("/", nhanVienController.createStaff);
router.post("/phan-cong", nhanVienController.createAssignment);
router.delete("/phan-cong", nhanVienController.removeAssignment);
router.put("/:id", nhanVienController.updateStaff);
router.delete("/:id", nhanVienController.removeStaff);

module.exports = router;
