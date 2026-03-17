import * as KakaoLogin from "@react-native-seoul/kakao-login";
import { supabase } from "./supabse";
import {
  GoogleSignin,
} from "@react-native-google-signin/google-signin";

export async function signInWithKakao() {
  const result = await KakaoLogin.login();

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "kakao",
    token: result.idToken,
  });

  if (error) {
    console.error("카카오 로그인 실패:", error);
    throw error;
  }

  return data;
}

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();
  const result = await GoogleSignin.signIn();
  if (!result.data || !result.data.idToken) {
    throw new Error("구글 로그인 실패: 사용자 데이터 없음");
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: result.data.idToken,
  });

  if (error) {
    console.error("구글 로그인 실패:", error);
    throw error;
  }

  return data;
}

export async function signOut() {
  const { data } = await supabase.auth.getSession();
  const provider = data.session?.user?.app_metadata?.provider;

  if (provider === "kakao") {
    await KakaoLogin.logout();
  } else if (provider === "google") {
    await GoogleSignin.signOut();
  }

  await supabase.auth.signOut();
}