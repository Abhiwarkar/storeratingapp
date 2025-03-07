// frontend/src/components/store/StoreCard.js
import React from 'react';

const StoreCard = ({ store, onRatingSubmit, onClick }) => {
  const handleRatingClick = (e, rating) => {
    e.stopPropagation();
    onRatingSubmit(store.id, rating);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(store.id)}
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{store.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{store.address}</p>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              <span className="font-medium">{store.averageRating ? store.averageRating.toFixed(1) : 'No ratings'}</span>
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
                onClick={(e) => handleRatingClick(e, rating)}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;