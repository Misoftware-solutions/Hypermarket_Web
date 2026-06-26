const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { authorizeAdmin } = require('../middleware/auth');

router.get('/', brandController.getAllBrands);
router.post('/', authorizeAdmin, brandController.createBrand);
router.put('/:id', authorizeAdmin, brandController.updateBrand);
router.delete('/:id', authorizeAdmin, brandController.deleteBrand);

module.exports = router;
