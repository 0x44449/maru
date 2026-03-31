import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/libs/auth/supabase";
import { authApi } from "@/api/auth";
import type { UserResponse } from "@/api/types";

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
        const { data: result } = await authApi.login({ fcmToken: null });
        if (currentRequestId !== requestId) return;

        if (result.success) {
          set({ user: result.data, isCheckingUser: false });
        } else if (result.errorCode === "USER_NOT_REGISTERED") {
          set({ user: null, isCheckingUser: false });
        } else {
          set({ userFetchError: true, isCheckingUser: false });
        }
      } catch {
        if (currentRequestId !== requestId) return;
        set({ userFetchError: true, isCheckingUser: false });
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
