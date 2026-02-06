const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, transactionController.getAllTransactions);
router.post('/buyin', isAuthenticated, transactionController.buyIn);
router.post('/cashout', isAuthenticated, transactionController.cashOut);
router.post('/expense', isAuthenticated, transactionController.createExpense);

module.exports = router;
