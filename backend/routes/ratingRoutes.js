// backend/routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { auth } = require('../middleware/auth');

router.post('/', auth, ratingController.submitRating);
router.put('/:id', auth, ratingController.updateRating);
router.get('/user/:userId', auth, ratingController.getUserRatings);
router.get('/store/:storeId', auth, ratingController.getStoreRatings);

module.exports = router;