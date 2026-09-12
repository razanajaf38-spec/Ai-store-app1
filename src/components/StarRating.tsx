import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1" id="star-rating-container">
      {Array.from({ length: maxRating }, (_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= activeRating;
        const isHalf = !isFilled && starValue - 0.5 <= activeRating;

        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            } focus:outline-none p-0.5`}
            aria-label={`${starValue} Stars`}
            id={`star-btn-${starValue}`}
          >
            <Star
              className={`${iconSizes[size]} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : isHalf
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-zinc-300 dark:text-zinc-600'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};
