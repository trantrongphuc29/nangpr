const express = require('express');
const router = express.Router();
const NguyenLieuController = require('../controllers/nguyenlieuController');

router.get('/', NguyenLieuController.getAll); 
router.get('/history', NguyenLieuController.getHistory); 
router.get('/stats', NguyenLieuController.getReportStats); // Thống kê chi phí theo mốc thời gian
router.post('/', NguyenLieuController.create);
router.put('/:id', NguyenLieuController.update);
router.delete('/:id', NguyenLieuController.delete);
router.post('/import', NguyenLieuController.importStock); 

module.exports = router;