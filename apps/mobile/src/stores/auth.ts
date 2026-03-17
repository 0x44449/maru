import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/libs/auth/supabse";
import apiClient from "@/api/client";
import type { ApiError, UserResponse } from "@/api/types";

export type AuthStatus =
  | "loading"
  | "unauthenticated"
  | "unregistered"
  | "error"
  | "authenticated";

interface AuthState {
  isInitialized: boolean;
  isCheckingUser: boolean;
  session: Session | null;
  user: UserResponse | null;
  userFetchError: boolean;

  checkUser: () => Promise<void>;
  setUser: (user: UserResponse) => void;
  logout: () => Promise<void>;
}

/** 원시 상태로부터 인증 상태를 계산하는 셀렉터 */
export function selectStatus(state: AuthState): AuthStatus {
  if (!state.isInitialized || state.isCheckingUser) return "loading";
  if (!state.session) return "unauthenticated";
  if (state.userFetchError) return "error";
  if (!state.user) return "unregistered";
  return "authenticated";
}

// 요청 ID — stale 응답 무시용
let requestId = 0;

export const useAuthStore = create<AuthState>()((set, get) => {
  // 스토어 생성 시 onAuthStateChange 리스너 자동 등록
  supabase.auth.onAuthStateChange((_event, session) => {
    set({ session, isInitialized: true, userFetchError: false });
    if (session) {
      get().checkUser();
    } else {
      set({ user: null, isCheckingUser: false });
    }
  });

  return {
    isInitialized: false,
    isCheckingUser: false,
    session: null,
    user: null,
    userFetchError: false,

    checkUser: async () => {
      const currentRequestId = ++requestId;
      set({ isCheckingUser: true, userFetchError: false });

      try {
        console.log("[auth] checkUser 요청:", process.env.EXPO_PUBLIC_API_URL + "/api/v1/users/me");
        const response = await apiClient.get<UserResponse>("/api/v1/users/me");
        if (currentRequestId !== requestId) return;
        console.log("[auth] checkUser 성공:", response.data);
        set({ user: response.data, isCheckingUser: false });
      } catch (e) {
        if (currentRequestId !== requestId) return;
        console.log("[auth] checkUser 에러 원본:", JSON.stringify(e, null, 2));

        const apiError = e as ApiError;
        if (apiError.errorCode === "USER_NOT_FOUND") {
          set({ user: null, isCheckingUser: false });
        } else if (apiError.errorCode === "UNAUTHORIZED") {
          await supabase.auth.signOut();
        } else {
          set({ userFetchError: true, isCheckingUser: false });
        }
      }
    },

    setUser: (user: UserResponse) => {
      set({ user, userFetchError: false });
    },

    logout: async () => {
      ++requestId; // stale 응답 무시
      await supabase.auth.signOut();
    },
  };
});
