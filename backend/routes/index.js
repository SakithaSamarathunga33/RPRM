const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const playerRoutes = require('./playerRoutes');
const tableRoutes = require('./tableRoutes');
const sessionRoutes = require('./sessionRoutes');
const transactionRoutes = require('./transactionRoutes');
const settingRoutes = require('./settingRoutes');
const reportRoutes = require('./reportRoutes');

router.use('/', authRoutes); // /api/login, /api/logout, /api/session
router.use('/users', userRoutes);
router.use('/players', playerRoutes);
router.use('/tables', tableRoutes);
router.use('/player-sessions', sessionRoutes);
router.use('/transactions', transactionRoutes);
router.use('/', settingRoutes); // settings, currencies, fx-rates are mixed
router.use('/reports', reportRoutes);

module.exports = router;
