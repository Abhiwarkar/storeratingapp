// backend/controllers/ratingController.js
const { pool } = require('../config/db');

// Submit or update rating
exports.submitRating = async (req, res) => {
  const { storeId, rating } = req.body;
  const userId = req.user.id;

  try {
    // Validate input
    if (!storeId || !rating) {
      return res.status(400).json({ message: 'Store ID and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Check if store exists
    const [stores] = await pool.execute('SELECT * FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Check if user has already rated this store
    const [existingRatings] = await pool.execute(
      'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    
    if (existingRatings.length > 0) {
      // Update existing rating
      await pool.execute(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, userId, storeId]
      );
      
      res.json({ message: 'Rating updated successfully' });
    } else {
      // Insert new rating
      await pool.execute(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
      
      res.status(201).json({ message: 'Rating submitted successfully' });
    }
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update existing rating
exports.updateRating = async (req, res) => {
  const ratingId = req.params.id;
  const { rating } = req.body;
  const userId = req.user.id;

  try {
    // Validate input
    if (!rating) {
      return res.status(400).json({ message: 'Rating is required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Check if rating exists and belongs to the user
    const [ratings] = await pool.execute(
      'SELECT * FROM ratings WHERE id = ?',
      [ratingId]
    );
    
    if (ratings.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    if (ratings[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update this rating' });
    }
    
    // Update rating
    await pool.execute(
      'UPDATE ratings SET rating = ? WHERE id = ?',
      [rating, ratingId]
    );
    
    res.json({ message: 'Rating updated successfully' });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get ratings by user
exports.getUserRatings = async (req, res) => {
  const userId = req.params.userId;

  try {
    // If not admin and not requesting own ratings, return error
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to view these ratings' });
    }
    
    // Get ratings with store info
    const [ratings] = await pool.execute(`
      SELECT r.*, s.name as storeName, s.address as storeAddress
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = ?
    `, [userId]);
    
    res.json(ratings);
  } catch (error) {
    console.error('Error getting user ratings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get ratings for a store
exports.getStoreRatings = async (req, res) => {
  const storeId = req.params.storeId;

  try {
    // Check if store exists
    const [stores] = await pool.execute('SELECT * FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // If store owner, check if they own this store
    if (req.user.role === 'store_owner') {
      const [ownedStores] = await pool.execute(
        'SELECT * FROM stores WHERE id = ? AND owner_id = ?',
        [storeId, req.user.id]
      );
      
      if (ownedStores.length === 0) {
        return res.status(403).json({ message: 'You are not authorized to view these ratings' });
      }
    }
    
    // Get ratings with user info
    const [ratings] = await pool.execute(`
      SELECT r.*, u.name as userName, u.email as userEmail
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [storeId]);
    
    res.json(ratings);
  } catch (error) {
    console.error('Error getting store ratings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};