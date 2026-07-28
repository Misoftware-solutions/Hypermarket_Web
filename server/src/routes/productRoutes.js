const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authorizeAdmin } = require('../middleware/auth');

router.get('/', productController.getAllProducts);
router.get('/inactive', authorizeAdmin, productController.getInactiveProducts);
router.get('/suggestions', productController.getProductSuggestions);
router.post('/search-record', productController.recordSearch);
router.post('/upload', authorizeAdmin, productController.uploadProductImage);
router.get('/:id', productController.getProductById);
router.post('/', authorizeAdmin, productController.createProduct);
router.put('/:id', authorizeAdmin, productController.updateProduct);
router.delete('/:id', authorizeAdmin, productController.deleteProduct);
router.put('/:id/restore', authorizeAdmin, productController.restoreProduct);
router.get('/:id/reviews', productController.getProductReviews);
router.post('/:id/reviews', productController.createProductReview);

module.exports = router;
