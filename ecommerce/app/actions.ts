"use server";
import { updateTag } from "next/cache";

export async function refreshBlogData(slug: string) {
  if (slug) {
    // নির্দিষ্ট ব্লগের ক্যাশ ক্লিয়ার করবে
    updateTag(`blog-${slug}`);
  }
}

export async function refreshTrainingData(slug: string) {
  if (slug) {
    // নির্দিষ্ট ব্লগের ক্যাশ ক্লিয়ার করবে
    updateTag(`training-${slug}`);
  }
}

export async function refreshProductData(slug: string) {
  if (slug) {
    // নির্দিষ্ট ব্লগের ক্যাশ ক্লিয়ার করবে
    updateTag(`product-${slug}`);
  }
}
