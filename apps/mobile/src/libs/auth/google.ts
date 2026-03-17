import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "./supabase";
import { AuthError, isCancelError } from "./error";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const result = await GoogleSignin.signIn();
    if (!result.data || !result.data.idToken) {
      throw new Error("사용자 데이터 없음");
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: result.data.idToken,
    });

    if (error) throw error;
    return data;
  } catch (e) {
    if (e instanceof AuthError) throw e;
    if (isCancelError(e)) throw new AuthError("AUTH_CANCELLED");
    throw new AuthError("AUTH_FAILED", e instanceof Error ? e.message : "구글 로그인 실패");
  }
}
