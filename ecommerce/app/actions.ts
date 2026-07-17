"use server";
import { revalidateTag } from "next/cache";

export async function refreshBlogData(slug: string) {
  if (slug) {
    revalidateTag(`blog-${slug}`);
  }
}

export async function refreshTrainingData(slug: string) {
  if (slug) {
    revalidateTag(`training-${slug}`);
  }
}

export async function refreshProductData(slug: string) {
  if (slug) {
    revalidateTag(`product-${slug}`);
  }
}
