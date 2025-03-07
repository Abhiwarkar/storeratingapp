// backend/models/Rating.js
const { pool } = require('../config/db');

class Rating {
  // Get all ratings
  static async getAll() {
    const [ratings] = await pool.execute(`
      SELECT r.*, 
        s.name as storeName, 
        u.name as userName
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      JOIN users u ON r.user_id = u.id
    `);
    return ratings;
  }
  
  // Get rating by ID
  static async getById(id) {
    const [ratings] = await pool.execute(`
      SELECT r.*, 
        s.name as storeName, 
        u.name as userName
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [id]);
    return ratings.length ? ratings[0] : null;
  }
  
  // Get ratings by user ID
  static async getByUserId(userId) {
    const [ratings] = await pool.execute(`
      SELECT r.*, 
        s.name as storeName, 
        s.address as storeAddress
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = ?
    `, [userId]);
    return ratings;
  }
  
  // Get ratings by store ID
  static async getByStoreId(storeId) {
    const [ratings] = await pool.execute(`
      SELECT r.*, 
        u.name as userName, 
        u.email as userEmail
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [storeId]);
    return ratings;
  }
  
  // Get user's rating for a store
  static async getUserStoreRating(userId, storeId) {
    const [ratings] = await pool.execute(
      'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    return ratings.length ? ratings[0] : null;
  }
  
  // Create or update rating
  static async createOrUpdate(ratingData) {
    const { user_id, store_id, rating } = ratingData;
    
    // Check if rating exists
    const [existingRatings] = await pool.execute(
      'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?',
      [user_id, store_id]
    );
    
    if (existingRatings.length > 0) {
      // Update existing rating
      const [result] = await pool.execute(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, user_id, store_id]
      );
      return { updated: true, id: existingRatings[0].id };
    } else {
      // Create new rating
      const [result] = await pool.execute(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [user_id, store_id, rating]
      );
      return { updated: false, id: result.insertId };
    }
  }
  
  // Update rating
  static async update(id, rating) {
    const [result] = await pool.execute(
      'UPDATE ratings SET rating = ? WHERE id = ?',
      [rating, id]
    );
    return result.affectedRows > 0;
  }
  
  // Delete rating
  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM ratings WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
  
  // Get average rating for a store
  static async getAverageRating(storeId) {
    const [result] = await pool.execute(
      'SELECT AVG(rating) as averageRating FROM ratings WHERE store_id = ?',
      [storeId]
    );
    return result[0].averageRating || 0;
  }
  
  // Get rating distribution for a store
  static async getRatingDistribution(storeId) {
    const [result] = await pool.execute(`
      SELECT rating, COUNT(*) as count
      FROM ratings
      WHERE store_id = ?
      GROUP BY rating
      ORDER BY rating
    `, [storeId]);
    return result;
  }
}

module.exports = Rating;