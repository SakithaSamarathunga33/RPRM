const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/', isAuthenticated, isAdmin, userController.getAllUsers);
router.post('/', isAuthenticated, isAdmin, userController.createUser);
router.put('/:uid/password', isAuthenticated, userController.updatePassword);

module.exports = router;
