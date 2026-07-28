const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Reports Endpoints
router.get('/sales-summary', reportController.getSalesSummary);
router.get('/category-brand', reportController.getCategoryBrandSales);
router.get('/product-performance', reportController.getProductPerformance);
router.get('/inventory-health', reportController.getInventoryReport);
router.get('/tax-summary', reportController.getTaxReport);
router.get('/profit-margins', reportController.getProfitReport);

module.exports = router;
