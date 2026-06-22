import TransformationCard from "../Cards/TransformationCard";

const Transformation = () => {
  const transformations = [
    {
      beforeImage:
        "https://preview.redd.it/59-29yrs-full-17mo-progress-dump-after-almost-4-years-of-v0-cmg4rtg5pmbf1.jpg?width=640&crop=smart&auto=webp&s=7e40e3263c315d02ca9c0fbf4a4c15192443a3b5",
      afterImage:
        "https://previews.123rf.com/images/veerasakpiyawatanakul/veerasakpiyawatanakul1711/veerasakpiyawatanakul171100033/89183335-fitness-man-showing-muscular-body-in-gym-fitness-concept-sport-concept.jpg",
      testimonial: "This program changed my physique completely!",
      quotation: "The Essentials Program",
      name: "Jordan R.",
    },
    // {
    //   beforeImage: "https://via.placeholder.com/200",
    //   afterImage: "https://via.placeholder.com/200",
    //   testimonial: "Best fitness journey of my life.",
    //   quotation: "The Hypertrophy Program",
    //   name: "Sarah M.",
    // },
  ];

  return (
    <div className="py-12 bg-[#F7F7F7] my-10">
      <h2 className="text-3xl font-bold text-center mb-8">Transformations</h2>

      <div className="flex flex-wrap justify-center gap-6">
        {transformations.map((item, index) => (
          <TransformationCard key={index} transformation={item} />
        ))}
      </div>
    </div>
  );
};

export default Transformation;
