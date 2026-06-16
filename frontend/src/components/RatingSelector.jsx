import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

/**
 * Interactive star selection inputs for logging ratings.
 * @param {object} props - Component properties
 * @param {number} props.rating - Active selection number
 * @param {function} props.onChange - Setter function mapping numbers
 */
const RatingSelector = ({ rating, onChange }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex items-center space-x-1.5">
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;
        return (
          <label key={ratingValue} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              className="hidden"
              onClick={() => onChange(ratingValue)}
            />
            <FaStar
              className="text-2xl transition-colors duration-150"
              color={ratingValue <= (hover || rating) ? '#f59e0b' : '#e2e8f0'}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default RatingSelector;
