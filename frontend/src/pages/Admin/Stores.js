// frontend/src/pages/Admin/Stores.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: ''
  });
  
  // Add sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending'
  });

  useEffect(() => {
    fetchStores();
    fetchStoreOwners();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, stores]);

  const fetchStores = async () => {
    try {
      const response = await api.get('/stores');
      setStores(response.data);
      
      // Apply initial sorting
      sortData(response.data, sortConfig.key, sortConfig.direction);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreOwners = async () => {
    try {
      const response = await api.get('/users', {
        params: { role: 'store_owner' }
      });
      setStoreOwners(response.data);
    } catch (error) {
      console.error('Error fetching store owners:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = () => {
    let result = [...stores];
    
    if (filters.name) {
      result = result.filter(store => 
        store.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    
    if (filters.email) {
      result = result.filter(store => 
        store.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    
    if (filters.address) {
      result = result.filter(store => 
        store.address.toLowerCase().includes(filters.address.toLowerCase())
      );
    }
    
    // After filtering, maintain the current sort
    sortData(result, sortConfig.key, sortConfig.direction);
  };

  // Sorting function
  const sortData = (data, key, direction) => {
    const sortedData = [...data].sort((a, b) => {
      // Special handling for rating which might be null
      if (key === 'averageRating') {
        const ratingA = a[key] || 0;
        const ratingB = b[key] || 0;
        return direction === 'ascending' 
          ? ratingA - ratingB 
          : ratingB - ratingA;
      }
      
      // Convert to lowercase for case-insensitive sorting
      const valueA = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
      const valueB = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];
      
      if (valueA < valueB) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredStores(sortedData);
  };

  // Request a sort
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    sortData(filteredStores, key, direction);
  };

  // Get sort indicator for table header
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? ' (ASC)' : ' (DESC)';
  };

  const handleNewStoreChange = (e) => {
    setNewStore({
      ...newStore,
      [e.target.name]: e.target.value
    });
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/stores', newStore);
      setNewStore({
        name: '',
        email: '',
        address: '',
        owner_id: ''
      });
      setShowAddForm(false);
      fetchStores();
    } catch (error) {
      console.error('Error adding store:', error);
      alert(error.response?.data?.message || 'Failed to add store');
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        await api.delete(`/stores/${storeId}`);
        fetchStores();
      } catch (error) {
        console.error('Error deleting store:', error);
        alert(error.response?.data?.message || 'Failed to delete store');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Manage Stores</h3>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add New Store'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium mb-3">Add New Store</h4>
          <form onSubmit={handleAddStore}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (20-60 characters)
                </label>
                <input
                  type="text"
                  name="name"
                  value={newStore.name}
                  onChange={handleNewStoreChange}
                  className="w-full p-2 border rounded"
                  minLength="20"
                  maxLength="60"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newStore.email}
                  onChange={handleNewStoreChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Owner
                </label>
                <select
                  name="owner_id"
                  value={newStore.owner_id}
                  onChange={handleNewStoreChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a Store Owner</option>
                  {storeOwners.map(owner => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (max 400 characters)
                </label>
                <textarea
                  name="address"
                  value={newStore.address}
                  onChange={handleNewStoreChange}
                  className="w-full p-2 border rounded"
                  maxLength="400"
                  rows="2"
                  required
                ></textarea>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Store
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h4 className="font-medium mb-3">Filter Stores</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Filter by name"
                value={filters.name}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <input
                type="text"
                name="email"
                placeholder="Filter by email"
                value={filters.email}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <input
                type="text"
                name="address"
                placeholder="Filter by address"
                value={filters.address}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">Loading stores...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('name')}
                  >
                    NAME <span className="text-blue-700 font-bold">{getSortIndicator('name')}</span>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('email')}
                  >
                    EMAIL <span className="text-blue-700 font-bold">{getSortIndicator('email')}</span>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('address')}
                  >
                    ADDRESS <span className="text-blue-700 font-bold">{getSortIndicator('address')}</span>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    OWNER
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('averageRating')}
                  >
                    RATING <span className="text-blue-700 font-bold">{getSortIndicator('averageRating')}</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStores.map(store => (
                  <tr key={store.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{store.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{store.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">{store.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{store.ownerName || 'No owner'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span>
                          {store.averageRating && typeof store.averageRating === 'number' 
                            ? store.averageRating.toFixed(1) 
                            : 'No ratings'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-red-600 hover:text-red-900 ml-4"
                        onClick={() => handleDeleteStore(store.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredStores.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No stores found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stores;