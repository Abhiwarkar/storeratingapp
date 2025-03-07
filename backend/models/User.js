// backend/models/User.js
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // Get all users
  static async getAll() {
    const [users] = await pool.execute('SELECT * FROM users');
    return users;
  }
  
  // Get user by ID
  static async getById(id) {
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return users.length ? users[0] : null;
  }
  
  // Get user by email
  static async getByEmail(email) {
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return users.length ? users[0] : null;
  }
  
  // Create new user
  static async create(userData) {
    const { name, email, password, address, role } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role || 'user']
    );
    
    return result.insertId;
  }
  
  // Update user
  static async update(id, userData) {
    const { name, email, address, role } = userData;
    
    const [result] = await pool.execute(
      'UPDATE users SET name = ?, email = ?, address = ?, role = ? WHERE id = ?',
      [name, email, address, role, id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Update password
  static async updatePassword(id, password) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Delete user
  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
  
  // Verify password
  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }
}

module.exports = User;