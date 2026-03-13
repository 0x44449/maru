import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/useTheme";
import {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
} from "@/constants/theme";

export default function UserRegisterScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // mock 데이터
  const socialProvider = "Google";
  const socialEmail = "dohyun.kim@gmail.com";
  const socialName = "김도현";

  const handleStart = () => {
    Alert.alert("시작하기", "워크스페이스 선택 화면으로 이동 예정");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top + spacing[12],
        },
      ]}
    >
      {/* 타이틀 */}
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        반갑습니다!
      </Text>
      <Text style={[styles.description, { color: theme.textTertiary }]}>
        마루에서 사용할 프로필을 설정해주세요
      </Text>

      {/* 소셜 로그인 정보 */}
      <View style={styles.socialInfo}>
        <View
          style={[styles.socialTag, { backgroundColor: colors.primary[50] }]}
        >
          <Text style={[styles.socialTagText, { color: colors.primary[600] }]}>
            {socialProvider}
          </Text>
        </View>
        <Text style={[styles.socialEmail, { color: theme.textSecondary }]}>
          {socialEmail}
        </Text>
      </View>

      {/* 프로필 사진 */}
      <View style={styles.avatarArea}>
        <View style={[styles.avatar, { borderColor: theme.border }]}>
          <Text style={{ fontSize: 28, color: theme.textTertiary }}>📷</Text>
        </View>
        <Text style={[styles.avatarHint, { color: theme.textTertiary }]}>
          프로필 사진 (선택)
        </Text>
      </View>

      {/* 이름 입력 */}
      <View style={styles.fieldArea}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          이름 <Text style={{ color: colors.semantic.error.default }}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
          placeholder="이름을 입력하세요"
          placeholderTextColor={theme.textTertiary}
          defaultValue={socialName}
        />
      </View>

      {/* 연락처 입력 */}
      <View style={styles.fieldArea}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          연락처 (선택)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
          placeholder="010-0000-0000"
          placeholderTextColor={theme.textTertiary}
          keyboardType="phone-pad"
        />
      </View>

      {/* 하단 영역 spacer */}
      <View style={{ flex: 1 }} />

      {/* 시작하기 버튼 */}
      <Pressable
        style={({ pressed }) => [
          styles.startButton,
          { opacity: pressed ? 0.85 : 1, marginBottom: insets.bottom + spacing[6] },
        ]}
        onPress={handleStart}
      >
        <Text style={styles.startButtonText}>시작하기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: "center",
    marginBottom: spacing[2],
  },
  description: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    textAlign: "center",
    marginBottom: spacing[6],
  },
  socialInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    marginBottom: spacing[8],
  },
  socialTag: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.sm,
  },
  socialTagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  socialEmail: {
    fontSize: fontSize.sm,
  },
  avatarArea: {
    alignItems: "center",
    marginBottom: spacing[8],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[2],
  },
  avatarHint: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
  },
  fieldArea: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing[2],
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[4],
    fontSize: 15,
  },
  startButton: {
    height: 48,
    backgroundColor: colors.primary[600],
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
