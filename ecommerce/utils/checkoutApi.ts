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
  const res = await api.post<ApiResponse<{ orderNo: string; sessionUrl?: string }>>(
    "/ecom/checkout",
    payload,
  );
  return res.data.data;
}

export async function getMyOrders(page = 1, limit = 10) {
  const res = await api.get<ApiResponse<EcomOrderListResponse>>(
    `/ecom/my-orders?page=${page}&limit=${limit}`,
  );
  return res.data.data;
}

export async function getOrderDetail(orderNo: string) {
  const res = await api.get<ApiResponse<EcomOrder>>(`/ecom/my-orders/${orderNo}`);
  return res.data.data;
}

export async function cancelOrder(orderNo: string) {
  const res = await api.post<ApiResponse<null>>(`/ecom/cancel/${orderNo}`);
  return res.data;
}

export async function confirmStripeOrder(sessionId: string) {
  const res = await api.get<ApiResponse<EcomOrder>>(
    `/ecom/order-success?session_id=${sessionId}`,
  );
  return res.data.data;
}

export async function getPublicOrder(orderNo: string) {
  const res = await api.get<ApiResponse<EcomOrder>>(`/ecom/order/${orderNo}`);
  return res.data.data;
}
