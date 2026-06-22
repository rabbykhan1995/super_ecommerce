export type FullProduct = {
  _id:string;
  title: string;
  slug: string;
  rating: number;
  description?: string;
  shortDescription?: string;
  thumbnail?: string | null;
  images: string[];
  tags:string[];
  price: number;
  stock: number;
  reviewers: number;
  averageReview: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CardProduct = Pick<
  FullProduct,
  "thumbnail" | "averageReview" | "title" | "slug"
>;
