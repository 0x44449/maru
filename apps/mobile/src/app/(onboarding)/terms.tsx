import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/useTheme";
import { spacing, fontSize, fontWeight } from "@/constants/theme";

const TITLES: Record<string, string> = {
  terms: "서비스 이용약관",
  privacy: "개인정보 처리방침",
};

export default function TermsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();

  const title = TITLES[type ?? ""] ?? "약관";

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing[5] }]}
      >
        <Text style={[styles.placeholder, { color: theme.textTertiary }]}>
          {title} 내용이 준비 중입니다.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[5],
    height: 44,
  },
  headerTitle: {
    fontSize: fontSize[4],
    fontWeight: fontWeight.semibold,
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
  },
  placeholder: {
    fontSize: fontSize[3],
    textAlign: "center",
    marginTop: spacing[10],
  },
});
