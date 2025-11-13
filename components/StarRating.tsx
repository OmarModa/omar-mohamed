
import React, { useState } from 'react';
import { StarIcon } from './icons';

interface StarRatingProps {
  onRate: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ onRate }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const handleClick = (rate: number) => {
    setRating(rate);
    onRate(rate);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse mb-2">
        {[...Array(10)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <button
              type="button"
              key={ratingValue}
              className={`transition-colors duration-200 ${
                ratingValue <= (hover || rating)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
              onClick={() => handleClick(ratingValue)}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            >
              <StarIcon className="w-7 h-7" />
            </button>
          );
        })}
      </div>
      <p className="text-lg font-semibold text-gray-700">
        {rating > 0 ? `${rating} / 10` : 'اختر تقييمك'}
      </p>
    </div>
  );
};
