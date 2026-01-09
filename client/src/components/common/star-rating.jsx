import React from "react";

const StarRatingComponent = ({ rating = 0, handleRatingChange, readOnly = false }) => {
  const maxStars = 5;

  // Function to handle user clicks on stars
  const onStarClick = (index) => {
    if (!readOnly && handleRatingChange) {
      handleRatingChange(index + 1);
    }
  };

  return (
    <div className="flex gap-1">
      {[...Array(maxStars)].map((_, index) => {
        const isFilled = index < Math.floor(rating);
        const isHalf = index === Math.floor(rating) && rating % 1 !== 0;

        return (
          <span
            key={index}
            className={`cursor-pointer text-2xl ${readOnly ? "cursor-default" : "hover:scale-110"} ${
              isFilled ? "text-yellow-500" : isHalf ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => onStarClick(index)}
          >
            {isFilled ? "★" : isHalf ? "⯪" : "☆"}
          </span>
        );
      })}
    </div>
  );
};

export default StarRatingComponent;