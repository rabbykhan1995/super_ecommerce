export type CartItem = {
  id: number;
  userID: string;
  productID: number;
  variantID: number;
  name: string;
  price: number;
  slug: string;
  thumbnail: string | null;
  attributes: { name: string; value: string }[];
  quantity: number;
  stock: number;
  addedAt: string;
};

export type AddToCartPayload = {
  productID: number;
  variantID: number;
  quantity: number;
};

export type UpdateCartPayload = {
  quantity: number;
};
