const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, playerController.getAllPlayers);
router.post('/', isAuthenticated, playerController.createPlayer);
router.get('/next-id', isAuthenticated, playerController.getNextId);
router.put('/:pid', isAuthenticated, playerController.updatePlayer);

module.exports = router;
