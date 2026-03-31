import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/useTheme";
import {
  colors,
  spacing,
  size,
  radius,
  fontSize,
  lineHeight,
  fontWeight,
} from "@/constants/theme";
import { useAuthStore, selectStatus } from "@/stores/auth";
import { usersApi } from "@/api/users";
import ErrorModal from "@/components/ErrorModal";
import PermissionModal from "@/components/PermissionModal";

/**
 * 사용자 등록 화면
 *
 * Supabase 소셜 로그인 후 사용자 정보가 없을 때(unregistered) 표시된다.
 * 프로필 사진, 이름, 마루 ID, 약관 동의를 입력받아 서버에 등록한다.
 *
 * @route /(onboarding)/user-register
 */
export default function UserRegisterScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const status = useAuthStore(selectStatus);
  const checkUser = useAuthStore((s) => s.checkUser);
  const setUser = useAuthStore((s) => s.setUser);
  const session = useAuthStore((s) => s.session);

  // ─── 소셜 로그인에서 가져온 정보 ───
  const socialEmail = session?.user?.email ?? "";
  const socialName = session?.user?.user_metadata?.full_name ?? "";

  // ─── 폼 상태 ───
  const [name, setName] = useState(socialName);
  const [maruId, setMaruId] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [profileImage, setProfileImage] = useState<{ uri: string; mimeType: string } | null>(null);

  // ─── UI 상태 ───
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [submitting, setSubmitting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [nameError, setNameError] = useState(false);
  const [permissionModal, setPermissionModal] = useState<{ title: string; message: string } | null>(null);

  // ─── 마루 ID 유효성 상태 ───
  const [tagStatus, setTagStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid" | "short" | "long"
  >("idle");

  /**
   * 마루 ID 디바운스 중복 체크
   *
   * 입력값이 변경될 때마다 클라이언트 유효성을 먼저 검사하고,
   * 통과하면 500ms 디바운스 후 서버에 중복 확인 요청을 보낸다.
   * cleanup에서 cancelled 플래그로 stale 응답을 무시한다.
   */
  useEffect(() => {
    const trimmed = maruId.trim();

    if (trimmed.length === 0) { setTagStatus("idle"); return; }
    if (trimmed.length < 4) { setTagStatus("short"); return; }
    if (trimmed.length > 12) { setTagStatus("long"); return; }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_.]*$/.test(trimmed)) { setTagStatus("invalid"); return; }

    setTagStatus("checking");
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { data: result } = await usersApi.checkTag({ tag: trimmed });
        if (cancelled) return;
        if (result.success && result.data) {
          if (result.data.status === "AVAILABLE") setTagStatus("available");
          else if (result.data.status === "ALREADY_TAKEN") setTagStatus("taken");
          else setTagStatus("invalid");
        }
      } catch {
        if (!cancelled) setTagStatus("idle");
      }
    }, 500);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [maruId]);

  /** 시작하기 버튼 활성화 조건 */
  const isValid =
    name.trim().length > 0 &&
    maruId.trim().length > 0 &&
    tagStatus === "available" &&
    agreeTerms &&
    agreePrivacy;

  // ─── 핸들러 ───

  /**
   * 사용자 등록 요청
   *
   * 이름, 마루 ID, 프로필 이미지를 multipart로 서버에 전송한다.
   * 성공 시 auth store에 사용자 정보를 설정하여 메인 화면으로 자동 이동,
   * 실패 시 에러코드에 따라 필드 상태 + ErrorModal을 표시한다.
   */
  const handleStart = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const { data: result } = await usersApi.register({
        name: name.trim(),
        userTag: maruId.trim(),
        profileImage: profileImage ?? undefined,
      });

      if (result.success && result.data) {
        setUser(result.data);
        return;
      }

      const code = result.errorCode;

      // 마루 ID 에러 → 필드 상태 반영 + 모달
      if (code === "USER_TAG_REQUIRED" || code === "USER_TAG_TOO_SHORT") {
        setTagStatus("short");
        setError({ title: "등록 실패", message: "마루 ID는 4자 이상이어야 합니다." });
      } else if (code === "USER_TAG_TOO_LONG") {
        setTagStatus("long");
        setError({ title: "등록 실패", message: "마루 ID는 12자 이하여야 합니다." });
      } else if (code === "USER_TAG_INVALID_FORMAT") {
        setTagStatus("invalid");
        setError({ title: "등록 실패", message: "마루 ID는 영문 소문자, 숫자, 밑줄, 마침표만 사용 가능합니다." });
      } else if (code === "USER_TAG_ALREADY_EXISTS") {
        setTagStatus("taken");
        setError({ title: "등록 실패", message: "이미 사용 중인 마루 ID입니다." });

      // 이름 에러 → 필드 강조 + 모달
      } else if (code === "NAME_REQUIRED") {
        setNameError(true);
        setError({ title: "등록 실패", message: "이름을 입력해주세요." });
      } else if (code === "NAME_TOO_LONG") {
        setNameError(true);
        setError({ title: "등록 실패", message: "이름은 20자 이하로 입력해주세요." });

      // 기타 에러 → 모달만
      } else if (code === "USER_ALREADY_EXISTS") {
        setError({ title: "등록 실패", message: "이미 등록된 사용자입니다." });
      } else {
        setError({ title: "등록 실패", message: "알 수 없는 오류가 발생했습니다." });
      }
    } catch {
      setError({ title: "등록 실패", message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요." });
    } finally {
      setSubmitting(false);
    }
  };

  /** 서버 연결 오류 시 재시도 (auth store의 login 재호출) */
  const handleRetry = async () => {
    setRetrying(true);
    await checkUser();
    setRetrying(false);
  };

  // ─── 프로필 이미지 선택 ───

  /** 프로필 사진 바텀시트 열기 */
  const openProfileSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  /**
   * 카메라로 프로필 사진 촬영
   *
   * 권한 거부(재요청 불가) 시 PermissionModal로 설정 이동 안내,
   * 카메라 미지원 기기에서는 ErrorModal로 앨범 선택 안내.
   */
  const pickFromCamera = useCallback(async () => {
    bottomSheetRef.current?.dismiss();

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      if (!permission.canAskAgain) {
        setPermissionModal({
          title: "카메라 권한 필요",
          message: "프로필 사진을 촬영하려면 카메라 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
        });
      }
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setProfileImage({ uri: asset.uri, mimeType: asset.mimeType ?? "image/jpeg" });
      }
    } catch {
      setError({
        title: "카메라 사용 불가",
        message: "이 기기에서는 카메라를 사용할 수 없습니다. 앨범에서 선택해주세요.",
      });
    }
  }, []);

  /**
   * 앨범에서 프로필 사진 선택
   *
   * 권한 거부(재요청 불가) 시 PermissionModal로 설정 이동 안내.
   */
  const pickFromGallery = useCallback(async () => {
    bottomSheetRef.current?.dismiss();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      if (!permission.canAskAgain) {
        setPermissionModal({
          title: "앨범 권한 필요",
          message: "프로필 사진을 선택하려면 사진 앨범 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
        });
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setProfileImage({ uri: asset.uri, mimeType: asset.mimeType ?? "image/jpeg" });
    }
  }, []);

  /** 바텀시트 백드롭 렌더러 */
  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  // ─── 서버 연결 오류 화면 ───

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
            paddingHorizontal: spacing[5],
          },
        ]}
      >
        <View style={[styles.errorIconContainer, { backgroundColor: colors.semantic.error.light }]}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>연결 오류</Text>
        <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
          서버에 연결할 수 없습니다.{"\n"}잠시 후 다시 시도해주세요.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.retryButton, { opacity: pressed || retrying ? 0.85 : 1 }]}
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

  // ─── 등록 폼 ───

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}
      behavior="padding"
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 헤더 */}
        <Text style={[styles.title, { color: theme.textPrimary }]}>반갑습니다!</Text>
        <Text style={[styles.description, { color: theme.textTertiary }]}>
          마루에서 사용할 프로필을 설정해주세요
        </Text>

        {/* 프로필 사진 */}
        <View style={styles.avatarSection}>
          <View>
            <Pressable onPress={openProfileSheet}>
              <View style={[styles.avatarPreview, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {profileImage ? (
                  <Image source={{ uri: profileImage.uri }} style={styles.avatarImage} contentFit="cover" />
                ) : (
                  <Ionicons name="person" size={32} color={theme.textTertiary} />
                )}
              </View>
              <View style={[styles.cameraIcon, { backgroundColor: colors.primary[600] }]}>
                <Ionicons name="camera" size={12} color="#ffffff" />
              </View>
            </Pressable>
            {profileImage && (
              <Pressable
                style={[styles.removeIcon, { backgroundColor: theme.textTertiary }]}
                onPress={() => setProfileImage(null)}
                hitSlop={8}
              >
                <Ionicons name="close" size={12} color="#ffffff" />
              </Pressable>
            )}
          </View>
          <Text style={[styles.avatarHint, { color: theme.textTertiary }]}>탭하여 프로필 사진 설정</Text>
        </View>

        {/* 이메일 (읽기 전용) */}
        <View style={styles.fieldArea}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>이메일</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textTertiary }]}
            value={socialEmail}
            editable={false}
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
                borderColor: nameError ? colors.semantic.error.default : theme.border,
                color: theme.textPrimary,
              },
            ]}
            placeholder="이름을 입력하세요"
            placeholderTextColor={theme.textTertiary}
            value={name}
            onChangeText={(text) => { setName(text); setNameError(false); }}
            maxLength={20}
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
                borderColor:
                  tagStatus === "taken" || tagStatus === "invalid" || tagStatus === "short" || tagStatus === "long"
                    ? colors.semantic.error.default
                    : tagStatus === "available"
                      ? colors.semantic.success.default
                      : theme.border,
                color: theme.textPrimary,
              },
            ]}
            placeholder="영문 또는 숫자로 시작, 4~12자"
            placeholderTextColor={theme.textTertiary}
            value={maruId}
            onChangeText={(text) => setMaruId(text.replace(/[^a-zA-Z0-9_.]/g, ""))}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={12}
          />
          {tagStatus === "checking" && (
            <Text style={[styles.fieldHint, { color: theme.textTertiary }]}>확인 중...</Text>
          )}
          {tagStatus === "available" && (
            <Text style={[styles.fieldHint, { color: colors.semantic.success.default }]}>사용 가능한 ID입니다</Text>
          )}
          {tagStatus === "taken" && (
            <Text style={[styles.fieldHint, { color: colors.semantic.error.default }]}>이미 사용 중인 ID입니다</Text>
          )}
          {tagStatus === "invalid" && (
            <Text style={[styles.fieldHint, { color: colors.semantic.error.default }]}>
              영문 또는 숫자로 시작해야 하며, 밑줄과 마침표도 사용 가능합니다
            </Text>
          )}
          {tagStatus === "short" && (
            <Text style={[styles.fieldHint, { color: colors.semantic.error.default }]}>4자 이상 입력해주세요</Text>
          )}
          {tagStatus === "long" && (
            <Text style={[styles.fieldHint, { color: colors.semantic.error.default }]}>12자 이하로 입력해주세요</Text>
          )}
          {tagStatus === "idle" && (
            <Text style={[styles.fieldHint, { color: theme.textTertiary }]}>
              다른 사용자가 이 ID로 회원님을 찾을 수 있습니다
            </Text>
          )}
        </View>

        {/* 이용약관 동의 */}
        <View style={styles.agreementArea}>
          <Pressable style={styles.agreementRow} onPress={() => setAgreeTerms(!agreeTerms)}>
            <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked, { borderColor: theme.border }]}>
              {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.agreementText, { color: theme.textPrimary }]}>
              서비스 이용약관 동의 <Text style={{ color: colors.semantic.error.default }}>(필수)</Text>
            </Text>
            <Pressable hitSlop={8} onPress={() => router.push({ pathname: "/(onboarding)/terms", params: { type: "terms" } })}>
              <Text style={[styles.agreementLink, { color: theme.textTertiary }]}>보기</Text>
            </Pressable>
          </Pressable>

          <Pressable style={styles.agreementRow} onPress={() => setAgreePrivacy(!agreePrivacy)}>
            <View style={[styles.checkbox, agreePrivacy && styles.checkboxChecked, { borderColor: theme.border }]}>
              {agreePrivacy && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.agreementText, { color: theme.textPrimary }]}>
              개인정보 처리방침 동의 <Text style={{ color: colors.semantic.error.default }}>(필수)</Text>
            </Text>
            <Pressable hitSlop={8} onPress={() => router.push({ pathname: "/(onboarding)/terms", params: { type: "privacy" } })}>
              <Text style={[styles.agreementLink, { color: theme.textTertiary }]}>보기</Text>
            </Pressable>
          </Pressable>
        </View>
      </ScrollView>

      {/* 시작하기 버튼 (하단 고정) */}
      <View style={{ paddingHorizontal: spacing[5], paddingBottom: insets.bottom + spacing[5] }}>
        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            !isValid && !submitting && { backgroundColor: theme.border },
            { opacity: pressed && isValid && !submitting ? 0.85 : 1 },
          ]}
          onPress={handleStart}
          disabled={!isValid || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={[styles.startButtonText, !isValid && { color: theme.textTertiary }]}>시작하기</Text>
          )}
        </Pressable>
      </View>

      {/* 프로필 사진 선택 바텀시트 */}
      <BottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.background, borderTopLeftRadius: radius[4], borderTopRightRadius: radius[4] }}
        handleIndicatorStyle={{ backgroundColor: theme.textTertiary, width: 36, height: 4, borderRadius: radius.full, opacity: 0.5 }}
      >
        <BottomSheetView style={[styles.sheetContent, { paddingBottom: insets.bottom + spacing[5] }]}>
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>프로필 사진</Text>

          <Pressable
            style={({ pressed }) => [styles.sheetOption, { backgroundColor: pressed ? theme.surface : "transparent" }]}
            onPress={pickFromCamera}
          >
            <View style={[styles.sheetOptionIconWrap, { backgroundColor: theme.surface }]}>
              <Ionicons name="camera-outline" size={20} color={theme.textPrimary} />
            </View>
            <Text style={[styles.sheetOptionText, { color: theme.textPrimary }]}>카메라로 촬영</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.sheetOption, { backgroundColor: pressed ? theme.surface : "transparent" }]}
            onPress={pickFromGallery}
          >
            <View style={[styles.sheetOptionIconWrap, { backgroundColor: theme.surface }]}>
              <Ionicons name="image-outline" size={20} color={theme.textPrimary} />
            </View>
            <Text style={[styles.sheetOptionText, { color: theme.textPrimary }]}>앨범에서 선택</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>

      {/* 모달 */}
      <ErrorModal
        visible={error !== null}
        title={error?.title ?? ""}
        message={error?.message ?? ""}
        onClose={() => setError(null)}
      />
      <PermissionModal
        visible={permissionModal !== null}
        title={permissionModal?.title ?? ""}
        message={permissionModal?.message ?? ""}
        onClose={() => setPermissionModal(null)}
      />
    </KeyboardAvoidingView>
  );
}

