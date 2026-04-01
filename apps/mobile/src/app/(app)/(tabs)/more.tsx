import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/useTheme";
import { colors, spacing, size, radius, fontSize, fontWeight } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth";

/**
 * 더보기 탭
 *
 * 상단에 내 프로필 정보, 하단에 메뉴 목록을 표시한다.
 * 현재는 로그아웃 기능만 제공.
 *
 * @route /(app)/(tabs)/more
 */
export default function MoreScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "로그아웃", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* 내 프로필 */}
      <View style={[styles.profileSection, { borderBottomColor: theme.border }]}>
        <View style={[styles.avatar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {user?.personalProfile?.profileImageUrl ? (
            <Image
              source={{ uri: user.personalProfile.profileImageUrl }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <Ionicons name="person" size={24} color={theme.textTertiary} />
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: theme.textPrimary }]}>
            {user?.name ?? ""}
          </Text>
          <Text style={[styles.profileTag, { color: theme.textTertiary }]}>
            @{user?.userTag ?? ""}
          </Text>
        </View>
      </View>

      {/* 메뉴 */}
      <View style={styles.menuSection}>
        <Pressable
          style={({ pressed }) => [styles.menuItem, { backgroundColor: pressed ? theme.surface : "transparent" }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.semantic.error.default} />
          <Text style={[styles.menuItemText, { color: colors.semantic.error.default }]}>로그아웃</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // 프로필
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[5],
    borderBottomWidth: 1,
  },
  avatar: {
    width: size[5],
    height: size[5],
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: size[5],
    height: size[5],
    borderRadius: radius.full,
  },
  profileInfo: {
    flex: 1,
    gap: spacing[0.5],
  },
  profileName: {
    fontSize: fontSize[5],
    fontWeight: fontWeight.semibold,
  },
  profileTag: {
    fontSize: fontSize[3],
  },

  // 메뉴
  menuSection: {
    paddingTop: spacing[2],
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    minHeight: size[4],
  },
  menuItemText: {
    fontSize: fontSize[4],
  },
});
