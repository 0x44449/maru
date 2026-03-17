import * as KakaoLogin from "@react-native-seoul/kakao-login";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "./supabase";

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
