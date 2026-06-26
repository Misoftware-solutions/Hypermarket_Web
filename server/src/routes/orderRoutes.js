const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', authorizeAdmin, orderController.getAllOrders);
router.post('/', authenticate, orderController.createOrder);
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/:id/status', authorizeAdmin, orderController.updateOrderStatus);
router.get('/customer/:customerId', authenticate, orderController.getCustomerOrders);

module.exports = router;
