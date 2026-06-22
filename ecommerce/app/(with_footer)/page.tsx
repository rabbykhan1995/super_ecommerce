import ProgramCard from "@/components/Cards/ProgramCard";
import { CardTrainingProgram } from "@/types/program.types";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import Transformation from "@/components/Transformation/Transformation";

const programs: CardTrainingProgram[] = [
  {
    title: "Full body workout program for beginners",
    level: "Mid-Experience",
    thumbnail:
      "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=600",
    avarageReview: 4.5,
    active: true,
    slug: "full-body-workout-program-for-beginners",
  },
  {
    title: "Advanced yoga training for flexibility",
    level: "Beginner",
    thumbnail:
      "https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600",
    avarageReview: 4.8,
    active: true,
    slug: "advanced-yoga-training-for-flexibility",
  },
  {
    title: "HIIT program for fat burn",
    level: "Full-Experience",
    thumbnail:
      "https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=600",
    avarageReview: 4.6,
    active: false,
    slug: "hiit-program-for-fat-burn",
  },
];

export default function Home() {
  return (
    <div className="">
      {/* top video */}
      <div className="relative w-full lg:h-[50vh] h-[60vh] overflow-hidden mb-10">
        <video
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source
            src="https://res.cloudinary.com/dstwflz0y/video/upload/v1782060848/sheshir_image/mcltqeuzqdscfsmjfku5.mp4"
            type="video/mp4"
          />
        </video>

        {/* Content on bottom of video */}
        <div className=" relative z-10 flex flex-col items-start justify-end p-5 lg:p-20 h-full text-white">
          <h1 className="text-6xl font-bold uppercase">
            Science-Based Bodybuilding
          </h1>
          <Link
            href={"/training&programs"}
            className="bg-[#4E5948] px-5 py-2 rounded-md mt-4"
          >
            View Programs
          </Link>
        </div>
      </div>

      {/* One customer review */}
      <div className="flex lg:flex-row flex-col mb-5">
        <h1 className="lg:border-r border-gray-300 lg:w-2/3 text-center text-xl font-bold">
          “Jeff&apos;s training programs have completely changed how I look and
          feel.”
        </h1>
        <div className="text-center lg:w-1/3 text-gray-600 font-bold">
          {/* 5 Star Review */}
          <div className="flex justify-center mb-2 space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
              />
            ))}
          </div>
          {/* cusotmer name */}
          <h1>Jordan R.</h1>
          {/*  the essential programs */}
          <h1>The Essentials Program</h1>
        </div>
      </div>

      {/* some program card */}
      <div className="grid px-7 lg:px-20 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {" "}
        <h1 className="col-span-full uppercase font-semibold text-2xl">
          Most popular
        </h1>
        {programs.map((p, i) => (
          <ProgramCard data={p} key={i} />
        ))}
      </div>
      <Transformation />
    </div>
  );
}
