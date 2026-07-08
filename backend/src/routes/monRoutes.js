/* ===== MÓN  CÔNG THỨC  =====
 * Định nghĩa endpoint API cho Món, Công thức, POS Menu
 * Prefix: /api/mon
 * ======================================== */
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const MonController = require("../controllers/monController");

const uploadDir = path.join(__dirname, "../../uploads/anh-mon");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `mon-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, gif, ...)"), false);
    }
    cb(null, true);
  },
});

router.get("/", MonController.getAll);
router.get("/categories", MonController.getCategoryList);
router.get("/pos", MonController.getMenuPos);

const uploadMiddleware = upload.single("hinh_anh");

/** Wrap multer để bắt lỗi validation (dung lượng, định dạng) trả về 400 thay vì 500 */
const handleUpload = (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "File ảnh quá lớn. Kích thước tối đa là 5MB."
          : err.message || "Lỗi upload ảnh";
      return res.status(400).json({ message });
    }
    next();
  });
};

router.post("/", handleUpload, MonController.create);
router.put("/:id", handleUpload, MonController.update);
router.delete("/:id", MonController.delete);

router.post("/sell", MonController.sellDish);

router.get("/:id/cong-thuc", MonController.getCongThuc);
router.put("/:id/cong-thuc", MonController.saveCongThuc);

module.exports = router;