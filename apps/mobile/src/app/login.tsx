import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/constants/useTheme";
import {
  spacing,
  radius,
  fontSize,
  fontWeight,
  socialColors,
} from "@/constants/theme";
import { signInWithGoogle, signInWithKakao } from "@/libs/auth";

export default function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleKakaoLogin = async () => {
    try {
      const data = await signInWithKakao();
      console.log("카카오 로그인 성공:", data);

      router.replace("/user-register");
    } catch (error) {
      console.error("카카오 로그인 실패:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const data = await signInWithGoogle();
      console.log("구글 로그인 성공:", data);

      router.replace("/user-register");
    } catch (error) {
      console.error("구글 로그인 실패:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 배경 이미지 */}
      <Image
        source={require("@/assets/images/maru-icon-background.png")}
        style={styles.backgroundImage}
        contentFit="cover"
      />

      {/* 로고 영역 */}
      <View style={styles.logoArea}>
        <Image
          source={require("@/assets/images/maru-icon-foreground.png")}
          style={styles.logoIcon}
          contentFit="contain"
        />
        <Text style={[styles.logoText, { color: theme.textPrimary }]}>
          마루
        </Text>
        <Text style={[styles.logoSubtext, { color: theme.textTertiary }]}>
          하나의 앱에서, 모든 소통을
        </Text>
      </View>

      {/* 소셜 로그인 버튼 */}
      <View style={styles.buttonArea}>
        <Pressable
          style={({ pressed }) => [
            styles.socialButton,
            {
              backgroundColor: socialColors.kakao.background,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={handleKakaoLogin}
        >
          <Text style={{ fontSize: 18 }}>💬</Text>
          <Text
            style={[
              styles.socialButtonText,
              { color: socialColors.kakao.text },
            ]}
          >
            카카오로 시작하기
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.socialButton,
            {
              backgroundColor: socialColors.google.background,
              borderWidth: 1,
              borderColor: socialColors.google.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={handleGoogleLogin}
        >
          <Text style={{ fontSize: 18, fontWeight: "500" }}>G</Text>
          <Text
            style={[
              styles.socialButtonText,
              { color: socialColors.google.text },
            ]}
          >
            Google로 시작하기
          </Text>
        </Pressable>
      </View>

      {/* 하단 안내 */}
      <Text
        style={[
          styles.footer,
          { color: theme.textTertiary, bottom: insets.bottom + spacing[6] },
        ]}
      >
        시작하면 서비스 이용약관 및 개인정보 처리방침에{"\n"}동의하는 것으로
        간주됩니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing[6],
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: spacing[12],
  },
  logoIcon: {
    width: 320,
    height: 320,
    marginBottom: spacing[3],
  },
  logoText: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    marginBottom: spacing[2],
  },
  logoSubtext: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
  },
  buttonArea: {
    gap: spacing[3],
  },
  socialButton: {
    height: 48,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
  },
  socialButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  footer: {
    position: "absolute",
    left: spacing[6],
    right: spacing[6],
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    textAlign: "center",
    lineHeight: 18,
  },
});
