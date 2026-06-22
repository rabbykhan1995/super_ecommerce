"use client";

import React from "react";

// Type for the transformation object
interface Transformation {
  beforeImage: string;
  afterImage: string;
  testimonial: string;
  quotation: string;
  name: string;
}

// Props type: single object
interface TransformationCardProps {
  transformation: Transformation;
}

const TransformationCard: React.FC<TransformationCardProps> = ({
  transformation,
}) => {
  const { beforeImage, afterImage, testimonial, quotation, name } =
    transformation;

  return (
    <div className="flex lg:flex-row flex-col items-center lg:items-start w-full lg:px-20 px-5">
      <div className="w-2/3">
        {/* Testimonial */}
        <p className="text-gray-700 mb-2">"{testimonial}"</p>

        {/* Quotation / highlighted */}
        <p className="text-blue-600 font-semibold mb-2">{quotation}</p>

        {/* Customer Name */}
        <h3 className="font-bold text-lg">{name}</h3>
      </div>
      {/* Images */}
      <div className="relative w-1/3">
        <div>
          <img
            src={afterImage}
            alt="After"
            className="w-2/2 min-h-55 object-cover rounded-lg"
          />
          <h1>After</h1>
        </div>
        <div className="w-2/4 h-45 absolute bottom-10 left-[-60]">
          <img
            src={beforeImage}
            alt="Before"
            className=" object-cover rounded-lg "
          />
          <h1>Before</h1>
        </div>
      </div>
    </div>
  );
};

export default TransformationCard;
