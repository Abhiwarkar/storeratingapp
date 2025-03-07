// frontend/src/pages/User/StoreDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/layout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const StoreDetails = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const response = await api.get(`/stores/${id}`);
        setStore(response.data);
        setUserRating(response.data.userRating || 0);
        setSelectedRating(response.data.userRating || 0);
      } catch (error) {
        console.error('Error fetching store details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetails();
  }, [id]);

  const handleRatingSelection = (rating) => {
    setSelectedRating(rating);
  };

  const handleRatingSubmit = async () => {
    if (selectedRating === 0) {
      alert('Please select a rating first');
      return;
    }
    
    try {
      await api.post('/ratings', { storeId: id, rating: selectedRating });
      
      // Update the local state with the new rating
      setUserRating(selectedRating);
      
      // Update the overall rating in the store data
      if (store) {
        const newStore = { ...store };
        
        if (userRating > 0) {
          // Updating existing rating - recalculate average
          newStore.averageRating = 
            ((store.averageRating * store.totalRatings) - userRating + selectedRating) / store.totalRatings;
        } else {
          // Adding new rating
          newStore.averageRating = store.totalRatings ? 
            ((store.averageRating * store.totalRatings) + selectedRating) / (store.totalRatings + 1) :
            selectedRating;
          newStore.totalRatings = (store.totalRatings || 0) + 1;
        }
        
        newStore.userRating = selectedRating;
        setStore(newStore);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting your rating. Please try again.');
    }
  };

  const handleGoBack = () => {
    navigate('/user');
  };

  if (loading) {
    return <Layout title="Store Details"><div>Loading...</div></Layout>;
  }

  if (!store) {
    return (
      <Layout title="Store Details">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Store not found.</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleGoBack}
          >
            Back to Stores
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Store Details">
      <div className="mb-4">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          onClick={handleGoBack}
        >
          &larr; Back to Stores
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-2xl font-semibold mb-2">{store.name}</h3>
          <p className="text-gray-600 mb-4">{store.address}</p>
          
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-yellow-500 mr-2">
              {store.averageRating && typeof store.averageRating === 'number' 
                ? store.averageRating.toFixed(1) 
                : 'No ratings'}
              </span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-2xl ${
                      star <= Math.round(store.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="ml-2 text-gray-600">({store.totalRatings || 0} ratings)</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Your Rating</h4>
            
            {userRating > 0 ? (
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  You've rated this store: <span className="font-bold">{userRating} out of 5</span>
                </p>
                <p className="text-sm text-gray-500">You can update your rating below:</p>
              </div>
            ) : (
              <p className="text-gray-600 mb-4">You haven't rated this store yet.</p>
            )}
            
            <div className="flex items-center mb-4">
              <div className="mr-4 text-sm text-gray-600">
                {userRating > 0 ? "Modify your rating:" : "Select your rating:"}
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    className={`w-10 h-10 flex items-center justify-center rounded-full mx-1 ${
                      selectedRating === rating 
                        ? 'bg-yellow-400 text-white' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    onClick={() => handleRatingSelection(rating)}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Always show a button, but text changes based on whether user has rated */}
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleRatingSubmit}
            >
              {userRating > 0 ? "Modify Rating" : "Submit Rating"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StoreDetails;