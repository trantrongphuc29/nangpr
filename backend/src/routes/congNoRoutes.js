/* =====  CÔNG NỢ  =====
 * Endpoint API cho module Công nợ
 * Prefix: /api/congno
 * ============================== */
const express = require('express');
const router = express.Router();
const CongNoController = require('../controllers/congNoController');

router.get('/', CongNoController.getAll);
router.get('/stats', CongNoController.getStats);
router.get('/payments', CongNoController.getPayments); // Lịch sử thanh toán
router.put('/:id/pay', CongNoController.pay);
router.post('/pay-all', CongNoController.payAll);

module.exports = router;
