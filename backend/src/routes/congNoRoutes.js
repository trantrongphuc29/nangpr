/* ===== 💰 CÔNG NỢ - ROUTES =====
 * Endpoint API cho module Công nợ
 * Prefix: /api/congno
 * ============================== */
const express = require('express');
const router = express.Router();
const CongNoController = require('../controllers/congNoController');

router.get('/', CongNoController.getAll);
router.get('/stats', CongNoController.getStats);
router.put('/:id/pay', CongNoController.pay);
router.post('/pay-all', CongNoController.payAll);

module.exports = router;
