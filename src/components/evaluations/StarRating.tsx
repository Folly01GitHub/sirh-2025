
import React from 'react';
import { Star } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readonly = false }) => {
  if (readonly) {
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`h-6 w-6 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <RadioGroup 
        value={value.toString()} 
        onValueChange={(val) => onChange?.(parseInt(val))}
        className="flex space-x-2"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="flex flex-col items-center">
            <RadioGroupItem 
              value={star.toString()} 
              id={`rating-${star}`} 
              className="sr-only"
            />
            <label 
              htmlFor={`rating-${star}`}
              className="cursor-pointer"
            >
              <Star 
                className={`h-6 w-6 transition-all ${star <= value ? 'fill-primary text-primary' : 'text-gray-300'}`}
              />
            </label>
          </div>
        ))}
      </RadioGroup>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Très insuffisant</span>
        <span>Excellent</span>
      </div>
    </div>
  );
};

export default StarRating;
