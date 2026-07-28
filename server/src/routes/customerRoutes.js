const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', authorizeAdmin, customerController.getAllCustomers);
router.get('/:id', authenticate, customerController.getCustomerById);
router.put('/:id', authenticate, customerController.updateCustomer);
router.post('/:id/addresses', authenticate, customerController.addAddress);
router.delete('/:id/addresses/:addressId', authenticate, customerController.deleteAddress);
router.put('/:id/addresses/:addressId/default', authenticate, customerController.setDefaultAddress);
router.put('/:id/addresses/:addressId', authenticate, customerController.updateAddress);

module.exports = router;

