import axios, { isAxiosError } from "axios";
import { supabase } from "@/libs/auth/supabase";
import type { ApiError } from "./types";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Request 인터셉터: Supabase access_token을 Authorization 헤더에 자동 주입
apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response 인터셉터: 에러 응답을 ApiError 구조로 변환
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && error.response?.data) {
      const apiError: ApiError = {
        errorCode: error.response.data.errorCode ?? "UNKNOWN_ERROR",
        message: error.response.data.message ?? "알 수 없는 오류가 발생했습니다.",
      };
      return Promise.reject(apiError);
    }
    // 네트워크 오류 등 응답 자체가 없는 경우
    const networkError: ApiError = {
      errorCode: "NETWORK_ERROR",
      message: "서버에 연결할 수 없습니다.",
    };
    return Promise.reject(networkError);
  },
);

export default apiClient;
