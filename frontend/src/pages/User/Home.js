// frontend/src/pages/User/Home.js
import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/layout';
import StoreDetails from './StoreDetails';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const Home = () => {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await api.get('/stores');
        setStores(response.data);
        setFilteredStores(response.data);
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = stores.filter(
        store => 
          store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStores(filtered);
    } else {
      setFilteredStores(stores);
    }
  }, [searchTerm, stores]);

  const handleStoreClick = (storeId) => {
    navigate(`/user/store/${storeId}`);
  };

  const handleRatingSubmit = async (storeId, rating) => {
    try {
      await api.post('/ratings', { storeId, rating });
      
      // Update the stores list with the new rating
      const updatedStores = stores.map(store => {
        if (store.id === storeId) {
          return {
            ...store,
            userRating: rating,
            // Recalculate overall rating
            overallRating: store.totalRatings ? 
              ((store.overallRating * store.totalRatings) + rating) / (store.totalRatings + 1) :
              rating
          };
        }
        return store;
      });
      
      setStores(updatedStores);
      setFilteredStores(
        searchTerm ? 
          updatedStores.filter(
            store => 
              store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              store.address.toLowerCase().includes(searchTerm.toLowerCase())
          ) : 
          updatedStores
      );
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <Layout title="Stores">
      <Routes>
        <Route path="/" element={
          <>
            <div className="mb-6">
              <div className="max-w-md">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Stores
                </label>
                <input
                  type="text"
                  id="search"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                  placeholder="Search by name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center">Loading stores...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStores.map(store => (
                  <div 
                    key={store.id}
                    className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleStoreClick(store.id)}
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{store.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{store.address}</p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            <span className="font-medium">{store.overallRating?.toFixed(1) || 'No ratings'}</span>
                            <span className="text-gray-400 text-sm ml-1">({store.totalRatings || 0} ratings)</span>
                          </div>
                          
                          {store.userRating && (
                            <div className="text-sm text-gray-600 mt-1">
                              Your rating: {store.userRating}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <button
                              key={rating}
                              className={`w-8 h-8 flex items-center justify-center rounded-full mx-0.5 ${
                                store.userRating === rating 
                                  ? 'bg-yellow-400 text-white' 
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRatingSubmit(store.id, rating);
                              }}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredStores.length === 0 && (
                  <div className="col-span-3 text-center py-8">
                    No stores found matching your search criteria.
                  </div>
                )}
              </div>
            )}
          </>
        } />
        <Route path="/store/:id" element={<StoreDetails />} />
      </Routes>
    </Layout>
  );
};

export default Home;