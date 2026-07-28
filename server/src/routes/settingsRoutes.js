const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authorizeAdmin } = require('../middleware/auth');

router.get('/', settingsController.getSettings);
router.put('/', authorizeAdmin, settingsController.updateSettings);

module.exports = router;
