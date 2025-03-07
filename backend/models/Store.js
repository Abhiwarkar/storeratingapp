// backend/models/Store.js
const { pool } = require('../config/db');

class Store {
  // Get all stores
  static async getAll() {
    const [stores] = await pool.execute(`
      SELECT s.*, u.name as ownerName,
      (SELECT AVG(rating) FROM ratings WHERE store_id = s.id) as averageRating,
      (SELECT COUNT(*) FROM ratings WHERE store_id = s.id) as totalRatings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
    `);
    return stores;
  }
  
  // Get store by ID
  static async getById(id) {
    const [stores] = await pool.execute(`
      SELECT s.*, u.name as ownerName,
      (SELECT AVG(rating) FROM ratings WHERE store_id = s.id) as averageRating,
      (SELECT COUNT(*) FROM ratings WHERE store_id = s.id) as totalRatings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE s.id = ?
    `, [id]);
    return stores.length ? stores[0] : null;
  }
  
  // Get stores by owner ID
  static async getByOwnerId(ownerId) {
    const [stores] = await pool.execute(`
      SELECT s.*,
      (SELECT AVG(rating) FROM ratings WHERE store_id = s.id) as averageRating,
      (SELECT COUNT(*) FROM ratings WHERE store_id = s.id) as totalRatings
      FROM stores s
      WHERE s.owner_id = ?
    `, [ownerId]);
    return stores;
  }
  
  // Create new store
  static async create(storeData) {
    const { name, email, address, owner_id } = storeData;
    
    const [result] = await pool.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );
    
    return result.insertId;
  }
  
  // Update store
  static async update(id, storeData) {
    const { name, email, address, owner_id } = storeData;
    
    const [result] = await pool.execute(
      'UPDATE stores SET name = ?, email = ?, address = ?, owner_id = ? WHERE id = ?',
      [name, email, address, owner_id || null, id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Delete store
  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM stores WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
  
  // Get user's rating for a store
  static async getUserRating(storeId, userId) {
    const [ratings] = await pool.execute(
      'SELECT rating FROM ratings WHERE store_id = ? AND user_id = ?',
      [storeId, userId]
    );
    return ratings.length ? ratings[0].rating : null;
  }
}

module.exports = Store;