export type Cart = {
    _id:string;
  itemID: string;
  itemSlug: string;
  itemTitle: string;
  thumbnail?: string;
  price: number;
  stock: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export type UpdateCart = Omit<Cart, "createdAt" | "updatedAt" | "_id">


export type CreateCart = UpdateCart;