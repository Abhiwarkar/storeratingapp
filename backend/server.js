// backend/server.js
const app = require('./app');
const dotenv = require('dotenv');
const { initDb } = require('./config/db');

// Load env variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize database before starting server
const startServer = async () => {
  try {
    // Initialize the database
    await initDb();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();