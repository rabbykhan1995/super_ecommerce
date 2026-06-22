import { Metadata } from "next";
import { notFound } from "next/navigation";
import Helper from "@/helper/helper";
import MdxRenderer from "@/components/MDX/MDXRenderer";
import Image from "next/image";
import Script from "next/script";
;

interface Props {
  params: Promise<{ slug: string }>;
}

const getBlogBySlug = async (slug: string):Promise<any> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/blog/blogBySlug/${slug}`,
    {
      next: { tags: [`blog-${slug}`] },
    }
  );
 const json = await res.json();
 if(!json.success){notFound()}
 return json.data; 
}

// ১. SEO এর জন্য Dynamic Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const blog = await getBlogBySlug(slug)


    if (!blog.success) return { title: "Blog Not Found" };

    return {
      title: blog.data.title,
      description: blog.data.shortDescription,
      openGraph: {
        title: blog.data.title,
        description: blog.data.shortDescription,
        images: [blog.data.thumbnail || ""],
        type: "article",
      },
    };
  } catch {
    return { title: "Blog Post" };
  }
}

export default async function BlogDetailsPage({ params }: Props) {
  const { slug } = await params;
  // update korar time a revalidateTag import kore seta call kore dite hobe


  const blog =  await getBlogBySlug(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.shortDescription,
    image: blog.thumbnail,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    author: {
      "@type": "Person",
      name: blog.author?.name || "Admin",
    },
    publisher: {
      "@type": "Organization",
      name: "Your Website Name",
      logo: {
        "@type": "ImageObject",
        url: "https://yourdomain.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://yourdomain.com/blog/${slug}`,
    },
  };

  return (
    <>
      <Script
        id="blog-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-4xl mx-auto px-4 py-10">
        {/* ৩. হেডার সেকশন */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {blog.title}
          </h1>
          <div className="flex items-center text-slate-500 text-sm gap-4">
            <span>{Helper.formatDate(blog.createdAt)}</span>
            <span>•</span>
            <div className="flex flex-wrap gap-2">
              {blog.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-slate-100 px-2 py-0.5 rounded text-blue-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* ৪. থাম্বনেইল */}
        {blog.thumbnail && (
          <div className="w-full min-h-[40vh] relative">
            <Image
              src={blog.thumbnail}
              alt={blog.slug}
              fill
              className="rounded-lg object-cover"
            />
          </div>
        )}

        {/* ৫. MDX কন্টেন্ট রেন্ডারার */}
        <MdxRenderer source={blog.description} />
      </article>
    </>
  );
}
