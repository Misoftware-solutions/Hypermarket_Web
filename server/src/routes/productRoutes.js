const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authorizeAdmin } = require('../middleware/auth');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', authorizeAdmin, productController.createProduct);
router.put('/:id', authorizeAdmin, productController.updateProduct);
router.delete('/:id', authorizeAdmin, productController.deleteProduct);

module.exports = router;
