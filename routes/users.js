const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const userController = require('../controllers/userController');

// GET /api/users/me
router.get('/me', verifyToken, userController.getMe);

// PUT /api/users/me
router.put('/me', verifyToken, userController.updateMe);

module.exports = router;