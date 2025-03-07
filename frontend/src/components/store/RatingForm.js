// frontend/src/components/store/RatingForm.js
import React, { useState } from 'react';

const RatingForm = ({ currentRating, onSubmit }) => {
  const [rating, setRating] = useState(currentRating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (value) => {
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (value) => {
    setRating(value);
    onSubmit(value);
  };

  return (
    <div className="rating-form">
      <div className="flex items-center">
        <div className="mr-4 text-sm text-gray-600">Select your rating:</div>
        <div className="flex">
          {[1, 2, 3, 4, 5].map(value => (
            <button
              key={value}
              className={`w-10 h-10 flex items-center justify-center rounded-full mx-1 ${
                (hoverRating >= value || (!hoverRating && rating >= value))
                  ? 'bg-yellow-400 text-white' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingForm;