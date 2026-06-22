import React from "react";
import { CardTrainingProgram } from "@/types/program.types";
import { Star, StarHalf } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Helper from "@/helper/helper";
import RatingStars from "@/utils/Ui/RatingStars";

interface ProgramCardProps {
  data: CardTrainingProgram; // props হিসেবে data দেবো
}

const ProgramCard: React.FC<ProgramCardProps> = ({ data }) => {
  return (
    <div className="">
      <div className="relative w-full h-[250px]">
        <Image
          className="object-contain"
          src={Helper.getImage(data?.thumbnail ?? null)}
          fill
          alt={data?.title as string}
          // onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
        />
      </div>
      <Link
        href={`/training/${data?.slug}`}
        className="uppercase font-bold text-center pt-4"
      >
        {data?.title}
      </Link>

      {/* ⭐ Rating */}
<div className="flex justify-center">
   <RatingStars average={data?.avarageReview} />
</div>
      <h1 className="text-center text-sm">{data?.level}</h1>
    </div>
  );
};

export default ProgramCard;
