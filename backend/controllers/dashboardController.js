// backend/controllers/dashboardController.js
const { pool } = require('../config/db');

// Get admin dashboard stats
exports.getAdminStats = async (req, res) => {
  try {
    // Get total users count
    const [usersResult] = await pool.execute('SELECT COUNT(*) as totalUsers FROM users');
    const totalUsers = usersResult[0].totalUsers;
    
    // Get total stores count
    const [storesResult] = await pool.execute('SELECT COUNT(*) as totalStores FROM stores');
    const totalStores = storesResult[0].totalStores;
    
    // Get total ratings count
    const [ratingsResult] = await pool.execute('SELECT COUNT(*) as totalRatings FROM ratings');
    const totalRatings = ratingsResult[0].totalRatings;
    
    // Get users by role
    const [usersByRole] = await pool.execute(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);
    
    // Get top rated stores - FIXED QUERY
    const [topStores] = await pool.execute(`
      SELECT s.id, s.name, 
         AVG(r.rating) as averageRating,
        COUNT(r.id) as totalRatings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, s.name
      HAVING COUNT(r.id) > 0
      ORDER BY averageRating DESC, totalRatings DESC
      LIMIT 5
    `);
    
    // Get recent ratings
    const [recentRatings] = await pool.execute(`
      SELECT r.*, s.name as storeName, u.name as userName
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `);
    
    res.json({
      totalUsers,
      totalStores,
      totalRatings,
      usersByRole,
      topStores,
      recentRatings
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rest of your code for getStoreOwnerStats remains the same
// Get store owner dashboard stats
exports.getStoreOwnerStats = async (req, res) => {
  const storeId = req.params.storeId;
  
  try {
    // Check if store exists and belongs to the user
    const [stores] = await pool.execute(
      'SELECT * FROM stores WHERE id = ? AND owner_id = ?',
      [storeId, req.user.id]
    );
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found or you do not own this store' });
    }
    
    // Get store details with average rating
    const [storeDetails] = await pool.execute(`
      SELECT s.*, 
        AVG(r.rating) as averageRating,
        COUNT(r.id) as totalRatings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id
    `, [storeId]);
    
    // Get rating distribution
    const [ratingDistribution] = await pool.execute(`
      SELECT rating, COUNT(*) as count
      FROM ratings
      WHERE store_id = ?
      GROUP BY rating
      ORDER BY rating
    `, [storeId]);
    
    // Get recent ratings
    const [recentRatings] = await pool.execute(`
      SELECT r.*, u.name as userName, u.email as userEmail
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [storeId]);
    
    res.json({
      storeDetails: storeDetails[0] || {},
      ratingDistribution,
      recentRatings
    });
  } catch (error) {
    console.error('Error getting store owner stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};