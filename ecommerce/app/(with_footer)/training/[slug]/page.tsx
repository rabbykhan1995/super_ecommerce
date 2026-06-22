import { Metadata } from "next";
import { notFound } from "next/navigation";
import Helper from "@/helper/helper";
import MdxRenderer from "@/components/MDX/MDXRenderer";
import Image from "next/image";
import RatingStars from "@/utils/Ui/RatingStars";
import DescriptionToggle from "@/utils/Ui/DescriptionToggle";



interface Props {
  params: Promise<{ slug: string }>;
}


async function getTraining(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/training/trainingBySlug/${slug}`,
    {
      next: {
        tags: [`training-${slug}`],
      },
    }
  );

  if (!res.ok) return null;
  const response = await res.json();
  return response.success ? response.data : null;
}


// ১. SEO এর জন্য Dynamic Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const training = await getTraining(slug);

  if (!training) {
    return { title: "Training Not Found" };
  }

  return {
    title: training.title,
    description: training.shortDescription,
    openGraph: {
      title: training.title,
      description: training.shortDescription,
      images: training.thumbnail ? [training.thumbnail] : [],
      type: "website",
    },
  };
}

export default async function TrainingDetailsPage({ params }: Props) {
  const { slug } = await params;
  // update korar time a revalidateTag import kore seta call kore dite hobe
const training = await getTraining(slug);

  if (!training) {
    notFound();
  }


  return (
    <div className="px-4 py-10 flex lg:flex-row flex-col gap-5">
      {/* ৩. হেডার সেকশন */}
<div className="w-full lg:w-1/2 p-2 flex items-start  h-fit">
    {training.thumbnail && (
        <div className="w-full min-h-[40vh] relative">
          <Image
            src={Helper.getImage(training.thumbnail?? null)}
            alt={training.slug}
            fill
            className="rounded-lg object-fill"
          />
        </div>
      )}
</div>
<div className="w-full lg:w-1/2">
        <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
          {training.title}
        </h1>
     <MdxRenderer source={training.shortDescription} />
        <div className="flex items-center text-slate-500 text-sm gap-4">
          <span>{Helper.formatDate(training.createdAt)}</span>
          <span>•</span>
          {/* <div className="flex flex-wrap gap-2">
            {training.tags?.map((tag: string) => (
              <span
                key={tag}
                className="bg-slate-100 px-2 py-0.5 rounded text-blue-600"
              >
                #{tag}
              </span>
            ))}
          </div> */}
        </div>
      </header>
      <h1 className="text-2xl font-[500]">{training.price} TK</h1>
       <div className="flex gap-3 items-center">
        <RatingStars average={training.avarageReview} />
      <h1>{training.reviewers} Reviews</h1>
       </div>
      {/* ৪. থাম্বনেইল */}
  

      {/* ৫. MDX কন্টেন্ট রেন্ডারার */}
      {/* <MdxRenderer source={training.description} /> */}

      <DescriptionToggle>
        <MdxRenderer source={training.description} />
      </DescriptionToggle>
</div>
    </div>
  );
}
