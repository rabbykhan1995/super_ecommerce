import { Metadata } from "next";
import { notFound } from "next/navigation";
import Helper from "@/helper/helper";
import MdxRenderer from "@/components/MDX/MDXRenderer";
import Image from "next/image";
import RatingStars from "@/utils/Ui/RatingStars";
import DescriptionToggle from "@/utils/Ui/DescriptionToggle";
import AddToCartButton from "@/components/Buttons/AddToCartButton";
import { FullProduct } from "@/types/product.types";
interface Props {
  params: Promise<{ slug: string }>;
}



async function getProduct(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/product/productBySlug/${slug}`,
    {
      next: {
        tags: [`product-${slug}`],
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
  const product:FullProduct = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.title,
    description: product.shortDescription,
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      images: product.thumbnail ? [product.thumbnail] : [],
      type: "website",
    },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;
  // update korar time a revalidateTag import kore seta call kore dite hobe
const product:FullProduct = await getProduct(slug);

  if (!product) {
    notFound();
  }


  return (
    <div className="px-4 py-10 flex lg:flex-row flex-col gap-5">
      {/* ৩. হেডার সেকশন */}
<div className="w-full lg:w-1/2 p-2 flex items-start  h-fit">
    {product.thumbnail && (
        <div className="w-full min-h-[40vh] relative">
          <Image
            src={Helper.getImage(product.thumbnail?? null)}
            alt={product.slug}
            fill
            className="rounded-lg object-fill"
          />
        </div>
      )}
</div>
<div className="w-full lg:w-1/2">
        <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
          {product.title}
        </h1>
     <MdxRenderer source={product.shortDescription as string} />
        <div className="flex items-center text-slate-500 text-sm gap-4">
          <span>{Helper.formatDate(product.createdAt as Date)}</span>
          <span>•</span>
          {/* <div className="flex flex-wrap gap-2">
            {product.tags?.map((tag: string) => (
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
      <h1 className="text-2xl font-[500]">{product.price} TK</h1>
       <div className="flex gap-3 items-center">
        <RatingStars average={product.averageReview} />
      <h1>{product.reviewers} Reviews</h1>
       </div>
      {/* ৪. থাম্বনেইল */}
  <AddToCartButton
   product={product}
/>

      {/* ৫. MDX কন্টেন্ট রেন্ডারার */}
{/* <details className="mt-6">
  <summary className="cursor-pointer font-semibold">
    Product Description
  </summary>

  <div className="mt-4">
    <MdxRenderer source={product.description} />
  </div>
</details> */}
<DescriptionToggle>
  <MdxRenderer source={product.description || ""} />
</DescriptionToggle>
</div>
    </div>
  );
}
