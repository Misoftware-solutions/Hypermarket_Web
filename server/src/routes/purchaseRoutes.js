const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

// Suppliers
router.get('/suppliers', purchaseController.getSuppliers);
router.post('/suppliers', purchaseController.createSupplier);

// Purchase Orders
router.get('/', purchaseController.getPurchaseOrders);
router.post('/', purchaseController.createPurchaseOrder);

module.exports = router;
