# Task 05 — API Layer (Axios + SecureStore)

> **Phase**: 2 — Core Infrastructure
> **Say**: "generate task 5" or "generate task 05"

## Objective

Create the Axios instance with SecureStore-based token injection. Same base URL, same endpoints, same interceptors as the web project.

## Reference

`/ecommerce/utils/apiconfig.ts`

## File to Create

### `mobile/lib/api.ts`

```ts
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Toast from "react-native-toast-message";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.token = token;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await SecureStore.deleteItemAsync("token");
      Toast.show({
        type: "error",
        text1: "Session expired",
        text2: "Please login again",
      });
      // Navigation handled by auth store listener
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    Toast.show({
      type: "error",
      text1: "Error",
      text2: message,
    });

    return Promise.reject(error);
  }
);

export default api;
```

## API Endpoints (same as web)

| Module | Method | Endpoint |
|--------|--------|----------|
| Auth | POST | `/auth/login` |
| Auth | POST | `/auth/register` |
| Auth | GET | `/auth/get-profile` |
| Auth | GET | `/auth/logout` |
| Products | GET | `/product/ecom-product-list` |
| Products | GET | `/product/productBySlug/:slug` |
| Products | GET | `/product/ecom-variants/:id` |
| Categories | GET | `/category/list` |
| Brands | GET | `/brand/list` |
| Cart | GET | `/cart/list` |
| Cart | POST | `/cart/add` |
| Cart | PUT | `/cart/update/:id` |
| Cart | DELETE | `/cart/remove/:id` |
| Cart | DELETE | `/cart/clear` |
| Checkout | POST | `/checkout/create-order` |

## Verify

Import `api` in a component, make a test GET call — should return data or proper error toast.
