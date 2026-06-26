const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.get('/:customerId', authenticate, cartController.getCart);
router.post('/', authenticate, cartController.addToCart);
router.put('/item/:itemId', authenticate, cartController.updateCartItem);
router.delete('/item/:itemId', authenticate, cartController.removeCartItem);

module.exports = router;
