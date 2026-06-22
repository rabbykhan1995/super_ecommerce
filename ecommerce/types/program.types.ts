export type Trainingprogram = {
  title: string | null;
  description: string | null;
  images: string[];
  thumbnail?: string;
  level: string | null;
  reviewers: number | null;
  avarageReview: number | null;
  shortDescription: string | null;
  price?: number;
  active: boolean;
  slug: string;
};

export type CardTrainingProgram = Pick<
  Trainingprogram,
  "thumbnail" | "avarageReview" | "title" | "level" | "active" | "slug"
>;
