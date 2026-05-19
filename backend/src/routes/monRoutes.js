const express = require('express');
const router = express.Router();
const MonController = require('../controllers/monController');

router.get('/', MonController.getAll);
router.get('/categories', MonController.getCategoryList);
router.post('/', MonController.create);
router.post('/sell', MonController.sellDish); // API Endpoint trừ kho tự động khi ra món
router.put('/:id', MonController.update);
router.delete('/:id', MonController.delete);

module.exports = router;