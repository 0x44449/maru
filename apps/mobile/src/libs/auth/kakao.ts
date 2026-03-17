import * as KakaoLogin from "@react-native-seoul/kakao-login";
import { supabase } from "./supabase";
import { AuthError, isCancelError } from "./error";

export async function signInWithKakao() {
  try {
    const result = await KakaoLogin.login();

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "kakao",
      token: result.idToken,
    });

    if (error) throw error;
    return data;
  } catch (e) {
    if (isCancelError(e)) throw new AuthError("AUTH_CANCELLED");
    throw new AuthError("AUTH_FAILED", e instanceof Error ? e.message : "카카오 로그인 실패");
  }
}
