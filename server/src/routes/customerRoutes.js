const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', authorizeAdmin, customerController.getAllCustomers);
router.get('/:id', authenticate, customerController.getCustomerById);
router.put('/:id', authenticate, customerController.updateCustomer);

module.exports = router;
