import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://yourdomain.com";
  const limit = 500; // সাইটম্যাপের জন্য লিমিট একটু বেশি রাখা ভালো
  let allBlogs: any[] = [];
  let page = 1;
  let totalPages = 1;

  try {
    // লুপ চালিয়ে সব পেজের ডাটা কালেক্ট করা
    do {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blog/list?page=${page}&limit=${limit}`,
        {
          next: {
            tags: ["update-blog-sitemap"],
          },
        },
      );

      const responseData = await res.json();

      if (responseData.success && responseData.data) {
        allBlogs = [...allBlogs, ...responseData.data.items];
        // টোটাল পেজ আপডেট করা (প্রথমবার রেসপন্স পাওয়ার পর)
        totalPages = Math.ceil(responseData.data.total / limit);
        page++;
      } else {
        break;
      }
    } while (page <= totalPages);

    // ডাইনামিক রুট জেনারেট করা
    const blogEntries: any = allBlogs.map((blog: any) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: new Date(blog.updatedAt || blog.createdAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // স্ট্যাটিক রুটগুলোও এখানে যোগ করে দিন (বেস্ট প্র্যাকটিস)
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      ...blogEntries,
    ];
  } catch (error) {
    console.error("Sitemap error:", error);
    return [];
  }
}
