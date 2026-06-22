import React from "react";
import { Star, StarHalf } from "lucide-react";

interface RatingProps {
  average?: number | null;
}

const RatingStars: React.FC<RatingProps> = ({ average }) => {
  // ১. সেফটি চেক এবং ক্যালকুলেশন
  const rating = average ?? 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const totalStars = 5;

  return (

      <div className="flex items-center gap-0.5 text-yellow-500">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} size={16} fill="currentColor" />
        ))}

        {/* Half star */}
        {hasHalfStar && <StarHalf size={16} fill="currentColor" />}

        {/* Empty stars */}
        {Array.from({
          length: Math.max(0, totalStars - fullStars - (hasHalfStar ? 1 : 0)),
        }).map((_, i) => (
          <Star key={`empty-${i}`} size={16} className="text-gray-300" />
        ))}
      </div>


   
  );
};

export default RatingStars;