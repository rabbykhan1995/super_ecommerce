// import axios from "axios";
// import Toast from "react-native-toast-message";
// import AuthHelper from "./auth";

// const API_URL = process.env.EXPO_PUBLIC_API_URL;

// const api = axios.create({
//   baseURL: API_URL,
//   timeout: 10000,
//   adapter: "xhr",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// api.interceptors.request.use(async (config) => {
//   const token = await AuthHelper.getToken();
//   if (token) {
//     config.headers.token = token;
//   }
//      console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, config.data)
//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       await AuthHelper.clearToken();
//       Toast.show({
//         type: "error",
//         text1: "Session expired",
//         text2: "Please login again",
//       });
//     }

//     const message =
//       error.response?.data?.message || error.message || "Something went wrong";
//     Toast.show({
//       type: "error",
//       text1: "Error",
//       text2: message,
//     });

//     return Promise.reject(error);
//   }
// );

// export default api;



import Toast from "react-native-toast-message";
import AuthHelper from "./auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type RequestOptions = {
  method?: string;
  data?: any;
  headers?: Record<string, string>;
};

// Mimics axios response shape: { data, status, statusText, headers }
type ApiResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
};

// Mimics axios error shape: { message, response: { data, status } }
class ApiError extends Error {
  response?: {
    data: any;
    status: number;
  };
  config?: any;

  constructor(message: string, response?: { data: any; status: number }) {
    super(message);
    this.response = response;
  }
}

async function request<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const token = await AuthHelper.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { token } : {}),
    ...options.headers,
  };


  let res: Response;
  try {
    console.log(`[API FETCH START] ${API_URL}${url}`);
    res = await fetch(`${API_URL}${url}`, {
      method: options.method || "GET",
      headers,
      body: options.data ? JSON.stringify(options.data) : undefined,
    });

  } catch (err: any) {

    // Network-level failure (no connection, DNS, etc.) — axios calls this "Network Error"
    const networkError = new ApiError(err.message || "Network Error");
    Toast.show({ type: "error", text1: "Error", text2: "Network Error" });
    throw networkError;
  }

  let data: any = null;
  try {
    data = await res.json();

  } catch (parseErr: any) {

    // response had no JSON body
  }

  if (!res.ok) {
    if (res.status === 401) {
      await AuthHelper.clearToken();
      Toast.show({ type: "error", text1: "Session expired", text2: "Please login again" });
    }

    const message = data?.message || res.statusText || "Something went wrong";
    Toast.show({ type: "error", text1: "Error", text2: message });

    throw new ApiError(message, { data, status: res.status });
  }

  return { data, status: res.status, statusText: res.statusText, headers: res.headers };
}

export default {
  get: <T = any>(url: string) => request<T>(url, { method: "GET" }),
  post: <T = any>(url: string, data?: any) => request<T>(url, { method: "POST", data }),
  put: <T = any>(url: string, data?: any) => request<T>(url, { method: "PUT", data }),
  patch: <T = any>(url: string, data?: any) => request<T>(url, { method: "PATCH", data }),
  delete: <T = any>(url: string) => request<T>(url, { method: "DELETE" }),
};