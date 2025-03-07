// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, checkAdmin } = require('../middleware/auth');

router.get('/', auth, checkAdmin, userController.getAllUsers);
router.post('/', auth, checkAdmin, userController.createUser);
router.get('/:id', auth, checkAdmin, userController.getUserById);
router.put('/:id', auth, checkAdmin, userController.updateUser);
router.delete('/:id', auth, checkAdmin, userController.deleteUser);

module.exports = router;