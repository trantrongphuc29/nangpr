/* ===== 🥬 NGUYÊN LIỆU - ROUTES =====
 * Định nghĩa các endpoint API cho module Nguyên liệu
 * Prefix: /api/nguyenlieu
 * ==================================== */
const express = require('express');
const router = express.Router();
const NguyenLieuController = require('../controllers/nguyenlieuController');

router.get('/', NguyenLieuController.getAll);
router.get('/categories', NguyenLieuController.getCategories);
router.get('/history', NguyenLieuController.getHistory); 
router.get('/stats', NguyenLieuController.getReportStats); // Thống kê chi phí theo mốc thời gian
router.post('/', NguyenLieuController.create);
router.put('/:id', NguyenLieuController.update);
router.patch('/:id/status', NguyenLieuController.setStatus);
router.delete('/:id', NguyenLieuController.delete);
router.post('/import', NguyenLieuController.importStock); 

module.exports = router;