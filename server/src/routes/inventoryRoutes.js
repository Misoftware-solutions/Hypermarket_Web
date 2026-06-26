const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authorizeAdmin } = require('../middleware/auth');

router.get('/', authorizeAdmin, inventoryController.getInventory);
router.put('/:id', authorizeAdmin, inventoryController.updateStock);

module.exports = router;
