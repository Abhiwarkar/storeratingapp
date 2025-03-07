// backend/controllers/storeController.js
const { pool } = require('../config/db');

// Get all stores
exports.getAllStores = async (req, res) => {
  try {
    // If owner_id is provided in query, filter by owner
    const ownerId = req.query.ownerId;
    
    let query = `
      SELECT s.*, u.name as ownerName,
      (SELECT AVG(rating) FROM ratings WHERE store_id = s.id) as averageRating,
      (SELECT COUNT(*) FROM ratings WHERE store_id = s.id) as totalRatings
    `;
    
    // If user is not admin, also get the user's rating for each store
    if (req.user.role !== 'admin') {
      query += `, (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) as userRating`;
    }
    
    query += ` FROM stores s LEFT JOIN users u ON s.owner_id = u.id`;
    
    // Add where clause if owner_id is provided
    if (ownerId) {
      query += ` WHERE s.owner_id = ?`;
    }
    
    // Execute query with appropriate parameters
    let [stores] = [[]];
    if (req.user.role !== 'admin') {
      if (ownerId) {
        [stores] = await pool.execute(query, [req.user.id, ownerId]);
      } else {
        [stores] = await pool.execute(query, [req.user.id]);
      }
    } else {
      if (ownerId) {
        [stores] = await pool.execute(query, [ownerId]);
      } else {
        [stores] = await pool.execute(query);
      }
    }

    res.json(stores);
  } catch (error) {
    console.error('Error getting stores:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get store by ID
exports.getStoreById = async (req, res) => {
  try {
    const storeId = req.params.id;
    
    let query = `
      SELECT s.*, u.name as ownerName,
      (SELECT AVG(rating) FROM ratings WHERE store_id = s.id) as averageRating,
      (SELECT COUNT(*) FROM ratings WHERE store_id = s.id) as totalRatings
    `;
    
    // If not admin, include user's rating for this store
    if (req.user.role !== 'admin') {
      query += `, (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) as userRating`;
    }
    
    query += ` FROM stores s LEFT JOIN users u ON s.owner_id = u.id WHERE s.id = ?`;
    
    let [stores] = [[]];
    if (req.user.role !== 'admin') {
      [stores] = await pool.execute(query, [req.user.id, storeId]);
    } else {
      [stores] = await pool.execute(query, [storeId]);
    }
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    res.json(stores[0]);
  } catch (error) {
    console.error('Error getting store:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new store
exports.createStore = async (req, res) => {
  const { name, email, address, owner_id } = req.body;

  try {
    // Validate input
    if (!name || !email || !address) {
      return res.status(400).json({ message: 'Name, email, and address are required' });
    }
    
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters' });
    }
    
    if (address.length > 400) {
      return res.status(400).json({ message: 'Address must be no more than 400 characters' });
    }
    
    // Check if owner exists and is a store owner
    if (owner_id) {
      const [owners] = await pool.execute('SELECT * FROM users WHERE id = ? AND role = ?', [owner_id, 'store_owner']);
      if (owners.length === 0) {
        return res.status(400).json({ message: 'Invalid store owner' });
      }
    }
    
    // Insert store
    const [result] = await pool.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );
    
    res.status(201).json({ 
      message: 'Store created successfully',
      storeId: result.insertId
    });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update store
exports.updateStore = async (req, res) => {
  const storeId = req.params.id;
  const { name, email, address, owner_id } = req.body;

  try {
    // Validate input
    if (!name || !email || !address) {
      return res.status(400).json({ message: 'Name, email, and address are required' });
    }
    
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters' });
    }
    
    if (address.length > 400) {
      return res.status(400).json({ message: 'Address must be no more than 400 characters' });
    }
    
    // Check if store exists
    const [stores] = await pool.execute('SELECT * FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Check if owner exists and is a store owner
    if (owner_id) {
      const [owners] = await pool.execute('SELECT * FROM users WHERE id = ? AND role = ?', [owner_id, 'store_owner']);
      if (owners.length === 0) {
        return res.status(400).json({ message: 'Invalid store owner' });
      }
    }
    
    // Update store
    await pool.execute(
      'UPDATE stores SET name = ?, email = ?, address = ?, owner_id = ? WHERE id = ?',
      [name, email, address, owner_id || null, storeId]
    );
    
    res.json({ message: 'Store updated successfully' });
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete store
exports.deleteStore = async (req, res) => {
  const storeId = req.params.id;

  try {
    // Check if store exists
    const [stores] = await pool.execute('SELECT * FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Delete store (associated ratings will be deleted automatically due to foreign key constraints)
    await pool.execute('DELETE FROM stores WHERE id = ?', [storeId]);
    
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ message: 'Server error' });
  }
};