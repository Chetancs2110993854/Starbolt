import React from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

interface StarRatingProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  size = 'md',
  readonly = true,
  onChange,
  className,
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const getStarSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  return (
    <div className={clsx('flex', className)}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = hoverValue !== null 
          ? starValue <= hoverValue 
          : starValue <= value;

        return (
          <span
            key={index}
            className={clsx(
              'transition-colors duration-200',
              getStarSize(),
              isFilled ? 'text-yellow-400' : 'text-gray-300',
              !readonly && 'cursor-pointer'
            )}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            onMouseLeave={() => !readonly && setHoverValue(null)}
            onClick={() => !readonly && onChange && onChange(starValue)}
          >
            <Star className="w-full h-full" fill={isFilled ? 'currentColor' : 'none'} />
          </span>
        );
      })}
    </div>
  );
};