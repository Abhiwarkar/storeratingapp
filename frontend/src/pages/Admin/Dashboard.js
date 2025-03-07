// frontend/src/pages/Admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import Layout from '../../components/layout/layout';
import Users from './Users';
import Stores from './Stores';
import api from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Log the request for debugging
        console.log('Fetching dashboard stats...');
        
        // Try the direct route first
        try {
          const response = await api.get('/dashboard/admin');
          console.log('Dashboard stats response:', response.data);
          
          if (response.data && typeof response.data === 'object') {
            setStats({
              totalUsers: response.data.totalUsers || 0,
              totalStores: response.data.totalStores || 0,
              totalRatings: response.data.totalRatings || 0
            });
            setError(null);
          } else {
            throw new Error('Invalid data format');
          }
        } catch (firstError) {
          console.error('First attempt failed:', firstError);
          
          // If the first attempt fails, try an alternative path
          const altResponse = await api.get('/admin/stats');
          console.log('Alternative stats response:', altResponse.data);
          
          if (altResponse.data && typeof altResponse.data === 'object') {
            setStats({
              totalUsers: altResponse.data.totalUsers || 0,
              totalStores: altResponse.data.totalStores || 0,
              totalRatings: altResponse.data.totalRatings || 0
            });
            setError(null);
          } else {
            throw new Error('Invalid data format in alternative response');
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <Layout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">
            {loading ? '...' : stats.totalUsers}
          </div>
          <div className="text-gray-500 mt-2">Total Users</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">
            {loading ? '...' : stats.totalStores}
          </div>
          <div className="text-gray-500 mt-2">Total Stores</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600">
            {loading ? '...' : stats.totalRatings}
          </div>
          <div className="text-gray-500 mt-2">Total Ratings</div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="flex border-b">
          <Link 
            to="/admin"
            className="px-4 py-3 text-blue-600 border-b-2 border-blue-600 font-medium"
          >
            Dashboard
          </Link>
          <Link 
            to="/admin/users"
            className="px-4 py-3 text-gray-700 hover:text-blue-600 font-medium"
          >
            Manage Users
          </Link>
          <Link 
            to="/admin/stores"
            className="px-4 py-3 text-gray-700 hover:text-blue-600 font-medium"
          >
            Manage Stores
          </Link>
        </div>
      </div>

      <Routes>
        <Route path="/users" element={<Users />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/" element={
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Welcome to the Admin Dashboard</h3>
            <p className="text-gray-600 mb-4">
              From here you can manage users, stores, and view statistics about the platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to="/admin/users"
                className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-blue-700"
              >
                <h4 className="font-bold mb-2">Manage Users</h4>
                <p className="text-sm">Add, edit, or delete users. View user details and assign roles.</p>
              </Link>
              <Link 
                to="/admin/stores"
                className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-green-700"
              >
                <h4 className="font-bold mb-2">Manage Stores</h4>
                <p className="text-sm">Add, edit, or delete stores. View store ratings and details.</p>
              </Link>
            </div>
          </div>
        } />
      </Routes>
    </Layout>
  );
};

export default Dashboard;