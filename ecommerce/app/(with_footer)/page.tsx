
import { CardTrainingProgram } from "@/types/program.types";
import Hero from "@/components/Sections/Hero";
import FlashSaleProductSlider from "@/components/Sliders/FlashProductuSlider";
import OfferProducts from "@/components/Sections/OfferProducts";

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
      <div className="relative w-full overflow-hidden mb-10">
        <Hero />
         <FlashSaleProductSlider />
  
      </div>
      <OfferProducts/>
    </div>
  );
}
