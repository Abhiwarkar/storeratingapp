// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth, checkAdmin, checkStoreOwner } = require('../middleware/auth');

router.get('/admin', auth, checkAdmin, dashboardController.getAdminStats);
router.get('/store-owner/:storeId', auth, checkStoreOwner, dashboardController.getStoreOwnerStats);

module.exports = router;