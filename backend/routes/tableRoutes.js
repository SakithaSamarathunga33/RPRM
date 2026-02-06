const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, tableController.getTables);
router.post('/', isAuthenticated, tableController.createTable);
router.post('/:tid/close', isAuthenticated, tableController.closeTable);
router.get('/:tid/players', isAuthenticated, tableController.getTablePlayers);
router.post('/:tid/seat-in', isAuthenticated, tableController.seatIn);
// Note: seat-out is /player-sessions/:psid/seat-out in original server.js
// I should probably keep it there or map it here. Structure-wise, it relates to the session.
// I'll create a separate route or handle it in table routes if I can map it.
// The original was /api/player-sessions/:psid/seat-out.
// I will create a separate route for player-sessions or just add it here with a comment on how to mount.
// Ideally, mounting at /api/tables and /api/player-sessions separately.
// For now, I'll put seat-out in a separate file or just include it here and user can mount it?
// No, I'll create `sessionRoutes.js` for player-sessions or just put it in `tableRoutes` and assume the prefix is handled or route is specific.
// I'll put it here but with the full path if I mount at /api, OR I'll assume mounting at /api/tables and /api/player-sessions.
// I'll create a separate `sessionRoutes.js` for clean separation as per REST.

module.exports = router;
