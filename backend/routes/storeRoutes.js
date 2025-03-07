// backend/routes/storeRoutes.js
const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { auth, checkAdmin } = require('../middleware/auth');

router.get('/', auth, storeController.getAllStores);
router.post('/', auth, checkAdmin, storeController.createStore);
router.get('/:id', auth, storeController.getStoreById);
router.put('/:id', auth, checkAdmin, storeController.updateStore);
router.delete('/:id', auth, checkAdmin, storeController.deleteStore);

module.exports = router;