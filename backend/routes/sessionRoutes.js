const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/:psid/seat-out', isAuthenticated, tableController.seatOut);

module.exports = router;
