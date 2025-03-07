// backend/controllers/userController.js
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Check for role filter
    const roleFilter = req.query.role;
    
    let query = `
      SELECT u.*, 
      (SELECT s.id FROM stores s WHERE s.owner_id = u.id LIMIT 1) as store_id,
      (SELECT AVG(r.rating) FROM stores s 
       LEFT JOIN ratings r ON s.id = r.store_id 
       WHERE s.owner_id = u.id) as store_rating
      FROM users u
    `;
    
    // Add role filter if provided
    if (roleFilter) {
      query += ' WHERE u.role = ?';
    }
    
    // Execute query
    let [users] =[[]];
    if (roleFilter) {
      [users] = await pool.execute(query, [roleFilter]);
    } else {
      [users] = await pool.execute(query);
    }
    
    // Remove password from response
    users = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [users] = await pool.execute(`
      SELECT u.*, 
      (SELECT s.id FROM stores s WHERE s.owner_id = u.id LIMIT 1) as store_id,
      (SELECT AVG(r.rating) FROM stores s 
       LEFT JOIN ratings r ON s.id = r.store_id 
       WHERE s.owner_id = u.id) as store_rating
      FROM users u
      WHERE u.id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = users[0];
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  try {
    // Validate input
    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters' });
    }
    
    if (address.length > 400) {
      return res.status(400).json({ message: 'Address must be no more than 400 characters' });
    }
    
    // Validate role
    if (!['admin', 'user', 'store_owner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be 8-16 characters with at least one uppercase letter and one special character'
      });
    }
    
    // Check if user already exists
    const [existingUser] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );
    
    res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, address, role } = req.body;

  try {
    // Validate input
    if (!name || !email || !address || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters' });
    }
    
    if (address.length > 400) {
      return res.status(400).json({ message: 'Address must be no more than 400 characters' });
    }
    
    // Validate role
    if (!['admin', 'user', 'store_owner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Check if user exists
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if email is already in use by another user
    const [existingUser] = await pool.execute('SELECT * FROM users WHERE email = ? AND id != ?', [email, userId]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email is already in use by another user' });
    }
    
    // Update user
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, address = ?, role = ? WHERE id = ?',
      [name, email, address, role, userId]
    );
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if user exists
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};