export type OrderStatus =
  | "pending"
  | "hold"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "failed";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type EcomOrderItem = {
  id: number;
  orderID: number;
  productID: number;
  variantID: number;
  productName: string;
  variantAttrs: { name: string; value: string }[];
  thumbnail: string | null;
  salePrice: number;
  discountPrice: number | null;
  quantity: number;
  lineTotal: number;
};

export type EcomOrder = {
  id: number;
  orderNo: string;
  saleID: number | null;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string | null;
  paymentStatus: PaymentStatus;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string | null;
  shippingArea: string | null;
  note: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: EcomOrderItem[];
};

export type EcomOrderListResponse = {
  orders: EcomOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
