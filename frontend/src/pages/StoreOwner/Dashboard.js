// frontend/src/pages/StoreOwner/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/layout/layout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        // First get the store that belongs to this owner
        const storesResponse = await api.get('/stores', {
          params: { ownerId: user.id }
        });
        
        if (storesResponse.data.length > 0) {
          const userStore = storesResponse.data[0];
          setStore(userStore);
          
          // Then get ratings for this store
          const ratingsResponse = await api.get(`/ratings/store/${userStore.id}`);
          setRatings(ratingsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [user.id]);

  if (loading) {
    return <Layout title="Store Dashboard"><div>Loading...</div></Layout>;
  }

  if (!store) {
    return (
      <Layout title="Store Dashboard">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            You don't have a store assigned to your account yet. Please contact an administrator.
          </p>
        </div>
      </Layout>
    );
  }

  // Calculate average rating
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
    : 0;

  return (
    <Layout title="Store Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h3 className="text-xl font-semibold mb-3">{store.name}</h3>
          <p className="text-gray-600 mb-4">{store.address}</p>
          
          <div className="flex items-center">
            <span className="text-2xl font-bold text-yellow-500 mr-2">
              {averageRating.toFixed(1)}
            </span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-2xl ${
                    star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="ml-2 text-gray-600">({ratings.length} ratings)</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Rating Distribution</h3>
          {[5, 4, 3, 2, 1].map(star => {
            const count = ratings.filter(r => r.rating === star).length;
            const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
            
            return (
              <div key={star} className="flex items-center mb-2">
                <div className="w-8 text-gray-600">{star} ★</div>
                <div className="flex-1 mx-2 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-8 text-right text-gray-600">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-semibold p-4 border-b">Customer Ratings</h3>
        
    
        {ratings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ratings.map(rating => (
                  <tr key={rating.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rating.userName}</div>
                      <div className="text-sm text-gray-500">{rating.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className={star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No ratings have been submitted for your store yet.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;