const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authorizeAdmin } = require('../middleware/auth');

router.get('/stats', authorizeAdmin, dashboardController.getDashboardStats);

module.exports = router;
