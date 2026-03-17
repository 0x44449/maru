import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useTheme } from "@/constants/useTheme";
import {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
} from "@/constants/theme";
import { useAuthStore, selectStatus } from "@/stores/auth";

export default function UserRegisterScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const status = useAuthStore(selectStatus);
  const checkUser = useAuthStore((s) => s.checkUser);
  const [retrying, setRetrying] = useState(false);

  // mock 소셜 로그인 정보
  const socialProvider = "Google";
  const socialEmail = "dohyun.kim@gmail.com";
  const socialName = "김도현";

  const [name, setName] = useState(socialName);
  const [maruId, setMaruId] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const defaultAvatars = [
    { id: "a1", emoji: "😊", bg: "#fce7f3", color: "#be185d" },
    { id: "a2", emoji: "🐱", bg: "#dcfce7", color: "#15803d" },
    { id: "a3", emoji: "🌸", bg: "#f3e8ff", color: "#7c3aed" },
    { id: "a4", emoji: "🌊", bg: "#dbeafe", color: "#1d4ed8" },
    { id: "a5", emoji: "🔥", bg: "#fef3c7", color: "#92400e" },
    { id: "a6", emoji: "🍀", bg: "#e0e7ff", color: "#3730a3" },
  ];

  const isValid = name.trim().length > 0 && maruId.trim().length > 0 && agreeTerms && agreePrivacy;

  const handleStart = () => {
    // TODO: 등록 API 호출 후 useAuthStore.getState().setUser(response)로 상태 갱신
    // 현재는 등록 API가 미구현이므로 동작하지 않음
  };

  const handleRetry = async () => {
    setRetrying(true);
    await checkUser();
    setRetrying(false);
  };

  // error 상태: 서버 조회 실패 → 재시도 UI
  if (status === "error") {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            paddingTop: insets.top,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: spacing[6],
          },
        ]}
      >
        <View
          style={[
            styles.errorIconContainer,
            { backgroundColor: colors.semantic.error.light },
          ]}
        >
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
          연결 오류
        </Text>
        <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
          서버에 연결할 수 없습니다.{"\n"}잠시 후 다시 시도해주세요.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            { opacity: pressed || retrying ? 0.85 : 1 },
          ]}
          onPress={handleRetry}
          disabled={retrying}
        >
          {retrying ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.retryButtonText}>다시 시도</Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
          <View style={[styles.socialTag, { backgroundColor: colors.primary[50] }]}>
            <Text style={[styles.socialTagText, { color: colors.primary[600] }]}>
              {socialProvider}
            </Text>
          </View>
          <Text style={[styles.socialEmail, { color: theme.textSecondary }]}>
            {socialEmail}
          </Text>
        </View>

        {/* 프로필 사진 */}
        <View style={styles.avatarSection}>
          {/* 현재 선택된 프로필 */}
          <View style={[styles.avatarPreview, { backgroundColor: selectedAvatar ? defaultAvatars.find(a => a.id === selectedAvatar)?.bg ?? theme.surface : theme.surface, borderColor: theme.border }]}>
            {selectedAvatar === "custom" ? (
              <Text style={{ fontSize: 32 }}>📷</Text>
            ) : selectedAvatar ? (
              <Text style={{ fontSize: 32 }}>{defaultAvatars.find(a => a.id === selectedAvatar)?.emoji}</Text>
            ) : (
              <Text style={{ fontSize: 32, color: theme.textTertiary }}>👤</Text>
            )}
          </View>

          {/* 기본 프로필 선택 */}
          <Text style={[styles.avatarHint, { color: theme.textTertiary }]}>
            프로필 사진을 선택하세요 (선택)
          </Text>
          <FlatList
            horizontal
            data={[...defaultAvatars, { id: "custom", emoji: "📷", bg: "transparent", color: "" }]}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.avatarList}
            renderItem={({ item }) => {
              const isSelected = selectedAvatar === item.id;
              const isCustom = item.id === "custom";
              return (
                <Pressable
                  onPress={() => setSelectedAvatar(isSelected ? null : item.id)}
                  style={[
                    styles.avatarOption,
                    {
                      backgroundColor: isCustom ? theme.surface : item.bg,
                      borderColor: isSelected ? colors.primary[600] : "transparent",
                    },
                    isCustom && { borderColor: isSelected ? colors.primary[600] : theme.border, borderStyle: "dashed" as const },
                  ]}
                >
                  <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                </Pressable>
              );
            }}
          />
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
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* 마루 ID 입력 */}
        <View style={styles.fieldArea}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>
            마루 ID <Text style={{ color: colors.semantic.error.default }}>*</Text>
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
            placeholder="영문, 숫자, 밑줄, 마침표 사용 가능"
            placeholderTextColor={theme.textTertiary}
            value={maruId}
            onChangeText={setMaruId}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={[styles.fieldHint, { color: theme.textTertiary }]}>
            다른 사용자가 이 ID로 회원님을 찾을 수 있습니다
          </Text>
        </View>

        {/* 이용약관 동의 */}
        <View style={styles.agreementArea}>
          <Pressable
            style={styles.agreementRow}
            onPress={() => setAgreeTerms(!agreeTerms)}
          >
            <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked, { borderColor: theme.border }]}>
              {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.agreementText, { color: theme.textPrimary }]}>
              서비스 이용약관 동의 <Text style={{ color: colors.semantic.error.default }}>(필수)</Text>
            </Text>
            <Pressable hitSlop={8}>
              <Text style={[styles.agreementLink, { color: theme.textTertiary }]}>보기</Text>
            </Pressable>
          </Pressable>

          <Pressable
            style={styles.agreementRow}
            onPress={() => setAgreePrivacy(!agreePrivacy)}
          >
            <View style={[styles.checkbox, agreePrivacy && styles.checkboxChecked, { borderColor: theme.border }]}>
              {agreePrivacy && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.agreementText, { color: theme.textPrimary }]}>
              개인정보 처리방침 동의 <Text style={{ color: colors.semantic.error.default }}>(필수)</Text>
            </Text>
            <Pressable hitSlop={8}>
              <Text style={[styles.agreementLink, { color: theme.textTertiary }]}>보기</Text>
            </Pressable>
          </Pressable>
        </View>
      </ScrollView>

      {/* 시작하기 버튼 */}
      <View style={{ paddingHorizontal: spacing[6], paddingBottom: insets.bottom + spacing[6] }}>
        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            !isValid && styles.startButtonDisabled,
            { opacity: pressed && isValid ? 0.85 : 1 },
          ]}
          onPress={handleStart}
          disabled={!isValid}
        >
          <Text style={styles.startButtonText}>시작하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[12],
    paddingBottom: spacing[4],
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
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing[6],
    gap: spacing[2],
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHint: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
  },
  avatarList: {
    gap: spacing[2],
    paddingHorizontal: spacing[2],
  },
  avatarOption: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
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
  fieldHint: {
    fontSize: fontSize.xs,
    marginTop: spacing[1],
  },

  // Agreement
  agreementArea: {
    marginTop: spacing[4],
    gap: spacing[3],
  },
  agreementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  checkmark: {
    fontSize: 14,
    fontWeight: fontWeight.bold,
    color: "#ffffff",
  },
  agreementText: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  agreementLink: {
    fontSize: fontSize.sm,
    textDecorationLine: "underline",
  },

  // Start Button
  startButton: {
    height: 48,
    backgroundColor: colors.primary[600],
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },

  // Error state
  errorIconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing[4],
  },
  errorIconText: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.semantic.error.default,
  },
  errorTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing[2],
  },
  errorMessage: {
    fontSize: fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing[6],
  },
  retryButton: {
    height: 48,
    paddingHorizontal: spacing[8],
    backgroundColor: colors.primary[600],
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
