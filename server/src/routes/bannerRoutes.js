const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authorizeAdmin } = require('../middleware/auth');

router.get('/', bannerController.getActiveBanners);
router.get('/all', authorizeAdmin, bannerController.getAllBanners);
router.post('/', authorizeAdmin, bannerController.createBanner);
router.post('/upload', authorizeAdmin, bannerController.uploadBannerImage);
router.put('/:id', authorizeAdmin, bannerController.updateBanner);
router.delete('/:id', authorizeAdmin, bannerController.deleteBanner);

module.exports = router;
