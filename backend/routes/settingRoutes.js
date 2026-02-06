const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/settings', isAuthenticated, settingController.getSettings);
router.put('/settings', isAuthenticated, isAdmin, settingController.updateSettings);

router.get('/currencies', isAuthenticated, settingController.getCurrencies);
router.get('/fx-rates', isAuthenticated, settingController.getFxRates);
router.post('/fx-rates', isAuthenticated, settingController.updateFxRate);
router.get('/fx-rates/current/:code', isAuthenticated, settingController.getCurrentRate);

module.exports = router;
