const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/daily-summary', isAuthenticated, reportController.getDailySummary);
router.get('/player-activity', isAuthenticated, reportController.getPlayerActivity);
router.get('/loyalty-rankings', isAuthenticated, reportController.getLoyaltyRankings);
router.get('/player/:pid', isAuthenticated, reportController.getPlayerReport);
router.get('/audit-log', isAuthenticated, isAdmin, reportController.getAuditLog);

module.exports = router;
