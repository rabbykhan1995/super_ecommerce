import api from "./apiconfig";
import type { EcomOrder, EcomOrderListResponse } from "@/types/order.types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  msg?: string;
  message?: string;
};

export async function createOrder(payload: {
  shipping: {
    name: string;
    phone: string;
    address: string;
    city?: string;
    area?: string;
  };
  note?: string;
  paymentMethod: "stripe" | "cod";
}) {
  const res = await api.post<ApiResponse<{ orderId: number; stripeSessionUrl?: string }>>(
    "/order/checkout",
    payload,
  );
  return res.data.data;
}

export async function getMyOrders(page = 1, limit = 10) {
  const res = await api.get<ApiResponse<EcomOrderListResponse>>(
    `/order/my-orders?page=${page}&limit=${limit}`,
  );
  return res.data.data;
}

export async function getOrderDetail(orderId: number) {
  const res = await api.get<ApiResponse<EcomOrder>>(`/order/my-orders/${orderId}`);
  return res.data.data;
}

export async function cancelOrder(orderId: number) {
  const res = await api.post<ApiResponse<null>>(`/order/cancel/${orderId}`);
  return res.data;
}

export async function confirmStripeOrder(sessionId: string) {
  const res = await api.get<ApiResponse<EcomOrder>>(
    `/order/order-success?session_id=${sessionId}`,
  );
  return res.data.data;
}

export async function confirmCodOrder(orderId: number) {
  const res = await api.get<ApiResponse<EcomOrder>>(
    `/order/order-success?orderId=${orderId}`,
  );
  return res.data.data;
}

export async function getPublicOrder(orderId: number) {
  const res = await api.get<ApiResponse<EcomOrder>>(`/order/order/${orderId}`);
  return res.data.data;
}
