const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/:customerId', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/item/:itemId', cartController.updateCartItem);
router.delete('/item/:itemId', cartController.removeCartItem);

module.exports = router;
