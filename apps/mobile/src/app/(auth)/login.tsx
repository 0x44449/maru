import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/useTheme";
import {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  socialColors,
} from "@/constants/theme";
import { signInWithGoogle, signInWithKakao } from "@/libs/auth";
import ErrorModal from "@/components/ErrorModal";

export default function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const handleLogin = async (
    provider: "kakao" | "google",
  ) => {
    setIsLoading(true);
    try {
      if (provider === "kakao") {
        await signInWithKakao();
      } else {
        await signInWithGoogle();
      }
      // 성공 → onAuthStateChange가 발동하여 Zustand 상태 자동 전환
      // Root layout이 자동으로 올바른 화면으로 라우팅
    } catch (e) {
      // 사용자가 로그인 팝업을 취소한 경우는 조용히 무시
      const errorMessage = e instanceof Error ? e.message : String(e);
      const isCancelled =
        errorMessage.includes("cancel") ||
        errorMessage.includes("Cancel") ||
        errorMessage.includes("사용자가 취소");

      if (!isCancelled) {
        setError({
          title: "로그인 실패",
          message: "로그인 중 문제가 발생했습니다. 다시 시도해주세요.",
        });
      }
    } finally {
      setIsLoading(false);
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
              opacity: isLoading ? 0.4 : pressed ? 0.85 : 1,
            },
          ]}
          onPress={() => handleLogin("kakao")}
          disabled={isLoading}
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
              opacity: isLoading ? 0.4 : pressed ? 0.85 : 1,
            },
          ]}
          onPress={() => handleLogin("google")}
          disabled={isLoading}
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

      {/* 로딩 오버레이 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            로그인 중...
          </Text>
        </View>
      )}

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

      {/* 에러 모달 */}
      <ErrorModal
        visible={error !== null}
        title={error?.title ?? ""}
        message={error?.message ?? ""}
        onClose={() => setError(null)}
      />
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing[3],
  },
  loadingText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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