// ─── 스타일 ───

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
    paddingBottom: spacing[4],
  },

  // 헤더
  title: {
    fontSize: fontSize[6],
    fontWeight: fontWeight.bold,
    textAlign: "center",
    marginBottom: spacing[1],
  },
  description: {
    fontSize: fontSize[3],
    fontWeight: fontWeight.regular,
    textAlign: "center",
    marginBottom: spacing[5],
  },

  // 프로필 사진
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing[5],
    gap: spacing[2],
  },
  avatarPreview: {
    width: size[8],
    height: size[8],
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: size[8],
    height: size[8],
    borderRadius: radius.full,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: size[1.5],
    height: size[1.5],
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  removeIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    width: size[1],
    height: size[1],
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHint: {
    fontSize: fontSize[2],
    fontWeight: fontWeight.regular,
  },

  // 입력 필드
  fieldArea: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: fontSize[3],
    fontWeight: fontWeight.semibold,
    marginBottom: spacing[2],
  },
  input: {
    height: size[4],
    borderWidth: 1,
    borderRadius: radius[4],
    paddingHorizontal: spacing[3],
    fontSize: fontSize[4],
  },
  fieldHint: {
    fontSize: fontSize[2],
    marginTop: spacing[1],
  },

  // 약관 동의
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
    borderRadius: radius[1],
    borderWidth: 1,
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
    fontSize: fontSize[3],
  },
  agreementLink: {
    fontSize: fontSize[3],
    textDecorationLine: "underline",
  },

  // 시작하기 버튼
  startButton: {
    height: size[4],
    backgroundColor: colors.primary[600],
    borderRadius: radius[4],
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: fontSize[4],
    fontWeight: fontWeight.semibold,
  },

  // 서버 연결 오류 화면
  errorIconContainer: {
    width: size[5],
    height: size[5],
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing[4],
  },
  errorIconText: {
    fontSize: fontSize[7],
    fontWeight: fontWeight.bold,
    color: colors.semantic.error.default,
  },
  errorTitle: {
    fontSize: fontSize[5],
    fontWeight: fontWeight.semibold,
    marginBottom: spacing[2],
  },
  errorMessage: {
    fontSize: fontSize[3],
    textAlign: "center",
    lineHeight: lineHeight[3],
    marginBottom: spacing[5],
  },
  retryButton: {
    height: size[4],
    paddingHorizontal: spacing[6],
    backgroundColor: colors.primary[600],
    borderRadius: radius[4],
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: fontSize[4],
    fontWeight: fontWeight.semibold,
  },

  // 바텀시트
  sheetContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[1],
  },
  sheetTitle: {
    fontSize: fontSize[5],
    fontWeight: fontWeight.semibold,
    marginBottom: spacing[3],
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    minHeight: size[4],
    paddingHorizontal: spacing[4],
    borderRadius: radius[4],
  },
  sheetOptionIconWrap: {
    width: size[2],
    height: size[2],
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetOptionText: {
    fontSize: fontSize[4],
  },
});
